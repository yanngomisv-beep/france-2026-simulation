import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import * as Dialog from '@radix-ui/react-dialog'
import anime from 'animejs'
import { getToutesLois, getLoisDisponibles } from '../engines/moteur-legislatif.js'
import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

// ═══════════════════════════════════════════════════════════
// DONNÉES PARLEMENTAIRES
// ═══════════════════════════════════════════════════════════

const PARTIS_AN = [
  { id: 'LFI',          label: 'LFI',         sieges: 87,  couleur: '#cc0000', bloc: 'Gauche radicale',  vote_tendance: 'opposition' },
  { id: 'TRAVAILLEURS', label: 'PT',           sieges: 12,  couleur: '#8b0000', bloc: 'Gauche radicale',  vote_tendance: 'opposition' },
  { id: 'PS_ECO',       label: 'PS-Écolos',   sieges: 112, couleur: '#ff8c00', bloc: 'Gauche',           vote_tendance: 'variable'   },
  { id: 'EPR',          label: 'Renaissance',  sieges: 98,  couleur: '#ffcc00', bloc: 'Centre',           vote_tendance: 'soutien'    },
  { id: 'LR',           label: 'LR',           sieges: 62,  couleur: '#0066cc', bloc: 'Droite',           vote_tendance: 'variable'   },
  { id: 'PATRIOTES',    label: 'Patriotes',    sieges: 18,  couleur: '#003399', bloc: 'Droite nationale', vote_tendance: 'opposition' },
  { id: 'UPR',          label: 'UPR',          sieges: 8,   couleur: '#001a66', bloc: 'Souverainiste',    vote_tendance: 'opposition' },
  { id: 'RN',           label: 'RN',           sieges: 178, couleur: '#1a1aff', bloc: 'Extrême droite',   vote_tendance: 'opposition' },
  { id: 'ANIMALISTE',   label: 'Animaliste',   sieges: 4,   couleur: '#00aa44', bloc: 'Divers',           vote_tendance: 'variable'   },
  { id: 'DIVERS',       label: 'Divers',       sieges: 6,   couleur: '#888888', bloc: 'Divers',           vote_tendance: 'variable'   },
]

const PARTIS_SENAT = [
  { id: 'LR_S',    label: 'LR',       sieges: 145, couleur: '#0066cc', bloc: 'Droite',          vote_tendance: 'variable'   },
  { id: 'UC_S',    label: 'UC',       sieges: 56,  couleur: '#3399ff', bloc: 'Centre droit',    vote_tendance: 'variable'   },
  { id: 'EPR_S',   label: 'Majorité', sieges: 72,  couleur: '#ffcc00', bloc: 'Centre',          vote_tendance: 'soutien'    },
  { id: 'RN_S',    label: 'RN',       sieges: 22,  couleur: '#1a1aff', bloc: 'Extrême droite',  vote_tendance: 'opposition' },
  { id: 'PS_S',    label: 'PS',       sieges: 64,  couleur: '#ff8c00', bloc: 'Gauche',          vote_tendance: 'opposition' },
  { id: 'CRCE_S',  label: 'CRCE',     sieges: 22,  couleur: '#cc0000', bloc: 'Gauche radicale', vote_tendance: 'opposition' },
  { id: 'DIVERS_S',label: 'Divers',   sieges: 7,   couleur: '#888888', bloc: 'Divers',          vote_tendance: 'variable'   },
]

const TOTAL_AN = 577, MAJORITE_AN = 289
const TOTAL_SENAT = 388, MAJORITE_SENAT = 195

const LOIS_BICAMERALES = [
  'referendum_constituant', 'dissolution_assemblee', 'frexit_referendum',
  'sortie_otan', 'loi_secret_defense', 'mise_en_accusation_68',
]

const BLOCS_LABELS = {
  BLOC_INSTITUTIONS: { label: 'Institutions', emoji: '🏛️' },
  BLOC_ENERGIE:      { label: 'Énergie',       emoji: '⚡' },
  BLOC_ECONOMIE:     { label: 'Économie',      emoji: '📊' },
  BLOC_SOCIAL:       { label: 'Social',        emoji: '👥' },
  BLOC_SECURITE:     { label: 'Sécurité',      emoji: '🛡️' },
  BLOC_SCANDALES:    { label: 'Événements',    emoji: '⚠️' },
}

// ═══════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════

function genererPositions(partis, W, H, cx, cy, R_MIN, R_STEP, RANGS) {
  const sieges = []
  for (const p of partis) for (let i = 0; i < p.sieges; i++) sieges.push({ parti: p.id, couleur: p.couleur })
  const total = sieges.length
  const siegesParRang = []
  let restants = total
  for (let r = 0; r < RANGS; r++) {
    const rayon = R_MIN + r * R_STEP
    const capacite = Math.floor(Math.PI * rayon / 13)
    const nb = r === RANGS - 1 ? restants : Math.min(capacite, Math.ceil(total / RANGS))
    const actual = Math.min(nb, restants)
    siegesParRang.push(actual)
    restants -= actual
    if (restants <= 0) break
  }
  const positions = []
  let idx = 0
  for (let r = 0; r < siegesParRang.length; r++) {
    const rayon = R_MIN + r * R_STEP
    const nb = siegesParRang[r]
    for (let i = 0; i < nb && idx < total; i++) {
      const angle = Math.PI - (i / Math.max(nb - 1, 1)) * Math.PI
      positions.push({ x: cx + rayon * Math.cos(angle), y: cy - rayon * Math.sin(angle), ...sieges[idx], idx })
      idx++
    }
  }
  return positions
}

function calculerVoteParti(partiId, loi, chambre = 'AN') {
  if (!loi) return { pour: 0.35, contre: 0.35, abstention: 0.30 }
  const favorables = loi.partis_favorables ?? []
  const hostiles   = loi.partis_hostiles   ?? []
  const partiBase  = partiId.replace('_S', '')
  if (favorables.includes(partiBase) || favorables.includes(partiId)) return { pour: 0.90, contre: 0.04, abstention: 0.06 }
  if (hostiles.includes(partiBase) || hostiles.includes(partiId))     return { pour: 0.04, contre: 0.90, abstention: 0.06 }
  const partis = chambre === 'AN' ? PARTIS_AN : PARTIS_SENAT
  const info   = partis.find(p => p.id === partiId)
  if (info?.vote_tendance === 'soutien')    return { pour: 0.75, contre: 0.15, abstention: 0.10 }
  if (info?.vote_tendance === 'opposition') return { pour: 0.10, contre: 0.75, abstention: 0.15 }
  return { pour: 0.40, contre: 0.35, abstention: 0.25 }
}

function getImpactColor(key, val) {
  const inversed = ['tension_sociale', 'deficit_milliards', 'inflation_pct']
  const positive = inversed.includes(key) ? val < 0 : val > 0
  if (val === 0) return 'text-slate-500'
  return positive ? 'text-emerald-400' : 'text-red-400'
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT HÉMICYCLE SVG
// ═══════════════════════════════════════════════════════════

function HemicycleSVG({ partis, total, majorite, etatVote, siegeSelectionne, setSiegeSelectionne,
  W = 680, H = 340, R_MIN = 95, R_STEP = 24, RANGS = 8 }) {
  const svgRef = useRef(null)
  const cx = W / 2, cy = H - 18

  useEffect(() => {
    if (!svgRef.current) return
    const positions = genererPositions(partis, W, H, cx, cy, R_MIN, R_STEP, RANGS)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%')
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#0a0f1a')
    svg.append('path')
      .attr('d', `M ${cx - R_MIN - R_STEP * RANGS - 15} ${cy} A 1 1 0 0 1 ${cx + R_MIN + R_STEP * RANGS + 15} ${cy}`)
      .attr('fill', 'none').attr('stroke', '#1e293b').attr('stroke-width', 1.5)

    // Ligne majorité
    const xMaj = cx + (R_MIN + R_STEP * RANGS + 20) * Math.cos(Math.PI * (1 - majorite / total))
    const yMaj = cy - (R_MIN + R_STEP * RANGS + 20) * Math.sin(Math.PI * (1 - majorite / total))
    svg.append('line')
      .attr('x1', cx).attr('y1', cy).attr('x2', xMaj).attr('y2', yMaj)
      .attr('stroke', '#ffffff22').attr('stroke-width', 1).attr('stroke-dasharray', '4,3')

    svg.selectAll('circle.siege')
      .data(positions)
      .enter().append('circle').attr('class', 'siege')
      .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 4.5)
      .attr('fill', d => {
        const e = etatVote?.[d.parti]
        if (e === 'pour') return '#22c55e'
        if (e === 'contre') return '#ef4444'
        if (e === 'abstention') return '#64748b'
        if (e === 'en_cours') return '#fbbf24'
        return d.couleur
      })
      .attr('fill-opacity', d => {
        if (siegeSelectionne && siegeSelectionne.parti !== d.parti) return 0.18
        if (etatVote && !etatVote[d.parti]) return 0.25
        return 0.90
      })
      .attr('stroke', d => siegeSelectionne?.parti === d.parti ? '#fff' : 'none')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function() { d3.select(this).attr('r', 6.5).attr('fill-opacity', 1) })
      .on('mouseout', function(ev, d) {
        d3.select(this).attr('r', 4.5)
          .attr('fill-opacity', (siegeSelectionne && siegeSelectionne.parti !== d.parti) ? 0.18 : (etatVote && !etatVote[d.parti]) ? 0.25 : 0.90)
      })
      .on('click', (ev, d) => setSiegeSelectionne(prev => prev?.parti === d.parti ? null : d))

    svg.append('text').attr('x', cx).attr('y', cy + 14)
      .attr('text-anchor', 'middle').attr('fill', '#334155').attr('font-size', '9px')
      .text(`Majorité : ${majorite} / ${total}`)
  }, [partis, etatVote, siegeSelectionne])

  return <svg ref={svgRef} className="w-full" />
}

// ═══════════════════════════════════════════════════════════
// SÉQUENCE DE VOTE ANIMÉE
// ═══════════════════════════════════════════════════════════

function SequenceVote({ loi, chambre, partis, total, majorite, onTermine }) {
  const [etatVote, setEtatVote]       = useState({})
  const [groupeActif, setGroupeActif] = useState(null)
  const [compteurs, setCompteurs]     = useState({ pour: 0, contre: 0, abstention: 0 })
  const [etape, setEtape]             = useState('vote')
  const [siegeSel, setSiegeSel]       = useState(null)
  const compteurRef = useRef({ pour: 0, contre: 0, abstention: 0 })

  const animer = useCallback(() => {
    let delai = 0
    partis.forEach((parti, i) => {
      setTimeout(() => {
        setGroupeActif(parti.id)
        setEtatVote(prev => ({ ...prev, [parti.id]: 'en_cours' }))
        setTimeout(() => {
          const { pour, contre } = calculerVoteParti(parti.id, loi, chambre)
          const votesPour       = Math.round(parti.sieges * pour)
          const votesContre     = Math.round(parti.sieges * contre)
          const votesAbstention = parti.sieges - votesPour - votesContre
          compteurRef.current = {
            pour:        compteurRef.current.pour + votesPour,
            contre:      compteurRef.current.contre + votesContre,
            abstention:  compteurRef.current.abstention + votesAbstention,
          }
          const target = { ...compteurRef.current }
          const current = { pour: compteurs.pour, contre: compteurs.contre, abstention: compteurs.abstention }
          anime({
            targets: current, pour: target.pour, contre: target.contre, abstention: target.abstention,
            duration: 350, easing: 'easeOutExpo',
            update: () => setCompteurs({ pour: Math.round(current.pour), contre: Math.round(current.contre), abstention: Math.round(current.abstention) }),
          })
          const resultat = votesPour > votesContre ? 'pour' : 'contre'
          setEtatVote(prev => ({ ...prev, [parti.id]: resultat }))
          setGroupeActif(null)
          if (i === partis.length - 1) {
            setTimeout(() => {
              setEtape('resultat')
              onTermine?.({ pour: compteurRef.current.pour, contre: compteurRef.current.contre, abstention: compteurRef.current.abstention, adopte: compteurRef.current.pour >= majorite })
            }, 700)
          }
        }, 500)
      }, delai)
      delai += 800
    })
  }, [partis, loi, chambre, majorite])

  useEffect(() => { setTimeout(animer, 600) }, [])

  const adopte = compteurs.pour >= majorite
  const dernierGroupe = partis.find(p => p.id === groupeActif)

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{chambre === 'AN' ? 'Assemblée Nationale' : 'Sénat'} — Vote en cours</p>
        <p className="font-bold text-white text-sm">{loi?.emoji} {loi?.titre}</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-2">
        <HemicycleSVG partis={partis} total={total} majorite={majorite} etatVote={etatVote}
          siegeSelectionne={siegeSel} setSiegeSelectionne={setSiegeSel}
          H={chambre === 'SENAT' ? 270 : 300} RANGS={chambre === 'SENAT' ? 6 : 8} />
      </div>

      {groupeActif && dernierGroupe && (
        <div className="flex items-center gap-2.5 bg-amber-950/40 border border-amber-700/30 rounded-lg px-3 py-2">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: dernierGroupe.couleur }} />
          <p className="text-xs text-amber-300 font-semibold">{dernierGroupe.label} vote… ({dernierGroupe.sieges} sièges)</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '✅ Pour', val: compteurs.pour, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
          { label: '❌ Contre', val: compteurs.contre, color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40' },
          { label: '⬜ Abst.', val: compteurs.abstention, color: 'text-slate-400', bg: 'bg-slate-800/60 border-slate-700/40' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`border rounded-lg p-2 text-center ${bg}`}>
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className={`text-xl font-black ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (compteurs.pour / total) * 100)}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/25" style={{ left: `${(majorite / total) * 100}%` }} />
      </div>

      {etape === 'resultat' && (
        <div className={`rounded-xl border p-3 text-center ${adopte ? 'bg-emerald-950/60 border-emerald-600/40' : 'bg-red-950/60 border-red-600/40'}`}>
          <p className={`text-xl font-black ${adopte ? 'text-emerald-400' : 'text-red-400'}`}>
            {adopte ? '✅ ADOPTÉE' : '❌ REJETÉE'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {adopte ? `+${compteurs.pour - majorite} voix d'avance` : `Manque ${majorite - compteurs.pour} voix`}
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MODAL VOTE COMPLET
// ═══════════════════════════════════════════════════════════

function ModalVote({ loi, open, onClose, onAdopte, onRejete }) {
  const [phase, setPhase]                 = useState('AN')
  const [resultatAN, setResultatAN]       = useState(null)
  const [resultatSenat, setResultatSenat] = useState(null)
  const [cmpResultat, setCmpResultat]     = useState(null)

  useEffect(() => {
    if (open) { setPhase('AN'); setResultatAN(null); setResultatSenat(null); setCmpResultat(null) }
  }, [open, loi])

  function handleResultatAN(res) {
    setResultatAN(res)
    if (!res.adopte) { setTimeout(() => { setPhase('DONE'); onRejete?.() }, 1400) }
    else              { setTimeout(() => setPhase('SENAT'), 1600) }
  }

  function handleResultatSenat(res) {
    setResultatSenat(res)
    if (res.adopte) { setTimeout(() => { setPhase('DONE'); onAdopte?.() }, 1400) }
    else             { setTimeout(() => setPhase('CMP'), 1600) }
  }

  function lancerCMP() {
    const adopte = Math.random() > 0.45
    setCmpResultat(adopte)
    setTimeout(() => { setPhase('DONE'); adopte ? onAdopte?.() : onRejete?.() }, 1200)
  }

  const PHASES = ['AN', 'SENAT', 'CMP', 'DONE']
  const phaseIdx = PHASES.indexOf(phase)

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose?.() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-slate-950 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 p-5">

          {/* Stepper */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'AN', label: '🏛️ AN' },
                { id: 'SENAT', label: '🏟️ Sénat' },
                { id: 'CMP', label: '🤝 CMP' },
                { id: 'DONE', label: '✅ Fin' },
              ].map(({ id, label }, i) => (
                <div key={id} className="flex items-center gap-1.5">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    phase === id         ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' :
                    phaseIdx > i        ? 'bg-emerald-900/60 text-emerald-400' :
                                          'bg-slate-800 text-slate-600'
                  }`}>{label}</div>
                  {i < 3 && <span className="text-slate-700 text-xs">→</span>}
                </div>
              ))}
            </div>
            <Dialog.Close asChild>
              <button className="text-slate-600 hover:text-slate-300 text-lg transition-colors">✕</button>
            </Dialog.Close>
          </div>

          {phase === 'AN' && (
            <SequenceVote loi={loi} chambre="AN" partis={PARTIS_AN} total={TOTAL_AN} majorite={MAJORITE_AN} onTermine={handleResultatAN} />
          )}

          {phase === 'SENAT' && (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-emerald-400 font-semibold">✅ Adoptée à l'AN ({resultatAN?.pour} pour) → Passage au Sénat</p>
              </div>
              <SequenceVote loi={loi} chambre="SENAT" partis={PARTIS_SENAT} total={TOTAL_SENAT} majorite={MAJORITE_SENAT} onTermine={handleResultatSenat} />
            </div>
          )}

          {phase === 'CMP' && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-5xl">🤝</p>
              <h3 className="text-xl font-black text-white text-center">Commission Mixte Paritaire</h3>
              <p className="text-sm text-slate-400 text-center max-w-sm">
                Désaccord entre les deux chambres. 7 députés + 7 sénateurs tentent de trouver un texte commun.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="bg-red-950/40 border border-red-800/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Sénat</p>
                  <p className="font-bold text-red-400">❌ Rejeté</p>
                  <p className="text-xs text-slate-500">{resultatSenat?.contre} contre</p>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Assemblée</p>
                  <p className="font-bold text-emerald-400">✅ Adopté</p>
                  <p className="text-xs text-slate-500">{resultatAN?.pour} pour</p>
                </div>
              </div>
              {cmpResultat === null ? (
                <button onClick={lancerCMP} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                  🗳️ Lancer la CMP
                </button>
              ) : (
                <div className={`text-lg font-black ${cmpResultat ? 'text-emerald-400' : 'text-red-400'}`}>
                  {cmpResultat ? '✅ Accord trouvé' : '❌ Désaccord persistant'}
                </div>
              )}
            </div>
          )}

          {phase === 'DONE' && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-6xl">{resultatAN?.adopte || (resultatSenat?.adopte) ? '🎉' : '💔'}</p>
              <h3 className={`text-2xl font-black text-center ${(resultatAN?.adopte || resultatSenat?.adopte) ? 'text-emerald-400' : 'text-red-400'}`}>
                {(resultatAN?.adopte || resultatSenat?.adopte) ? 'Loi promulguée !' : 'Loi rejetée'}
              </h3>
              <p className="text-sm text-slate-400 text-center">{loi?.emoji} {loi?.titre}</p>
              {loi?.evenements_secondaires?.length > 0 && (resultatAN?.adopte || resultatSenat?.adopte) && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {loi.evenements_secondaires.map((e, i) => (
                    <span key={i} className="text-xs bg-amber-950/40 text-amber-400 border border-amber-800/30 px-2 py-0.5 rounded">⚡ {e}</span>
                  ))}
                </div>
              )}
              <Dialog.Close asChild>
                <button className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors">Fermer</button>
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ═══════════════════════════════════════════════════════════
// CARTE LOI (panneau gauche)
// ═══════════════════════════════════════════════════════════

function CarteLoi({ loi, onVoter, dejaVotee, etatJeu }) {
  const [expanded, setExpanded] = useState(false)

  // Probabilité de passage approximative
  const scoreFavorable = (loi.partis_favorables ?? []).reduce((s, p) => {
    const info = PARTIS_AN.find(a => a.id === p)
    return s + (info?.sieges ?? 0)
  }, 0)
  const proba = Math.min(99, Math.max(5, Math.round((scoreFavorable / MAJORITE_AN) * 65)))

  const conditionsOk = (() => {
    const c = loi.conditions ?? {}
    if (c.popularite_min  && (etatJeu?.popularite_joueur ?? 50)            < c.popularite_min)  return false
    if (c.reserve_min     && (etatJeu?.reserve_budgetaire_milliards ?? 28) < c.reserve_min)     return false
    if (c.stabilite_min   && (etatJeu?.stabilite ?? 58)                    < c.stabilite_min)   return false
    if (c.prix_baril_min  && (etatJeu?.prix_baril ?? 80)                   < c.prix_baril_min)  return false
    if (c.scandale_actif  && !etatJeu?.scandale_actif) return false
    return true
  })()

  const impactsNotables = Object.entries(loi.impacts ?? {})
    .filter(([, v]) => v !== 0)
    .slice(0, 4)

  return (
    <div className={`rounded-xl border transition-all ${
      dejaVotee    ? 'border-emerald-800/40 bg-emerald-950/20 opacity-60' :
      !conditionsOk ? 'border-slate-700/40 bg-slate-900/40 opacity-50' :
                      'border-slate-700/60 bg-slate-900/60 hover:border-slate-600/80 hover:bg-slate-800/60'
    }`}>
      <div className="p-3">
        {/* Entête */}
        <div className="flex items-start gap-2.5 mb-2">
          <span className="text-xl flex-shrink-0 mt-0.5">{loi.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">{loi.titre}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{loi.description}</p>
          </div>
        </div>

        {/* Proba + impacts rapides */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <div className={`text-xs px-2 py-0.5 rounded font-bold ${
            proba > 60 ? 'bg-emerald-900/60 text-emerald-400' :
            proba > 35 ? 'bg-yellow-900/60 text-yellow-400' :
                         'bg-red-900/60 text-red-400'
          }`}>
            {proba}% de passage
          </div>
          {impactsNotables.map(([key, val]) => (
            <span key={key} className={`text-xs font-semibold ${getImpactColor(key, val)}`}>
              {val > 0 ? '+' : ''}{val} {key.replace(/_/g, ' ').replace(' pct', '%').replace(' milliards', 'Md')}
            </span>
          ))}
        </div>

        {/* Partis favorables / hostiles */}
        {expanded && (
          <div className="flex flex-col gap-1.5 mb-2.5 border-t border-slate-800/60 pt-2.5">
            {loi.partis_favorables?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-emerald-500 font-medium">✅</span>
                {loi.partis_favorables.map(p => (
                  <span key={p} className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 px-1.5 py-0.5 rounded">{p}</span>
                ))}
              </div>
            )}
            {loi.partis_hostiles?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-red-500 font-medium">❌</span>
                {loi.partis_hostiles.map(p => (
                  <span key={p} className="text-xs bg-red-950/50 text-red-400 border border-red-800/30 px-1.5 py-0.5 rounded">{p}</span>
                ))}
              </div>
            )}
            {loi.note && (
              <p className="text-xs text-slate-500 italic border-l-2 border-slate-700 pl-2">{loi.note}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(e => !e)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            {expanded ? '▲ Moins' : '▼ Détails'}
          </button>
          <div className="flex-1" />
          {dejaVotee ? (
            <span className="text-xs text-emerald-400 font-semibold">✅ Promulguée</span>
          ) : !conditionsOk ? (
            <span className="text-xs text-slate-600 font-medium">🔒 Conditions non remplies</span>
          ) : (
            <button
              onClick={() => onVoter(loi)}
              className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
            >
              🗳️ Soumettre au vote
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL — PARLEMENT
// ═══════════════════════════════════════════════════════════

export default function Parlement({ etatJeu, voterLoi }) {
  const [vue, setVue]                     = useState('AN')
  const [siegeSelectionne, setSiegeSel]   = useState(null)
  const [modalVote, setModalVote]         = useState(null)
  const [historiqueVotes, setHistorique]  = useState([])
  const [blocActif, setBlocActif]         = useState('ALL')
  const [recherche, setRecherche]         = useState('')

  const partis   = vue === 'AN' ? PARTIS_AN    : PARTIS_SENAT
  const total    = vue === 'AN' ? TOTAL_AN     : TOTAL_SENAT
  const majorite = vue === 'AN' ? MAJORITE_AN  : MAJORITE_SENAT
  const partiSel = siegeSelectionne ? partis.find(p => p.id === siegeSelectionne.parti) : null

  const totalGauche = partis.filter(p => p.bloc.includes('Gauche')).reduce((s, p) => s + p.sieges, 0)
  const totalCentre = partis.filter(p => p.bloc.includes('Centre')).reduce((s, p) => s + p.sieges, 0)
  const totalDroite = partis.filter(p => p.bloc.includes('Droite') || p.bloc.includes('Extrême')).reduce((s, p) => s + p.sieges, 0)

  const loisAdoptees = etatJeu?.lois_votees ?? []

  // Catalogue des lois
  const toutesLois = useMemo(() => {
    try { return getToutesLois() } catch { return [] }
  }, [])

  const loisParBloc = useMemo(() => {
    // Utilise directement le CATALOGUE_LOIS importé (ESM)
    try { return CATALOGUE_LOIS } catch { return {} }
  }, [])

  const loisFiltrees = useMemo(() => {
    let lois = toutesLois
    if (blocActif !== 'ALL') {
      const blocKey = blocActif
      lois = loisParBloc[blocKey] ?? []
    }
    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      lois = lois.filter(l => l.titre?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
    }
    // Exclure art_49_3 et art_50_1 du catalogue
    lois = lois.filter(l => !['art_49_3', 'art_50_1'].includes(l.id))
    return lois
  }, [toutesLois, loisParBloc, blocActif, recherche])

  function handleVoter(loi) { setModalVote(loi) }

  function handleAdopte() {
    if (modalVote) {
      voterLoi?.(modalVote.id, 0)
      setHistorique(h => [{ loi: modalVote, resultat: 'adoptee', date: etatJeu?.date ?? 'Mars 2026' }, ...h])
    }
    setModalVote(null)
  }

  function handleRejete() {
    if (modalVote) setHistorique(h => [{ loi: modalVote, resultat: 'rejetee', date: etatJeu?.date ?? 'Mars 2026' }, ...h])
    setModalVote(null)
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">

      {/* Modal vote animé */}
      <ModalVote loi={modalVote} open={!!modalVote} onClose={() => setModalVote(null)} onAdopte={handleAdopte} onRejete={handleRejete} />

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">⚖️ Parlement — Lois & Hémicycle</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-emerald-400 font-bold">{loisAdoptees.length}</span> loi{loisAdoptees.length !== 1 ? 's' : ''} promulguée{loisAdoptees.length !== 1 ? 's' : ''}
          {historiqueVotes.length > 0 && (
            <span className="text-slate-600">· {historiqueVotes.length} vote{historiqueVotes.length !== 1 ? 's' : ''} ce mandat</span>
          )}
        </div>
      </div>

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* ════ COLONNE GAUCHE : CATALOGUE DES LOIS ════ */}
        <div className="flex flex-col gap-3">

          {/* Filtres blocs */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <button
              onClick={() => setBlocActif('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${blocActif === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              Toutes ({toutesLois.filter(l => !['art_49_3','art_50_1'].includes(l.id)).length})
            </button>
            {Object.entries(BLOCS_LABELS).map(([key, { label, emoji }]) => {
              const nb = (loisParBloc[key] ?? []).length
              return (
                <button key={key} onClick={() => setBlocActif(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${blocActif === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {emoji} {label} ({nb})
                </button>
              )
            })}
          </div>

          {/* Recherche */}
          <input
            type="text"
            placeholder="🔍 Rechercher une loi..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 text-white text-xs rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* Liste des lois */}
          <div className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1">
            {loisFiltrees.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Aucune loi trouvée</div>
            ) : (
              loisFiltrees.map(loi => (
                <CarteLoi
                  key={loi.id}
                  loi={loi}
                  onVoter={handleVoter}
                  dejaVotee={loisAdoptees.includes(loi.id)}
                  etatJeu={etatJeu}
                />
              ))
            )}
          </div>
        </div>

        {/* ════ COLONNE DROITE : HÉMICYCLE ════ */}
        <div className="flex flex-col gap-3">

          {/* Switch AN / Sénat */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 gap-1">
            {[
              { id: 'AN',    label: '🏛️ Assemblée', total: TOTAL_AN,    majorite: MAJORITE_AN    },
              { id: 'SENAT', label: '🏟️ Sénat',     total: TOTAL_SENAT, majorite: MAJORITE_SENAT },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setVue(tab.id); setSiegeSel(null) }}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  vue === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}>
                {tab.label}
                <span className="ml-1 opacity-50">{tab.total}</span>
              </button>
            ))}
          </div>

          {/* Compteurs blocs */}
          <div className="flex gap-3 text-xs px-1">
            <span className="text-red-400">Gauche <strong>{totalGauche}</strong></span>
            <span className="text-yellow-400">Centre <strong>{totalCentre}</strong></span>
            <span className="text-blue-400">Droite <strong>{totalDroite}</strong></span>
            <span className="text-slate-500 ml-auto">Maj. {majorite}</span>
          </div>

          {/* SVG Hémicycle */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-2">
            <HemicycleSVG partis={partis} total={total} majorite={majorite} etatVote={null}
              siegeSelectionne={siegeSelectionne} setSiegeSelectionne={setSiegeSel} H={300} />
          </div>

          {/* Info parti sélectionné */}
          {partiSel ? (
            <div className="bg-slate-800/80 border rounded-xl p-3 flex items-center gap-3" style={{ borderColor: partiSel.couleur + '60' }}>
              <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: partiSel.couleur }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{partiSel.label}</p>
                <p className="text-xs text-slate-400">{partiSel.bloc}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-white">{partiSel.sieges}</p>
                <p className="text-xs text-slate-500">{Math.round(partiSel.sieges / total * 100)}%</p>
              </div>
              <div className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                partiSel.vote_tendance === 'soutien'    ? 'bg-emerald-900/60 text-emerald-300' :
                partiSel.vote_tendance === 'opposition' ? 'bg-red-900/60 text-red-300' :
                                                          'bg-slate-700 text-slate-300'
              }`}>
                {partiSel.vote_tendance === 'soutien' ? '🤝' : partiSel.vote_tendance === 'opposition' ? '⚔️' : '🎲'}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 text-center italic">Cliquez sur un siège pour voir le groupe politique</p>
          )}

          {/* Légende partis */}
          <div className="grid grid-cols-2 gap-1.5">
            {partis.map(p => (
              <button key={p.id}
                onClick={() => setSiegeSel(prev => prev?.parti === p.id ? null : { parti: p.id })}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  siegeSelectionne?.parti === p.id ? 'bg-slate-600 ring-1 ring-white/20' : 'bg-slate-800/60 hover:bg-slate-700'
                }`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.couleur }} />
                <span className="text-slate-300 truncate">{p.label}</span>
                <span className="text-slate-500 ml-auto font-bold">{p.sieges}</span>
              </button>
            ))}
          </div>

          {/* Historique des votes */}
          {historiqueVotes.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
              <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">📋 Historique</h3>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {historiqueVotes.map((v, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 ${
                    v.resultat === 'adoptee' ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-red-950/30 border border-red-800/30'
                  }`}>
                    <span>{v.resultat === 'adoptee' ? '✅' : '❌'}</span>
                    <span className="text-slate-300 flex-1 truncate">{v.loi?.emoji} {v.loi?.titre}</span>
                    <span className="text-slate-600 flex-shrink-0">{v.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
