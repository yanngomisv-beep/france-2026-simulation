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
