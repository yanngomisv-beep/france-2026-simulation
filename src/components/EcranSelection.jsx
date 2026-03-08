import { useState } from 'react'
import { PARTIS_JOUABLES } from '../data/programmes-politiques.js'

const FAMILLES = ['Tous', 'Nationaliste', 'Libéral-centriste', 'Gauche radicale',
  'Social-démocrate', 'Droite conservatrice', 'Écologiste', 'Communiste',
  'Trotskiste', 'Souverainiste', 'Souverainiste républicain', 'Centre-droit',
  'Gaulliste souverainiste', 'Populiste rural', 'Gaulliste humaniste',
  'Démocratie directe', 'Libéral-conservateur']

const DIFFICULTES = {
  'Intermédiaire': { couleur: 'text-green-400',  bg: 'bg-green-900/30 border-green-700' },
  'Difficile':     { couleur: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700' },
  'Très difficile':{ couleur: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700' },
  'Extrême':       { couleur: 'text-red-400',    bg: 'bg-red-900/30 border-red-700' },
}

const THEMES = ['economie', 'social', 'securite', 'immigration', 'energie', 'europe']
const THEMES_LABELS = {
  economie: '💰 Économie', social: '👥 Social', securite: '🛡️ Sécurité',
  immigration: '🌍 Immigration', energie: '⚡ Énergie', europe: '🇪🇺 Europe'
}

export default function EcranSelection({ onChoisir }) {
  const [filtre, setFiltre]       = useState('Tous')
  const [selectionne, setSelectionne] = useState(null)
  const [ongletProg, setOngletProg]   = useState('economie')

  const partiFiltres = filtre === 'Tous'
    ? PARTIS_JOUABLES
    : PARTIS_JOUABLES.filter(p => p.famille === filtre)

  const parti = PARTIS_JOUABLES.find(p => p.id === selectionne)
  const diff  = parti ? DIFFICULTES[parti.difficulte] : null

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* En-tête */}
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl font-black text-white mb-2">🇫🇷 France 2026</h1>
        <p className="text-slate-400 text-lg">Choisissez votre camp politique pour commencer la simulation</p>
        <p className="text-slate-500 text-sm mt-1">Mars 2026 — La France sous tension. Quel président serez-vous ?</p>
      </div>

      <div className="flex flex-1 gap-0 max-w-screen-2xl mx-auto w-full px-4 pb-8">

        {/* ── Colonne gauche : liste des partis ── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 pr-4">

          {/* Filtre famille */}
          <select
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded-lg px-3 py-2 w-full"
          >
            {['Tous', ...new Set(PARTIS_JOUABLES.map(p => p.famille))].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Liste */}
          <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {partiFiltres.map(p => {
              const d = DIFFICULTES[p.difficulte]
              const actif = selectionne === p.id
              return (
                <button key={p.id}
                  onClick={() => { setSelectionne(p.id); setOngletProg('economie') }}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    actif
                      ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-900/30'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.nom}</p>
                      <p className="text-xs text-slate-400 truncate">{p.leader}</p>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.couleur }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{p.famille}</span>
                    <span className={`text-xs font-semibold ${d.couleur}`}>{p.difficulte}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-xs text-slate-500">Popularité de départ :</span>
                    <span className="text-xs font-bold text-white">{p.popularite_base}%</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Colonne droite : détail du parti ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {!parti ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl mb-4">👈</p>
                <p className="text-slate-400 text-lg">Sélectionnez un parti pour voir son programme</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header parti */}
              <div className="rounded-2xl border p-6 flex items-start gap-5"
                style={{ backgroundColor: parti.couleur + '22', borderColor: parti.couleur + '66' }}>
                <div className="text-6xl">{parti.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-black text-white">{parti.nom}</h2>
                      <p className="text-slate-300 text-lg">👤 {parti.leader}</p>
                      <p className="text-slate-400 italic mt-1">"{parti.slogan}"</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${diff.bg} ${diff.couleur}`}>
                        {parti.difficulte}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        {parti.famille}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mt-3">{parti.description}</p>

                  {/* Stats de départ */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Popularité initiale', val: `${parti.popularite_base}%`,
                        color: parti.popularite_base > 25 ? 'text-green-400' : parti.popularite_base > 15 ? 'text-yellow-400' : 'text-red-400' },
                      { label: 'Tension sociale', val: `${parti.tension_base}/100`,
                        color: parti.tension_base > 60 ? 'text-red-400' : parti.tension_base > 50 ? 'text-yellow-400' : 'text-green-400' },
                      { label: 'Alliés potentiels', val: parti.partis_allies.length || 'Aucun',
                        color: parti.partis_allies.length > 1 ? 'text-green-400' : 'text-yellow-400' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-slate-900/60 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className={`text-xl font-bold mt-1 ${color}`}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Alliés / Hostiles */}
                  <div className="flex gap-4 mt-3 flex-wrap">
                    {parti.partis_allies.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-400">✅ Alliés :</span>
                        {parti.partis_allies.map(id => (
                          <span key={id} className="text-xs bg-green-900/30 border border-green-700 text-green-300 px-2 py-0.5 rounded">
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                    {parti.partis_hostiles.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-red-400">❌ Hostiles :</span>
                        {parti.partis_hostiles.slice(0,5).map(id => (
                          <span key={id} className="text-xs bg-red-900/30 border border-red-700 text-red-300 px-2 py-0.5 rounded">
                            {id}
                          </span>
                        ))}
                        {parti.partis_hostiles.length > 5 && (
                          <span className="text-xs text-slate-500">+{parti.partis_hostiles.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Programme par thème */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 flex-1 flex flex-col">
                <div className="flex gap-1 p-3 border-b border-slate-700 flex-wrap">
                  {THEMES.map(t => (
                    <button key={t}
                      onClick={() => setOngletProg(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        ongletProg === t
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}>
                      {THEMES_LABELS[t]}
                    </button>
                  ))}
                </div>

                <div className="p-5 flex-1">
                  <ul className="flex flex-col gap-2.5">
                    {(parti.programme[ongletProg] ?? []).map((mesure, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold text-sm flex-shrink-0 mt-0.5">
                          {String(i+1).padStart(2,'0')}
                        </span>
                        <p className="text-sm text-slate-300">{mesure}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bouton Jouer */}
              <button
                onClick={() => onChoisir(parti.id)}
                className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-[1.01] shadow-lg"
                style={{ backgroundColor: parti.couleur }}
              >
                🚀 Jouer avec {parti.nom} — {parti.leader}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
