import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import * as Dialog from '@radix-ui/react-dialog'
import anime from 'animejs'
import { getToutesLois, getLoisDisponibles, getLoi } from '../engines/moteur-legislatif.js'
import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'
import { LOIS_PAR_PARTI, getToutesLoisPartis, getStatutLoi } from '../data/lois/lois-partis.js'

const PARTIS_AN = [
  { id: 'LFI',          label: 'LFI',         sieges: 87,  couleur: '#cc0000', bloc: 'Gauche radicale',  vote_tendance: 'opposition' },
  { id: 'TRAVAILLEURS', label: 'PT',           sieges: 12,  couleur: '#8b0000', bloc: 'Gauche radicale',  vote_tendance: 'opposition' },
  { id: 'PS_ECO',       label: 'PS-Ecolos',   sieges: 112, couleur: '#ff8c00', bloc: 'Gauche',           vote_tendance: 'variable'   },
  { id: 'EPR',          label: 'Renaissance',  sieges: 98,  couleur: '#ffcc00', bloc: 'Centre',           vote_tendance: 'soutien'    },
  { id: 'LR',           label: 'LR',           sieges: 62,  couleur: '#0066cc', bloc: 'Droite',           vote_tendance: 'variable'   },
  { id: 'PATRIOTES',    label: 'Patriotes',    sieges: 18,  couleur: '#003399', bloc: 'Droite nationale', vote_tendance: 'opposition' },
  { id: 'UPR',          label: 'UPR',          sieges: 8,   couleur: '#001a66', bloc: 'Souverainiste',    vote_tendance: 'opposition' },
  { id: 'RN',           label: 'RN',           sieges: 178, couleur: '#1a1aff', bloc: 'Extreme droite',   vote_tendance: 'opposition' },
  { id: 'ANIMALISTE',   label: 'Animaliste',   sieges: 4,   couleur: '#00aa44', bloc: 'Divers',           vote_tendance: 'variable'   },
  { id: 'DIVERS',       label: 'Divers',       sieges: 6,   couleur: '#888888', bloc: 'Divers',           vote_tendance: 'variable'   },
]

const PARTIS_SENAT = [
  { id: 'LR_S',    label: 'LR',       sieges: 138, couleur: '#0066cc', bloc: 'Droite',          vote_tendance: 'variable'   },
  { id: 'UC_S',    label: 'UC',       sieges: 54,  couleur: '#3399ff', bloc: 'Centre droit',    vote_tendance: 'variable'   },
  { id: 'EPR_S',   label: 'Majorite', sieges: 54,  couleur: '#ffcc00', bloc: 'Centre',          vote_tendance: 'soutien'    },
  { id: 'RN_S',    label: 'RN',       sieges: 36,  couleur: '#1a1aff', bloc: 'Extreme droite',  vote_tendance: 'opposition' },
  { id: 'PS_S',    label: 'PS',       sieges: 70,  couleur: '#ff8c00', bloc: 'Gauche',          vote_tendance: 'opposition' },
  { id: 'CRCE_S',  label: 'CRCE',     sieges: 22,  couleur: '#cc0000', bloc: 'Gauche radicale', vote_tendance: 'opposition' },
  { id: 'DIVERS_S',label: 'Divers',   sieges: 14,  couleur: '#888888', bloc: 'Divers',          vote_tendance: 'variable'   },
]

const TOTAL_AN = 577, MAJORITE_AN = 289
const TOTAL_SENAT = 388, MAJORITE_SENAT = 195

const BLOCS_LABELS = {
  BLOC_INSTITUTIONS: { label: 'Institutions', emoji: '🏛️' },
  BLOC_ENERGIE:      { label: 'Energie',      emoji: '⚡' },
  BLOC_ECONOMIE:     { label: 'Economie',     emoji: '📊' },
  BLOC_SOCIAL:       { label: 'Social',       emoji: '👥' },
  BLOC_SECURITE:     { label: 'Securite',     emoji: '🛡️' },
  BLOC_SCANDALES:    { label: 'Evenements',   emoji: '⚠️' },
}

// Leviers constitutionnels
const LEVIERS = [
  {
    id: 'art_49_3', label: 'Article 49.3', emoji: '⚖️',
    description: 'Engagement de responsabilite - passe la loi en force sans vote',
    couleur: 'amber',
    effets: { stabilite: -20, tension_sociale: +18, popularite_joueur: -12 },
    risque: 'Motion de censure automatique - Usage max : 3 par mandat',
    usage_max: 3,
  },
  {
    id: 'art_50_1', label: 'Article 50.1', emoji: '🗣️',
    description: 'Debat sans vote - tater le terrain sur une reforme sensible',
    couleur: 'blue',
    effets: { stabilite: +2, tension_sociale: -3, popularite_joueur: +1 },
    risque: 'Aucun risque majeur',
    usage_max: 99,
  },
]

// Lobbies
const LOBBIES = [
  { id: 'medef',   label: 'MEDEF',          emoji: '🏭', influence: 72, couleur: '#3b82f6', effet_vote: +8,
    bonus_lois: ['reforme_marche_travail', 'plan_relance_industriel'], malus_lois: ['smic_1600', 'retraite_60'],
    description: 'Patronat francais - pese sur la fiscalite et le droit du travail' },
  { id: 'cgt',     label: 'CGT',             emoji: '✊', influence: 58, couleur: '#ef4444', effet_vote: +6,
    bonus_lois: ['smic_1600', 'retraite_60', 'lfss_2026'], malus_lois: ['reforme_marche_travail'],
    description: 'Premier syndicat - mobilise facilement dans la rue' },
  { id: 'total',   label: 'Total Energies',  emoji: '⛽', influence: 65, couleur: '#f59e0b', effet_vote: +7,
    bonus_lois: ['relance_gpl', 'gel_cee'], malus_lois: ['sortie_nucleaire', 'nationalisation_energie'],
    description: 'Influence majeure sur la politique energetique' },
  { id: 'pharma',  label: 'Pharma France',   emoji: '💊', influence: 48, couleur: '#8b5cf6', effet_vote: +5,
    bonus_lois: ['lfss_2026'], malus_lois: [],
    description: 'Lobbying sur les prix des medicaments' },
  { id: 'fnsea',   label: 'FNSEA',           emoji: '🌾', influence: 61, couleur: '#22c55e', effet_vote: +6,
    bonus_lois: ['accord_libre_echange', 'loi_statut_loup'], malus_lois: ['loi_zan'],
    description: 'Premier syndicat agricole - bloque les routes' },
  { id: 'presse',  label: 'Groupe Presse',   emoji: '📰', influence: 55, couleur: '#06b6d4', effet_vote: +4,
    bonus_lois: [], malus_lois: ['loi_secret_defense'],
    description: 'Concentrations mediatiques - influence la pression' },
]

// Canaux medias
const CANAUX_MEDIAS = [
  { id: 'tf1',     label: 'TF1 / BFM',      emoji: '📺', audience: 38, biais: 'centre-droit',  influence_pop: +3,  influence_tension: -2 },
  { id: 'france2', label: 'France Tele',     emoji: '🎙️', audience: 28, biais: 'institutionnel', influence_pop: +1, influence_tension:  0 },
  { id: 'lci',     label: 'LCI / CNews',     emoji: '🔴', audience: 22, biais: 'droite',         influence_pop: -2,  influence_tension: +5 },
  { id: 'lefig',   label: 'Figaro / BFMTV',  emoji: '📰', audience: 18, biais: 'liberal',        influence_pop: +2,  influence_tension: +2 },
  { id: 'liber',   label: 'Libe / Le Monde', emoji: '✒️', audience: 15, biais: 'gauche',         influence_pop: +1,  influence_tension: -3 },
]

// ─── Utilitaires ────────────────────────────────────────────

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

// bonusParParti : { partiId: deltaPour } pour cibler des partis via lobbies/medias
function calculerVoteParti(partiId, loi, chambre = 'AN', bonusParParti = {}) {
  if (!loi) return { pour: 0.35, contre: 0.35, abstention: 0.30 }
  const favorables = loi.partis_favorables ?? []
  const hostiles   = loi.partis_hostiles   ?? []
  const partiBase  = partiId.replace('_S', '')
  let basePour, baseContre, baseAbst
  if (favorables.includes(partiBase) || favorables.includes(partiId)) {
    basePour = 0.90; baseContre = 0.04; baseAbst = 0.06
  } else if (hostiles.includes(partiBase) || hostiles.includes(partiId)) {
    basePour = 0.04; baseContre = 0.90; baseAbst = 0.06
  } else {
    const partis = chambre === 'AN' ? PARTIS_AN : PARTIS_SENAT
    const info   = partis.find(p => p.id === partiId)
    if (info?.vote_tendance === 'soutien')         { basePour = 0.75; baseContre = 0.15; baseAbst = 0.10 }
    else if (info?.vote_tendance === 'opposition') { basePour = 0.10; baseContre = 0.75; baseAbst = 0.15 }
    else                                           { basePour = 0.40; baseContre = 0.35; baseAbst = 0.25 }
  }
  // Appliquer bonus par parti (lobbies ciblés, médias, 50-1)
  const delta = bonusParParti[partiBase] ?? bonusParParti[partiId] ?? 0
  basePour = Math.min(0.95, Math.max(0.02, basePour + delta))
  return { pour: basePour, contre: baseContre, abstention: baseAbst }
}

// Calcule bonus votes depuis lobbies, médias, leviers actifs
function calculerBonusVote(loi, lobbiesActifs, canauxActifs, levierActif) {
  let bonusSieges = 0
  const bonusParParti = {}

  for (const lobbyId of (lobbiesActifs ?? [])) {
    const lobby = LOBBIES.find(l => l.id === lobbyId)
    if (!lobby || !loi) continue
    if (lobby.bonus_lois.includes(loi.id)) bonusSieges += lobby.effet_vote * 3
    if (lobby.malus_lois.includes(loi.id)) bonusSieges -= lobby.effet_vote * 2
  }

  for (const canalId of (canauxActifs ?? [])) {
    const canal = CANAUX_MEDIAS.find(c => c.id === canalId)
    if (!canal) continue
    const delta = canal.influence_pop * 0.025
    for (const p of [...PARTIS_AN, ...PARTIS_SENAT]) {
      if (p.vote_tendance === 'variable')
        bonusParParti[p.id] = (bonusParParti[p.id] ?? 0) + delta
    }
    bonusSieges += Math.max(0, canal.influence_pop) * 1.5
  }

  if (levierActif === 'art_50_1') {
    for (const p of [...PARTIS_AN, ...PARTIS_SENAT]) {
      if (p.vote_tendance === 'variable')
        bonusParParti[p.id] = (bonusParParti[p.id] ?? 0) + 0.12
    }
    bonusSieges += 18
  }

  return { bonusSieges: Math.round(bonusSieges), bonusParParti }
}

function getImpactColor(key, val) {
  const inversed = ['tension_sociale', 'deficit_milliards', 'inflation_pct']
  const positive = inversed.includes(key) ? val < 0 : val > 0
  if (val === 0) return 'text-slate-500'
  return positive ? 'text-emerald-400' : 'text-red-400'
}

// ─── HemicycleSVG ───────────────────────────────────────────

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
    const xMaj = cx + (R_MIN + R_STEP * RANGS + 20) * Math.cos(Math.PI * (1 - majorite / total))
    const yMaj = cy - (R_MIN + R_STEP * RANGS + 20) * Math.sin(Math.PI * (1 - majorite / total))
    svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', xMaj).attr('y2', yMaj)
      .attr('stroke', '#ffffff22').attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
    svg.selectAll('circle.siege').data(positions).enter().append('circle').attr('class', 'siege')
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
      .attr('stroke-width', 1.5).style('cursor', 'pointer')
      .on('mouseover', function() { d3.select(this).attr('r', 6.5).attr('fill-opacity', 1) })
      .on('mouseout', function(ev, d) {
        d3.select(this).attr('r', 4.5)
          .attr('fill-opacity', (siegeSelectionne && siegeSelectionne.parti !== d.parti) ? 0.18 : (etatVote && !etatVote[d.parti]) ? 0.25 : 0.90)
      })
      .on('click', (ev, d) => setSiegeSelectionne(prev => prev?.parti === d.parti ? null : d))
    svg.append('text').attr('x', cx).attr('y', cy + 14)
      .attr('text-anchor', 'middle').attr('fill', '#334155').attr('font-size', '9px')
      .text(`Majorite : ${majorite} / ${total}`)
  }, [partis, etatVote, siegeSelectionne])
  return <svg ref={svgRef} className="w-full" />
}

// ─── SequenceVote ────────────────────────────────────────────

function SequenceVote({ loi, chambre, partis, total, majorite, onTermine, bonusSieges = 0, bonusParParti = {} }) {
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
          const { pour, contre } = calculerVoteParti(parti.id, loi, chambre, bonusParParti)
          const votesPour = Math.round(parti.sieges * pour)
          const votesContre = Math.round(parti.sieges * contre)
          const votesAbstention = parti.sieges - votesPour - votesContre
          compteurRef.current = { pour: compteurRef.current.pour + votesPour, contre: compteurRef.current.contre + votesContre, abstention: compteurRef.current.abstention + votesAbstention }
          const target = { ...compteurRef.current }
          const current = { pour: compteurs.pour, contre: compteurs.contre, abstention: compteurs.abstention }
          anime({ targets: current, pour: target.pour, contre: target.contre, abstention: target.abstention, duration: 350, easing: 'easeOutExpo',
            update: () => setCompteurs({ pour: Math.round(current.pour), contre: Math.round(current.contre), abstention: Math.round(current.abstention) }) })
          setEtatVote(prev => ({ ...prev, [parti.id]: votesPour > votesContre ? 'pour' : 'contre' }))
          setGroupeActif(null)
          if (i === partis.length - 1) {
            // Appliquer les bonusSieges au total final
            const pourFinal = compteurRef.current.pour + bonusSieges
            setTimeout(() => { setEtape('resultat'); onTermine?.({ pour: pourFinal, contre: compteurRef.current.contre, abstention: compteurRef.current.abstention, adopte: pourFinal >= majorite }) }, 700)
          }
        }, 500)
      }, delai)
      delai += 800
    })
  }, [partis, loi, chambre, majorite, bonusSieges, bonusParParti])

  useEffect(() => { setTimeout(animer, 600) }, [])
  const adopte = compteurs.pour >= majorite
  const dernierGroupe = partis.find(p => p.id === groupeActif)

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{chambre === 'AN' ? 'Assemblee Nationale' : 'Senat'} - Vote en cours</p>
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
          <p className="text-xs text-amber-300 font-semibold">{dernierGroupe.label} vote... ({dernierGroupe.sieges} sieges)</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pour',  val: compteurs.pour,       color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
          { label: 'Contre', val: compteurs.contre,    color: 'text-red-400',     bg: 'bg-red-950/40 border-red-800/40'         },
          { label: 'Abst.',  val: compteurs.abstention, color: 'text-slate-400',  bg: 'bg-slate-800/60 border-slate-700/40'     },
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
          <p className={`text-xl font-black ${adopte ? 'text-emerald-400' : 'text-red-400'}`}>{adopte ? 'ADOPTEE' : 'REJETEE'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{adopte ? `+${compteurs.pour - majorite} voix d avance` : `Manque ${majorite - compteurs.pour} voix`}</p>
        </div>
      )}
    </div>
  )
}

// ─── ModalVote ───────────────────────────────────────────────

function ModalVote({ loi, open, onClose, onAdopte, onRejete, bonusSieges = 0, bonusParParti = {} }) {
  const [phase, setPhase]                 = useState('AN')
  const [resultatAN, setResultatAN]       = useState(null)
  const [resultatSenat, setResultatSenat] = useState(null)
  const [cmpResultat, setCmpResultat]     = useState(null)
  useEffect(() => { if (open) { setPhase('AN'); setResultatAN(null); setResultatSenat(null); setCmpResultat(null) } }, [open, loi])
  const handleResultatAN = res => { setResultatAN(res); if (!res.adopte) { setTimeout(() => { setPhase('DONE'); onRejete?.() }, 1400) } else { setTimeout(() => setPhase('SENAT'), 1600) } }
  const handleResultatSenat = res => { setResultatSenat(res); if (res.adopte) { setTimeout(() => { setPhase('DONE'); onAdopte?.() }, 1400) } else { setTimeout(() => setPhase('CMP'), 1600) } }
  const lancerCMP = () => { const a = Math.random() > 0.45; setCmpResultat(a); setTimeout(() => { setPhase('DONE'); a ? onAdopte?.() : onRejete?.() }, 1200) }
  const PHASES = ['AN', 'SENAT', 'CMP', 'DONE']
  const phaseIdx = PHASES.indexOf(phase)
  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose?.() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-slate-950 border border-slate-700/60 rounded-2xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              {[{ id: 'AN', label: 'AN' }, { id: 'SENAT', label: 'Senat' }, { id: 'CMP', label: 'CMP' }, { id: 'DONE', label: 'Fin' }].map(({ id, label }, i) => (
                <div key={id} className="flex items-center gap-1.5">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${phase === id ? 'bg-blue-600 text-white' : phaseIdx > i ? 'bg-emerald-900/60 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>{label}</div>
                  {i < 3 && <span className="text-slate-700 text-xs">-</span>}
                </div>
              ))}
            </div>
            <Dialog.Close asChild><button className="text-slate-600 hover:text-slate-300 text-lg">x</button></Dialog.Close>
          </div>

          {/* Indicateur bonus actifs */}
          {bonusSieges > 0 && (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg px-3 py-1.5 mb-3 flex-wrap">
              <span className="text-xs text-emerald-400 font-bold">Bonus actifs :</span>
              <span className="text-xs text-emerald-300">+{bonusSieges} votes supplementaires appliques</span>
            </div>
          )}

          {phase === 'AN' && <SequenceVote loi={loi} chambre="AN" partis={PARTIS_AN} total={TOTAL_AN} majorite={MAJORITE_AN} onTermine={handleResultatAN} bonusSieges={bonusSieges} bonusParParti={bonusParParti} />}
          {phase === 'SENAT' && (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-emerald-400 font-semibold">Adoptee a l AN ({resultatAN?.pour} pour) - Passage au Senat</p>
              </div>
              <SequenceVote loi={loi} chambre="SENAT" partis={PARTIS_SENAT} total={TOTAL_SENAT} majorite={MAJORITE_SENAT} onTermine={handleResultatSenat} bonusSieges={Math.round(bonusSieges * 0.5)} bonusParParti={bonusParParti} />
            </div>
          )}
          {phase === 'CMP' && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-5xl">🤝</p>
              <h3 className="text-xl font-black text-white text-center">Commission Mixte Paritaire</h3>
              <p className="text-sm text-slate-400 text-center max-w-sm">Desaccord entre les deux chambres. 7 deputes + 7 senateurs tentent un accord.</p>
              {cmpResultat === null ? (
                <button onClick={lancerCMP} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">Lancer la CMP</button>
              ) : (
                <div className={`text-lg font-black ${cmpResultat ? 'text-emerald-400' : 'text-red-400'}`}>{cmpResultat ? 'Accord trouve' : 'Desaccord persistant'}</div>
              )}
            </div>
          )}
          {phase === 'DONE' && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-6xl">{(resultatAN?.adopte || resultatSenat?.adopte) ? '🎉' : '💔'}</p>
              <h3 className={`text-2xl font-black text-center ${(resultatAN?.adopte || resultatSenat?.adopte) ? 'text-emerald-400' : 'text-red-400'}`}>
                {(resultatAN?.adopte || resultatSenat?.adopte) ? 'Loi promulguee !' : 'Loi rejetee'}
              </h3>
              <Dialog.Close asChild><button className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors">Fermer</button></Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── PanneauLeviers ──────────────────────────────────────────

function PanneauLeviers({ appliquerLoiAdoptee, usagesLeviers, setUsagesLeviers, levierActif, setLevierActif }) {
  const [confirm, setConfirm] = useState(null)

  function confirmerLevier() {
    if (!confirm) return
    setUsagesLeviers(prev => ({ ...prev, [confirm.id]: (prev[confirm.id] ?? 0) + 1 }))
    if (confirm.id === 'art_49_3') {
      // 49-3 : effets immédiats sur l'état (passe la loi EN FORCE — effets politiques négatifs)
      if (appliquerLoiAdoptee) appliquerLoiAdoptee(`LEVIER_49_3_${Date.now()}`, confirm.effets)
    } else if (confirm.id === 'art_50_1') {
      // 50-1 : active le bonus pour le prochain vote
      setLevierActif(prev => prev === 'art_50_1' ? null : 'art_50_1')
    }
    setConfirm(null)
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-3">Leviers Constitutionnels</h3>
      {levierActif === 'art_50_1' && (
        <div className="bg-blue-950/40 border border-blue-700/40 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-blue-300 font-semibold">Article 50.1 actif — bonus applique au prochain vote</p>
          <button onClick={() => setLevierActif(null)} className="text-xs text-blue-500 hover:text-blue-300 mt-1">Desactiver</button>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {LEVIERS.map(levier => {
          const usages = usagesLeviers[levier.id] ?? 0
          const epuise = usages >= levier.usage_max
          const isAmber = levier.couleur === 'amber'
          const estActif = levierActif === levier.id
          return (
            <div key={levier.id} className={`border rounded-xl p-3 transition-all ${
              epuise ? 'opacity-40 border-slate-700/40 bg-slate-900/40'
              : estActif ? 'border-blue-500/60 bg-blue-950/30'
              : isAmber ? 'bg-amber-950/30 border-amber-800/40'
              : 'bg-blue-950/30 border-blue-800/40'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className={`text-sm font-bold ${estActif ? 'text-blue-300' : isAmber ? 'text-amber-300' : 'text-blue-300'}`}>{levier.emoji} {levier.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{levier.description}</p>
                  {levier.id === 'art_50_1' && <p className="text-xs text-blue-400/70 mt-1">Active un bonus de +18 votes pour le prochain vote</p>}
                  {levier.id === 'art_49_3' && <p className="text-xs text-amber-400/70 mt-1">Promulgue la loi en cours directement — avec consequences politiques</p>}
                </div>
                {levier.usage_max < 99 && (
                  <span className="text-xs text-slate-500 flex-shrink-0"><span className={usages > 0 ? 'text-amber-400 font-bold' : ''}>{usages}</span>/{levier.usage_max}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {Object.entries(levier.effets).map(([k, v]) => (
                  <span key={k} className={`text-xs font-semibold ${getImpactColor(k, v)}`}>{v > 0 ? '+' : ''}{v} {k.replace(/_/g, ' ')}</span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600 italic flex-1">{levier.risque}</p>
                {!epuise && (
                  <button onClick={() => setConfirm(levier)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex-shrink-0 ${estActif ? 'bg-blue-800 text-blue-200' : isAmber ? 'bg-amber-700 hover:bg-amber-600' : 'bg-blue-700 hover:bg-blue-600'} text-white`}>
                    {estActif ? 'Actif' : 'Activer'}
                  </button>
                )}
                {epuise && <span className="text-xs text-slate-600 font-semibold">Epuise</span>}
              </div>
              {confirm?.id === levier.id && (
                <div className="mt-2.5 bg-slate-900/80 border border-slate-600 rounded-lg p-2.5">
                  <p className="text-xs text-amber-300 font-semibold mb-2">Confirmer l activation du {levier.label} ?</p>
                  <div className="flex gap-2">
                    <button onClick={confirmerLevier} className="flex-1 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-lg">Confirmer</button>
                    <button onClick={() => setConfirm(null)} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg">Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PanneauLobbies ──────────────────────────────────────────

function PanneauLobbies({ loiSelectionnee, lobbiesActifs, setLobbiesActifs }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Groupes de Pression</h3>
        <span className="text-xs text-slate-500">{lobbiesActifs.length} actif{lobbiesActifs.length !== 1 ? 's' : ''}</span>
      </div>
      {loiSelectionnee && (
        <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg px-2.5 py-1.5 mb-3">
          <p className="text-xs text-blue-400">Lobbies pour : <strong>{loiSelectionnee.emoji} {loiSelectionnee.titre}</strong></p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {LOBBIES.map(lobby => {
          const actif     = lobbiesActifs.includes(lobby.id)
          const favorable = loiSelectionnee && lobby.bonus_lois.includes(loiSelectionnee.id)
          const hostile   = loiSelectionnee && lobby.malus_lois.includes(loiSelectionnee.id)
          return (
            <div key={lobby.id}
              className={`border rounded-lg p-2.5 cursor-pointer transition-all ${
                actif ? 'border-slate-500 bg-slate-700/60'
                : favorable ? 'border-emerald-700/50 bg-emerald-950/20'
                : hostile ? 'border-red-700/50 bg-red-950/20'
                : 'border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60'}`}
              onClick={() => setLobbiesActifs(prev => prev.includes(lobby.id) ? prev.filter(l => l !== lobby.id) : [...prev, lobby.id])}>
              <div className="flex items-center gap-2">
                <span className="text-base">{lobby.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white">{lobby.label}</p>
                    {favorable && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 font-bold">Favorable</span>}
                    {hostile && <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/60 text-red-400 font-bold">Hostile</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{lobby.description}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-10 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${lobby.influence}%`, backgroundColor: lobby.couleur }} />
                    </div>
                    <span className="text-xs text-slate-400">{lobby.influence}</span>
                  </div>
                  {actif && <span className="text-xs text-emerald-400 font-bold">+{lobby.effet_vote} votes</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-600 mt-2.5 italic">Cliquez pour activer - les lobbies actifs bonifient les prochains votes</p>
    </div>
  )
}

// ─── PanneauMedias ───────────────────────────────────────────

function PanneauMedias({ etatJeu, canauxActifs, setCanauxActifs }) {
  const pressionMed   = etatJeu?.pression_mediatique ?? 15
  const dissimulation = etatJeu?.dissimulation       ?? 20
  const niveauPress   = pressionMed < 30 ? { label: 'Faible',  color: 'text-emerald-400' }
                      : pressionMed < 60 ? { label: 'Moderee', color: 'text-yellow-400'  }
                      :                    { label: 'Elevee',   color: 'text-red-400'     }
  const bonusTotal = canauxActifs.reduce((s, id) => {
    const c = CANAUX_MEDIAS.find(x => x.id === id)
    return s + (c ? Math.max(0, c.influence_pop) * 1.5 : 0)
  }, 0)
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Pouvoir Mediatique</h3>
        {bonusTotal > 0 && <span className="text-xs text-emerald-400 font-bold">+{Math.round(bonusTotal)} votes actifs</span>}
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="rounded-lg p-2.5 border border-slate-700/40 bg-slate-900/40">
          <p className="text-xs text-slate-400 mb-0.5">Pression mediatique</p>
          <p className={`text-lg font-black ${niveauPress.color}`}>{pressionMed}<span className="text-xs font-normal text-slate-500">/100</span></p>
          <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pressionMed}%`, backgroundColor: pressionMed < 30 ? '#22c55e' : pressionMed < 60 ? '#eab308' : '#ef4444' }} />
          </div>
          <p className={`text-xs font-semibold mt-1 ${niveauPress.color}`}>{niveauPress.label}</p>
        </div>
        <div className="rounded-lg p-2.5 border border-slate-700/40 bg-slate-900/40">
          <p className="text-xs text-slate-400 mb-0.5">Dissimulation</p>
          <p className={`text-lg font-black ${dissimulation > 60 ? 'text-red-400' : dissimulation > 35 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {dissimulation}<span className="text-xs font-normal text-slate-500">/100</span>
          </p>
          <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${dissimulation}%`, backgroundColor: dissimulation > 60 ? '#ef4444' : dissimulation > 35 ? '#eab308' : '#22c55e' }} />
          </div>
          <p className="text-xs text-slate-500 mt-1">Secrets accumules</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Canaux — cliquez pour activer avant un vote</p>
      <div className="flex flex-col gap-1.5">
        {CANAUX_MEDIAS.map(canal => {
          const actif = canauxActifs.includes(canal.id)
          const bonusCanal = Math.round(Math.max(0, canal.influence_pop) * 1.5)
          return (
            <div key={canal.id}
              className={`border rounded-lg px-3 py-2 cursor-pointer transition-all ${actif ? 'border-emerald-600/60 bg-emerald-950/20' : 'border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60'}`}
              onClick={() => setCanauxActifs(prev => prev.includes(canal.id) ? prev.filter(c => c !== canal.id) : [...prev, canal.id])}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{canal.emoji}</span>
                <p className="text-xs font-semibold text-slate-200 flex-1">{canal.label}</p>
                <span className="text-xs text-slate-500">{canal.audience}%</span>
                {bonusCanal > 0 && <span className={`text-xs font-bold ${actif ? 'text-emerald-400' : 'text-slate-500'}`}>+{bonusCanal} votes</span>}
                <span className={`text-xs font-semibold ${canal.influence_pop >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>pop {canal.influence_pop > 0 ? '+' : ''}{canal.influence_pop}</span>
              </div>
              {actif && <p className="text-xs text-emerald-400/70 mt-1">Biais : {canal.biais} — actif pour le prochain vote</p>}
            </div>
          )
        })}
      </div>
      {pressionMed >= 60 && (
        <div className="mt-3 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
          <p className="text-xs text-red-400 font-semibold">Pression mediatique critique</p>
          <p className="text-xs text-slate-400 mt-0.5">Un scandale peut eclater. Reduisez la dissimulation.</p>
        </div>
      )}
    </div>
  )
}

// ─── CarteLoi ────────────────────────────────────────────────

function CarteLoi({ loi, onVoter, dejaVotee, etatJeu, onSelect, selectionne }) {
  const [expanded, setExpanded] = useState(false)
  const scoreFav = (loi.partis_favorables ?? []).reduce((s, p) => s + (PARTIS_AN.find(a => a.id === p)?.sieges ?? 0), 0)
  const proba = Math.min(99, Math.max(5, Math.round((scoreFav / MAJORITE_AN) * 65)))
  const conditionsOk = (() => {
    const c = loi.conditions ?? {}
    if (c.popularite_min && (etatJeu?.popularite_joueur ?? 50) < c.popularite_min) return false
    if (c.reserve_min    && (etatJeu?.reserve_budgetaire_milliards ?? 28) < c.reserve_min) return false
    if (c.prix_baril_min && (etatJeu?.prix_baril ?? 80) < c.prix_baril_min) return false
    if (c.scandale_actif && !etatJeu?.scandale_actif) return false
    return true
  })()
  const impactsNotables = Object.entries(loi.impacts ?? {}).filter(([, v]) => v !== 0).slice(0, 4)

  const statut = loi._statut
  const statutConfig = {
    propre:     { label: '⭐ Votre programme', bg: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
    allie:      { label: '🤝 Allié',           bg: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' },
    opposition: { label: '⚔️ Opposition',      bg: 'bg-red-900/30 text-red-300 border-red-700/30' },
  }
  const statutStyle = statutConfig[statut]

  const borderClass = statut === 'propre'
    ? 'border-yellow-700/50 bg-yellow-950/10'
    : statut === 'allie'
    ? 'border-emerald-800/40 bg-emerald-950/10'
    : selectionne
    ? 'border-blue-500/60 bg-blue-950/20'
    : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600/80 hover:bg-slate-800/60'
  return (
    <div className={`rounded-xl border transition-all ${
      dejaVotee      ? 'border-emerald-800/40 bg-emerald-950/20 opacity-60'
      : !conditionsOk ? 'border-slate-700/40 bg-slate-900/40 opacity-50'
      : borderClass
    }`} onClick={() => onSelect?.(loi)}>
      <div className="p-3">
        <div className="flex items-start gap-2.5 mb-2">
          <span className="text-xl flex-shrink-0 mt-0.5">{loi.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-white leading-tight truncate">{loi.titre}</p>
              {statutStyle && (
                <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ${statutStyle.bg}`}>
                  {statutStyle.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{loi.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <div className={`text-xs px-2 py-0.5 rounded font-bold ${proba > 60 ? 'bg-emerald-900/60 text-emerald-400' : proba > 35 ? 'bg-yellow-900/60 text-yellow-400' : 'bg-red-900/60 text-red-400'}`}>{proba}%</div>
          {loi.parti_auteur && loi.parti_auteur !== (etatJeu?.parti_joueur) && (
            <span className="text-xs text-slate-500 italic">par {loi.parti_auteur}</span>
          )}
          {impactsNotables.map(([key, val]) => (
            <span key={key} className={`text-xs font-semibold ${getImpactColor(key, val)}`}>{val > 0 ? '+' : ''}{val} {key.replace(/_/g, ' ').replace(' pct', '%').replace(' milliards', 'Md')}</span>
          ))}
        </div>
        {expanded && (
          <div className="flex flex-col gap-1.5 mb-2.5 border-t border-slate-800/60 pt-2.5">
            {loi.partis_favorables?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-emerald-500 font-medium">Pour</span>
                {loi.partis_favorables.map(p => <span key={p} className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 px-1.5 py-0.5 rounded">{p}</span>)}
              </div>
            )}
            {loi.partis_hostiles?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-red-500 font-medium">Contre</span>
                {loi.partis_hostiles.map(p => <span key={p} className="text-xs bg-red-950/50 text-red-400 border border-red-800/30 px-1.5 py-0.5 rounded">{p}</span>)}
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => setExpanded(e => !e)} className="text-xs text-slate-500 hover:text-slate-300">{expanded ? 'Moins' : 'Details'}</button>
          <div className="flex-1" />
          {dejaVotee ? <span className="text-xs text-emerald-400 font-semibold">Promulguee</span>
            : !conditionsOk ? <span className="text-xs text-slate-600">Conditions non remplies</span>
            : <button onClick={() => onVoter(loi)} className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">Voter</button>
          }
        </div>
      </div>
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────

export default function Parlement({ etatJeu, voterLoi, appliquerLoiAdoptee }) {
  const [vue, setVue]                     = useState('AN')
  const [siegeSelectionne, setSiegeSel]   = useState(null)
  const [modalVote, setModalVote]         = useState(null)
  const [historiqueVotes, setHistorique]  = useState([])
  const [blocActif, setBlocActif]         = useState('ALL')
  const [sourceActif, setSourceActif]     = useState('catalogue') // 'catalogue' | 'programme'
  const [recherche, setRecherche]         = useState('')
  const [ongletDroit, setOngletDroit]     = useState('hemicycle')
  const [loiSelectionnee, setLoiSel]      = useState(null)
  const [lobbiesActifs, setLobbiesActifs] = useState([])
  const [canauxActifs, setCanauxActifs]   = useState([])
  const [levierActif, setLevierActif]     = useState(null) // 'art_50_1' ou null
  const [usagesLeviers, setUsagesLeviers] = useState({})

  const partis   = vue === 'AN' ? PARTIS_AN    : PARTIS_SENAT
  const total    = vue === 'AN' ? TOTAL_AN     : TOTAL_SENAT
  const majorite = vue === 'AN' ? MAJORITE_AN  : MAJORITE_SENAT
  const partiSel = siegeSelectionne ? partis.find(p => p.id === siegeSelectionne.parti) : null

  const totalGauche = partis.filter(p => p.bloc.includes('Gauche')).reduce((s, p) => s + p.sieges, 0)
  const totalCentre = partis.filter(p => p.bloc.includes('Centre')).reduce((s, p) => s + p.sieges, 0)
  const totalDroite = partis.filter(p => p.bloc.includes('Droite') || p.bloc.includes('Extreme')).reduce((s, p) => s + p.sieges, 0)

  const loisAdoptees = etatJeu?.lois_votees ?? []
  const partiJoueur  = etatJeu?.parti_joueur ?? null

  const toutesLois   = useMemo(() => { try { return getToutesLois() } catch { return [] } }, [])
  const loisParBloc  = useMemo(() => { try { return CATALOGUE_LOIS  } catch { return {} } }, [])

  // Lois du programme du parti joueur, enrichies avec statut
  const loisProgramme = useMemo(() => {
    if (!partiJoueur) return []
    const propres = (LOIS_PAR_PARTI[partiJoueur] ?? []).map(l => ({ ...l, _statut: 'propre' }))
    return propres
  }, [partiJoueur])

  // Toutes les lois de tous les partis pour le catalogue étendu
  const toutesLoisPartis = useMemo(() => getToutesLoisPartis(), [])

  const loisFiltrees = useMemo(() => {
    let lois

    if (sourceActif === 'programme') {
      lois = loisProgramme
    } else {
      // Catalogue général + lois partis fusionnés, sans doublons d'id
      const idsExistants = new Set(toutesLois.map(l => l.id))
      const loisPartisSupplémentaires = toutesLoisPartis.filter(l => !idsExistants.has(l.id))
      lois = [...toutesLois, ...loisPartisSupplémentaires]

      if (blocActif !== 'ALL') lois = loisParBloc[blocActif] ?? []
    }

    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      lois = lois.filter(l => l.titre?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
    }
    lois = lois.filter(l => !['art_49_3', 'art_50_1'].includes(l.id))
    // Enrichir avec statut si parti joueur connu
    if (partiJoueur) {
      lois = lois.map(l => ({
        ...l,
        _statut: l._statut ?? getStatutLoi(l, partiJoueur),
      }))
      // Trier : propres en premier, puis alliés, puis reste
      const ordre = { propre: 0, allie: 1, opposition: 2, neutre: 3 }
      lois = [...lois].sort((a, b) => (ordre[a._statut] ?? 3) - (ordre[b._statut] ?? 3))
    }
    return lois
  }, [toutesLois, loisParBloc, toutesLoisPartis, loisProgramme, blocActif, sourceActif, recherche, partiJoueur])

  function handleVoter(loi) { setModalVote(loi) }
  function handleAdopte() {
    if (modalVote) {
      if (appliquerLoiAdoptee) appliquerLoiAdoptee(modalVote.id)
      else voterLoi?.(modalVote.id, 577)
      setHistorique(h => [{ loi: modalVote, resultat: 'adoptee', date: etatJeu?.date ?? 'Mars 2026' }, ...h])
    }
    setLevierActif(null) // réinitialiser le levier après le vote
    setModalVote(null)
  }
  function handleRejete() {
    if (modalVote) setHistorique(h => [{ loi: modalVote, resultat: 'rejetee', date: etatJeu?.date ?? 'Mars 2026' }, ...h])
    setLevierActif(null)
    setModalVote(null)
  }

  // Calcul des bonus pour le vote en cours
  const { bonusSieges: bonusSiegesActif, bonusParParti: bonusParPartiActif } = useMemo(
    () => calculerBonusVote(modalVote, lobbiesActifs, canauxActifs, levierActif),
    [modalVote, lobbiesActifs, canauxActifs, levierActif]
  )

  const ONGLETS_DROITE = [
    { id: 'hemicycle', label: 'Hemicycle' },
    { id: 'leviers',   label: 'Leviers' },
    { id: 'lobbies',   label: 'Lobbies' },
    { id: 'medias',    label: 'Medias' },
  ]

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <ModalVote loi={modalVote} open={!!modalVote} onClose={() => setModalVote(null)} onAdopte={handleAdopte} onRejete={handleRejete} bonusSieges={bonusSiegesActif} bonusParParti={bonusParPartiActif} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">Parlement - Lois & Hemicycle</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-emerald-400 font-bold">{loisAdoptees.length}</span> loi{loisAdoptees.length !== 1 ? 's' : ''} promulguee{loisAdoptees.length !== 1 ? 's' : ''}
          {lobbiesActifs.length > 0 && <span className="text-blue-400 font-bold">· {lobbiesActifs.length} lobby</span>}
          {canauxActifs.length > 0 && <span className="text-cyan-400 font-bold">· {canauxActifs.length} media</span>}
          {levierActif && <span className="text-blue-300 font-bold">· 50.1 actif</span>}
          {bonusSiegesActif > 0 && <span className="text-emerald-300 font-bold">· +{bonusSiegesActif} votes bonus</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* COLONNE GAUCHE */}
        <div className="flex flex-col gap-3">
        {/* Switch source : Catalogue général / Mon programme */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 gap-1 mb-1">
            <button onClick={() => { setSourceActif('catalogue'); setBlocActif('ALL') }}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sourceActif === 'catalogue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              📚 Catalogue général
            </button>
            <button onClick={() => setSourceActif('programme')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sourceActif === 'programme' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              ⭐ Mon programme {partiJoueur ? `(${partiJoueur})` : ''}
            </button>
          </div>

          {/* Filtres blocs — masqués en mode programme */}
          {sourceActif === 'catalogue' && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={() => setBlocActif('ALL')} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${blocActif === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              Toutes ({toutesLois.filter(l => !['art_49_3','art_50_1'].includes(l.id)).length + toutesLoisPartis.length})
            </button>
            {Object.entries(BLOCS_LABELS).map(([key, { label, emoji }]) => (
              <button key={key} onClick={() => setBlocActif(key)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${blocActif === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {emoji} {label} ({(loisParBloc[key] ?? []).length})
              </button>
            ))}
          </div>
          )}
          <input type="text" placeholder="Rechercher une loi..." value={recherche} onChange={e => setRecherche(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/60 text-white text-xs rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:border-blue-500" />
          <div className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1">
            {loisFiltrees.length === 0
              ? <div className="text-center py-8 text-slate-500 text-sm">Aucune loi trouvee</div>
              : loisFiltrees.map(loi => (
                <CarteLoi key={loi.id} loi={loi} onVoter={handleVoter}
                  dejaVotee={loisAdoptees.includes(loi.id)} etatJeu={etatJeu}
                  selectionne={loiSelectionnee?.id === loi.id}
                  onSelect={l => setLoiSel(prev => prev?.id === l.id ? null : l)} />
              ))
            }
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="flex flex-col gap-3">
          <div className="flex bg-slate-800/80 rounded-xl p-1 gap-0.5">
            {ONGLETS_DROITE.map(o => (
              <button key={o.id} onClick={() => setOngletDroit(o.id)}
                className={`flex-1 px-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${ongletDroit === o.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                {o.label}
              </button>
            ))}
          </div>

          {ongletDroit === 'hemicycle' && (
            <>
              <div className="flex bg-slate-800/60 rounded-xl p-1 gap-1">
                {[{ id: 'AN', label: 'Assemblee', total: TOTAL_AN, majorite: MAJORITE_AN }, { id: 'SENAT', label: 'Senat', total: TOTAL_SENAT, majorite: MAJORITE_SENAT }].map(tab => (
                  <button key={tab.id} onClick={() => { setVue(tab.id); setSiegeSel(null) }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${vue === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                    {tab.label} <span className="ml-1 opacity-50">{tab.total}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 text-xs px-1">
                <span className="text-red-400">Gauche <strong>{totalGauche}</strong></span>
                <span className="text-yellow-400">Centre <strong>{totalCentre}</strong></span>
                <span className="text-blue-400">Droite <strong>{totalDroite}</strong></span>
                <span className="text-slate-500 ml-auto">Maj. {majorite}</span>
              </div>
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-2">
                <HemicycleSVG partis={partis} total={total} majorite={majorite} etatVote={null}
                  siegeSelectionne={siegeSelectionne} setSiegeSelectionne={setSiegeSel} H={300} />
              </div>
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
                </div>
              ) : <p className="text-xs text-slate-600 text-center italic">Cliquez sur un siege pour voir le groupe</p>}
              <div className="grid grid-cols-2 gap-1.5">
                {partis.map(p => (
                  <button key={p.id} onClick={() => setSiegeSel(prev => prev?.parti === p.id ? null : { parti: p.id })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${siegeSelectionne?.parti === p.id ? 'bg-slate-600 ring-1 ring-white/20' : 'bg-slate-800/60 hover:bg-slate-700'}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.couleur }} />
                    <span className="text-slate-300 truncate">{p.label}</span>
                    <span className="text-slate-500 ml-auto font-bold">{p.sieges}</span>
                  </button>
                ))}
              </div>
              {historiqueVotes.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
                  <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Historique</h3>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                    {historiqueVotes.map((v, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 ${v.resultat === 'adoptee' ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-red-950/30 border border-red-800/30'}`}>
                        <span>{v.resultat === 'adoptee' ? 'OK' : 'NON'}</span>
                        <span className="text-slate-300 flex-1 truncate">{v.loi?.emoji} {v.loi?.titre}</span>
                        <span className="text-slate-600 flex-shrink-0">{v.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {ongletDroit === 'leviers' && (
            <PanneauLeviers appliquerLoiAdoptee={appliquerLoiAdoptee} usagesLeviers={usagesLeviers} setUsagesLeviers={setUsagesLeviers} levierActif={levierActif} setLevierActif={setLevierActif} />
          )}

          {ongletDroit === 'lobbies' && (
            <PanneauLobbies loiSelectionnee={loiSelectionnee} lobbiesActifs={lobbiesActifs} setLobbiesActifs={setLobbiesActifs} />
          )}

          {ongletDroit === 'medias' && (
            <PanneauMedias etatJeu={etatJeu} canauxActifs={canauxActifs} setCanauxActifs={setCanauxActifs} />
          )}
        </div>
      </div>
    </div>
  )
}
