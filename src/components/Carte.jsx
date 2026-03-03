import { useState } from 'react'
import {
  DEPARTEMENTS_SVG,
  DOMTOM_SVG,
  COULEURS_PARTIS,
  getPolitiqueDepartement,
} from '../data/departements-svg.js'

const MODES = [
  { id: 'politique',  label: '🗳️ Tendance politique' },
  { id: 'tension',    label: '🔥 Tension sociale' },
  { id: 'popularite', label: '📊 Popularité' },
]

// Couleur selon le mode
function getCouleurDep(code, mode, etatJeu) {
  const pol = getPolitiqueDepartement(code)

  if (mode === 'politique') {
    return COULEURS_PARTIS[pol.parti] ?? '#94a3b8'
  }

  if (mode === 'tension') {
    const tension = etatJeu?.tension_sociale ?? 45
    const intensite = Math.min(1, tension / 100)
    const r = Math.round(80 + intensite * 175)
    const g = Math.round(120 - intensite * 120)
    const b = Math.round(60 - intensite * 60)
    return `rgb(${r},${g},${b})`
  }

  if (mode === 'popularite') {
    const pop = etatJeu?.popularite_joueur ?? 42
    const intensite = pop / 100
    const r = Math.round(220 - intensite * 180)
    const g = Math.round(50 + intensite * 160)
    const b = Math.round(50)
    return `rgb(${r},${g},${b})`
  }

  return '#475569'
}

function PanneauDepartement({ code, onFermer }) {
  const dep = DEPARTEMENTS_SVG[code] ?? DOMTOM_SVG[code]
  const pol = getPolitiqueDepartement(code)
  if (!dep) return null

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl z-10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{dep.nom}</h3>
          <p className="text-xs text-slate-400">{dep.chef_lieu} — Dep. {code}</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg">✕</button>
      </div>

      {/* Parti dominant */}
      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-900">
        <div className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: COULEURS_PARTIS[pol.parti] }} />
        <div>
          <p className="text-xs text-slate-400">Parti dominant</p>
          <p className="font-semibold text-white">{pol.parti} — {pol.score}%</p>
        </div>
      </div>

      {/* Intentions de vote */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
          Intentions de vote 2026
        </p>
        {Object.entries(pol.intentions)
          .sort(([, a], [, b]) => b - a)
          .map(([parti, pct]) => (
            <div key={parti} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              <span className="text-xs text-slate-400 w-20">{parti}</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8',
                  }} />
              </div>
              <span className="text-xs text-white font-semibold w-8 text-right">{pct}%</span>
            </div>
          ))}
      </div>
    </div>
  )
}

function Legende({ mode }) {
  if (mode === 'politique') {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(COULEURS_PARTIS)
          .filter(([p]) => ['LFI','PS_ECO','EPR','LR','RN','PATRIOTES','UPR'].includes(p))
          .map(([parti, couleur]) => (
            <div key={parti} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: couleur }} />
              <span className="text-xs text-slate-400">{parti}</span>
            </div>
          ))}
      </div>
    )
  }
  if (mode === 'tension') {
    return (
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-slate-400">Faible</span>
        <div className="flex-1 h-3 rounded-full"
          style={{ background: 'linear-gradient(to right, rgb(80,120,60), rgb(255,60,0))' }} />
        <span className="text-xs text-slate-400">Élevée</span>
      </div>
    )
  }
  if (mode === 'popularite') {
    return (
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-slate-400">Impopulaire</span>
        <div className="flex-1 h-3 rounded-full"
          style={{ background: 'linear-gradient(to right, rgb(220,50,50), rgb(40,210,50))' }} />
        <span className="text-xs text-slate-400">Populaire</span>
      </div>
    )
  }
  return null
}

export default function Carte({ etatJeu }) {
  const [mode, setMode] = useState('politique')
  const [depSelectionnee, setDepSelectionnee] = useState(null)
  const [hover, setHover] = useState(null)

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">

      {/* Contrôles */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">🗺️ Carte de France</h2>
        <div className="flex gap-2">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">

        <svg
          viewBox="0 0 750 1100"
          className="w-full"
          style={{ maxHeight: '80vh' }}
        >
          {/* Fond */}
          <rect width="750" height="1100" fill="#0f172a" />

          {/* Séparateur DOM-TOM */}
          <line x1="20" y1="800" x2="730" y2="800"
            stroke="#334155" strokeWidth="1" strokeDasharray="6,4" />
          <text x="30" y="815" fill="#475569" fontSize="11">
            Départements et Régions d'Outre-Mer
          </text>

          {/* Départements métropolitains */}
          {Object.entries(DEPARTEMENTS_SVG)
            .filter(([, dep]) => dep.path)
            .map(([code, dep]) => {
              const couleur = getCouleurDep(code, mode, etatJeu)
              const estSurvole = hover === code
              const estSelectionne = depSelectionnee === code

              return (
                <g key={code}
                  onClick={() => setDepSelectionnee(estSelectionne ? null : code)}
                  onMouseEnter={() => setHover(code)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={dep.path}
                    fill={couleur}
                    fillOpacity={estSurvole ? 1 : 0.82}
                    stroke={estSelectionne ? '#ffffff' : '#0f172a'}
                    strokeWidth={estSelectionne ? 2 : 0.8}
                  />
                  {/* Tooltip au survol */}
                  {estSurvole && (
                    <g>
                      <rect
                        x={dep.cx - 28} y={dep.cy - 22}
                        width={56} height={18}
                        rx={3} fill="#1e293b"
                        stroke="#475569" strokeWidth={0.5}
                      />
                      <text
                        x={dep.cx} y={dep.cy - 10}
                        textAnchor="middle"
                        fill="white" fontSize="8"
                        fontWeight="bold"
                      >
                        {dep.nom.substring(0, 12)}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

          {/* DOM-TOM */}
          {Object.entries(DOMTOM_SVG).map(([code, dep]) => {
            const couleur = getCouleurDep(code, mode, etatJeu)
            const estSurvole = hover === code
            const estSelectionne = depSelectionnee === code

            return (
              <g key={code}
                onClick={() => setDepSelectionnee(estSelectionne ? null : code)}
                onMouseEnter={() => setHover(code)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Encart de fond */}
                <rect
                  x={dep.encart.x - 5} y={dep.encart.y - 5}
                  width={dep.encart.w + 10} height={dep.encart.h + 10}
                  rx={4} fill="#1e293b" stroke="#334155" strokeWidth={0.8}
                />
                <path
                  d={dep.path}
                  fill={couleur}
                  fillOpacity={estSurvole ? 1 : 0.82}
                  stroke={estSelectionne ? '#ffffff' : '#0f172a'}
                  strokeWidth={estSelectionne ? 2 : 0.8}
                />
                <text
                  x={dep.cx} y={dep.encart.y + dep.encart.h + 4}
                  textAnchor="middle"
                  fill="#94a3b8" fontSize="9"
                >
                  {dep.nom}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Panneau département sélectionné */}
        {depSelectionnee && (
          <PanneauDepartement
            code={depSelectionnee}
            onFermer={() => setDepSelectionnee(null)}
          />
        )}
      </div>

      {/* Légende */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Légende</p>
        <Legende mode={mode} />
      </div>

      {/* Stats nationales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Popularité nationale', val: `${etatJeu?.popularite_joueur ?? 42}%` },
          { label: 'Tension sociale',      val: `${etatJeu?.tension_sociale ?? 45}/100` },
          { label: 'Stabilité',            val: `${etatJeu?.stabilite ?? 58}/100` },
          { label: 'Date',                 val: etatJeu?.date ?? '1er Mars 2026' },
        ].map(({ label, val }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-lg font-bold text-white mt-1">{val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
