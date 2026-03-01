import { useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Carte from './components/Carte.jsx'
import Hemicycle from './components/Hemicycle.jsx'
import Legislatif from './components/Legislatif.jsx'

const ONGLETS = [
  { id: 'dashboard', label: '🏛️ Élysée' },
  { id: 'carte',     label: '🗺️ Carte' },
  { id: 'hemicycle', label: '⚖️ Hémicycle' },
  { id: 'legislatif',label: '📜 Lois' },
]

export default function App() {
  const [onglet, setOnglet] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">🇫🇷 France 2026</h1>
          <p className="text-xs text-slate-400">Simulation Souveraine — 1er Mars 2026</p>
        </div>
        <div className="flex gap-2">
          {ONGLETS.map(o => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                onglet === o.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 p-6">
        {onglet === 'dashboard'  && <Dashboard />}
        {onglet === 'carte'      && <Carte />}
        {onglet === 'hemicycle'  && <Hemicycle />}
        {onglet === 'legislatif' && <Legislatif />}
      </main>
    </div>
  )
}
