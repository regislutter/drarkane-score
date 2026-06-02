import type { GameConfig, Player, Team, RoundData } from './scoring'

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
}

export function getCurrentGame(): CurrentGame | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CurrentGame
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
