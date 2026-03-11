import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { COULEURS_PARTIS, getPolitiqueDepartement } from '../data/departements-svg.js'
import PanneauEnergie from './PanneauEnergie.jsx'

// ─────────────────────────────────────────────────────────────
// CONFIG MODES
// ─────────────────────────────────────────────────────────────

const MODES = [
  { id: 'politique',  label: '🗳️ Politique' },
  { id: 'tension',    label: '🔥 Tension' },
  { id: 'popularite', label: '📊 Popularité' },
  { id: 'energie',    label: '⚡ Énergie' },
  { id: 'chomage',    label: '📉 Chômage' },
]

// ─────────────────────────────────────────────────────────────
// DONNÉES PAYS EUROPÉENS (relations diplomatiques uniquement)
// Les échanges électriques viennent de etatJeu.echanges_mw
// ─────────────────────────────────────────────────────────────

const PAYS_DATA = {
  "ESP": { nom: "Espagne",      emoji: "🇪🇸", echanges_key: "espagne",             relation: 55, tension: 42 },
  "ITA": { nom: "Italie",       emoji: "🇮🇹", echanges_key: "italie",              relation: 60, tension: 38 },
  "CHE": { nom: "Suisse",       emoji: "🇨🇭", echanges_key: "suisse",              relation: 72, tension: 25 },
  "DEU": { nom: "Allemagne",    emoji: "🇩🇪", echanges_key: "allemagne_belgique",  relation: 65, tension: 44 },
  "BEL": { nom: "Belgique",     emoji: "🇧🇪", echanges_key: "allemagne_belgique",  relation: 68, tension: 48 },
  "LUX": { nom: "Luxembourg",   emoji: "🇱🇺", echanges_key: null,                  relation: 70, tension: 22 },
  "GBR": { nom: "Royaume-Uni",  emoji: "🇬🇧", echanges_key: "angleterre",          relation: 48, tension: 52 },
  "AND": { nom: "Andorre",      emoji: "🇦🇩", echanges_key: null,                  relation: 80, tension: 10 },
  "MCO": { nom: "Monaco",       emoji: "🇲🇨", echanges_key: null,                  relation: 85, tension:  8 },
  "NLD": { nom: "Pays-Bas",     emoji: "🇳🇱", echanges_key: null,                  relation: 62, tension: 35 },
}

// Capacités d'interconnexion max (MW) pour normaliser les barres
const CAP_MAX = {
  angleterre: 2000, allemagne_belgique: 3500,
  suisse: 3500, italie: 3900, espagne: 800,
}

// ─────────────────────────────────────────────────────────────
// DROM-COM CONFIG
// ─────────────────────────────────────────────────────────────

const DROMCOM_CODES = ['971','972','973','974','976']

const DROMCOM_INFO = {
  '971': { nom: 'Guadeloupe',  encartX: 20,  encartY: 650, encartW: 90, encartH: 80, scale: 3.2, center: [-61.55, 16.17] },
  '972': { nom: 'Martinique',  encartX: 120, encartY: 650, encartW: 80, encartH: 80, scale: 5.5, center: [-61.02, 14.64] },
  '973': { nom: 'Guyane',      encartX: 210, encartY: 635, encartW: 95, encartH: 95, scale: 0.9, center: [-53.1,   3.93] },
  '974': { nom: 'La Réunion',  encartX: 315, encartY: 650, encartW: 85, encartH: 80, scale: 4.8, center: [55.54, -21.13] },
  '976': { nom: 'Mayotte',     encartX: 410, encartY: 655, encartW: 75, encartH: 75, scale: 9.0, center: [45.17, -12.83] },
}

// ─────────────────────────────────────────────────────────────
// COULEURS MODES
// ─────────────────────────────────────────────────────────────

function getCouleurDep(code, mode, etatJeu) {
  const pol = getPolitiqueDepartement(code)
  if (mode === 'politique') return COULEURS_PARTIS[pol.parti] ?? '#94a3b8'
  if (mode === 'tension') {
    const t = Math.min(1, (etatJeu?.tension_sociale ?? 45) / 100)
    const seed = code.charCodeAt(0) / 200
    const tv = Math.min(1, Math.max(0, t + (seed - 0.5) * 0.2))
    return `rgb(${Math.round(60 + tv*195)},${Math.round(120 - tv*110)},${Math.round(60 - tv*55)})`
  }
  if (mode === 'popularite') {
    const p = Math.min(1, Math.max(0, (etatJeu?.popularite_joueur ?? 42) / 100))
    const seed = code.charCodeAt(0) / 300
    const pv = Math.min(1, Math.max(0, p + (seed - 0.5) * 0.15))
    return `rgb(${Math.round(210 - pv*180)},${Math.round(50 + pv*160)},60)`
  }
  if (mode === 'energie') {
    const nuc = etatJeu?.part_nucleaire_mix_pct ?? 68
    const t = nuc / 100
    return `rgb(${Math.round(30 + t*30)},${Math.round(80 + t*100)},${Math.round(150 + t*80)})`
  }
  if (mode === 'chomage') {
    const seed = ((code.charCodeAt(0) * 17 + (code.charCodeAt(1) ?? 1) * 5) % 100) / 100
    const base = (etatJeu?.tension_sociale ?? 45) / 100
    const t = Math.min(1, Math.max(0, base * 0.7 + seed * 0.3))
    return `rgb(${Math.round(200*t)},${Math.round(160-120*t)},${Math.round(30+20*t)})`
  }
  return '#475569'
}

function getCouleurPays(code, mode, etatJeu) {
  const p = PAYS_DATA[code]
  if (!p) return '#1e293b'
  if (mode === 'tension') {
    const t = p.tension / 100
    return `rgb(${Math.round(60+t*195)},${Math.round(120-t*110)},${Math.round(60-t*55)})`
  }
  if (mode === 'energie') {
    // Couleur dynamique basée sur les échanges réels
    if (!p.echanges_key) return '#1e3a5f'
    const mw = etatJeu?.echanges_mw?.[p.echanges_key] ?? 0
    return mw > 0 ? '#14532d' : '#7f1d1d'
  }
  return '#1e3a5f'
}

// Solde échange pour un pays ISO depuis etatJeu
function getSoldePays(code, etatJeu) {
  const p = PAYS_DATA[code]
  if (!p?.echanges_key) return null
  const mw = etatJeu?.echanges_mw?.[p.echanges_key]
  return mw ?? null
}

function fmtMW(mw) {
  if (mw == null) return '—'
  const abs = Math.abs(mw)
  const s = mw >= 0 ? '+' : ''
  if (abs >= 1000) return `${s}${(mw / 1000).toFixed(1)} GW`
  return `${s}${Math.round(mw)} MW`
}

// ─────────────────────────────────────────────────────────────
// PANNEAU DÉPARTEMENT
// ─────────────────────────────────────────────────────────────

function PanneauDepartement({ feature, onFermer, mode, etatJeu }) {
  if (!feature) return null
  const code = feature.properties.code
  const nom  = feature.properties.nom
  const pol  = getPolitiqueDepartement(code)

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900 border border-slate-600 rounded-xl p-4 shadow-2xl z-20 backdrop-blur">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-base">{nom}</h3>
          <p className="text-xs text-slate-500">Département {code}</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
      </div>

      {/* Parti politique */}
      <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-slate-800">
        <div className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: COULEURS_PARTIS[pol.parti] ?? '#94a3b8' }} />
        <div>
          <p className="text-xs text-slate-400">Tendance dominante</p>
          <p className="font-semibold text-white text-sm">{pol.parti} — {pol.score}%</p>
        </div>
      </div>

      {mode === 'tension' && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/30">
          <p className="text-xs text-red-400 font-semibold mb-1.5">Tension sociale</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full"
                style={{ width: `${etatJeu?.tension_sociale ?? 45}%` }} />
            </div>
            <span className="text-xs text-red-300 font-bold">{Math.round(etatJeu?.tension_sociale ?? 45)}/100</span>
          </div>
        </div>
      )}
      {mode === 'popularite' && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <p className="text-xs text-blue-400 font-semibold mb-1.5">Popularité dans ce département</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full"
                style={{ width: `${etatJeu?.popularite_joueur ?? 42}%` }} />
            </div>
            <span className="text-xs text-blue-300 font-bold">{Math.round(etatJeu?.popularite_joueur ?? 42)}%</span>
          </div>
        </div>
      )}
      {mode === 'energie' && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <p className="text-xs text-blue-400 font-semibold mb-2">Mix énergétique national</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-lg font-black text-indigo-300">{etatJeu?.part_nucleaire_mix_pct ?? 68}%</p>
              <p className="text-xs text-slate-500">⚛️ Nucléaire</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-green-300">{etatJeu?.part_renouvelable_mix_pct ?? 24}%</p>
              <p className="text-xs text-slate-500">🌿 Renouvelable</p>
            </div>
            {etatJeu?.taux_co2_g_kwh != null && (
              <div className="col-span-2 text-center mt-1 pt-2 border-t border-slate-700">
                <p className="text-sm font-bold text-emerald-400">{etatJeu.taux_co2_g_kwh} gCO₂/kWh</p>
                <p className="text-xs text-slate-500">Intensité carbone</p>
              </div>
            )}
          </div>
        </div>
      )}
      {mode === 'chomage' && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
          <p className="text-xs text-amber-400 font-semibold mb-1.5">Chômage estimé</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(etatJeu?.tension_sociale ?? 45) * 0.7 + 5}%` }} />
            </div>
            <span className="text-xs text-amber-300 font-bold">
              {(((etatJeu?.tension_sociale ?? 45) * 0.12) + 5).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Intentions de vote */}
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Intentions de vote 2026</p>
      <div className="flex flex-col gap-1">
        {Object.entries(pol.intentions)
          .sort(([,a],[,b]) => b - a)
          .slice(0, 6)
          .map(([parti, pct]) => (
            <div key={parti} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              <span className="text-xs text-slate-400 w-16">{parti}</span>
              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              </div>
              <span className="text-xs text-white font-bold w-7 text-right">{pct}%</span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PANNEAU PAYS — échanges dynamiques depuis etatJeu
// ─────────────────────────────────────────────────────────────

function PanneauPays({ code, onFermer, mode, etatJeu }) {
  const pays = PAYS_DATA[code]
  if (!pays) return null

  // Données échanges dynamiques
  const mw_solde = getSoldePays(code, etatJeu)
  const export_  = mw_solde != null ? mw_solde >= 0 : null
  const cap      = pays.echanges_key ? (CAP_MAX[pays.echanges_key] ?? 2000) : null
  const utilisation_pct = (mw_solde != null && cap)
    ? Math.round((Math.abs(mw_solde) / cap) * 100)
    : null

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900 border border-slate-600 rounded-xl p-4 shadow-2xl z-20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-base">{pays.emoji} {pays.nom}</h3>
          <p className="text-xs text-slate-500">Relation France : {pays.relation}/100</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
      </div>

      {/* Relations diplomatiques */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">Relations diplomatiques</span>
          <span className={`text-xs font-bold ${pays.relation > 60 ? 'text-emerald-400' : pays.relation > 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {pays.relation}/100
          </span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${pays.relation > 60 ? 'bg-emerald-500' : pays.relation > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${pays.relation}%` }} />
        </div>
      </div>

      {/* Échanges électriques — dynamiques */}
      {pays.echanges_key ? (
        <>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">⚡ Échanges électriques (temps réel)</p>

          {/* Solde courant */}
          <div className={`rounded-xl border p-3 mb-3 flex items-center justify-between ${
            export_ === null ? 'bg-slate-800/50 border-slate-700/40' :
            export_ ? 'bg-green-950/40 border-green-700/40' : 'bg-red-950/40 border-red-700/40'
          }`}>
            <div>
              <p className="text-[10px] text-slate-400">Solde actuel</p>
              <p className={`text-xl font-bold tabular-nums mt-0.5 ${
                export_ === null ? 'text-slate-400' : export_ ? 'text-green-300' : 'text-red-300'
              }`}>{fmtMW(mw_solde)}</p>
            </div>
            <div className="text-right">
              {export_ !== null && (
                <p className={`text-xs font-semibold ${export_ ? 'text-green-400' : 'text-red-400'}`}>
                  {export_ ? '▲ Export FR' : '▼ Import FR'}
                </p>
              )}
              {utilisation_pct != null && (
                <p className="text-[10px] text-slate-500 mt-1">{utilisation_pct}% capacité</p>
              )}
            </div>
          </div>

          {/* Barre capacité */}
          {cap && mw_solde != null && (
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-slate-500">Utilisation interconnexion</span>
                <span className="text-[10px] text-slate-500">Cap. max : {cap >= 1000 ? `${cap/1000} GW` : `${cap} MW`}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${export_ ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, utilisation_pct)}%`, opacity: 0.8 }} />
              </div>
            </div>
          )}

          {/* Note dynamique */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-2.5">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              💡 Ces flux varient à chaque tour selon vos décisions, le mix énergétique,
              les crises géopolitiques et les maintenances en cours.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-2.5">
          <p className="text-xs text-slate-500">Pas d'interconnexion électrique directe avec la France.</p>
        </div>
      )}

      {/* Tension politique interne */}
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">Tension politique interne</span>
          <span className="text-xs text-slate-300">{pays.tension}/100</span>
        </div>
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pays.tension}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PANNEAU ÉNERGIE LATÉRAL — PanneauEnergie complet
// ─────────────────────────────────────────────────────────────

function PanneauEnergieLatéral({ etatJeu, onFermer }) {
  return (
    <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] bg-slate-900 border border-slate-600 rounded-xl p-4 shadow-2xl z-20 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Détail système électrique</span>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PanneauEnergie etatJeu={etatJeu} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function Carte({ etatJeu }) {
  const svgRef = useRef(null)
  const [mode, setMode]           = useState('politique')
  const [geoFrance, setGeoFrance] = useState(null)
  const [geoEurope, setGeoEurope] = useState(null)
  const [selected, setSelected]   = useState(null)
  const [panneauEnergie, setPanneauEnergie] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // ── Ouvrir panneau énergie auto quand on passe en mode énergie ──
  useEffect(() => {
    if (mode === 'energie') setPanneauEnergie(true)
    else setPanneauEnergie(false)
  }, [mode])

  // ── Charger les GeoJSON ─────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    const urlFrance  = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson'
    const urlEurope  = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson'

    Promise.all([
      fetch(urlFrance).then(r => r.json()),
      fetch(urlEurope).then(r => r.json()).catch(() => null),
    ]).then(([france, europe]) => {
      setGeoFrance(france)
      setGeoEurope(europe)
      setLoading(false)
    }).catch(() => {
      setError('Impossible de charger la carte.')
      setLoading(false)
    })
  }, [])

  // ── Dessiner ─────────────────────────────────────────────────
  useEffect(() => {
    if (!geoFrance || !svgRef.current) return

    const W = 760
    const H = 860

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${W} ${H}`)

    // Fond océan
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#0c1520')

    // Projection
    const proj = d3.geoConicConformal()
      .center([2.454071, 46.279229])
      .scale(2100)
      .translate([W / 2 - 30, H / 2 - 100])

    const path = d3.geoPath().projection(proj)
    const codesEuropePays = Object.keys(PAYS_DATA)

    // ── Pays européens ──
    if (geoEurope?.features) {
      const paysFiltres = geoEurope.features.filter(f => {
        const iso = f.properties?.ISO3 ?? f.properties?.iso_a3 ?? f.properties?.ADM0_A3 ?? ''
        return codesEuropePays.includes(iso)
      })

      svg.append('g').attr('id', 'europe')
        .selectAll('path')
        .data(paysFiltres)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => {
          const iso = d.properties?.ISO3 ?? d.properties?.iso_a3 ?? d.properties?.ADM0_A3 ?? ''
          return getCouleurPays(iso, mode, etatJeu)
        })
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#1e3a5f')
        .attr('stroke-width', 0.8)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('fill-opacity', 0.95).attr('stroke', '#60a5fa').attr('stroke-width', 1.5)
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill-opacity', 0.7).attr('stroke', '#1e3a5f').attr('stroke-width', 0.8)
        })
        .on('click', function(event, d) {
          const iso = d.properties?.ISO3 ?? d.properties?.iso_a3 ?? d.properties?.ADM0_A3 ?? ''
          if (codesEuropePays.includes(iso)) {
            setPanneauEnergie(false)
            setSelected(prev => prev?.type === 'pays' && prev.code === iso ? null : { type: 'pays', code: iso })
          }
        })

      // Labels pays avec solde dynamique en mode énergie
      paysFiltres.forEach(f => {
        const iso = f.properties?.ISO3 ?? f.properties?.iso_a3 ?? f.properties?.ADM0_A3 ?? ''
        const p = PAYS_DATA[iso]
        if (!p) return
        const centroid = path.centroid(f)
        if (!centroid || isNaN(centroid[0])) return

        const g = svg.append('g').style('cursor', 'pointer')
          .on('click', () => {
            setPanneauEnergie(false)
            setSelected(prev => prev?.type === 'pays' && prev.code === iso ? null : { type: 'pays', code: iso })
          })

        g.append('text')
          .attr('x', centroid[0]).attr('y', centroid[1])
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('fill', '#94a3b8').attr('font-size', 9)
          .attr('pointer-events', 'none')
          .text(p.emoji)

        if (mode === 'energie' && p.echanges_key) {
          const mw = etatJeu?.echanges_mw?.[p.echanges_key] ?? null
          if (mw != null) {
            const label = Math.abs(mw) >= 1000
              ? `${mw >= 0 ? '▲' : '▼'}${(Math.abs(mw)/1000).toFixed(1)}GW`
              : `${mw >= 0 ? '▲' : '▼'}${Math.abs(Math.round(mw))}MW`
            g.append('text')
              .attr('x', centroid[0]).attr('y', centroid[1] + 12)
              .attr('text-anchor', 'middle')
              .attr('fill', mw >= 0 ? '#4ade80' : '#f87171')
              .attr('font-size', 7.5).attr('font-weight', 'bold')
              .attr('pointer-events', 'none')
              .text(label)
          }
        }
      })

    } else {
      // Fallback rectangles
      const fallback = [
        { code: 'GBR', x: 185, y: 25,  w: 130, h: 55 },
        { code: 'BEL', x: 390, y: 25,  w: 90,  h: 45 },
        { code: 'LUX', x: 490, y: 25,  w: 75,  h: 45 },
        { code: 'DEU', x: 535, y: 72,  w: 135, h: 155 },
        { code: 'CHE', x: 545, y: 300, w: 130, h: 85  },
        { code: 'ITA', x: 575, y: 395, w: 130, h: 150 },
        { code: 'AND', x: 258, y: 560, w: 68,  h: 35  },
        { code: 'ESP', x: 65,  y: 535, w: 185, h: 100 },
      ]
      const gFallback = svg.append('g').attr('id', 'europe-fallback')
      fallback.forEach(pays => {
        const info = PAYS_DATA[pays.code]
        if (!info) return
        const g = gFallback.append('g').style('cursor', 'pointer')
        g.append('rect').attr('x', pays.x).attr('y', pays.y).attr('width', pays.w).attr('height', pays.h)
          .attr('rx', 4).attr('fill', getCouleurPays(pays.code, mode, etatJeu))
          .attr('stroke', '#334155').attr('stroke-width', 1)
        g.append('text').attr('x', pays.x + pays.w/2).attr('y', pays.y + pays.h/2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('fill', '#94a3b8').attr('font-size', 10).text(info.emoji)

        if (mode === 'energie' && info.echanges_key) {
          const mw = etatJeu?.echanges_mw?.[info.echanges_key] ?? null
          if (mw != null) {
            g.append('text').attr('x', pays.x + pays.w/2).attr('y', pays.y + pays.h/2 + 13)
              .attr('text-anchor', 'middle').attr('fill', mw >= 0 ? '#4ade80' : '#f87171')
              .attr('font-size', 8).attr('font-weight', 'bold')
              .text(`${mw >= 0 ? '+' : ''}${Math.round(mw/1000*10)/10}GW`)
          }
        }

        g.on('click', () => {
          setPanneauEnergie(false)
          setSelected(prev => prev?.type === 'pays' && prev.code === pays.code ? null : { type: 'pays', code: pays.code })
        })
        .on('mouseover', () => g.select('rect').attr('stroke', '#60a5fa'))
        .on('mouseout', () => g.select('rect').attr('stroke', '#334155'))
      })
    }

    // ── Départements métropole ──
    const metro = {
      ...geoFrance,
      features: geoFrance.features.filter(f => !DROMCOM_CODES.includes(f.properties.code))
    }

    const gDeps = svg.append('g').attr('id', 'metropole')
    gDeps.selectAll('path')
      .data(metro.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => getCouleurDep(d.properties.code, mode, etatJeu))
      .attr('fill-opacity', 0.88)
      .attr('stroke', '#0c1520')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this).attr('fill-opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1.5)
      })
      .on('mouseout', function(event, d) {
        const isSel = selected?.type === 'dep' && selected?.feature?.properties?.code === d.properties.code
        d3.select(this)
          .attr('fill-opacity', 0.88)
          .attr('stroke', isSel ? '#fff' : '#0c1520')
          .attr('stroke-width', isSel ? 2 : 0.5)
      })
      .on('click', function(event, d) {
        setPanneauEnergie(false)
        setSelected(prev =>
          prev?.type === 'dep' && prev?.feature?.properties?.code === d.properties.code
            ? null : { type: 'dep', feature: d }
        )
      })

    // Labels codes départements
    gDeps.selectAll('text.dep-label')
      .data(metro.features)
      .enter()
      .append('text')
      .attr('class', 'dep-label')
      .attr('x', d => path.centroid(d)[0])
      .attr('y', d => path.centroid(d)[1])
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', 'white').attr('fill-opacity', 0.55)
      .attr('font-size', 5.5).attr('pointer-events', 'none')
      .text(d => d.properties.code)

    // ── Séparateur DROM-COM ──
    svg.append('line')
      .attr('x1', 12).attr('y1', 630).attr('x2', W - 12).attr('y2', 630)
      .attr('stroke', '#1e3a5f').attr('stroke-width', 1).attr('stroke-dasharray', '5,4')
    svg.append('text')
      .attr('x', 16).attr('y', 645)
      .attr('fill', '#334155').attr('font-size', 9).text('▶ DROM-COM')

    // ── DROM-COM encarts ──
    const dromFeatures = geoFrance.features.filter(f => DROMCOM_CODES.includes(f.properties.code))
    dromFeatures.forEach(feature => {
      const code = feature.properties.code
      const info = DROMCOM_INFO[code]
      if (!info) return

      svg.append('rect')
        .attr('x', info.encartX - 2).attr('y', info.encartY - 2)
        .attr('width', info.encartW + 4).attr('height', info.encartH + 4)
        .attr('rx', 6).attr('fill', '#0d1f35').attr('stroke', '#1e3a5f').attr('stroke-width', 1)

      const projDrom = d3.geoMercator()
        .center(info.center)
        .scale(info.scale * 500)
        .translate([info.encartX + info.encartW / 2, info.encartY + info.encartH / 2 - 6])

      const pathDrom = d3.geoPath().projection(projDrom)

      svg.append('path')
        .datum(feature)
        .attr('d', pathDrom)
        .attr('fill', getCouleurDep(code, mode, etatJeu))
        .attr('fill-opacity', 0.88)
        .attr('stroke', '#0c1520').attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function() { d3.select(this).attr('fill-opacity', 1).attr('stroke', '#fff') })
        .on('mouseout', function() { d3.select(this).attr('fill-opacity', 0.88).attr('stroke', '#0c1520') })
        .on('click', () => { setPanneauEnergie(false); setSelected({ type: 'dep', feature }) })

      svg.append('text')
        .attr('x', info.encartX + info.encartW / 2).attr('y', info.encartY + info.encartH - 3)
        .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 7.5)
        .text(info.nom)
    })

    // ── Bandeau solde énergie total (dynamique) ──
    if (mode === 'energie') {
      const soldeTotal_mw = etatJeu?.echanges_mw?.solde_total ?? null
      const positif = soldeTotal_mw != null ? soldeTotal_mw >= 0 : true

      const label = soldeTotal_mw != null
        ? `${positif ? '+' : ''}${Math.abs(soldeTotal_mw) >= 1000
            ? `${(soldeTotal_mw/1000).toFixed(1)} GW`
            : `${Math.round(soldeTotal_mw)} MW`}`
        : '— MW'

      svg.append('rect')
        .attr('x', W/2 - 105).attr('y', H - 82)
        .attr('width', 210).attr('height', 56)
        .attr('rx', 10)
        .attr('fill', positif ? '#14532d' : '#7f1d1d')
        .attr('stroke', positif ? '#16a34a' : '#dc2626').attr('stroke-width', 1)

      svg.append('text')
        .attr('x', W/2).attr('y', H - 59)
        .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 9)
        .text('Solde électrique total France')

      svg.append('text')
        .attr('x', W/2).attr('y', H - 38)
        .attr('text-anchor', 'middle')
        .attr('fill', positif ? '#4ade80' : '#f87171')
        .attr('font-size', 18).attr('font-weight', 'bold')
        .text(label)

      // Bouton "Détail →" sous le bandeau
      const gBtn = svg.append('g').style('cursor', 'pointer')
        .on('click', () => { setPanneauEnergie(true); setSelected(null) })

      gBtn.append('rect')
        .attr('x', W/2 - 55).attr('y', H - 26)
        .attr('width', 110).attr('height', 18)
        .attr('rx', 9).attr('fill', '#1e40af').attr('fill-opacity', 0.8)

      gBtn.append('text')
        .attr('x', W/2).attr('y', H - 14)
        .attr('text-anchor', 'middle').attr('fill', '#bfdbfe')
        .attr('font-size', 8).attr('font-weight', 'bold')
        .text('⚡ Détail mix →')
    }

  }, [geoFrance, geoEurope, mode, etatJeu, selected])

  // ─────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────

  const panneauVisible = panneauEnergie || selected?.type === 'dep' || selected?.type === 'pays'

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">

      {/* Contrôles modes */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">🗺️ Carte de France & Europe</h2>
        <div className="flex gap-1.5 flex-wrap">
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setSelected(null) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG carte */}
      <div className="relative rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl"
        style={{ background: '#0c1520', minHeight: 420 }}>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 text-sm animate-pulse">🗺️ Chargement des cartes...</p>
              <p className="text-slate-600 text-xs mt-1">France + Europe</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <svg ref={svgRef} className="w-full" />

        {/* Panneau département */}
        {selected?.type === 'dep' && (
          <PanneauDepartement
            feature={selected.feature}
            onFermer={() => setSelected(null)}
            mode={mode}
            etatJeu={etatJeu}
          />
        )}

        {/* Panneau pays */}
        {selected?.type === 'pays' && (
          <PanneauPays
            code={selected.code}
            onFermer={() => setSelected(null)}
            mode={mode}
            etatJeu={etatJeu}
          />
        )}

        {/* Panneau énergie latéral */}
        {panneauEnergie && !selected && (
          <PanneauEnergieLatéral
            etatJeu={etatJeu}
            onFermer={() => setPanneauEnergie(false)}
          />
        )}
      </div>

      {/* Légende */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          Légende — mode {MODES.find(m => m.id === mode)?.label}
        </p>
        {mode === 'politique' && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(COULEURS_PARTIS)
              .filter(([p]) => ['LFI','PS_ECO','EPR','LR','RN','PATRIOTES','UPR','EELV','PCF'].includes(p))
              .map(([parti, couleur]) => (
                <div key={parti} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: couleur }} />
                  <span className="text-xs text-slate-400">{parti}</span>
                </div>
              ))}
          </div>
        )}
        {(mode === 'tension' || mode === 'popularite' || mode === 'chomage') && (
          <div className="flex items-center gap-3 max-w-sm">
            <span className="text-xs text-slate-400">
              {mode === 'tension' ? 'Faible' : mode === 'popularite' ? 'Impopulaire' : 'Faible'}
            </span>
            <div className="flex-1 h-3 rounded-full" style={{
              background: mode === 'tension'
                ? 'linear-gradient(to right, rgb(60,120,60), rgb(255,60,0))'
                : mode === 'popularite'
                ? 'linear-gradient(to right, rgb(210,50,50), rgb(40,210,50))'
                : 'linear-gradient(to right, rgb(200,200,50), rgb(200,50,30))'
            }} />
            <span className="text-xs text-slate-400">
              {mode === 'tension' ? 'Élevée' : mode === 'popularite' ? 'Populaire' : 'Élevé'}
            </span>
          </div>
        )}
        {mode === 'energie' && (
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-600" />
              <span className="text-xs text-slate-400">Fort nucléaire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-700" />
              <span className="text-xs text-slate-400">Exportateur net (pays voisin)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-900" />
              <span className="text-xs text-slate-400">Importateur net (pays voisin)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold text-sm">▲</span>
              <span className="text-xs text-slate-400">France exporte vers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-bold text-sm">▼</span>
              <span className="text-xs text-slate-400">France importe depuis</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats synthèse */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '❤️ Popularité',  val: `${Math.round(etatJeu?.popularite_joueur ?? 42)}%`,
            color: (etatJeu?.popularite_joueur ?? 42) < 35 ? 'text-red-400' : 'text-emerald-400' },
          { label: '🔥 Tension',     val: `${Math.round(etatJeu?.tension_sociale ?? 45)}/100`,
            color: (etatJeu?.tension_sociale ?? 45) > 65 ? 'text-red-400' : 'text-amber-400' },
          { label: '⚡ Électricité', val: `${Math.round(etatJeu?.prix_electricite ?? 95)} €/MWh`,
            color: (etatJeu?.prix_electricite ?? 95) > 100 ? 'text-red-400' : 'text-blue-400' },
          { label: '☢️ Nucléaire',   val: `${etatJeu?.part_nucleaire_mix_pct ?? 68}%`,
            color: 'text-blue-300' },
          { label: '📅 Date',        val: etatJeu?.date ?? '1er Mars 2026',
            color: 'text-slate-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-sm font-bold mt-1 ${color}`}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
