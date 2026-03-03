import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { COULEURS_PARTIS, getPolitiqueDepartement } from '../data/departements-svg.js'

const MODES = [
  { id: 'politique',  label: '🗳️ Tendance politique' },
  { id: 'tension',    label: '🔥 Tension sociale' },
  { id: 'popularite', label: '📊 Popularité' },
]

function getCouleurDep(code, mode, etatJeu) {
  const pol = getPolitiqueDepartement(code)
  if (mode === 'politique') return COULEURS_PARTIS[pol.parti] ?? '#94a3b8'
  if (mode === 'tension') {
    const t = Math.min(1, (etatJeu?.tension_sociale ?? 45) / 100)
    return `rgb(${Math.round(80 + t*175)},${Math.round(120 - t*120)},${Math.round(60 - t*60)})`
  }
  if (mode === 'popularite') {
    const p = (etatJeu?.popularite_joueur ?? 42) / 100
    return `rgb(${Math.round(220 - p*180)},${Math.round(50 + p*160)},50)`
  }
  return '#475569'
}

function PanneauDepartement({ feature, onFermer }) {
  if (!feature) return null
  const code = feature.properties.code
  const nom  = feature.properties.nom
  const pol  = getPolitiqueDepartement(code)

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl z-10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{nom}</h3>
          <p className="text-xs text-slate-400">Département {code}</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg">✕</button>
      </div>

      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-900">
        <div className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: COULEURS_PARTIS[pol.parti] }} />
        <div>
          <p className="text-xs text-slate-400">Parti dominant</p>
          <p className="font-semibold text-white">{pol.parti} — {pol.score}%</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Intentions 2026</p>
        {Object.entries(pol.intentions)
          .sort(([,a],[,b]) => b - a)
          .map(([parti, pct]) => (
            <div key={parti} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              <span className="text-xs text-slate-400 w-20">{parti}</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              </div>
              <span className="text-xs text-white font-semibold w-8 text-right">{pct}%</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default function Carte({ etatJeu }) {
  const svgRef       = useRef(null)
  const [mode, setMode]             = useState('politique')
  const [geoData, setGeoData]       = useState(null)
  const [selected, setSelected]     = useState(null)
  const [hover, setHover]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // ── Charger le GeoJSON depuis un CDN public ──────────────
  useEffect(() => {
    setLoading(true)
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson')
      .then(r => r.json())
      .then(data => {
        // Normaliser les propriétés
        data.features = data.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            code: f.properties.code,
            nom:  f.properties.nom,
          }
        }))
        setGeoData(data)
        setLoading(false)
      })
      .catch(e => {
        setError("Impossible de charger la carte. Vérifiez votre connexion.")
        setLoading(false)
      })
  }, [])

  // ── Dessiner la carte avec D3 ────────────────────────────
  useEffect(() => {
    if (!geoData || !svgRef.current) return

    const container = svgRef.current.parentElement
    const W = container.clientWidth || 700
    const H = Math.round(W * 0.75)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    // Projection centrée sur la France métropolitaine
    const projection = d3.geoConicConformal()
      .center([2.454071, 46.279229])
      .scale(W * 3.5)
      .translate([W / 2, H / 2])

    const path = d3.geoPath().projection(projection)

    // Groupe principal
    const g = svg.append('g')

    // Dessiner les départements
    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => getCouleurDep(d.properties.code, mode, etatJeu))
      .attr('fill-opacity', d => d.properties.code === hover ? 1 : 0.82)
      .attr('stroke', d => d.properties.code === selected?.properties?.code ? '#ffffff' : '#0f172a')
      .attr('stroke-width', d => d.properties.code === selected?.properties?.code ? 2 : 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        setHover(d.properties.code)
        d3.select(this).attr('fill-opacity', 1)
        // Tooltip nom
        g.append('text')
          .attr('id', 'tooltip-dep')
          .attr('x', () => { const c = path.centroid(d); return c[0] })
          .attr('y', () => { const c = path.centroid(d); return c[1] - 8 })
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(d.properties.nom)
      })
      .on('mouseout', function(event, d) {
        setHover(null)
        d3.select(this).attr('fill-opacity', 0.82)
        g.select('#tooltip-dep').remove()
      })
      .on('click', function(event, d) {
        setSelected(prev =>
          prev?.properties?.code === d.properties.code ? null : d
        )
      })

  }, [geoData, mode, etatJeu, selected, hover])

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">

      {/* Contrôles */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">🗺️ Carte de France</h2>
        <div className="flex gap-2">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden"
        style={{ minHeight: 400 }}>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-400 text-sm animate-pulse">
              🗺️ Chargement de la carte...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}

        <svg ref={svgRef} className="w-full" />

        {selected && (
          <PanneauDepartement
            feature={selected}
            onFermer={() => setSelected(null)}
          />
        )}
      </div>

      {/* Légende */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Légende</p>
        {mode === 'politique' && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(COULEURS_PARTIS)
              .filter(([p]) => ['LFI','PS_ECO','EPR','LR','RN','PATRIOTES','UPR'].includes(p))
              .map(([parti, couleur]) => (
                <div key={parti} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: couleur }} />
                  <span className="text-xs text-slate-400">{parti}</span>
                </div>
              ))}
          </div>
        )}
        {mode === 'tension' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Faible</span>
            <div className="flex-1 h-3 rounded-full"
              style={{ background: 'linear-gradient(to right, rgb(80,120,60), rgb(255,60,0))' }} />
            <span className="text-xs text-slate-400">Élevée</span>
          </div>
        )}
        {mode === 'popularite' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Impopulaire</span>
            <div className="flex-1 h-3 rounded-full"
              style={{ background: 'linear-gradient(to right, rgb(220,50,50), rgb(40,210,50))' }} />
            <span className="text-xs text-slate-400">Populaire</span>
          </div>
        )}
      </div>

      {/* Stats */}
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
import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { COULEURS_PARTIS, getPolitiqueDepartement } from '../data/departements-svg.js'

const MODES = [
  { id: 'politique',  label: '🗳️ Tendance politique' },
  { id: 'tension',    label: '🔥 Tension sociale' },
  { id: 'popularite', label: '📊 Popularité' },
  { id: 'energie',    label: '⚡ Énergie' },
]

// Pays limitrophes avec données énergétiques
const PAYS_LIMITROPHES = {
  "ESP": { nom: "Espagne",    emoji: "🇪🇸", import_twh: 4.2,  export_twh: 12.8, solde: +8.6,  couleur: "#d97706" },
  "ITA": { nom: "Italie",     emoji: "🇮🇹", import_twh: 2.1,  export_twh: 15.2, solde: +13.1, couleur: "#16a34a" },
  "CHE": { nom: "Suisse",     emoji: "🇨🇭", import_twh: 8.5,  export_twh: 6.2,  solde: -2.3,  couleur: "#dc2626" },
  "DEU": { nom: "Allemagne",  emoji: "🇩🇪", import_twh: 18.2, export_twh: 9.8,  solde: -8.4,  couleur: "#1d4ed8" },
  "BEL": { nom: "Belgique",   emoji: "🇧🇪", import_twh: 3.2,  export_twh: 22.1, solde: +18.9, couleur: "#7c3aed" },
  "LUX": { nom: "Luxembourg", emoji: "🇱🇺", import_twh: 0.1,  export_twh: 4.8,  solde: +4.7,  couleur: "#0891b2" },
  "GBR": { nom: "Royaume-Uni",emoji: "🇬🇧", import_twh: 5.8,  export_twh: 8.2,  solde: +2.4,  couleur: "#be185d" },
  "AND": { nom: "Andorre",    emoji: "🇦🇩", import_twh: 0.0,  export_twh: 0.5,  solde: +0.5,  couleur: "#6b7280" },
}

// Positions approximatives des labels pays sur la carte
const PAYS_LABELS = {
  "ESP": { x: 160, y: 520 },
  "ITA": { x: 620, y: 480 },
  "CHE": { x: 590, y: 350 },
  "DEU": { x: 560, y: 180 },
  "BEL": { x: 430, y: 120 },
  "LUX": { x: 520, y: 200 },
  "GBR": { x: 230, y: 80  },
  "AND": { x: 290, y: 530 },
}

function getCouleurDep(code, mode, etatJeu) {
  const pol = getPolitiqueDepartement(code)
  if (mode === 'politique') return COULEURS_PARTIS[pol.parti] ?? '#94a3b8'
  if (mode === 'tension') {
    const t = Math.min(1, (etatJeu?.tension_sociale ?? 45) / 100)
    return `rgb(${Math.round(80 + t*175)},${Math.round(120 - t*120)},${Math.round(60 - t*60)})`
  }
  if (mode === 'popularite') {
    const p = (etatJeu?.popularite_joueur ?? 42) / 100
    return `rgb(${Math.round(220 - p*180)},${Math.round(50 + p*160)},50)`
  }
  if (mode === 'energie') {
    // Bleu = nucléaire dominant, vert = renouvelable
    return '#3b82f6'
  }
  return '#475569'
}

function PanneauDepartement({ feature, onFermer }) {
  if (!feature) return null
  const code = feature.properties.code
  const nom  = feature.properties.nom
  const pol  = getPolitiqueDepartement(code)

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl z-10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{nom}</h3>
          <p className="text-xs text-slate-400">Département {code}</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg">✕</button>
      </div>

      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-900">
        <div className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: COULEURS_PARTIS[pol.parti] }} />
        <div>
          <p className="text-xs text-slate-400">Parti dominant</p>
          <p className="font-semibold text-white">{pol.parti} — {pol.score}%</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Intentions 2026</p>
        {Object.entries(pol.intentions)
          .sort(([,a],[,b]) => b - a)
          .map(([parti, pct]) => (
            <div key={parti} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              <span className="text-xs text-slate-400 w-20">{parti}</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: COULEURS_PARTIS[parti] ?? '#94a3b8' }} />
              </div>
              <span className="text-xs text-white font-semibold w-8 text-right">{pct}%</span>
            </div>
          ))}
      </div>
    </div>
  )
}

function PanneauPays({ code, onFermer }) {
  const pays = PAYS_LIMITROPHES[code]
  if (!pays) return null
  const positif = pays.solde > 0

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-xl z-10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">{pays.emoji} {pays.nom}</h3>
          <p className="text-xs text-slate-400">Échanges électriques avec la France</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg">✕</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-2 text-center">
          <p className="text-xs text-red-400">🔴 Importé</p>
          <p className="text-lg font-bold text-white">{pays.import_twh}</p>
          <p className="text-xs text-slate-400">TWh/an</p>
        </div>
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-2 text-center">
          <p className="text-xs text-green-400">🟢 Exporté</p>
          <p className="text-lg font-bold text-white">{pays.export_twh}</p>
          <p className="text-xs text-slate-400">TWh/an</p>
        </div>
      </div>

      <div className={`rounded-lg p-3 text-center border ${
        positif ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'
      }`}>
        <p className="text-xs text-slate-400">Solde France</p>
        <p className={`text-2xl font-bold ${positif ? 'text-green-400' : 'text-red-400'}`}>
          {positif ? '+' : ''}{pays.solde} TWh
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {positif ? '✅ La France exporte plus qu\'elle n\'importe' : '⚠️ La France importe plus qu\'elle n\'exporte'}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DROM-COM — GeoJSON simplifié
// ─────────────────────────────────────────────────────────────

const DROMCOM_GEOJSON_URL = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson'

const DROMCOM_CODES = ['971','972','973','974','976']

const DROMCOM_INFO = {
  '971': { nom: 'Guadeloupe',  encartX: 30,  encartY: 650, scale: 3.5, center: [-61.55, 16.17] },
  '972': { nom: 'Martinique',  encartX: 130, encartY: 650, scale: 5,   center: [-61.02, 14.64] },
  '973': { nom: 'Guyane',      encartX: 245, encartY: 635, scale: 0.9, center: [-53.1,  3.93]  },
  '974': { nom: 'La Réunion',  encartX: 360, encartY: 650, scale: 4.5, center: [55.54, -21.13] },
  '976': { nom: 'Mayotte',     encartX: 465, encartY: 650, scale: 8,   center: [45.17, -12.83] },
}

export default function Carte({ etatJeu }) {
  const svgRef   = useRef(null)
  const [mode, setMode]         = useState('politique')
  const [geoData, setGeoData]   = useState(null)
  const [selected, setSelected] = useState(null)  // { type: 'dep'|'pays', data }
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // ── Charger le GeoJSON ───────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetch(DROMCOM_GEOJSON_URL)
      .then(r => r.json())
      .then(data => { setGeoData(data); setLoading(false) })
      .catch(() => { setError("Impossible de charger la carte."); setLoading(false) })
  }, [])

  // ── Dessiner ─────────────────────────────────────────────
  useEffect(() => {
    if (!geoData || !svgRef.current) return

    const W = 720
    const H = 820

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${W} ${H}`)

    // ── Fond ──
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#0f172a')

    // ── Projection métropole ──
    const proj = d3.geoConicConformal()
      .center([2.454071, 46.279229])
      .scale(2200)
      .translate([W / 2 - 20, H / 2 - 80])

    const path = d3.geoPath().projection(proj)

    // Filtrer départements métropole
    const metro = {
      ...geoData,
      features: geoData.features.filter(f =>
        !DROMCOM_CODES.includes(f.properties.code)
      )
    }

    // ── Pays limitrophes (rectangles annotés) ──
    const paysGroup = svg.append('g').attr('id', 'pays-limitrophes')

    const paysPositions = [
      { code: 'GBR', x: 180, y: 30,  w: 140, h: 55, label: 'Royaume-Uni 🇬🇧' },
      { code: 'BEL', x: 385, y: 28,  w: 110, h: 45, label: 'Belgique 🇧🇪' },
      { code: 'LUX', x: 500, y: 28,  w: 85,  h: 45, label: 'Luxembourg 🇱🇺' },
      { code: 'DEU', x: 530, y: 75,  w: 140, h: 160, label: 'Allemagne 🇩🇪' },
      { code: 'CHE', x: 540, y: 305, w: 140, h: 90,  label: 'Suisse 🇨🇭' },
      { code: 'ITA', x: 570, y: 400, w: 140, h: 160, label: 'Italie 🇮🇹' },
      { code: 'AND', x: 255, y: 565, w: 75,  h: 38,  label: 'Andorre 🇦🇩' },
      { code: 'ESP', x: 60,  y: 540, w: 190, h: 110, label: 'Espagne 🇪🇸' },
    ]

    paysPositions.forEach(pays => {
      const info = PAYS_LIMITROPHES[pays.code]
      const soldePositif = info.solde > 0
      const g = paysGroup.append('g').style('cursor', 'pointer')

      g.append('rect')
        .attr('x', pays.x).attr('y', pays.y)
        .attr('width', pays.w).attr('height', pays.h)
        .attr('rx', 4)
        .attr('fill', '#1e293b')
        .attr('stroke', '#334155')
        .attr('stroke-width', 1)

      g.append('text')
        .attr('x', pays.x + pays.w / 2)
        .attr('y', pays.y + pays.h / 2 - (mode === 'energie' ? 8 : 2))
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', Math.min(11, pays.w / 10))
        .text(pays.label)

      if (mode === 'energie') {
        g.append('text')
          .attr('x', pays.x + pays.w / 2)
          .attr('y', pays.y + pays.h / 2 + 10)
          .attr('text-anchor', 'middle')
          .attr('fill', soldePositif ? '#4ade80' : '#f87171')
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .text(`${soldePositif ? '▶' : '◀'} ${Math.abs(info.solde)} TWh`)
      }

      g.on('click', () => setSelected({ type: 'pays', code: pays.code }))
       .on('mouseover', function() {
          g.select('rect').attr('stroke', '#60a5fa').attr('stroke-width', 1.5)
        })
       .on('mouseout', function() {
          g.select('rect').attr('stroke', '#334155').attr('stroke-width', 1)
        })
    })

    // ── Mer / océan (fond bleu clair) ──
    svg.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', W).attr('height', H)
      .attr('fill', '#0c1a2e')
      .attr('pointer-events', 'none')
      .lower()

    // ── Départements métropole ──
    const gDeps = svg.append('g').attr('id', 'metropole')

    gDeps.selectAll('path')
      .data(metro.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => getCouleurDep(d.properties.code, mode, etatJeu))
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('fill-opacity', 1)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5)
      })
      .on('mouseout', function(event, d) {
        const isSelected = selected?.type === 'dep' &&
          selected?.feature?.properties?.code === d.properties.code
        d3.select(this)
          .attr('fill-opacity', 0.85)
          .attr('stroke', isSelected ? '#ffffff' : '#0f172a')
          .attr('stroke-width', isSelected ? 2 : 0.5)
      })
      .on('click', function(event, d) {
        setSelected(prev =>
          prev?.type === 'dep' && prev?.feature?.properties?.code === d.properties.code
            ? null : { type: 'dep', feature: d }
        )
      })

    // ── Noms de départements (petits labels) ──
    gDeps.selectAll('text.dep-label')
      .data(metro.features)
      .enter()
      .append('text')
      .attr('class', 'dep-label')
      .attr('x', d => path.centroid(d)[0])
      .attr('y', d => path.centroid(d)[1])
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('fill-opacity', 0.7)
      .attr('font-size', 6)
      .attr('pointer-events', 'none')
      .text(d => d.properties.code)

    // ── Séparateur DROM-COM ──
    svg.append('line')
      .attr('x1', 15).attr('y1', 625)
      .attr('x2', W - 15).attr('y2', 625)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '6,4')

    svg.append('text')
      .attr('x', 18).attr('y', 640)
      .attr('fill', '#475569')
      .attr('font-size', 10)
      .text('DROM-COM')

    // ── DROM-COM ──
    const dromFeatures = geoData.features.filter(f =>
      DROMCOM_CODES.includes(f.properties.code)
    )

    dromFeatures.forEach(feature => {
      const code = feature.properties.code
      const info = DROMCOM_INFO[code]
      if (!info) return

      const encartW = 85
      const encartH = 75

      // Fond encart
      svg.append('rect')
        .attr('x', info.encartX - 3)
        .attr('y', info.encartY - 3)
        .attr('width', encartW)
        .attr('height', encartH)
        .attr('rx', 4)
        .attr('fill', '#1e293b')
        .attr('stroke', '#334155')
        .attr('stroke-width', 0.8)

      // Projection locale pour ce DROM
      const projDrom = d3.geoMercator()
        .center(info.center)
        .scale(info.scale * 500)
        .translate([info.encartX + encartW / 2, info.encartY + encartH / 2 - 5])

      const pathDrom = d3.geoPath().projection(projDrom)

      svg.append('path')
        .datum(feature)
        .attr('d', pathDrom)
        .attr('fill', getCouleurDep(code, mode, etatJeu))
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('fill-opacity', 1).attr('stroke', '#ffffff')
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill-opacity', 0.85).attr('stroke', '#0f172a')
        })
        .on('click', () => setSelected({ type: 'dep', feature }))

      // Label
      svg.append('text')
        .attr('x', info.encartX + encartW / 2)
        .attr('y', info.encartY + encartH - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', 8)
        .text(info.nom)
    })

    // ── Mode énergie : solde total ──
    if (mode === 'energie') {
      const soldeTotal = Object.values(PAYS_LIMITROPHES).reduce((s, p) => s + p.solde, 0)
      const positif = soldeTotal > 0
      svg.append('rect')
        .attr('x', W/2 - 90).attr('y', H - 75)
        .attr('width', 180).attr('height', 50)
        .attr('rx', 8)
        .attr('fill', positif ? '#14532d' : '#7f1d1d')
        .attr('stroke', positif ? '#16a34a' : '#dc2626')
        .attr('stroke-width', 1)
      svg.append('text')
        .attr('x', W/2).attr('y', H - 53)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8').attr('font-size', 10)
        .text('Solde électrique total France')
      svg.append('text')
        .attr('x', W/2).attr('y', H - 34)
        .attr('text-anchor', 'middle')
        .attr('fill', positif ? '#4ade80' : '#f87171')
        .attr('font-size', 16).attr('font-weight', 'bold')
        .text(`${positif ? '+' : ''}${soldeTotal.toFixed(1)} TWh`)
    }

  }, [geoData, mode, etatJeu, selected])

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">

      {/* Contrôles */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">🗺️ Carte de France</h2>
        <div className="flex gap-2 flex-wrap">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                mode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carte SVG */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden"
        style={{ minHeight: 400 }}>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 text-sm animate-pulse">🗺️ Chargement de la carte...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <svg ref={svgRef} className="w-full" />

        {/* Panneaux info */}
        {selected?.type === 'dep' && (
          <PanneauDepartement
            feature={selected.feature}
            onFermer={() => setSelected(null)}
          />
        )}
        {selected?.type === 'pays' && (
          <PanneauPays
            code={selected.code}
            onFermer={() => setSelected(null)}
          />
        )}
      </div>

      {/* Légende */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Légende</p>
        {mode === 'politique' && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(COULEURS_PARTIS)
              .filter(([p]) => ['LFI','PS_ECO','EPR','LR','RN','PATRIOTES','UPR'].includes(p))
              .map(([parti, couleur]) => (
                <div key={parti} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: couleur }} />
                  <span className="text-xs text-slate-400">{parti}</span>
                </div>
              ))}
          </div>
        )}
        {mode === 'tension' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Faible</span>
            <div className="flex-1 h-3 rounded-full"
              style={{ background: 'linear-gradient(to right, rgb(80,120,60), rgb(255,60,0))' }} />
            <span className="text-xs text-slate-400">Élevée</span>
          </div>
        )}
        {mode === 'popularite' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Impopulaire</span>
            <div className="flex-1 h-3 rounded-full"
              style={{ background: 'linear-gradient(to right, rgb(220,50,50), rgb(40,210,50))' }} />
            <span className="text-xs text-slate-400">Populaire</span>
          </div>
        )}
        {mode === 'energie' && (
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-green-400 font-bold">▶</span>
              <span className="text-xs text-slate-400">La France exporte vers ce pays</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-bold">◀</span>
              <span className="text-xs text-slate-400">La France importe depuis ce pays</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Popularité nationale', val: `${etatJeu?.popularite_joueur ?? 42}%` },
          { label: 'Tension sociale',      val: `${etatJeu?.tension_sociale ?? 45}/100` },
          { label: 'Prix électricité',     val: `${etatJeu?.prix_electricite ?? 72} €/MWh` },
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
