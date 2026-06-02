import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { HistoryItem } from '@/components/HistoryItem'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Dialog } from '@/components/ui/dialog'
import type { GameConfig } from '@/utils/scoring'
import type { GameRecord } from '@/utils/storage'

interface HomePageProps {
  config:   GameConfig
  history:  GameRecord[]
  onStart:  (config: GameConfig) => void
}

export default function HomePage({ config: initConfig, history, onStart }: HomePageProps) {
  const [playerCount, setPlayerCount] = useState<number>(initConfig.playerCount ?? 4)
  const [mode,        setMode]        = useState<'solo' | 'team'>(initConfig.mode ?? 'solo')
  const [treasures,   setTreasures]   = useState<boolean>(initConfig.treasures ?? false)
  const [showHistory, setShowHistory] = useState<boolean>(false)

  const teamAvailable = playerCount === 4 || playerCount === 6
  const effectiveMode = teamAvailable ? mode : 'solo'

  function handlePlayerCount(n: number) {
    setPlayerCount(n)
    if (n !== 4 && n !== 6) setMode('solo')
  }

  function handleStart() {
    onStart({ playerCount, mode: effectiveMode, treasures })
  }

  return (
    <PageLayout
      className="min-h-[100dvh]"
      contentClassName="flex-1 px-4 pb-4"
      header={
        <div className="flex justify-end px-4 py-3 flex-shrink-0">
          <Button variant="ghost" onClick={() => setShowHistory(true)}>
            📜 Historique
          </Button>
        </div>
      }
      footer={
        <Button size="lg" onClick={handleStart}>
          Commencer →
        </Button>
      }
    >
      {/* Modal historique */}
      <Dialog
        open={showHistory}
        onOpenChange={setShowHistory}
        title="Parties précédentes"
        onCancel={() => setShowHistory(false)}
        cancelLabel="Fermer"
      >
        {history.length === 0 ? (
          <p className="text-center py-6 text-text-muted">Aucune partie enregistrée.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map(game => (
              <HistoryItem key={game.id} game={game} />
            ))}
          </div>
        )}
      </Dialog>

      {/* Titre */}
      <div className="pt-8 pb-7 text-center">
        <img src="/drarkane-logo.png" alt="Drarkane" className="h-20 mx-auto mb-4" />
        <p className="mt-1.5 text-[14px] text-text-muted tracking-[0.06em] uppercase">Compteur de scores</p>
      </div>

      {/* Configuration */}
      <div className="py-[14px] border-b border-border">
        <span className="text-[15px] font-semibold text-text mb-[10px] block">Nombre de joueurs</span>
        <ToggleGroup
          type="single"
          value={String(playerCount)}
          onValueChange={(val) => handlePlayerCount(Number(val))}
        >
          {[2, 3, 4, 5, 6].map(n => (
            <ToggleGroupItem key={n} value={String(n)}>{n}</ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="py-[14px] border-b border-border">
        <span className="text-[15px] font-semibold text-text mb-[10px] block">Mode de jeu</span>
        <ToggleGroup
          type="single"
          value={effectiveMode}
          onValueChange={(val) => setMode(val as 'solo' | 'team')}
        >
          <ToggleGroupItem value="solo">Individuel</ToggleGroupItem>
          <ToggleGroupItem
            value="team"
            disabled={!teamAvailable}
            aria-label={!teamAvailable ? '4 ou 6 joueurs uniquement' : undefined}
          >
            Équipe {!teamAvailable ? '(4/6 j.)' : ''}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="py-[14px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[15px] font-semibold text-text block">Extension Trésors</span>
            <p className="text-[13px] text-text-muted mt-0.5">Ajoute un compteur de points trésors par joueur</p>
          </div>
          <Switch
            checked={treasures}
            onCheckedChange={setTreasures}
            aria-label="Extension Trésors"
          />
        </div>
      </div>
    </PageLayout>
  )
}
