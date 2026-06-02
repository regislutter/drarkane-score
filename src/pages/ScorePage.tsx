import { cva } from 'class-variance-authority'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { computeTotalScores, computeTeamTotals } from '@/utils/scoring'
import type { GameConfig, Player, Team, RoundData } from '@/utils/scoring'

const scoreRow = cva('flex items-center gap-3 border rounded-md px-[14px] py-3', {
  variants: {
    first: {
      true:  'border-primary bg-primary/14',
      false: 'border-border bg-surface',
    },
  },
  defaultVariants: { first: false },
})

const scoreRank = cva('text-[14px] font-bold min-w-[20px]', {
  variants: {
    first: {
      true:  'text-primary',
      false: 'text-text-muted',
    },
  },
  defaultVariants: { first: false },
})

const scorePoints = cva('text-[16px] font-extrabold', {
  variants: {
    first: {
      true:  'text-primary',
      false: 'text-text',
    },
  },
  defaultVariants: { first: false },
})

interface ScorePageProps {
  config:    GameConfig
  players:   Player[]
  teams:     Team[] | null
  rounds:    RoundData[]
  onNewGame: () => void
}

export default function ScorePage({ config, players, teams, rounds, onNewGame }: ScorePageProps) {
  const playerTotals = computeTotalScores(rounds, players)
  const isTeam       = config.mode === 'team' && teams?.length
  const teamTotals   = isTeam ? computeTeamTotals(playerTotals, players, teams) : null

  const displayEntries = isTeam
    ? (teams ?? []).map(t  => ({ key: t.id, name: t.name, score: teamTotals?.[t.id]  ?? 0 }))
    : players.map(p => ({ key: p.id, name: p.name, score: playerTotals[p.id] ?? 0 }))

  const sorted = [...displayEntries].sort((a, b) => b.score - a.score)
  const winner = sorted[0]

  return (
    <PageLayout
      contentClassName="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      header={
        <div className="pt-5 px-4 pb-0 text-center flex-shrink-0">
          <h1 className="gradient-text text-[28px] font-extrabold leading-[1.2]">Fin de partie</h1>
        </div>
      }
      footer={
        <Button size="lg" onClick={onNewGame}>Nouvelle partie</Button>
      }
    >
      {/* Bandeau gagnant */}
      {winner && (
        <div className="bg-[linear-gradient(135deg,rgba(232,93,4,0.12),rgba(255,140,0,0.08))] border-[1.5px] border-primary rounded-xl p-5 text-center">
          <div className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-1.5">🏆 Victoire</div>
          <div className="text-[26px] font-extrabold text-text mb-1">{winner.name}</div>
          <div className="text-[20px] font-bold text-primary">{winner.score} points</div>
        </div>
      )}

      {/* Classement */}
      <div className="flex flex-col gap-1.5 mt-2">
        {sorted.map((entry, i) => (
          <div key={entry.key} className={scoreRow({ first: i === 0 })}>
            <span className={scoreRank({ first: i === 0 })}>{i + 1}</span>
            <span className="flex-1 text-[15px] font-semibold text-text">{entry.name}</span>
            <span className={scorePoints({ first: i === 0 })}>{entry.score} pts</span>
          </div>
        ))}
      </div>

      {/* Détail joueurs en mode équipe */}
      {isTeam && (
        <div className="bg-surface border border-border rounded-lg p-[14px]">
          <h3 className="text-[13px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-[10px]">Détail par joueur</h3>
          {[...players]
            .sort((a, b) => (playerTotals[b.id] ?? 0) - (playerTotals[a.id] ?? 0))
            .map(player => {
              const team = (teams ?? []).find(t => t.index === player.teamIndex)
              return (
                <div key={player.id} className="flex justify-between py-1.5 text-[14px] text-text-2 border-b border-border last:border-b-0">
                  <div>
                    <span>{player.name}</span>
                    {team && <div className="text-[12px] text-primary font-medium">{team.name}</div>}
                  </div>
                  <span>{playerTotals[player.id] ?? 0} pts</span>
                </div>
              )
            })}
        </div>
      )}

      {/* Détail des manches */}
      <div className="bg-surface border border-border rounded-lg p-[14px]">
        <h3 className="text-[13px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-[10px]">Détail des manches</h3>
        {rounds.map((round, ri) => (
          <div key={ri} className={ri < rounds.length - 1 ? 'mb-[14px]' : ''}>
            <div className="text-[12px] font-semibold text-text-muted mb-1.5 tracking-[0.06em]">
              {round.overwhelmed ? `MANCHE ${ri + 1} — Submergés` : `MANCHE ${ri + 1}`}
            </div>
            {players.map(player => {
              const s = round.scores?.[player.id] ?? 0
              const b = round.bets?.[player.id]   ?? 0
              const t = round.tricks?.[player.id] ?? 0
              return (
                <div key={player.id} className="flex justify-between py-1.5 text-[14px] text-text-2 border-b border-border last:border-b-0">
                  <span className="text-[13px]">
                    {player.name}
                    <span className="text-text-muted ml-1.5 text-[12px]">(pari {b}, réalisé {t})</span>
                  </span>
                  <span className="text-[13px]">{s} pts</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
