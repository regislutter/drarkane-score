import { useState } from 'react'
import HomePage    from './pages/HomePage'
import PlayersPage from './pages/PlayersPage'
import GamePage    from './pages/GamePage'
import ScorePage   from './pages/ScorePage'
import {
  saveGame,
  getHistory,
  getCurrentGame,
  saveCurrentGame,
  clearCurrentGame,
  type GameRecord,
} from './utils/storage'
import type { GameConfig, Player, Team, RoundData } from './utils/scoring'

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

  /* ── Transitions ── */

  function handleStart(config: GameConfig) {
    setGameConfig(config)
    setView('players')
  }

  function handlePlayersConfirmed(playerList: Player[], teamList: Team[] | null) {
    setPlayers(playerList)
    setTeams(teamList)
    setCompletedRounds([])
    setView('game')
    saveCurrentGame({
      view:            'game',
      config:          gameConfig,
      players:         playerList,
      teams:           teamList,
      completedRounds: [],
    })
  }

  function handleRoundComplete(roundData: RoundData) {
    const newRounds = [...completedRounds, roundData]
    setCompletedRounds(newRounds)

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
    } else {
      saveCurrentGame({
        view:            'game',
        config:          gameConfig,
        players,
        teams,
        completedRounds: newRounds,
      })
    }
    // Sinon, GamePage est remontée avec key=newRounds.length → nouvelle manche automatiquement
  }

  function handleNewGame() {
    clearCurrentGame()
    setPlayers([])
    setTeams(null)
    setCompletedRounds([])
    setView('home')
  }

  function handleAbortGame() {
    clearCurrentGame()
    setPlayers([])
    setTeams(null)
    setCompletedRounds([])
    setView('home')
  }

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
      <GamePage
        // key force le remontage à chaque nouvelle manche
        key={completedRounds.length}
        config={gameConfig}
        players={players}
        teams={teams}
        completedRounds={completedRounds}
        onRoundComplete={handleRoundComplete}
        onAbort={handleAbortGame}
      />
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
