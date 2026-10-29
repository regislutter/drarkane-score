import { useState, useRef, useEffect } from 'react'
import HomePage    from './pages/HomePage'
import PlayersPage from './pages/PlayersPage'
import GamePage    from './pages/GamePage'
import EditRoundPage from './pages/EditRoundPage'
import ScorePage   from './pages/ScorePage'
import {
  saveGame,
  getHistory,
  getCurrentGame,
  saveCurrentGame,
  clearCurrentGame,
  type GameRecord,
} from './utils/storage'
import { completeRound, createRoundDraft } from './utils/scoring'
import type { GameConfig, Player, Team, RoundData, RoundDraft, RoundPhase } from './utils/scoring'

type View = 'home' | 'players' | 'game' | 'score'

export default function App() {
  const [resume] = useState(() => getCurrentGame())

  const [view, setView] = useState<View>(resume?.view ?? 'home')

  const [gameConfig, setGameConfig] = useState<GameConfig>(resume?.config ?? {
    playerCount: 4,
    mode:        'solo',
    treasures:   false,
  })

  const [players,         setPlayers]         = useState<Player[]>(resume?.players ?? [])
  const [teams,           setTeams]           = useState<Team[] | null>(resume?.teams ?? null)
  const [completedRounds, setCompletedRounds] = useState<RoundData[]>(resume?.completedRounds ?? [])
  const [history,         setHistory]         = useState<GameRecord[]>(() => getHistory())

  // Index de la manche terminée en cours de correction (null = manche en cours normale)
  const [editingIndex, setEditingIndex] = useState<number | null>(resume?.editingIndex ?? null)

  // Phase de la manche en cours (liftée ici pour piloter le retour arrière natif)
  const [phase, setPhase] = useState<RoundPhase>(resume?.phase ?? 'betting')
  const [roundDraft, setRoundDraft] = useState<RoundDraft>(() =>
    resume?.currentRound ?? createRoundDraft(resume?.players ?? [])
  )

  /* Toute modification métier de la partie active est sauvegardée ici. */
  useEffect(() => {
    if (view !== 'game' || players.length === 0) return
    saveCurrentGame({
      view: 'game',
      config: gameConfig,
      players,
      teams,
      completedRounds,
      phase,
      currentRound: roundDraft,
      editingIndex,
    })
  }, [view, gameConfig, players, teams, completedRounds, phase, roundDraft, editingIndex])

  /* ── Transitions ── */

  function handleStart(config: GameConfig) {
    setGameConfig(config)
    setView('players')
  }

  function handlePlayersConfirmed(playerList: Player[], teamList: Team[] | null) {
    setPlayers(playerList)
    setTeams(teamList)
    setCompletedRounds([])
    setPhase('betting')
    setRoundDraft(createRoundDraft(playerList))
    setEditingIndex(null)
    setView('game')
  }

  function handleRoundComplete() {
    const roundData = completeRound(roundDraft, players, gameConfig.treasures)
    const newRounds = [...completedRounds, roundData]
    setCompletedRounds(newRounds)
    setPhase('betting') // la manche suivante démarre en phase de paris
    setRoundDraft(createRoundDraft(players))

    if (newRounds.length === 3) {
      saveGame({
        config: gameConfig,
        players,
        teams,
        rounds: newRounds,
      })
      setHistory(getHistory())
      clearCurrentGame()
      setView('score')
    }
    // Sinon, GamePage est remontée avec key=newRounds.length → nouvelle manche automatiquement
  }

  function handleEditRoundChange(round: RoundData) {
    if (editingIndex === null) return
    const newRounds = completedRounds.map((r, i) => (i === editingIndex ? round : r))
    setCompletedRounds(newRounds)
  }

  function handleNewGame() {
    clearCurrentGame()
    setPlayers([])
    setTeams(null)
    setCompletedRounds([])
    setEditingIndex(null)
    setPhase('betting')
    setRoundDraft(createRoundDraft([]))
    setView('home')
  }

  function handleAbortGame() {
    clearCurrentGame()
    setPlayers([])
    setTeams(null)
    setCompletedRounds([])
    setEditingIndex(null)
    setPhase('betting')
    setRoundDraft(createRoundDraft([]))
    setView('home')
  }

  /* ── Retour arrière natif (geste de swipe / bouton retour) ──
     L'app est une machine à états sans URL : sans cela, le geste retour
     ferait un history.back() qui sort de la PWA. On piège le geste et on
     le mappe sur le retour logique de l'écran courant. */

  function goBack(): boolean {
    // Renvoie true si le retour a été géré dans l'app, false pour laisser quitter.
    if (editingIndex !== null) {
      // Correction ouverte : on remonte la chaîne de manches, puis on referme.
      setEditingIndex(editingIndex < completedRounds.length - 1 ? editingIndex + 1 : null)
      return true
    }
    if (view === 'game') {
      if (phase === 'playing') {
        setPhase('betting')             // ↩ retour à la saisie des paris
        return true
      }
      if (completedRounds.length > 0) {
        setEditingIndex(completedRounds.length - 1) // ↩ corriger la manche précédente
        return true
      }
      return true                       // manche 1 / paris : on reste dans l'app
    }
    if (view === 'players') {
      setView('home')
      return true
    }
    if (view === 'score') {
      return true                       // écran final : on évite de quitter par inadvertance
    }
    return false                        // accueil : on laisse le geste quitter l'app
  }

  const goBackRef = useRef(goBack)
  goBackRef.current = goBack

  useEffect(() => {
    // Entrée « piège » : donne un cran d'historique à consommer par le geste retour.
    window.history.pushState({ trap: true }, '')
    const onPop = () => {
      if (goBackRef.current()) {
        // Retour géré dans l'app : on ré-arme le piège pour le prochain geste.
        window.history.pushState({ trap: true }, '')
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  /* ── Rendu ── */

  if (view === 'home') {
    return (
      <HomePage
        config={gameConfig}
        history={history}
        onStart={handleStart}
      />
    )
  }

  if (view === 'players') {
    return (
      <PlayersPage
        config={gameConfig}
        onConfirm={handlePlayersConfirmed}
        onBack={() => setView('home')}
      />
    )
  }

  if (view === 'game') {
    return (
      <>
        {/* La manche en cours reste montée (masquée) pendant la correction
            pour ne pas perdre les saisies non validées. */}
        <div className={editingIndex !== null ? 'hidden' : 'contents'}>
          <GamePage
            // key force le remontage à chaque nouvelle manche
            key={completedRounds.length}
            config={gameConfig}
            players={players}
            teams={teams}
            completedRounds={completedRounds}
            phase={phase}
            roundDraft={roundDraft}
            onPhaseChange={setPhase}
            onRoundDraftChange={setRoundDraft}
            onRoundComplete={handleRoundComplete}
            onAbort={handleAbortGame}
            onEditPrevious={() => setEditingIndex(completedRounds.length - 1)}
          />
        </div>

        {editingIndex !== null && (
          <EditRoundPage
            key={editingIndex}
            index={editingIndex}
            config={gameConfig}
            players={players}
            teams={teams}
            round={completedRounds[editingIndex]}
            onChange={handleEditRoundChange}
            onNavigate={setEditingIndex}
          />
        )}
      </>
    )
  }

  if (view === 'score') {
    return (
      <ScorePage
        config={gameConfig}
        players={players}
        teams={teams}
        rounds={completedRounds}
        onNewGame={handleNewGame}
      />
    )
  }

  return null
}
