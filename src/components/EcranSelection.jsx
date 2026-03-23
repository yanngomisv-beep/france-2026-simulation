import { useState } from 'react'
import { PARTIS_JOUABLES } from '../data/programmes-politiques.js'

// ═══════════════════════════════════════════════════════════
// RÉSULTATS MUNICIPALES 2026
// ═══════════════════════════════════════════════════════════

const RESULTATS_MUNICIPALES = [
  { parti: 'RN',       couleur: '#1a1aff', pct: 28, maires: 312, variation: +89,  label: 'RN'          },
  { parti: 'LR',       couleur: '#0066cc', pct: 22, maires: 248, variation: -41,  label: 'LR'          },
  { parti: 'PS_ECO',   couleur: '#ff8c00', pct: 18, maires: 203, variation: +12,  label: 'PS-Écolos'   },
  { parti: 'EPR',      couleur: '#ffcc00', pct: 14, maires: 158, variation: -67,  label: 'Renaissance' },
  { parti: 'LFI',      couleur: '#cc0000', pct: 9,  maires: 101, variation: +28,  label: 'LFI'         },
  { parti: 'DIVERS',   couleur: '#94a3b8', pct: 9,  maires: 102, variation: -21,  label: 'Divers'      },
]

// Impact des municipales sur les stats de départ selon le parti choisi
const IMPACT_MUNICIPALES = {
  RN:             { popularite: +4,  tension: -3,  note: 'Vague bleue marine dans les communes — vous surfez sur la dynamique locale' },
  LR:             { popularite: +2,  tension: -1,  note: 'Solide ancrage local malgré le recul national' },
  PS_ECO:         { popularite: +1,  tension: -2,  note: 'Bon résultat dans les grandes métropoles' },
  RE:             { popularite: -3,  tension: +4,  note: 'Déroute municipale — les élus locaux fragilisent votre autorité' },
  HORIZONS:       { popularite: +1,  tension: -1,  note: 'Philippe résiste bien dans ses bastions du Havre et alentours' },
  LFI:            { popularite: +2,  tension: +3,  note: 'Progression dans les banlieues, mais tensions dans les quartiers gagnés' },
  default:        { popularite: 0,   tension: 0,   note: 'Les résultats municipaux ont peu impacté votre position nationale' },
}

const DIFFICULTES = {
  'Intermédiaire': { couleur: 'text-green-400',  bg: 'bg-green-900/30 border-green-700' },
  'Difficile':     { couleur: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700' },
  'Très difficile':{ couleur: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700' },
  'Extrême':       { couleur: 'text-red-400',    bg: 'bg-red-900/30 border-red-700' },
}

const THEMES = ['economie', 'social', 'securite', 'immigration', 'energie', 'europe']
const THEMES_LABELS = {
  economie:   '💰 Économie',
  social:     '👥 Social',
  securite:   '🛡️ Sécurité',
  immigration:'🌍 Immigration',
  energie:    '⚡ Énergie',
  europe:     '🇪🇺 Europe',
}

// ═══════════════════════════════════════════════════════════
// BANDEAU MUNICIPALES
// ═══════════════════════════════════════════════════════════

function BandeauMunicipales() {
  const [expanded, setExpanded] = useState(false)
  const total = RESULTATS_MUNICIPALES.reduce((s, r) => s + r.maires, 0)

  return (
    <div className="bg-slate-900/80 border border-amber-700/40 rounded-2xl overflow-hidden mx-4 mb-6">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/60 transition-colors"
      >
        <span className="text-lg">🗳️</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-amber-300">Résultats des Élections Municipales — Mars 2026</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Le RN s'impose comme première force locale · {total} communes analysées
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Miniature barre */}
          <div className="hidden sm:flex h-3 w-36 rounded-full overflow-hidden gap-px">
            {RESULTATS_MUNICIPALES.map(r => (
              <div key={r.parti} style={{ width: `${r.pct}%`, backgroundColor: r.couleur }} />
            ))}
          </div>
          <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Détail déplié */}
      {expanded && (
        <div className="border-t border-slate-700/60 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {RESULTATS_MUNICIPALES.map(r => (
              <div key={r.parti} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/40">
                <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: r.couleur }} />
                <p className="text-xs font-bold text-white">{r.label}</p>
                <p className="text-xl font-black mt-0.5" style={{ color: r.couleur }}>{r.pct}%</p>
                <p className="text-xs text-slate-400">{r.maires} mairies</p>
                <p className={`text-xs font-semibold mt-0.5 ${r.variation > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.variation > 0 ? '+' : ''}{r.variation}
                </p>
              </div>
            ))}
          </div>

          {/* Barre proportionnelle */}
          <div className="flex h-4 rounded-full overflow-hidden gap-px mb-2">
            {RESULTATS_MUNICIPALES.map(r => (
              <div key={r.parti}
                style={{ width: `${r.pct}%`, backgroundColor: r.couleur }}
                className="transition-all"
                title={`${r.label} : ${r.pct}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {RESULTATS_MUNICIPALES.map(r => (
              <div key={r.parti} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.couleur }} />
                <span className="text-xs text-slate-400">{r.label} <strong className="text-white">{r.pct}%</strong></span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-3 border-t border-slate-700/40 pt-3">
            📌 Ces résultats influencent votre popularité de départ et la tension sociale selon votre parti.
            La carte électorale locale est mise à jour dans l'onglet <strong className="text-slate-300">🗺️ Carte</strong>.
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

export default function EcranSelection({ onChoisir }) {
  const [selectionne, setSelectionne] = useState(null)
  const [ongletProg, setOngletProg]   = useState('economie')
  const [filtreFiltre, setFiltreFiltre] = useState('Tous')

  const parti  = PARTIS_JOUABLES.find(p => p.id === selectionne)
  const diff   = parti ? DIFFICULTES[parti.difficulte] : null
  const impact = parti ? (IMPACT_MUNICIPALES[parti.id] ?? IMPACT_MUNICIPALES.default) : null

  const familles = ['Tous', ...new Set(PARTIS_JOUABLES.map(p => p.famille))]
  const partis   = filtreFiltre === 'Tous'
    ? PARTIS_JOUABLES
    : PARTIS_JOUABLES.filter(p => p.famille === filtreFiltre)

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ══ En-tête ══ */}
      <div className="text-center pt-10 pb-6 px-4">
        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">🇫🇷 France 2026</h1>
        <p className="text-slate-400 text-lg">Simulation Souveraine — Choisissez votre camp</p>
        <p className="text-slate-600 text-sm mt-1.5">
          🗓️ Mars 2026 — Les municipales viennent de redistribuer les cartes locales.
          Vous êtes Président de la République. Quel cap allez-vous donner ?
        </p>
      </div>

      {/* ══ Bandeau municipales ══ */}
      <BandeauMunicipales />

      {/* ══ Corps ══ */}
      <div className="flex flex-1 gap-0 max-w-screen-2xl mx-auto w-full px-4 pb-8 min-h-0">

        {/* ─── Colonne gauche : liste ─── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2.5 pr-4">

          <select
            value={filtreFiltre}
            onChange={e => setFiltreFiltre(e.target.value)}
            className="bg-slate-800 border border-slate-600/60 text-slate-300 text-xs rounded-lg px-3 py-2 w-full"
          >
            {familles.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
            {partis.map(p => {
              const d = DIFFICULTES[p.difficulte]
              const imp = IMPACT_MUNICIPALES[p.id] ?? IMPACT_MUNICIPALES.default
              const actif = selectionne === p.id
              return (
                <button key={p.id}
                  onClick={() => { setSelectionne(p.id); setOngletProg('economie') }}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    actif
                      ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-900/30'
                      : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.nom}</p>
                      <p className="text-xs text-slate-500 truncate">{p.leader}</p>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.couleur }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs font-semibold ${d.couleur}`}>{p.difficulte}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">{p.popularite_base}%</span>
                      {imp.popularite !== 0 && (
                        <span className={`font-bold ${imp.popularite > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {imp.popularite > 0 ? '+' : ''}{imp.popularite}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── Colonne droite : détail ─── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {!parti ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl mb-4">👈</p>
                <p className="text-slate-400 text-lg">Sélectionnez un parti pour voir son programme</p>
                <p className="text-slate-600 text-sm mt-1">16 partis disponibles, de LO à l'UPR</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header parti */}
              <div className="rounded-2xl border p-5 flex items-start gap-5"
                style={{ backgroundColor: parti.couleur + '18', borderColor: parti.couleur + '50' }}>
                <div className="text-5xl">{parti.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-black text-white">{parti.nom}</h2>
                      <p className="text-slate-300">👤 {parti.leader}</p>
                      <p className="text-slate-500 italic text-sm mt-0.5">"{parti.slogan}"</p>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${diff.bg} ${diff.couleur}`}>
                        {parti.difficulte}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{parti.famille}</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mt-2 leading-relaxed">{parti.description}</p>

                  {/* Stats de départ + impact municipales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">
                    {[
                      {
                        label: 'Popularité initiale',
                        val: `${parti.popularite_base + impact.popularite}%`,
                        sub: impact.popularite !== 0 ? `base ${parti.popularite_base}% ${impact.popularite > 0 ? '+' : ''}${impact.popularite} municipales` : `base ${parti.popularite_base}%`,
                        color: (parti.popularite_base + impact.popularite) > 25 ? 'text-green-400' : (parti.popularite_base + impact.popularite) > 15 ? 'text-yellow-400' : 'text-red-400',
                      },
                      {
                        label: 'Tension sociale',
                        val: `${parti.tension_base + impact.tension}/100`,
                        sub: impact.tension !== 0 ? `base ${parti.tension_base} ${impact.tension > 0 ? '+' : ''}${impact.tension} municipales` : `base ${parti.tension_base}`,
                        color: (parti.tension_base + impact.tension) > 60 ? 'text-red-400' : (parti.tension_base + impact.tension) > 50 ? 'text-yellow-400' : 'text-green-400',
                      },
                      {
                        label: 'Déficit de départ',
                        val: `${parti.deficit_base ?? 173} Md€`,
                        sub: 'héritage budgétaire',
                        color: (parti.deficit_base ?? 173) > 180 ? 'text-red-400' : 'text-yellow-400',
                      },
                      {
                        label: 'Alliés potentiels',
                        val: parti.partis_allies.length || 'Aucun',
                        sub: parti.partis_allies.join(', ') || 'isolé',
                        color: parti.partis_allies.length > 1 ? 'text-green-400' : 'text-yellow-400',
                      },
                    ].map(({ label, val, sub, color }) => (
                      <div key={label} className="bg-slate-900/60 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                        <p className={`text-lg font-black ${color}`}>{val}</p>
                        <p className="text-xs text-slate-600 truncate mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Impact municipales */}
                  {impact && (
                    <div className={`mt-3 rounded-xl px-3 py-2 border text-xs flex items-start gap-2 ${
                      impact.popularite >= 0 ? 'bg-emerald-950/30 border-emerald-800/30 text-emerald-300' : 'bg-red-950/30 border-red-800/30 text-red-300'
                    }`}>
                      <span className="text-base flex-shrink-0">🗳️</span>
                      <span>{impact.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Programme par thème */}
              <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 flex-1 flex flex-col min-h-0">
                <div className="flex gap-1 p-3 border-b border-slate-700/60 flex-wrap">
                  {THEMES.map(t => (
                    <button key={t} onClick={() => setOngletProg(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        ongletProg === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}>
                      {THEMES_LABELS[t]}
                    </button>
                  ))}
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                  <ul className="flex flex-col gap-2">
                    {(parti.programme[ongletProg] ?? []).map((mesure, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold text-sm flex-shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-slate-300 leading-relaxed">{mesure}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bouton Jouer */}
              <button
                onClick={() => onChoisir(parti.id)}
                className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-[1.01] shadow-xl active:scale-[0.99]"
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
