import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { COULEURS_PARTIS, getPolitiqueDepartement } from '../data/departements-svg.js'
import PanneauEnergie from './PanneauEnergie.jsx'

// ─────────────────────────────────────────────────────────────
// MODES
// ─────────────────────────────────────────────────────────────

const MODES = [
  { id: 'politique',  label: '🗳️ Politique' },
  { id: 'tension',    label: '🔥 Tension' },
  { id: 'popularite', label: '📊 Popularité' },
  { id: 'energie',    label: '⚡ Énergie' },
  { id: 'chomage',    label: '📉 Chômage' },
]

// ─────────────────────────────────────────────────────────────
// PAYS EUROPÉENS
// ─────────────────────────────────────────────────────────────

const PAYS_DATA = {
  ESP: { nom: 'Espagne',     emoji: '🇪🇸', echanges_key: 'espagne',            relation: 55, tension: 42 },
  ITA: { nom: 'Italie',      emoji: '🇮🇹', echanges_key: 'italie',             relation: 60, tension: 38 },
  CHE: { nom: 'Suisse',      emoji: '🇨🇭', echanges_key: 'suisse',             relation: 72, tension: 25 },
  DEU: { nom: 'Allemagne',   emoji: '🇩🇪', echanges_key: 'allemagne_belgique', relation: 65, tension: 44 },
  BEL: { nom: 'Belgique',    emoji: '🇧🇪', echanges_key: 'allemagne_belgique', relation: 68, tension: 48 },
  LUX: { nom: 'Luxembourg',  emoji: '🇱🇺', echanges_key: null,                 relation: 70, tension: 22 },
  GBR: { nom: 'Royaume-Uni', emoji: '🇬🇧', echanges_key: 'angleterre',         relation: 48, tension: 52 },
  AND: { nom: 'Andorre',     emoji: '🇦🇩', echanges_key: null,                 relation: 80, tension: 10 },
  MCO: { nom: 'Monaco',      emoji: '🇲🇨', echanges_key: null,                 relation: 85, tension:  8 },
}

const CAP_MAX = { angleterre: 2000, allemagne_belgique: 3500, suisse: 3500, italie: 3900, espagne: 800 }

// ─────────────────────────────────────────────────────────────
// DROM — codes + config encarts
// La projection utilise d3.geoMercator().fitExtent() pour que
// la forme remplisse TOUJOURS l'encart, quelle que soit sa taille
// ─────────────────────────────────────────────────────────────

const DROM_CODES = ['971', '972', '973', '974', '976']

const DROM_CONFIG = {
  '971': { nom: 'Guadeloupe',  pop: '400 000 hab.', chef: 'Basse-Terre',
           encartX: 18,  encartY: 648, encartW: 94, encartH: 82 },
  '972': { nom: 'Martinique',  pop: '360 000 hab.', chef: 'Fort-de-France',
           encartX: 122, encartY: 648, encartW: 82, encartH: 82 },
  '973': { nom: 'Guyane',      pop: '300 000 hab.', chef: 'Cayenne',
           encartX: 214, encartY: 636, encartW: 98, encartH: 94 },
  '974': { nom: 'La Réunion',  pop: '900 000 hab.', chef: 'Saint-Denis',
           encartX: 322, encartY: 648, encartW: 86, encartH: 82 },
  '976': { nom: 'Mayotte',     pop: '320 000 hab.', chef: 'Mamoudzou',
           encartX: 418, encartY: 652, encartW: 78, encartH: 78 },
}

// ─────────────────────────────────────────────────────────────
// ZOOM ÎLE-DE-FRANCE
// ─────────────────────────────────────────────────────────────

const IDF_CODES = ['75', '77', '78', '91', '92', '93', '94', '95']

const IDF_ENCART = { x: 530, y: 636, w: 218, h: 130 }

// ─────────────────────────────────────────────────────────────
// COULEURS
// ─────────────────────────────────────────────────────────────

function getCouleurTerritoire(code, mode, etatJeu) {
  const pol = getPolitiqueDepartement(code)
  if (mode === 'politique') return COULEURS_PARTIS[pol?.parti] ?? '#64748b'
  const seed = (code.charCodeAt(0) + (code.charCodeAt(1) ?? 0)) / 300
  if (mode === 'tension') {
    const t = Math.min(1, (etatJeu?.tension_sociale ?? 45) / 100)
    const tv = Math.min(1, Math.max(0, t + (seed - 0.5) * 0.2))
    return `rgb(${Math.round(60+tv*195)},${Math.round(120-tv*110)},${Math.round(60-tv*55)})`
  }
  if (mode === 'popularite') {
    const p = Math.min(1, Math.max(0, (etatJeu?.popularite_joueur ?? 42) / 100))
    const pv = Math.min(1, Math.max(0, p + (seed - 0.5) * 0.15))
    return `rgb(${Math.round(210-pv*180)},${Math.round(50+pv*160)},60)`
  }
  if (mode === 'energie') {
    const t = (etatJeu?.part_nucleaire_mix_pct ?? 68) / 100
    return `rgb(${Math.round(30+t*30)},${Math.round(80+t*100)},${Math.round(150+t*80)})`
  }
  if (mode === 'chomage') {
    const s = ((code.charCodeAt(0)*17 + (code.charCodeAt(1) ?? 1)*5) % 100) / 100
    const t = Math.min(1, Math.max(0, (etatJeu?.tension_sociale ?? 45)/100 * 0.7 + s * 0.3))
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
    if (!p.echanges_key) return '#1e3a5f'
    return (etatJeu?.echanges_mw?.[p.echanges_key] ?? 0) > 0 ? '#14532d' : '#7f1d1d'
  }
  return '#1e3a5f'
}

function fmtMW(mw) {
  if (mw == null) return '—'
  const s = mw >= 0 ? '+' : ''
  return Math.abs(mw) >= 1000 ? `${s}${(mw/1000).toFixed(1)} GW` : `${s}${Math.round(mw)} MW`
}

// ─────────────────────────────────────────────────────────────
// DESSIN ENCART DROM — fitExtent garantit que la forme est visible
// ─────────────────────────────────────────────────────────────

function dessinerDrom(svg, feature, cfg, code, mode, etatJeu, onSelect) {
  const { encartX: ex, encartY: ey, encartW: ew, encartH: eh, nom } = cfg
  const PAD = 6
  const labelH = 14
  const couleur = getCouleurTerritoire(code, mode, etatJeu)

  // Fond
  svg.append('rect')
    .attr('x', ex - 1).attr('y', ey - 1)
    .attr('width', ew + 2).attr('height', eh + 2)
    .attr('rx', 6).attr('fill', '#0d1f35')
    .attr('stroke', '#1e3a5f').attr('stroke-width', 1)

  // fitExtent : D3 calcule scale+translate pour que la forme
  // remplisse exactement [[ex+PAD, ey+PAD], [ex+ew-PAD, ey+eh-PAD-labelH]]
  const extent = [
    [ex + PAD, ey + PAD],
    [ex + ew - PAD, ey + eh - PAD - labelH],
  ]

  const proj = d3.geoMercator().fitExtent(extent, feature)
  const pathFn = d3.geoPath().projection(proj)

  // Clippath
  const clipId = `clip-drom-${code}`
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect')
    .attr('x', ex).attr('y', ey)
    .attr('width', ew).attr('height', eh - labelH)

  const g = svg.append('g').style('cursor', 'pointer')
    .on('click', () => onSelect(code, nom, true))
    .on('mouseover', function() {
      g.select('.drom-shape').attr('fill-opacity', 1).attr('stroke', '#e2e8f0').attr('stroke-width', 1)
    })
    .on('mouseout', function() {
      g.select('.drom-shape').attr('fill-opacity', 0.9).attr('stroke', '#0f172a').attr('stroke-width', 0.4)
    })

  g.append('path')
    .attr('class', 'drom-shape')
    .datum(feature)
    .attr('d', pathFn)
    .attr('fill', couleur)
    .attr('fill-opacity', 0.9)
    .attr('stroke', '#0f172a').attr('stroke-width', 0.4)
    .attr('clip-path', `url(#${clipId})`)

  // Label centré
  svg.append('text')
    .attr('x', ex + ew / 2)
    .attr('y', ey + eh - 3)
    .attr('text-anchor', 'middle')
    .attr('fill', '#64748b').attr('font-size', 7.5)
    .attr('pointer-events', 'none')
    .text(nom)
}

// ─────────────────────────────────────────────────────────────
// DESSIN ZOOM ÎLE-DE-FRANCE
// ─────────────────────────────────────────────────────────────

function dessinerZoomIDF(svg, idfFeatures, mode, etatJeu, onSelectDep) {
  if (!idfFeatures || idfFeatures.length === 0) return
  const { x: ex, y: ey, w: ew, h: eh } = IDF_ENCART
  const PAD = 8
  const TITLE_H = 14

  // Fond encart
  svg.append('rect')
    .attr('x', ex - 1).attr('y', ey - 1)
    .attr('width', ew + 2).attr('height', eh + 2)
    .attr('rx', 6).attr('fill', '#0b1929')
    .attr('stroke', '#2563eb').attr('stroke-width', 1.2)

  // Titre
  svg.append('text')
    .attr('x', ex + ew / 2).attr('y', ey + 10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#60a5fa').attr('font-size', 7.5).attr('font-weight', 'bold')
    .attr('pointer-events', 'none')
    .text('🔍 Île-de-France')

  // Collection pour fitExtent
  const collection = { type: 'FeatureCollection', features: idfFeatures }
  const extent = [
    [ex + PAD, ey + TITLE_H + PAD],
    [ex + ew - PAD, ey + eh - PAD],
  ]

  const proj = d3.geoMercator().fitExtent(extent, collection)
  const pathFn = d3.geoPath().projection(proj)

  const clipId = 'clip-idf'
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('x', ex).attr('y', ey + TITLE_H).attr('width', ew).attr('height', eh - TITLE_H)

  idfFeatures.forEach(feature => {
    const code = feature.properties.code
    const g = svg.append('g').style('cursor', 'pointer')
      .on('click', () => onSelectDep(feature))
      .on('mouseover', function() {
        g.select('path').attr('fill-opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1.2)
        // Tooltip code
        svg.append('text').attr('id', 'idf-tooltip')
          .attr('x', ex + ew / 2).attr('y', ey + eh + 14)
          .attr('text-anchor', 'middle').attr('fill', '#93c5fd').attr('font-size', 8)
          .text(feature.properties.nom)
      })
      .on('mouseout', function() {
        g.select('path').attr('fill-opacity', 0.88).attr('stroke', '#0f172a').attr('stroke-width', 0.5)
        svg.select('#idf-tooltip').remove()
      })

    g.append('path')
      .datum(feature)
      .attr('d', pathFn)
      .attr('fill', getCouleurTerritoire(code, mode, etatJeu))
      .attr('fill-opacity', 0.88)
      .attr('stroke', '#0f172a').attr('stroke-width', 0.5)
      .attr('clip-path', `url(#${clipId})`)

    // Label code département
    const centroid = pathFn.centroid(feature)
    if (centroid && !isNaN(centroid[0])) {
      svg.append('text')
        .attr('x', centroid[0]).attr('y', centroid[1])
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', 'white').attr('fill-opacity', 0.7)
        .attr('font-size', 6).attr('pointer-events', 'none')
        .text(code)
    }
  })

  // Ligne reliant l'encart à la position IDF sur la carte principale
  // (flèche indicative depuis ~Seine-et-Marne vers l'encart)
  svg.append('line')
    .attr('x1', ex).attr('y1', ey + eh / 2)
    .attr('x2', ex - 30).attr('y2', ey - 20)
    .attr('stroke', '#2563eb').attr('stroke-width', 0.8)
    .attr('stroke-dasharray', '3,3').attr('opacity', 0.5)
    .attr('pointer-events', 'none')
}

// ─────────────────────────────────────────────────────────────
// PANNEAUX
// ─────────────────────────────────────────────────────────────

function PanneauTerritoire({ code, nom, isDrom, onFermer, mode, etatJeu }) {
  const cfg = DROM_CONFIG[code]
  const pol = getPolitiqueDepartement(code)
  const couleur = getCouleurTerritoire(code, mode, etatJeu)

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900 border border-slate-600 rounded-xl p-4 shadow-2xl z-20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: couleur }} />
            <h3 className="font-bold text-white text-base">{nom}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Département & Région d'Outre-Mer</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg leading-none ml-2">✕</button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {[
          { label: '👥 Population', val: cfg?.pop  ?? '—' },
          { label: '🏛️ Chef-lieu',  val: cfg?.chef ?? '—' },
          { label: '📍 Code INSEE', val: code },
          { label: '🗂️ Statut',    val: 'DROM (Art. 73)' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/70 rounded-lg p-2">
            <p className="text-[10px] text-slate-500">{s.label}</p>
            <p className="text-xs font-semibold text-white mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>

      {mode === 'tension' && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/30">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-red-400 font-semibold">Tension sociale</span>
            <span className="text-xs text-red-300 font-bold">{Math.round(etatJeu?.tension_sociale ?? 45)}/100</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${etatJeu?.tension_sociale ?? 45}%` }} />
          </div>
        </div>
      )}
      {mode === 'popularite' && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-blue-400 font-semibold">Popularité</span>
            <span className="text-xs text-blue-300 font-bold">{Math.round(etatJeu?.popularite_joueur ?? 42)}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${etatJeu?.popularite_joueur ?? 42}%` }} />
          </div>
        </div>
      )}
      {mode === 'chomage' && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-amber-400 font-semibold">Chômage estimé</span>
            <span className="text-xs text-amber-300 font-bold">{(((etatJeu?.tension_sociale ?? 45) * 0.15) + 8).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (etatJeu?.tension_sociale ?? 45) * 0.7 + 10)}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Taux structurellement plus élevé en Outre-Mer</p>
        </div>
      )}
      {mode === 'energie' && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <p className="text-xs text-blue-400 font-semibold mb-1.5">Mix énergétique local</p>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Réseau insulaire autonome. Principalement fioul et solaire. Pas d'interconnexion avec le réseau continental.
          </p>
        </div>
      )}

      {pol?.intentions && (
        <>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Intentions de vote 2026</p>
          <div className="flex flex-col gap-1">
            {Object.entries(pol.intentions).sort(([,a],[,b]) => b - a).slice(0, 5).map(([parti, pct]) => (
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
        </>
      )}
    </div>
  )
}

function PanneauDepartement({ feature, onFermer, mode, etatJeu }) {
  if (!feature) return null
  const code = feature.properties.code
  const nom  = feature.properties.nom
  const pol  = getPolitiqueDepartement(code)

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900 border border-slate-600 rounded-xl p-4 shadow-2xl z-20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-base">{nom}</h3>
          <p className="text-xs text-slate-500">Département {code}</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
      </div>

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
          <div className="flex justify-between mb-1">
            <span className="text-xs text-red-400 font-semibold">Tension sociale</span>
            <span className="text-xs text-red-300 font-bold">{Math.round(etatJeu?.tension_sociale ?? 45)}/100</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${etatJeu?.tension_sociale ?? 45}%` }} />
          </div>
        </div>
      )}
      {mode === 'popularite' && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-blue-400 font-semibold">Popularité</span>
            <span className="text-xs text-blue-300 font-bold">{Math.round(etatJeu?.popularite_joueur ?? 42)}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${etatJeu?.popularite_joueur ?? 42}%` }} />
          </div>
        </div>
      )}
      {mode === 'energie' && (
        <div className="mb-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <p className="text-xs text-blue-400 font-semibold mb-2">Mix national</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-lg font-black text-indigo-300">{etatJeu?.part_nucleaire_mix_pct ?? 68}%</p>
              <p className="text-xs text-slate-500">⚛️ Nucléaire</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-green-300">{etatJeu?.part_renouvelable_mix_pct ?? 24}%</p>
              <p className="text-xs text-slate-500">🌿 Renouvelable</p>
            </div>
          </div>
        </div>
      )}
      {mode === 'chomage' && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-amber-400 font-semibold">Chômage estimé</span>
            <span className="text-xs text-amber-300 font-bold">{(((etatJeu?.tension_sociale ?? 45) * 0.12) + 5).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full"
              style={{ width: `${(etatJeu?.tension_sociale ?? 45) * 0.7 + 5}%` }} />
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Intentions de vote 2026</p>
      <div className="flex flex-col gap-1">
        {Object.entries(pol.intentions).sort(([,a],[,b]) => b - a).slice(0, 6).map(([parti, pct]) => (
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

function PanneauPays({ code, onFermer, mode, etatJeu }) {
  const pays = PAYS_DATA[code]
  if (!pays) return null
  const mw    = pays.echanges_key ? (etatJeu?.echanges_mw?.[pays.echanges_key] ?? null) : null
  const exp   = mw != null ? mw >= 0 : null
  const cap   = pays.echanges_key ? (CAP_MAX[pays.echanges_key] ?? 2000) : null
  const util  = mw != null && cap ? Math.round((Math.abs(mw) / cap) * 100) : null

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900 border border-slate-600 rounded-xl p-4 shadow-2xl z-20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-base">{pays.emoji} {pays.nom}</h3>
          <p className="text-xs text-slate-500">Relation France : {pays.relation}/100</p>
        </div>
        <button onClick={onFermer} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">Relations diplomatiques</span>
          <span className={`text-xs font-bold ${pays.relation > 60 ? 'text-emerald-400' : pays.relation > 40 ? 'text-amber-400' : 'text-red-400'}`}>{pays.relation}/100</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${pays.relation > 60 ? 'bg-emerald-500' : pays.relation > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${pays.relation}%` }} />
        </div>
      </div>
      {pays.echanges_key ? (
        <>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">⚡ Échanges électriques</p>
          <div className={`rounded-xl border p-3 mb-3 flex items-center justify-between ${exp === null ? 'bg-slate-800/50 border-slate-700/40' : exp ? 'bg-green-950/40 border-green-700/40' : 'bg-red-950/40 border-red-700/40'}`}>
            <div>
              <p className="text-[10px] text-slate-400">Solde actuel</p>
              <p className={`text-xl font-bold tabular-nums mt-0.5 ${exp === null ? 'text-slate-400' : exp ? 'text-green-300' : 'text-red-300'}`}>{fmtMW(mw)}</p>
            </div>
            <div className="text-right">
              {exp !== null && <p className={`text-xs font-semibold ${exp ? 'text-green-400' : 'text-red-400'}`}>{exp ? '▲ Export FR' : '▼ Import FR'}</p>}
              {util != null && <p className="text-[10px] text-slate-500 mt-1">{util}% capacité</p>}
            </div>
          </div>
          {cap && mw != null && (
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-slate-500">Utilisation interconnexion</span>
                <span className="text-[10px] text-slate-500">Cap. {cap >= 1000 ? `${cap/1000} GW` : `${cap} MW`}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${exp ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, util)}%`, opacity: 0.8 }} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-slate-500">Pas d'interconnexion électrique directe.</p>
        </div>
      )}
      <div>
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

  useEffect(() => {
    if (mode === 'energie') setPanneauEnergie(true)
    else setPanneauEnergie(false)
  }, [mode])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson').then(r => r.json()),
      fetch('https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson').then(r => r.json()).catch(() => null),
    ]).then(([france, europe]) => {
      setGeoFrance(france)
      setGeoEurope(europe)
      setLoading(false)
    }).catch(() => { setError('Impossible de charger la carte.'); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!geoFrance || !svgRef.current) return

    const W = 760, H = 760
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${W} ${H}`)
    // Ajouter defs une fois pour les clipPaths
    svg.append('defs')
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#0c1520')

    // Projection principale France métro
    const proj = d3.geoConicConformal()
      .center([2.454071, 46.279229])
      .scale(2100)
      .translate([W / 2 - 30, H / 2 - 80])

    const path = d3.geoPath().projection(proj)
    const europeISOs = Object.keys(PAYS_DATA)

    // ── Pays européens ────────────────────────────────────────
    if (geoEurope?.features) {
      const paysF = geoEurope.features.filter(f => {
        const iso = f.properties?.ISO3 ?? f.properties?.iso_a3 ?? f.properties?.ADM0_A3 ?? ''
        return europeISOs.includes(iso)
      })
      svg.append('g').attr('id', 'europe')
        .selectAll('path').data(paysF).enter().append('path')
        .attr('d', path)
        .attr('fill', d => getCouleurPays(d.properties?.ISO3 ?? d.properties?.iso_a3 ?? d.properties?.ADM0_A3, mode, etatJeu))
        .attr('fill-opacity', 0.7).attr('stroke', '#1e3a5f').attr('stroke-width', 0.8)
        .style('cursor', 'pointer')
        .on('mouseover', function() { d3.select(this).attr('fill-opacity', 0.95).attr('stroke', '#60a5fa').attr('stroke-width', 1.5) })
        .on('mouseout',  function() { d3.select(this).attr('fill-opacity', 0.7).attr('stroke', '#1e3a5f').attr('stroke-width', 0.8) })
        .on('click', function(event, d) {
          const iso = d.properties?.ISO3 ?? d.properties?.iso_a3 ?? d.properties?.ADM0_A3 ?? ''
          if (europeISOs.includes(iso)) { setPanneauEnergie(false); setSelected(p => p?.type === 'pays' && p.code === iso ? null : { type: 'pays', code: iso }) }
        })

      paysF.forEach(f => {
        const iso = f.properties?.ISO3 ?? f.properties?.iso_a3 ?? f.properties?.ADM0_A3 ?? ''
        const p = PAYS_DATA[iso]; if (!p) return
        const c = path.centroid(f); if (!c || isNaN(c[0])) return
        const g = svg.append('g').style('cursor', 'pointer')
          .on('click', () => { setPanneauEnergie(false); setSelected(prev => prev?.type === 'pays' && prev.code === iso ? null : { type: 'pays', code: iso }) })
        g.append('text').attr('x', c[0]).attr('y', c[1])
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
          .attr('fill', '#94a3b8').attr('font-size', 9).attr('pointer-events', 'none').text(p.emoji)
        if (mode === 'energie' && p.echanges_key) {
          const mw = etatJeu?.echanges_mw?.[p.echanges_key] ?? null
          if (mw != null) {
            const lbl = Math.abs(mw) >= 1000 ? `${mw >= 0 ? '▲' : '▼'}${(Math.abs(mw)/1000).toFixed(1)}GW` : `${mw >= 0 ? '▲' : '▼'}${Math.abs(Math.round(mw))}MW`
            g.append('text').attr('x', c[0]).attr('y', c[1] + 12).attr('text-anchor', 'middle')
              .attr('fill', mw >= 0 ? '#4ade80' : '#f87171').attr('font-size', 7.5).attr('font-weight', 'bold').attr('pointer-events', 'none').text(lbl)
          }
        }
      })
    } else {
      // Fallback rectangles
      [{ code:'GBR',x:185,y:25,w:130,h:55 },{ code:'BEL',x:390,y:25,w:90,h:45 },
       { code:'DEU',x:535,y:72,w:135,h:155 },{ code:'CHE',x:545,y:300,w:130,h:85 },
       { code:'ITA',x:575,y:395,w:130,h:150 },{ code:'ESP',x:65,y:505,w:185,h:100 }
      ].forEach(pays => {
        const info = PAYS_DATA[pays.code]; if (!info) return
        const g = svg.append('g').style('cursor', 'pointer')
        g.append('rect').attr('x',pays.x).attr('y',pays.y).attr('width',pays.w).attr('height',pays.h)
          .attr('rx',4).attr('fill',getCouleurPays(pays.code,mode,etatJeu)).attr('stroke','#334155').attr('stroke-width',1)
        g.append('text').attr('x',pays.x+pays.w/2).attr('y',pays.y+pays.h/2).attr('text-anchor','middle').attr('dominant-baseline','middle').attr('fill','#94a3b8').attr('font-size',10).text(info.emoji)
        g.on('click', () => { setPanneauEnergie(false); setSelected(p => p?.type==='pays'&&p.code===pays.code?null:{type:'pays',code:pays.code}) })
          .on('mouseover', () => g.select('rect').attr('stroke','#60a5fa'))
          .on('mouseout', () => g.select('rect').attr('stroke','#334155'))
      })
    }

    // ── Métropole ─────────────────────────────────────────────
    const metro = geoFrance.features.filter(f => !DROM_CODES.includes(f.properties.code))

    const gDeps = svg.append('g').attr('id', 'metropole')
    gDeps.selectAll('path').data(metro).enter().append('path')
      .attr('d', path)
      .attr('fill', d => getCouleurTerritoire(d.properties.code, mode, etatJeu))
      .attr('fill-opacity', 0.88).attr('stroke', '#0c1520').attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill-opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1.5)
      })
      .on('mouseout', function(event, d) {
        const isSel = selected?.type === 'dep' && selected?.feature?.properties?.code === d.properties.code
        d3.select(this).attr('fill-opacity', 0.88)
          .attr('stroke', isSel ? '#fff' : '#0c1520')
          .attr('stroke-width', isSel ? 2 : 0.5)
      })
      .on('click', function(event, d) {
        setPanneauEnergie(false)
        setSelected(p => p?.type==='dep'&&p?.feature?.properties?.code===d.properties.code ? null : { type:'dep', feature:d })
      })

    gDeps.selectAll('text.dep-label').data(metro).enter().append('text').attr('class','dep-label')
      .attr('x', d => path.centroid(d)[0]).attr('y', d => path.centroid(d)[1])
      .attr('text-anchor','middle').attr('dominant-baseline','middle')
      .attr('fill','white').attr('fill-opacity',0.5).attr('font-size',5.5).attr('pointer-events','none')
      .text(d => d.properties.code)

    // ── Zoom Île-de-France ────────────────────────────────────
    const idfFeatures = geoFrance.features.filter(f => IDF_CODES.includes(f.properties.code))
    dessinerZoomIDF(svg, idfFeatures, mode, etatJeu, (feature) => {
      setPanneauEnergie(false)
      setSelected(p => p?.type==='dep'&&p?.feature?.properties?.code===feature.properties.code ? null : { type:'dep', feature })
    })

    // ── Séparateur DROM ───────────────────────────────────────
    const SEP_Y = 626
    svg.append('line')
      .attr('x1', 10).attr('y1', SEP_Y).attr('x2', W - 10).attr('y2', SEP_Y)
      .attr('stroke', '#1e3a5f').attr('stroke-width', 1).attr('stroke-dasharray', '5,4')
    svg.append('text').attr('x', 12).attr('y', SEP_Y - 4)
      .attr('fill', '#334155').attr('font-size', 8)
      .text('▶ DROM — Départements et Régions d\'Outre-Mer')

    // ── DROM ─────────────────────────────────────────────────
    geoFrance.features.filter(f => DROM_CODES.includes(f.properties.code)).forEach(feature => {
      const code = feature.properties.code
      const cfg  = DROM_CONFIG[code]
      if (!cfg) return
      dessinerDrom(svg, feature, cfg, code, mode, etatJeu, (c, nom, isDrom) => {
        setPanneauEnergie(false)
        setSelected(p => p?.type==='territoire'&&p.code===c ? null : { type:'territoire', code:c, nom, isDrom })
      })
    })

    // ── Bandeau énergie ───────────────────────────────────────
    if (mode === 'energie') {
      const solde = etatJeu?.echanges_mw?.solde_total ?? null
      const pos   = solde != null ? solde >= 0 : true
      const lbl   = solde != null
        ? `${pos?'+':''}${Math.abs(solde)>=1000?`${(solde/1000).toFixed(1)} GW`:`${Math.round(solde)} MW`}`
        : '— MW'
      svg.append('rect').attr('x',W/2-108).attr('y',H-76).attr('width',216).attr('height',48)
        .attr('rx',10).attr('fill',pos?'#14532d':'#7f1d1d').attr('stroke',pos?'#16a34a':'#dc2626').attr('stroke-width',1)
      svg.append('text').attr('x',W/2).attr('y',H-53).attr('text-anchor','middle').attr('fill','#94a3b8').attr('font-size',9)
        .text('Solde électrique total France')
      svg.append('text').attr('x',W/2).attr('y',H-33).attr('text-anchor','middle')
        .attr('fill',pos?'#4ade80':'#f87171').attr('font-size',18).attr('font-weight','bold').text(lbl)
      const gBtn = svg.append('g').style('cursor','pointer').on('click',()=>{setPanneauEnergie(true);setSelected(null)})
      gBtn.append('rect').attr('x',W/2-55).attr('y',H-20).attr('width',110).attr('height',15).attr('rx',7).attr('fill','#1e40af').attr('fill-opacity',0.8)
      gBtn.append('text').attr('x',W/2).attr('y',H-9).attr('text-anchor','middle').attr('fill','#bfdbfe').attr('font-size',8).attr('font-weight','bold').text('⚡ Détail mix →')
    }

  }, [geoFrance, geoEurope, mode, etatJeu, selected])

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">🗺️ Carte de France & Europe</h2>
        <div className="flex gap-1.5 flex-wrap">
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setSelected(null) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl"
        style={{ background: '#0c1520', minHeight: 420 }}>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 text-sm animate-pulse">🗺️ Chargement de la carte…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <svg ref={svgRef} className="w-full" />

        {selected?.type === 'dep' && (
          <PanneauDepartement feature={selected.feature} onFermer={() => setSelected(null)} mode={mode} etatJeu={etatJeu} />
        )}
        {selected?.type === 'territoire' && (
          <PanneauTerritoire code={selected.code} nom={selected.nom} isDrom={selected.isDrom}
            onFermer={() => setSelected(null)} mode={mode} etatJeu={etatJeu} />
        )}
        {selected?.type === 'pays' && (
          <PanneauPays code={selected.code} onFermer={() => setSelected(null)} mode={mode} etatJeu={etatJeu} />
        )}
        {panneauEnergie && !selected && (
          <PanneauEnergieLatéral etatJeu={etatJeu} onFermer={() => setPanneauEnergie(false)} />
        )}
      </div>

      {/* Légende */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Légende — {MODES.find(m => m.id === mode)?.label}</p>
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
            <span className="text-xs text-slate-400">{mode === 'tension' ? 'Faible' : mode === 'popularite' ? 'Impopulaire' : 'Faible'}</span>
            <div className="flex-1 h-3 rounded-full" style={{ background: mode === 'tension' ? 'linear-gradient(to right,rgb(60,120,60),rgb(255,60,0))' : mode === 'popularite' ? 'linear-gradient(to right,rgb(210,50,50),rgb(40,210,50))' : 'linear-gradient(to right,rgb(200,200,50),rgb(200,50,30))' }} />
            <span className="text-xs text-slate-400">{mode === 'tension' ? 'Élevée' : mode === 'popularite' ? 'Populaire' : 'Élevé'}</span>
          </div>
        )}
        {mode === 'energie' && (
          <div className="flex flex-wrap gap-4">
            {[['bg-blue-600','Fort nucléaire'],['bg-green-700','Export net (voisin)'],['bg-red-900','Import net (voisin)']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${c}`} />
                <span className="text-xs text-slate-400">{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '❤️ Popularité',  val: `${Math.round(etatJeu?.popularite_joueur ?? 42)}%`,     color: (etatJeu?.popularite_joueur ?? 42) < 35 ? 'text-red-400' : 'text-emerald-400' },
          { label: '🔥 Tension',     val: `${Math.round(etatJeu?.tension_sociale ?? 45)}/100`,     color: (etatJeu?.tension_sociale ?? 45) > 65 ? 'text-red-400' : 'text-amber-400' },
          { label: '⚡ Électricité', val: `${Math.round(etatJeu?.prix_electricite ?? 95)} €/MWh`,  color: (etatJeu?.prix_electricite ?? 95) > 100 ? 'text-red-400' : 'text-blue-400' },
          { label: '☢️ Nucléaire',   val: `${etatJeu?.part_nucleaire_mix_pct ?? 68}%`,             color: 'text-blue-300' },
          { label: '📅 Date',        val: etatJeu?.date ?? '1er Mars 2026',                        color: 'text-slate-400' },
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
