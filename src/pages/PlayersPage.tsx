import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { GameConfig, Player, Team } from '@/utils/scoring'

interface PlayersPageProps {
  config:    GameConfig
  onConfirm: (players: Player[], teams: Team[] | null) => void
  onBack:    () => void
}

export default function PlayersPage({ config, onConfirm, onBack }: PlayersPageProps) {
  const { playerCount, mode } = config
  const isTeam = mode === 'team'

  const [playerNames, setPlayerNames] = useState<string[]>(() =>
    Array.from({ length: playerCount }, () => '')
  )

  const teamCount = playerCount / 2
  const [teamNames, setTeamNames] = useState<string[]>(() =>
    Array.from({ length: teamCount }, (_, i) => `Équipe ${i + 1}`)
  )

  const [playerTeams, setPlayerTeams] = useState<number[]>(() =>
    Array.from({ length: playerCount }, (_, i) => Math.floor(i / 2))
  )

  function setPlayerName(i: number, val: string) {
    setPlayerNames(prev => { const next = [...prev]; next[i] = val; return next })
  }

  function setTeamName(i: number, val: string) {
    setTeamNames(prev => { const next = [...prev]; next[i] = val; return next })
  }

  function setPlayerTeam(i: number, ti: number) {
    setPlayerTeams(prev => { const next = [...prev]; next[i] = ti; return next })
  }

  function handleConfirm() {
    const players: Player[] = playerNames.map((name, i) => ({
      id:        `p${i}`,
      name:      name.trim() || `Joueur ${i + 1}`,
      teamIndex: isTeam ? playerTeams[i] : null,
    }))

    const teams: Team[] | null = isTeam
      ? teamNames.map((name, i) => ({
          id:    `t${i}`,
          name:  name.trim() || `Équipe ${i + 1}`,
          index: i,
        }))
      : null

    onConfirm(players, teams)
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-bg flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onBack}>← Retour</Button>
          <h2 className="text-[17px] font-semibold text-text">
            {isTeam ? 'Joueurs & Équipes' : 'Joueurs'}
          </h2>
        </div>
      }
      footer={
        <Button size="lg" onClick={handleConfirm}>Lancer la partie →</Button>
      }
    >
      {/* Noms des équipes */}
      {isTeam && (
        <div className="mb-5 pb-5 border-b border-border">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-[10px]">Noms des équipes</p>
          <div className="flex flex-col gap-2">
            {teamNames.map((name, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-text-2">Équipe {i + 1}</label>
                <input
                  type="text"
                  value={name}
                  placeholder={`Équipe ${i + 1}`}
                  onChange={e => setTeamName(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Noms des joueurs */}
      <div>
        <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-[10px]">Noms des joueurs</p>
        <div className="flex flex-col gap-2.5">
          {playerNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  placeholder={`Joueur ${i + 1}`}
                  onChange={e => setPlayerName(i, e.target.value)}
                />
              </div>
              {isTeam && (
                <ToggleGroup
                  type="single"
                  value={String(playerTeams[i])}
                  onValueChange={(val) => setPlayerTeam(i, Number(val))}
                  className="flex-shrink-0"
                >
                  {teamNames.map((tname, ti) => (
                    <ToggleGroupItem
                      key={ti}
                      value={String(ti)}
                      size="sm"
                      aria-label={tname || `Équipe ${ti + 1}`}
                    >
                      {ti + 1}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
