import { computeTotalScores, computeTeamTotals } from '@/utils/scoring'
import { cn } from '@/lib/utils'
import type { GameRecord } from '@/utils/storage'

interface HistoryItemProps {
  game: GameRecord
}

export function HistoryItem({ game }: HistoryItemProps) {
  const date = new Date(game.date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const isTeam  = game.config.mode === 'team' && game.teams?.length
  const players = game.players ?? []
  const teams   = game.teams   ?? []

  const playerTotals = computeTotalScores(game.rounds ?? [], players)
  const teamTotals   = isTeam ? computeTeamTotals(playerTotals, players, teams) : null

  const entries = isTeam
    ? teams.map(t => ({ id: t.id, name: t.name, score: teamTotals?.[t.id] ?? 0 }))
    : players.map(p => ({ id: p.id, name: p.name, score: playerTotals[p.id] ?? 0 }))

  const sorted = [...entries].sort((a, b) => b.score - a.score)

  const badges: string[] = []
  if (isTeam) badges.push('Équipe')
  if (game.config.treasures) badges.push('Trésors')

  return (
    <div className="bg-surface-2 rounded-md px-[14px] py-3 border border-border">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] text-text-muted">{date} · {game.config.playerCount} joueurs</span>
        <div className="flex gap-1">
          {badges.map(b => (
            <span key={b} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/14 text-primary font-semibold">{b}</span>
          ))}
        </div>
      </div>
      {sorted.map((entry, i) => (
        <div key={entry.id} className={cn('flex justify-between items-center py-[3px] text-[14px]', i === 0 ? 'text-text font-semibold' : 'text-text-2')}>
          <span>{i === 0 ? '🏆 ' : ''}{entry.name}</span>
          <span className={i === 0 ? 'text-primary font-bold' : ''}>{entry.score} pts</span>
        </div>
      ))}
    </div>
  )
}
