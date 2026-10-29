/** Nombre de plis par manche selon le nombre de joueurs */
export const TRICKS_PER_ROUND: Record<number, number> = { 2: 14, 3: 14, 4: 11, 5: 9, 6: 8 }

export interface Player {
  id: string
  name: string
  teamIndex: number | null
}

export interface Team {
  id: string
  name: string
  index: number
}

export interface GameConfig {
  playerCount: number
  mode: 'solo' | 'team'
  treasures: boolean
}

export interface RoundData {
  bets:        Record<string, number>
  tricks:      Record<string, number>
  dragons:     Record<string, number>
  treasures:   Record<string, number>
  terrorValue: number
  overwhelmed: boolean
  scores?:     Record<string, number>
}

export type RoundPhase = 'betting' | 'playing'

/** Saisie non validée de la manche en cours. */
export interface RoundDraft {
  bets:        Record<string, number>
  tricks:      Record<string, number>
  dragons:     Record<string, number>
  treasures:   Record<string, number>
  terrorValue: number
  overwhelmed: boolean
}

export function createRoundDraft(players: Player[]): RoundDraft {
  const emptyValues = Object.fromEntries(players.map(player => [player.id, 0]))
  return {
    bets:        { ...emptyValues },
    tricks:      { ...emptyValues },
    dragons:     { ...emptyValues },
    treasures:   { ...emptyValues },
    terrorValue: 0,
    overwhelmed: false,
  }
}

/** Transforme la saisie de la manche en résultat définitivement comptabilisé. */
export function completeRound(
  draft: RoundDraft,
  players: Player[],
  treasuresActive: boolean
): RoundData {
  const round: RoundData = {
    ...draft,
    treasures: draft.overwhelmed
      ? Object.fromEntries(players.map(player => [player.id, 0]))
      : draft.treasures,
  }
  round.scores = computeRoundScores(round, players, treasuresActive)
  return round
}

/**
 * Calcule les scores d'une manche pour chaque joueur.
 */
export function computeRoundScores(
  round: RoundData,
  players: Player[],
  treasuresActive: boolean
): Record<string, number> {
  return Object.fromEntries(
    players.map(player => {
      const bet     = round.bets?.    [player.id] ?? 0
      const tricks  = round.tricks?.  [player.id] ?? 0
      const dragons = round.dragons?. [player.id] ?? 0
      const treas   = (!round.overwhelmed && treasuresActive) ? (round.treasures?.[player.id] ?? 0) : 0

      let score = tricks * 4 + dragons * 2 + treas

      const diff = Math.abs(bet - tricks)
      if      (diff === 0) score += round.terrorValue
      else if (diff === 1) score += Math.floor(round.terrorValue / 2)

      return [player.id, score]
    })
  )
}

/**
 * Calcule les scores totaux sur les 3 manches.
 */
export function computeTotalScores(
  rounds: RoundData[],
  players: Player[]
): Record<string, number> {
  const totals = Object.fromEntries(players.map(p => [p.id, 0]))
  rounds.forEach(round => {
    if (round.scores) {
      players.forEach(p => { totals[p.id] += round.scores![p.id] ?? 0 })
    }
  })
  return totals
}

/**
 * Calcule les scores par équipe.
 */
export function computeTeamTotals(
  playerTotals: Record<string, number>,
  players: Player[],
  teams: Team[] | null | undefined
): Record<string, number> | null {
  if (!teams?.length) return null
  return Object.fromEntries(
    teams.map(team => {
      const score = players
        .filter(p => p.teamIndex === team.index)
        .reduce((sum, p) => sum + (playerTotals[p.id] ?? 0), 0)
      return [team.id, score]
    })
  )
}

/**
 * Retourne le message de rappel des cartes à retirer, ou null si aucun retrait.
 */
export function getCardReminder(playerCount: number): string | null {
  if (playerCount <= 3) {
    return 'Retirez du jeu les cartes atout (jaune) 1, 5 et 10, ainsi que 3 chevaliers (11 noir) avant de distribuer les cartes.'
  }
  if (playerCount === 4) {
    return 'Retirez du jeu les cartes atout (jaune) 1 et 10, ainsi que 2 chevaliers (11 noir) avant de distribuer les cartes.'
  }
  if (playerCount === 5) {
    return 'Retirez du jeu la carte atout (jaune) 10 et un chevalier (11 noir) avant de distribuer les cartes.'
  }
  return null // 6 joueurs : toutes les cartes sont utilisées
}
