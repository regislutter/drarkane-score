import StepperInput from '@/components/StepperInput'
import { TeamScores } from '@/components/TeamScores'
import { cn } from '@/lib/utils'
import type { Player, Team } from '@/utils/scoring'

interface PlayingPhaseProps {
  players:           Player[]
  teams:             Team[] | null
  bets:              Record<string, number>
  tricks:            Record<string, number>
  dragons:           Record<string, number>
  treasures:         Record<string, number>
  treasuresActive:   boolean
  maxTricks:         number
  totalTricksPlayed: number
  onTrickChange:     (playerId: string, val: number) => void
  onDragonChange:    (playerId: string, val: number) => void
  onTreasureChange:  (playerId: string, val: number) => void
  playerTotals:      Record<string, number> | null
  teamTotals:        Record<string, number> | null
}

export function PlayingPhase({
  players, teams, bets, tricks, dragons, treasures,
  treasuresActive, maxTricks, totalTricksPlayed,
  onTrickChange, onDragonChange, onTreasureChange, playerTotals, teamTotals,
}: PlayingPhaseProps) {
  const tricksMaxReached = totalTricksPlayed >= maxTricks

  return (
    <div>
      {teams && teamTotals && <TeamScores teams={teams} teamTotals={teamTotals} />}

      {/* Compteur de plis */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-md px-[14px] py-2.5 mb-[14px] text-[14px] text-text-2">
        <span>Plis joués</span>
        <span className={cn('text-[18px] font-extrabold transition-colors duration-200', tricksMaxReached ? 'text-success' : 'text-text')}>
          {totalTricksPlayed} / {maxTricks}
        </span>
      </div>

      {/* Cartes joueurs */}
      <div className="flex flex-col gap-2.5">
        {players.map(player => {
          const team = teams?.find(t => t.index === player.teamIndex)
          const playerTricks = tricks[player.id] ?? 0

          return (
            <div key={player.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="flex items-start justify-between px-[14px] pt-3 pb-2.5 border-b border-border">
                <div>
                  <div className="text-[16px] font-bold text-text flex items-center gap-2">
                    {player.name}
                    {playerTotals && (
                      <span className="text-[13px] font-semibold text-primary bg-primary/12 px-[7px] py-px rounded-full">
                        {playerTotals[player.id]}
                      </span>
                    )}
                  </div>
                  {team && <div className="text-[12px] text-primary mt-0.5 font-medium">{team.name}</div>}
                </div>
                <div className="text-[13px] text-text-2 bg-surface-2 rounded-sm px-[9px] py-[3px] font-medium flex-shrink-0">
                  Pari : {bets[player.id] ?? 0} pli{(bets[player.id] ?? 0) !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="px-[14px] py-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-text-2">Plis gagnés</span>
                  <StepperInput
                    value={playerTricks}
                    onChange={val => onTrickChange(player.id, val)}
                    min={0}
                    max={tricksMaxReached ? playerTricks : maxTricks}
                    step={1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-text-2">Dragons battus</span>
                  <StepperInput
                    value={dragons[player.id] ?? 0}
                    onChange={val => onDragonChange(player.id, val)}
                    min={0}
                    step={1}
                  />
                </div>

                {treasuresActive && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-2">Trésors</span>
                    <StepperInput
                      value={treasures[player.id] ?? 0}
                      onChange={val => onTreasureChange(player.id, val)}
                      min={0}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
