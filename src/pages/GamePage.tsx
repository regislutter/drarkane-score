import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { RoundIndicator } from '@/components/RoundIndicator'
import { BettingPhase } from '@/components/BettingPhase'
import { PlayingPhase } from '@/components/PlayingPhase'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import StepperInput from '@/components/StepperInput'
import { TRICKS_PER_ROUND, getCardReminder, computeTeamTotals } from '@/utils/scoring'
import type { GameConfig, Player, Team, RoundData, RoundDraft, RoundPhase } from '@/utils/scoring'

interface GamePageProps {
  config:           GameConfig
  players:          Player[]
  teams:            Team[] | null
  completedRounds:  RoundData[]
  phase:            RoundPhase
  roundDraft:        RoundDraft
  onPhaseChange:    (phase: RoundPhase) => void
  onRoundDraftChange: (draft: RoundDraft) => void
  onRoundComplete:  () => void
  onAbort:          () => void
  onEditPrevious:   () => void
}

export default function GamePage({ config, players, teams, completedRounds, phase, roundDraft, onPhaseChange, onRoundDraftChange, onRoundComplete, onAbort, onEditPrevious }: GamePageProps) {
  const currentRound = completedRounds.length
  const maxTricks    = TRICKS_PER_ROUND[config.playerCount]

  const playerTotals: Record<string, number> | null = currentRound > 0
    ? Object.fromEntries(players.map(p => [
        p.id,
        completedRounds.reduce((sum, r) => sum + (r.scores?.[p.id] ?? 0), 0),
      ]))
    : null
  const teamTotals = playerTotals && config.mode === 'team'
    ? computeTeamTotals(playerTotals, players, teams)
    : null

  const [showCardReminder,   setShowCardReminder]   = useState<boolean>(currentRound === 0)
  const [showOverwhelmedDlg, setShowOverwhelmedDlg] = useState<boolean>(false)
  const [showTerrorDlg,      setShowTerrorDlg]      = useState<boolean>(false)
  const [showAbortDlg,       setShowAbortDlg]       = useState<boolean>(false)

  const totalTricksPlayed = players.reduce((sum, p) => sum + (roundDraft.tricks[p.id] ?? 0), 0)
  // À 2 joueurs, les manches peuvent se conclure avant que tous les plis aient été joués
  const canEndRound       = config.playerCount === 2 || totalTricksPlayed >= maxTricks

  function update(field: 'bets' | 'tricks' | 'dragons' | 'treasures', playerId: string, val: number) {
    onRoundDraftChange({
      ...roundDraft,
      [field]: { ...roundDraft[field], [playerId]: val },
    })
  }

  function handleOverwhelmedConfirm() {
    setShowOverwhelmedDlg(false)
    onRoundDraftChange({ ...roundDraft, overwhelmed: true, terrorValue: 0 })
    setShowTerrorDlg(true)
  }

  function handleTerrorConfirm() {
    setShowTerrorDlg(false)
    onRoundComplete()
  }

  const cardReminder = getCardReminder(config.playerCount)

  return (
    <>
      {/* Dialogs (outside PageLayout to avoid stacking context issues) */}
      {cardReminder && (
        <Dialog
          open={showCardReminder}
          onOpenChange={setShowCardReminder}
          title="Préparation du jeu"
          confirmLabel="Compris"
          onConfirm={() => setShowCardReminder(false)}
        >
          <p>{cardReminder}</p>
        </Dialog>
      )}

      <Dialog
        open={showOverwhelmedDlg}
        onOpenChange={setShowOverwhelmedDlg}
        title="Joueurs submergés ?"
        danger
        confirmLabel="Confirmer — manche perdue"
        cancelLabel="Annuler"
        onConfirm={handleOverwhelmedConfirm}
        onCancel={() => setShowOverwhelmedDlg(false)}
      >
        <p>
          Les joueurs ont été submergés dès le 7e dragon.
          Les trésors sont perdus, mais les plis et dragons battus comptent.
        </p>
      </Dialog>

      <Dialog
        open={showTerrorDlg}
        onOpenChange={setShowTerrorDlg}
        title="Valeur de terreur totale"
        confirmLabel="Calculer les scores"
        cancelLabel="Annuler"
        onConfirm={handleTerrorConfirm}
        onCancel={() => setShowTerrorDlg(false)}
      >
        <p>Entrez la somme des valeurs de terreur de tous les dragons rencontrés cette manche.</p>
        <div className="flex justify-center mt-5">
          <StepperInput value={roundDraft.terrorValue} onChange={terrorValue => onRoundDraftChange({ ...roundDraft, terrorValue })} min={0} />
        </div>
      </Dialog>

      <Dialog
        open={showAbortDlg}
        onOpenChange={setShowAbortDlg}
        title="Quitter la partie ?"
        danger
        confirmLabel="Quitter"
        cancelLabel="Annuler"
        onConfirm={onAbort}
        onCancel={() => setShowAbortDlg(false)}
      >
        <p>La partie en cours sera perdue. Cette action est irréversible.</p>
      </Dialog>

      <PageLayout
        header={
          <div className="px-4 py-3 border-b border-border bg-bg flex-shrink-0 flex items-center">
            <div className="flex-1 flex justify-start">
              {currentRound > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditPrevious}
                  aria-label="Corriger une manche précédente"
                >
                  ←
                </Button>
              )}
            </div>
            <RoundIndicator current={currentRound + 1} />
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAbortDlg(true)}
                aria-label="Quitter la partie"
              >
                ✕
              </Button>
            </div>
          </div>
        }
        footer={
          phase === 'betting' ? (
            <Button size="lg" onClick={() => onPhaseChange('playing')}>
              Valider les paris →
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" onClick={() => onPhaseChange('betting')}>
                ← Retour aux paris
              </Button>
              <div className="flex gap-2">
                <Button variant="danger" className="flex-1" onClick={() => setShowOverwhelmedDlg(true)}>
                  ☠ Submergés
                </Button>
                <Button className="flex-1" disabled={!canEndRound} onClick={() => setShowTerrorDlg(true)}>
                  Fin de manche →
                </Button>
              </div>
            </div>
          )
        }
      >
        {phase === 'betting' ? (
          <BettingPhase
            players={players}
            teams={teams}
            bets={roundDraft.bets}
            maxTricks={maxTricks}
            onBetChange={(id, val) => update('bets', id, val)}
            playerTotals={playerTotals}
            teamTotals={teamTotals}
          />
        ) : (
          <PlayingPhase
            players={players}
            teams={teams}
            bets={roundDraft.bets}
            tricks={roundDraft.tricks}
            dragons={roundDraft.dragons}
            treasures={roundDraft.treasures}
            treasuresActive={config.treasures}
            maxTricks={maxTricks}
            totalTricksPlayed={totalTricksPlayed}
            onTrickChange={(id, val)    => update('tricks',    id, val)}
            onDragonChange={(id, val)   => update('dragons',   id, val)}
            onTreasureChange={(id, val) => update('treasures', id, val)}
            playerTotals={playerTotals}
            teamTotals={teamTotals}
          />
        )}
      </PageLayout>
    </>
  )
}
