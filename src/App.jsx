import { useState } from 'react'
import GameEngine from './components/GameEngine.jsx'
import Dashboard from './components/Dashboard.jsx'
import Carte from './components/Carte.jsx'
import Hemicycle from './components/Hemicycle.jsx'
import Legislatif from './components/Legislatif.jsx'
import FabriqueLoi from './components/FabriqueLoi.jsx'
import EcranSelection from './components/EcranSelection.jsx'

const ONGLETS = [
  { id: 'dashboard',  label: '🏛️ Élysée' },
  { id: 'carte',      label: '🗺️ Carte' },
  { id: 'hemicycle',  label: '⚖️ Hémicycle' },
  { id: 'legislatif', label: '📜 Lois' },
  { id: 'fabrique',   label: '⚗️ Fabrique de loi' },
]

export default function App() {
  const [onglet, setOnglet]         = useState('dashboard')
  const [partiChoisi, setPartiChoisi] = useState(null)

  if (!partiChoisi) {
    return <EcranSelection onChoisir={setPartiChoisi} />
  }

  return (
    <GameEngine partiJoueur={partiChoisi}>
      {(gameProps) => (
        <div className="min-h-screen flex flex-col">
          <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">🇫🇷 France 2026</h1>
              <span className="text-xs text-slate-500">—</span>
              <span className="text-sm text-slate-300">
                {gameProps.etatJeu.leader} · {gameProps.etatJeu.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {ONGLETS.map(o => (
                  <button key={o.id} onClick={() => setOnglet(o.id)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      onglet === o.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPartiChoisi(null)}
                className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 px-2 py-1 rounded transition-colors"
              >
                ↩ Changer de camp
              </button>
            </div>
          </header>

          {onglet === 'dashboard'  && <Dashboard  {...gameProps} />}
          {onglet === 'carte'      && <Carte       {...gameProps} />}
          {onglet === 'hemicycle'  && <Hemicycle   {...gameProps} />}
          {onglet === 'legislatif' && <Legislatif  {...gameProps} />}
          {onglet === 'fabrique'   && <FabriqueLoi {...gameProps} />}
        </div>
      )}
    </GameEngine>
  )
}
