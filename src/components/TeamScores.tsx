import type { Team } from '@/utils/scoring'

interface TeamScoresProps {
  teams:       Team[]
  teamTotals:  Record<string, number>
}

export function TeamScores({ teams, teamTotals }: TeamScoresProps) {
  return (
    <div className="bg-surface border border-border rounded-md px-[14px] py-2.5 mb-[14px]">
      <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-1.5">Scores des équipes</div>
      <div className="flex flex-col gap-1">
        {teams.map(team => (
          <div key={team.id} className="flex items-center justify-between text-[14px] text-text-2">
            <span className="font-medium text-primary">{team.name}</span>
            <span className="text-[13px] font-semibold text-primary bg-primary/12 px-[7px] py-px rounded-full">
              {teamTotals[team.id] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
