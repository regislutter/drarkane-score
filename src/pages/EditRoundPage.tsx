import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import StepperInput from '@/components/StepperInput'
import { computeRoundScores, TRICKS_PER_ROUND } from '@/utils/scoring'
import type { GameConfig, Player, Team, RoundData } from '@/utils/scoring'

interface EditRoundPageProps {
  index:      number
  config:     GameConfig
  players:    Player[]
  teams:      Team[] | null
  round:      RoundData
  onChange:   (round: RoundData) => void
  onNavigate: (target: number | null) => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-text-2">{label}</span>
      {children}
    </div>
  )
}

export default function EditRoundPage({ index, config, players, teams, round, onChange, onNavigate }: EditRoundPageProps) {
  const maxTricks       = TRICKS_PER_ROUND[config.playerCount]
  const treasuresActive = config.treasures && !round.overwhelmed

  function emit(patch: Partial<RoundData>) {
    const next: RoundData = { ...round, ...patch }
    next.scores = computeRoundScores(next, players, config.treasures)
    onChange(next)
  }

  function setField(field: 'bets' | 'tricks' | 'dragons' | 'treasures', playerId: string, val: number) {
    emit({ [field]: { ...round[field], [playerId]: val } })
  }

  return (
    <PageLayout
      header={
        <div className="px-4 py-3 border-b border-border bg-bg flex-shrink-0 flex items-center gap-2">
          <div className="flex-1 flex justify-start">
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(index - 1)}
                aria-label="Corriger la manche précédente"
              >
                ←
              </Button>
            )}
          </div>
          <div className="text-center">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-primary">Correction</div>
            <div className="text-[14px] font-bold text-text-2 tracking-[0.04em]">Manche {index + 1} / 3</div>
          </div>
          <div className="flex-1 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => onNavigate(null)}>Terminé</Button>
          </div>
        </div>
      }
      footer={
        <Button size="lg" onClick={() => onNavigate(null)}>Revenir à la manche en cours</Button>
      }
    >
      <p className="text-[13px] text-text-muted mb-3">
        Corrigez les paris et résultats de cette manche. Les scores sont recalculés automatiquement.
      </p>

      <div className="flex flex-col gap-2.5">
        {players.map(player => {
          const team  = teams?.find(t => t.index === player.teamIndex)
          const score = round.scores?.[player.id] ?? 0
          return (
            <div key={player.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-[14px] pt-3 pb-2.5 border-b border-border">
                <div>
                  <div className="text-[16px] font-bold text-text">{player.name}</div>
                  {team && <div className="text-[12px] text-primary mt-0.5 font-medium">{team.name}</div>}
                </div>
                <span className="text-[13px] font-semibold text-primary bg-primary/12 px-[9px] py-[3px] rounded-full">
                  {score} pts
                </span>
              </div>

              <div className="px-[14px] py-2.5 flex flex-col gap-2">
                <Row label="Pari">
                  <StepperInput value={round.bets?.[player.id] ?? 0} onChange={v => setField('bets', player.id, v)} min={0} max={maxTricks} step={1} />
                </Row>
                <Row label="Plis gagnés">
                  <StepperInput value={round.tricks?.[player.id] ?? 0} onChange={v => setField('tricks', player.id, v)} min={0} max={maxTricks} step={1} />
                </Row>
                <Row label="Dragons battus">
                  <StepperInput value={round.dragons?.[player.id] ?? 0} onChange={v => setField('dragons', player.id, v)} min={0} step={1} />
                </Row>
                {treasuresActive && (
                  <Row label="Trésors">
                    <StepperInput value={round.treasures?.[player.id] ?? 0} onChange={v => setField('treasures', player.id, v)} min={0} />
                  </Row>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Paramètres de la manche */}
      <div className="bg-surface border border-border rounded-lg px-[14px] py-3 mt-3 flex flex-col gap-3">
        <Row label="Valeur de terreur totale">
          <StepperInput value={round.terrorValue} onChange={v => emit({ terrorValue: v })} min={0} />
        </Row>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] text-text-2">Joueurs submergés</div>
            <div className="text-[12px] text-text-muted">Trésors perdus cette manche</div>
          </div>
          <Switch checked={round.overwhelmed} onCheckedChange={v => emit({ overwhelmed: v })} aria-label="Joueurs submergés" />
        </div>
      </div>
    </PageLayout>
  )
}
