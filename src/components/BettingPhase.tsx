import StepperInput from '@/components/StepperInput'
import { TeamScores } from '@/components/TeamScores'
import type { Player, Team } from '@/utils/scoring'

interface BettingPhaseProps {
  players:      Player[]
  teams:        Team[] | null
  bets:         Record<string, number>
  maxTricks:    number
  onBetChange:  (playerId: string, val: number) => void
  playerTotals: Record<string, number> | null
  teamTotals:   Record<string, number> | null
}

export function BettingPhase({ players, teams, bets, maxTricks, onBetChange, playerTotals, teamTotals }: BettingPhaseProps) {
  return (
    <div>
      <h2 className="text-[18px] font-bold mb-1">Paris de la manche</h2>
      <p className="text-[13px] text-text-muted mb-[18px]">{maxTricks} plis au total cette manche</p>
      {teams && teamTotals && <TeamScores teams={teams} teamTotals={teamTotals} />}
      <div className="flex flex-col gap-2">
        {players.map(player => {
          const team = teams?.find(t => t.index === player.teamIndex)
          return (
            <div key={player.id} className="flex items-center justify-between bg-surface border border-border rounded-md px-[14px] py-3">
              <div>
                <div className="text-[15px] font-semibold text-text flex items-center gap-2">
                  {player.name}
                  {playerTotals && (
                    <span className="text-[13px] font-semibold text-primary bg-primary/12 px-[7px] py-px rounded-full">
                      {playerTotals[player.id]}
                    </span>
                  )}
                </div>
                {team && <div className="text-[12px] text-text-muted mt-px">{team.name}</div>}
              </div>
              <StepperInput
                value={bets[player.id] ?? 0}
                onChange={val => onBetChange(player.id, val)}
                min={0}
                max={maxTricks}
                step={1}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
