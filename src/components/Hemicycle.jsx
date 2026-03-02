import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const PARTIS = [
  { id: 'LFI',         label: 'LFI',          sieges: 87,  couleur: '#cc0000', bloc: 'Gauche radicale' },
  { id: 'TRAVAILLEURS',label: 'PT',            sieges: 12,  couleur: '#8b0000', bloc: 'Gauche radicale' },
  { id: 'PS_ECO',      label: 'PS-Écolos',    sieges: 112, couleur: '#ff8c00', bloc: 'Gauche' },
  { id: 'EPR',         label: 'Renaissance',  sieges: 98,  couleur: '#ffcc00', bloc: 'Centre' },
  { id: 'LR',          label: 'LR',           sieges: 62,  couleur: '#0066cc', bloc: 'Droite' },
  { id: 'PATRIOTES',   label: 'Patriotes',    sieges: 18,  couleur: '#003399', bloc: 'Droite nationale' },
  { id: 'RN',          label: 'RN',           sieges: 178, couleur: '#1a1aff', bloc: 'Extrême droite' },
  { id: 'ANIMALISTE',  label: 'Animaliste',   sieges: 4,   couleur: '#00aa44', bloc: 'Divers' },
  { id: 'DIVERS',      label: 'Divers',       sieges: 6,   couleur: '#888888', bloc: 'Divers' },
]

const MAJORITE = 289
const TOTAL = 577

function genererSieges(partis) {
  const sieges = []
  for (const parti of partis) {
    for (let i = 0; i < parti.sieges; i++) {
      sieges.push({ parti: parti.id, couleur: parti.couleur })
    }
  }
  return sieges
}

function dessinerHemicycle(svgRef, partis, siegeSelectionne, setSiegeSelectionne) {
  const sieges = genererSieges(partis)
  const total = sieges.length

  const width = 700
  const height = 380
  const cx = width / 2
  const cy = height - 30

  const RANGS = 8
  const R_MIN = 120
  const R_STEP = 28

  // Répartir les sièges en arcs concentriques
  const siegesParRang = []
  let restants = total
  for (let r = 0; r < RANGS; r++) {
    const rayon = R_MIN + r * R_STEP
    const capacite = Math.floor(Math.PI * rayon / 14)
    const nb = r === RANGS - 1 ? restants : Math.min(capacite, Math.ceil(total / RANGS))
    siegesParRang.push(nb)
    restants -= nb
    if (restants <= 0) break
  }

  // Positionner chaque siège
  const positions = []
  let idx = 0
  for (let r = 0; r < siegesParRang.length; r++) {
    const rayon = R_MIN + r * R_STEP
    const nb = siegesParRang[r]
    for (let i = 0; i < nb && idx < total; i++) {
      const angle = Math.PI - (i / (nb - 1)) * Math.PI
      positions.push({
        x: cx + rayon * Math.cos(angle),
        y: cy - rayon * Math.sin(angle),
        ...sieges[idx],
        idx,
      })
      idx++
    }
  }

  // Nettoyer et redessiner
  const svg = d3.select(svgRef.current)
  svg.selectAll('*').remove()

  svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%')

  // Ligne de majorité (repère visuel)
  svg.append('line')
    .attr('x1', cx - 10).attr('y1', cy)
    .attr('x2', cx + 10).attr('y2', cy)
    .attr('stroke', '#ffffff33').attr('stroke-width', 1)

  // Sièges
  svg.selectAll('circle.siege')
    .data(positions)
    .enter()
    .append('circle')
    .attr('class', 'siege')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 5.5)
    .attr('fill', d => d.couleur)
    .attr('stroke', d => siegeSelectionne?.parti === d.parti ? '#ffffff' : 'transparent')
    .attr('stroke-width', 1.5)
    .attr('opacity', d => siegeSelectionne && siegeSelectionne.parti !== d.parti ? 0.25 : 0.92)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      d3.select(this).attr('r', 7).attr('opacity', 1)
    })
    .on('mouseout', function(event, d) {
      d3.select(this).attr('r', 5.5)
        .attr('opacity', siegeSelectionne && siegeSelectionne.parti !== d.parti ? 0.25 : 0.92)
    })
    .on('click', (event, d) => {
      setSiegeSelectionne(prev => prev?.parti === d.parti ? null : d)
    })

  // Ligne de démarcation hémicycle
  svg.append('path')
    .attr('d', `M ${cx - R_MIN - R_STEP * RANGS - 10} ${cy} A 1 1 0 0 1 ${cx + R_MIN + R_STEP * RANGS + 10} ${cy}`)
    .attr('fill', 'none')
    .attr('stroke', '#334155')
    .attr('stroke-width', 1)

  // Indicateur majorité absolue
  svg.append('text')
    .attr('x', cx)
    .attr('y', cy + 20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#94a3b8')
    .attr('font-size', '11px')
    .text(`Majorité absolue : ${MAJORITE} sièges`)
}

export default function Hemicycle() {
  const svgRef = useRef(null)
  const [siegeSelectionne, setSiegeSelectionne] = useState(null)
  const [partis] = useState(PARTIS)

  useEffect(() => {
    if (svgRef.current) {
      dessinerHemicycle(svgRef, partis, siegeSelectionne, setSiegeSelectionne)
    }
  }, [partis, siegeSelectionne])

  const partiSelectionne = siegeSelectionne
    ? partis.find(p => p.id === siegeSelectionne.parti)
    : null

  const totalGauche = partis.filter(p => ['LFI','TRAVAILLEURS','PS_ECO'].includes(p.id))
    .reduce((s, p) => s + p.sieges, 0)
  const totalCentre = partis.find(p => p.id === 'EPR')?.sieges ?? 0
  const totalDroite = partis.filter(p => ['LR','PATRIOTES','RN'].includes(p.id))
    .reduce((s, p) => s + p.sieges, 0)

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">⚖️ Assemblée Nationale — {TOTAL} sièges</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-red-400">Gauche {totalGauche}</span>
          <span className="text-yellow-400">Centre {totalCentre}</span>
          <span className="text-blue-400">Droite {totalDroite}</span>
        </div>
      </div>

      {/* SVG Hémicycle */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <svg ref={svgRef} />
      </div>

      {/* Info siège sélectionné */}
      {partiSelectionne && (
        <div className="bg-slate-800 border rounded-lg p-4 flex items-center gap-4"
          style={{ borderColor: partiSelectionne.couleur }}>
          <div className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: partiSelectionne.couleur }} />
          <div className="flex-1">
            <p className="font-semibold text-white">{partiSelectionne.label}</p>
            <p className="text-sm text-slate-400">{partiSelectionne.bloc}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{partiSelectionne.sieges}</p>
            <p className="text-xs text-slate-400">sièges ({Math.round(partiSelectionne.sieges/TOTAL*100)}%)</p>
          </div>
          {partiSelectionne.sieges >= MAJORITE && (
            <span className="bg-green-700 text-green-100 text-xs px-2 py-1 rounded">Majorité absolue</span>
          )}
        </div>
      )}

      {/* Légende */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {partis.map(p => (
          <button key={p.id}
            onClick={() => setSiegeSelectionne(prev => prev?.parti === p.id ? null : { parti: p.id })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              siegeSelectionne?.parti === p.id ? 'bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.couleur }} />
            <span className="text-slate-300 truncate">{p.label}</span>
            <span className="text-slate-500 ml-auto">{p.sieges}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
