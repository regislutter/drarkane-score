import type { GameConfig, Player, Team, RoundData, RoundDraft, RoundPhase } from './scoring'

const KEY = 'drarkane_history'
const CURRENT_KEY = 'drarkane_current_game'

export interface GameRecord {
  id:      number
  date:    string
  config:  GameConfig
  players: Player[]
  teams:   Team[] | null
  rounds:  RoundData[]
}

export function getHistory(): GameRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as GameRecord[]
  } catch {
    return []
  }
}

export function saveGame(data: Omit<GameRecord, 'id' | 'date'>): void {
  const history = getHistory()
  const record: GameRecord = {
    ...data,
    id:   Date.now(),
    date: new Date().toISOString(),
  }
  localStorage.setItem(KEY, JSON.stringify([record, ...history].slice(0, 20)))
}

export type CurrentGameView = 'game' | 'score'

export interface CurrentGame {
  view:            CurrentGameView
  config:          GameConfig
  players:         Player[]
  teams:           Team[] | null
  completedRounds: RoundData[]
  phase?:          RoundPhase
  currentRound?:    RoundDraft
  editingIndex?:    number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isGameConfig(value: unknown): value is GameConfig {
  return isRecord(value)
    && typeof value.playerCount === 'number'
    && Number.isInteger(value.playerCount)
    && value.playerCount >= 2
    && value.playerCount <= 6
    && (value.mode === 'solo' || value.mode === 'team')
    && typeof value.treasures === 'boolean'
}

function isPlayer(value: unknown): value is Player {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && (typeof value.teamIndex === 'number' || value.teamIndex === null)
}

function isTeam(value: unknown): value is Team {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.index === 'number'
}

function isNumberMap(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every(entry => typeof entry === 'number' && Number.isFinite(entry))
}

function isRoundDraft(value: unknown): value is RoundDraft {
  return isRecord(value)
    && isNumberMap(value.bets)
    && isNumberMap(value.tricks)
    && isNumberMap(value.dragons)
    && isNumberMap(value.treasures)
    && typeof value.terrorValue === 'number'
    && Number.isFinite(value.terrorValue)
    && typeof value.overwhelmed === 'boolean'
}

function isRoundData(value: unknown): value is RoundData {
  return isRoundDraft(value)
    && isRecord(value)
    && (value.scores === undefined || isNumberMap(value.scores))
}

function isCurrentGame(value: unknown): value is CurrentGame {
  if (!isRecord(value) || (value.view !== 'game' && value.view !== 'score')) return false
  if (!isGameConfig(value.config) || !Array.isArray(value.players) || !value.players.every(isPlayer)) return false
  if (!Array.isArray(value.completedRounds) || !value.completedRounds.every(isRoundData)) return false
  if (value.teams !== null && (!Array.isArray(value.teams) || !value.teams.every(isTeam))) return false
  if (value.phase !== undefined && value.phase !== 'betting' && value.phase !== 'playing') return false
  if (value.currentRound !== undefined && !isRoundDraft(value.currentRound)) return false
  if (value.editingIndex !== undefined && value.editingIndex !== null && (
    typeof value.editingIndex !== 'number'
    || !Number.isInteger(value.editingIndex)
    || value.editingIndex < 0
  )) return false
  return true
}

export function getCurrentGame(): CurrentGame | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    if (!raw) return null
    const currentGame: unknown = JSON.parse(raw)
    return isCurrentGame(currentGame) ? currentGame : null
  } catch {
    return null
  }
}

export function saveCurrentGame(data: CurrentGame): void {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(data))
  } catch {
    /* storage plein / indisponible : on ignore silencieusement */
  }
}

export function clearCurrentGame(): void {
  localStorage.removeItem(CURRENT_KEY)
}
