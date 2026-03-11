import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import * as Dialog from '@radix-ui/react-dialog'
import anime from 'animejs'
import { getLoisDisponibles } from '../engines/moteur-legislatif.js'
import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

// ─────────────────────────────────────────────────────────────
// COMPOSITION ASSEMBLÉE NATIONALE
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// COMPOSITION SÉNAT (2026 — dominante LR/droite)
// ─────────────────────────────────────────────────────────────

const PARTIS_SENAT = [
  { id: 'LR_S',    label: 'LR',          sieges: 145, couleur: '#0066cc', bloc: 'Droite',           vote_tendance: 'variable'   },
  { id: 'UC_S',    label: 'UC',          sieges: 56,  couleur: '#3399ff', bloc: 'Centre droit',     vote_tendance: 'variable'   },
  { id: 'EPR_S',   label: 'Majorité',    sieges: 72,  couleur: '#ffcc00', bloc: 'Centre',           vote_tendance: 'soutien'    },
  { id: 'RN_S',    label: 'RN',          sieges: 22,  couleur: '#1a1aff', bloc: 'Extrême droite',   vote_tendance: 'opposition' },
  { id: 'PS_S',    label: 'PS',          sieges: 64,  couleur: '#ff8c00', bloc: 'Gauche',           vote_tendance: 'opposition' },
  { id: 'CRCE_S',  label: 'CRCE',        sieges: 22,  couleur: '#cc0000', bloc: 'Gauche radicale',  vote_tendance: 'opposition' },
  { id: 'DIVERS_S',label: 'Divers',      sieges: 7,   couleur: '#888888', bloc: 'Divers',           vote_tendance: 'variable'   },
]

const TOTAL_AN    = 577
const MAJORITE_AN = 289
const TOTAL_SENAT = 388
const MAJORITE_SENAT = 195

// Lois nécessitant le Sénat obligatoirement
const LOIS_BICAMERALES = [
  'referendum_constituant', 'dissolution_assemblee', 'frexit_referendum',
  'sortie_otan', 'loi_secret_defense', 'mise_en_accusation_68',
]

// ─────────────────────────────────────────────────────────────
// GÉNÉRATION POSITIONS HÉMICYCLE
// ─────────────────────────────────────────────────────────────

function genererPositions(partis, W, H, cx, cy, R_MIN, R_STEP, RANGS) {
  const sieges = []
  for (const parti of partis) {
    for (let i = 0; i < parti.sieges; i++) {
      sieges.push({ parti: parti.id, couleur: parti.couleur })
    }
  }
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
      positions.push({
        x: cx + rayon * Math.cos(angle),
        y: cy - rayon * Math.sin(angle),
        ...sieges[idx], idx,
      })
      idx++
    }
  }
  return positions
}

// ─────────────────────────────────────────────────────────────
// CALCUL DU VOTE D'UN PARTI
// ─────────────────────────────────────────────────────────────

function calculerVoteParti(partiId, loi, chambre = 'AN') {
  if (!loi) return { pour: 0.35, contre: 0.35, abstention: 0.30 }
  const favorables = loi.partis_favorables ?? []
  const hostiles   = loi.partis_hostiles   ?? []

  // Mapping sénat → AN pour les vérifications
  const partiBase = partiId.replace('_S', '')

  if (favorables.includes(partiBase) || favorables.includes(partiId)) {
    return { pour: 0.90, contre: 0.04, abstention: 0.06 }
  }
  if (hostiles.includes(partiBase) || hostiles.includes(partiId)) {
    return { pour: 0.04, contre: 0.90, abstention: 0.06 }
  }
  // Parti variable selon tendance
  const partis = chambre === 'AN' ? PARTIS_AN : PARTIS_SENAT
  const partiInfo = partis.find(p => p.id === partiId)
  if (partiInfo?.vote_tendance === 'soutien')    return { pour: 0.75, contre: 0.15, abstention: 0.10 }
  if (partiInfo?.vote_tendance === 'opposition') return { pour: 0.10, contre: 0.75, abstention: 0.15 }
  return { pour: 0.40, contre: 0.35, abstention: 0.25 }
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT HÉMICYCLE SVG
// ─────────────────────────────────────────────────────────────

function HemicycleSVG({
  partis, total, majorite, titre,
  etatVote,       // { [partiId]: 'pour'|'contre'|'abstention'|null }
  siegeSelectionne, setSiegeSelectionne,
  W = 700, H = 370,
  R_MIN = 100, R_STEP = 26, RANGS = 8,
}) {
  const svgRef = useRef(null)
  const cx = W / 2
  const cy = H - 20

  useEffect(() => {
    if (!svgRef.current) return
    const positions = genererPositions(partis, W, H, cx, cy, R_MIN, R_STEP, RANGS)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%')

    // Fond
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#0f172a')

    // Arc de fond
    svg.append('path')
      .attr('d', `M ${cx - R_MIN - R_STEP * RANGS - 15} ${cy} A 1 1 0 0 1 ${cx + R_MIN + R_STEP * RANGS + 15} ${cy}`)
      .attr('fill', 'none').attr('stroke', '#1e293b').attr('stroke-width', 2)

    // Sièges
    const circles = svg.selectAll('circle.siege')
      .data(positions)
      .enter()
      .append('circle')
      .attr('class', 'siege')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .attr('fill', d => {
        const etat = etatVote?.[d.parti]
        if (etat === 'pour')        return '#22c55e'
        if (etat === 'contre')      return '#ef4444'
        if (etat === 'abstention')  return '#94a3b8'
        if (etat === 'en_cours')    return '#fbbf24'
        return d.couleur
      })
      .attr('fill-opacity', d => {
        if (etatVote && !etatVote[d.parti]) return 0.25
        return 0.88
      })
      .attr('stroke', d => siegeSelectionne?.parti === d.parti ? '#ffffff' : 'transparent')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function() { d3.select(this).attr('r', 7).attr('fill-opacity', 1) })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('r', 5)
          .attr('fill-opacity', etatVote && !etatVote[d.parti] ? 0.25 : 0.88)
      })
      .on('click', (event, d) => {
        setSiegeSelectionne(prev => prev?.parti === d.parti ? null : d)
      })

    // Texte majorité
    svg.append('text')
      .attr('x', cx).attr('y', cy + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#475569').attr('font-size', '10px')
      .text(`Majorité : ${majorite} / ${total}`)

  }, [partis, etatVote, siegeSelectionne])

  return <svg ref={svgRef} className="w-full" />
}

// ─────────────────────────────────────────────────────────────
// SÉQUENCE DE VOTE ANIMÉE
// ─────────────────────────────────────────────────────────────

function SequenceVote({ loi, chambre, partis, total, majorite, onTermine, onFermer }) {
  const [etatVote, setEtatVote]     = useState({})
  const [groupeActif, setGroupeActif] = useState(null)
  const [compteurs, setCompteurs]   = useState({ pour: 0, contre: 0, abstention: 0 })
  const [etape, setEtape]           = useState('intro') // intro | vote | resultat
  const [siegeSel, setSiegeSel]     = useState(null)
  const compteurRef                 = useRef({ pour: 0, contre: 0, abstention: 0 })
  const animRef                     = useRef(null)

  const animer = useCallback(() => {
    setEtape('vote')
    let delai = 0

    partis.forEach((parti, i) => {
      setTimeout(() => {
        setGroupeActif(parti.id)
        // Marquer en cours
        setEtatVote(prev => ({ ...prev, [parti.id]: 'en_cours' }))

        setTimeout(() => {
          // Calculer le vote de ce groupe
          const { pour, contre, abstention } = calculerVoteParti(parti.id, loi, chambre)
          const roll = Math.random()
          let resultat
          if (roll < pour) resultat = 'pour'
          else if (roll < pour + contre) resultat = 'contre'
          else resultat = 'abstention'

          // Votes réels par siège (probabilistique)
          const votesPour       = Math.round(parti.sieges * pour)
          const votesContre     = Math.round(parti.sieges * contre)
          const votesAbstention = parti.sieges - votesPour - votesContre

          compteurRef.current = {
            pour:        compteurRef.current.pour + votesPour,
            contre:      compteurRef.current.contre + votesContre,
            abstention:  compteurRef.current.abstention + votesAbstention,
          }

          // Animer le compteur — objet local détaché, pas de stale closure sur compteurs
          const animObj = {
            pour:        compteurRef.current.pour - votesPour,
            contre:      compteurRef.current.contre - votesContre,
            abstention:  compteurRef.current.abstention - votesAbstention,
          }
          anime({
            targets: animObj,
            pour: compteurRef.current.pour,
            contre: compteurRef.current.contre,
            abstention: compteurRef.current.abstention,
            duration: 400,
            easing: 'easeOutExpo',
            update: () => setCompteurs({ pour: Math.round(animObj.pour), contre: Math.round(animObj.contre), abstention: Math.round(animObj.abstention) }),
          })

          setEtatVote(prev => ({ ...prev, [parti.id]: resultat }))
          setGroupeActif(null)

          // Si dernier parti → résultat
          if (i === partis.length - 1) {
            setTimeout(() => {
              setEtape('resultat')
              onTermine?.({
                pour: compteurRef.current.pour,
                contre: compteurRef.current.contre,
                abstention: compteurRef.current.abstention,
                adopte: compteurRef.current.pour >= majorite,
              })
            }, 800)
          }
        }, 600)
      }, delai)
      delai += 900
    })
  }, [partis, loi, chambre, majorite])

  useEffect(() => { setTimeout(animer, 800) }, [])

  const adopte   = compteurs.pour >= majorite
  const pct      = Math.round((compteurs.pour / total) * 100)
  const dernierGroupe = partis.find(p => p.id === groupeActif)

  return (
    <div className="flex flex-col gap-4">
      {/* Titre loi */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{chambre === 'AN' ? 'Assemblée Nationale' : 'Sénat'} — Vote en cours</p>
        <p className="font-bold text-white">{loi?.emoji} {loi?.titre}</p>
      </div>

      {/* Hémicycle */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
        <HemicycleSVG
          partis={partis}
          total={total}
          majorite={majorite}
          titre={chambre}
          etatVote={etatVote}
          siegeSelectionne={siegeSel}
          setSiegeSelectionne={setSiegeSel}
          H={chambre === 'SENAT' ? 300 : 340}
          RANGS={chambre === 'SENAT' ? 7 : 8}
        />
      </div>

      {/* Groupe qui vote actuellement */}
      {groupeActif && dernierGroupe && (
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-700/40 rounded-lg px-4 py-2.5">
          <div className="w-3 h-3 rounded-full animate-pulse flex-shrink-0"
            style={{ backgroundColor: dernierGroupe.couleur }} />
          <p className="text-sm text-amber-300 font-semibold">
            {dernierGroupe.label} vote... ({dernierGroupe.sieges} sièges)
          </p>
        </div>
      )}

      {/* Compteurs temps réel */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '✅ Pour',        val: compteurs.pour,        color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-700/40' },
          { label: '❌ Contre',      val: compteurs.contre,      color: 'text-red-400',     bg: 'bg-red-950/40 border-red-700/40' },
          { label: '⬜ Abstention',  val: compteurs.abstention,  color: 'text-slate-400',   bg: 'bg-slate-800/60 border-slate-700/40' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`border rounded-xl p-3 text-center ${bg}`}>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-600">{Math.round(val / total * 100)}%</p>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, (compteurs.pour / total) * 100)}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/30"
          style={{ left: `${(majorite / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span className="text-white">Seuil : {majorite}</span>
        <span>{total}</span>
      </div>

      {/* Résultat final */}
      {etape === 'resultat' && (
        <div className={`rounded-xl border p-4 text-center ${adopte ? 'bg-emerald-950/60 border-emerald-600/50' : 'bg-red-950/60 border-red-600/50'}`}>
          <p className={`text-2xl font-black mb-1 ${adopte ? 'text-emerald-400' : 'text-red-400'}`}>
            {adopte ? '✅ ADOPTÉE' : '❌ REJETÉE'}
          </p>
          <p className="text-sm text-slate-300">
            {compteurs.pour} pour · {compteurs.contre} contre · {compteurs.abstention} abstentions
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {adopte ? `Majorité atteinte (+${compteurs.pour - majorite} voix)` : `Manque ${majorite - compteurs.pour} voix`}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MODAL VOTE COMPLET (AN + Sénat + CMP)
// ─────────────────────────────────────────────────────────────

function ModalVote({ loi, open, onClose, onAdopte, onRejete }) {
  const [phase, setPhase]           = useState('AN')      // AN | SENAT | CMP | DONE
  const [resultatAN, setResultatAN] = useState(null)
  const [resultatSenat, setResultatSenat] = useState(null)

  function handleResultatAN(res) {
    setResultatAN(res)
    const necessite_senat = LOIS_BICAMERALES.includes(loi?.id) || res.adopte
    if (!res.adopte) {
      // Rejeté à l'AN → terminé
      setTimeout(() => { setPhase('DONE'); onRejete?.() }, 1500)
    } else {
      // Adopté AN → Sénat
      setTimeout(() => setPhase('SENAT'), 1800)
    }
  }

  function handleResultatSenat(res) {
    setResultatSenat(res)
    if (res.adopte) {
      setTimeout(() => { setPhase('DONE'); onAdopte?.() }, 1500)
    } else {
      // Désaccord → CMP
      setTimeout(() => setPhase('CMP'), 1800)
    }
  }

  function handleCMP() {
    // La CMP est un vote simplifié 50/50
    const adopte = Math.random() > 0.45
    setTimeout(() => {
      setPhase('DONE')
      adopte ? onAdopte?.() : onRejete?.()
    }, 1000)
  }

  useEffect(() => {
    if (open) { setPhase('AN'); setResultatAN(null); setResultatSenat(null) }
  }, [open, loi])

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose?.() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl p-5">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {['AN', 'SENAT', 'CMP', 'DONE'].map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    phase === p ? 'bg-blue-600 text-white' :
                    ['AN','SENAT','CMP','DONE'].indexOf(phase) > i ? 'bg-emerald-900/60 text-emerald-400' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {p === 'AN' ? '🏛️ AN' : p === 'SENAT' ? '🏟️ Sénat' : p === 'CMP' ? '🤝 CMP' : '✅ Fin'}
                  </div>
                  {i < 3 && <span className="text-slate-600 text-xs">→</span>}
                </div>
              ))}
            </div>
            <Dialog.Close asChild>
              <button className="text-slate-500 hover:text-white text-lg transition-colors">✕</button>
            </Dialog.Close>
          </div>

          {/* Phase AN */}
          {phase === 'AN' && (
            <SequenceVote
              loi={loi}
              chambre="AN"
              partis={PARTIS_AN}
              total={TOTAL_AN}
              majorite={MAJORITE_AN}
              onTermine={handleResultatAN}
            />
          )}

          {/* Phase Sénat */}
          {phase === 'SENAT' && (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-emerald-400 font-semibold">
                  ✅ Adoptée à l'Assemblée ({resultatAN?.pour} voix pour) → Passage au Sénat
                </p>
              </div>
              <SequenceVote
                loi={loi}
                chambre="SENAT"
                partis={PARTIS_SENAT}
                total={TOTAL_SENAT}
                majorite={MAJORITE_SENAT}
                onTermine={handleResultatSenat}
              />
            </div>
          )}

          {/* Phase CMP */}
          {phase === 'CMP' && (
            <div className="flex flex-col gap-4 items-center py-6">
              <p className="text-4xl">🤝</p>
              <h3 className="text-xl font-black text-white text-center">Commission Mixte Paritaire</h3>
              <p className="text-sm text-slate-400 text-center max-w-md">
                L'Assemblée et le Sénat sont en désaccord. Une commission de 7 députés + 7 sénateurs tente de trouver un texte commun.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Sénat</p>
                  <p className="font-bold text-red-400">❌ Rejeté</p>
                  <p className="text-xs text-slate-500">{resultatSenat?.contre} voix contre</p>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Assemblée</p>
                  <p className="font-bold text-emerald-400">✅ Adopté</p>
                  <p className="text-xs text-slate-500">{resultatAN?.pour} voix pour</p>
                </div>
              </div>
              <button
                onClick={handleCMP}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                🗳️ Lancer la CMP
              </button>
            </div>
          )}

          {/* Phase DONE */}
          {phase === 'DONE' && (
            <div className="flex flex-col gap-4 items-center py-6">
              <p className="text-5xl">{resultatAN?.adopte ? '🎉' : '💔'}</p>
              <h3 className={`text-2xl font-black text-center ${resultatAN?.adopte ? 'text-emerald-400' : 'text-red-400'}`}>
                {resultatAN?.adopte ? 'Loi promulguée !' : 'Loi rejetée'}
              </h3>
              <p className="text-sm text-slate-400 text-center">{loi?.emoji} {loi?.titre}</p>
              {loi?.evenements_secondaires?.length > 0 && resultatAN?.adopte && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {loi.evenements_secondaires.map((e, i) => (
                    <span key={i} className="text-xs bg-amber-950/40 text-amber-400 border border-amber-800/30 px-2 py-0.5 rounded">⚡ {e}</span>
                  ))}
                </div>
              )}
              <Dialog.Close asChild>
                <button className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors">
                  Fermer
                </button>
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function Hemicycle({ etatJeu, voterLoi, bonusVote = 0 }) {
  const [vue, setVue]                   = useState('AN')        // AN | SENAT
  const [siegeSelectionne, setSiegeSel] = useState(null)
  const [modalVote, setModalVote]       = useState(null)        // loi en cours de vote
  const [historiqueVotes, setHistorique] = useState([])

  const partis        = vue === 'AN'    ? PARTIS_AN    : PARTIS_SENAT
  const total         = vue === 'AN'    ? TOTAL_AN     : TOTAL_SENAT
  const majorite      = vue === 'AN'    ? MAJORITE_AN  : MAJORITE_SENAT

  const totalGauche = partis.filter(p => p.bloc.includes('Gauche')).reduce((s, p) => s + p.sieges, 0)
  const totalCentre = partis.filter(p => p.bloc.includes('Centre')).reduce((s, p) => s + p.sieges, 0)
  const totalDroite = partis.filter(p => p.bloc.includes('Droite')).reduce((s, p) => s + p.sieges, 0)

  const partiSel = siegeSelectionne ? partis.find(p => p.id === siegeSelectionne.parti) : null

  // Bug fix : afficher les lois DISPONIBLES (pas encore votées), pas les adoptées
  const loisDisponibles = useMemo(() => {
    if (!etatJeu) return []
    try { return getLoisDisponibles(etatJeu) }
    catch { return CATALOGUE_LOIS?.filter(l => !(etatJeu?.lois_votees ?? []).includes(l.id)) ?? [] }
  }, [etatJeu])

  function handleAdopte() {
    if (modalVote) {
      voterLoi?.(modalVote.id, bonusVote)
      setHistorique(h => [{
        loi: modalVote,
        resultat: 'adoptee',
        date: etatJeu?.date ?? 'Mars 2026',
      }, ...h])
    }
  }

  function handleRejete() {
    setHistorique(h => [{
      loi: modalVote,
      resultat: 'rejetee',
      date: etatJeu?.date ?? 'Mars 2026',
    }, ...h])
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">

      {/* Modal vote */}
      <ModalVote
        loi={modalVote}
        open={!!modalVote}
        onClose={() => setModalVote(null)}
        onAdopte={handleAdopte}
        onRejete={handleRejete}
      />

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
          {[
            { id: 'AN',    label: '🏛️ Assemblée Nationale', total: TOTAL_AN,    majorite: MAJORITE_AN    },
            { id: 'SENAT', label: '🏟️ Sénat',               total: TOTAL_SENAT, majorite: MAJORITE_SENAT },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setVue(tab.id); setSiegeSel(null) }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                vue === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              {tab.label}
              <span className="ml-2 text-xs opacity-60">{tab.total} sièges</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-red-400">Gauche {totalGauche}</span>
          <span className="text-yellow-400">Centre {totalCentre}</span>
          <span className="text-blue-400">Droite {totalDroite}</span>
          <span className="text-slate-500">Majorité {majorite}</span>
        </div>
      </div>

      {/* Hémicycle principal */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <HemicycleSVG
          partis={partis}
          total={total}
          majorite={majorite}
          titre={vue}
          etatVote={null}
          siegeSelectionne={siegeSelectionne}
          setSiegeSelectionne={setSiegeSel}
        />
      </div>

      {/* Info parti sélectionné */}
      {partiSel && (
        <div className="bg-slate-800 border rounded-xl p-4 flex items-center gap-4"
          style={{ borderColor: partiSel.couleur + '80' }}>
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: partiSel.couleur }} />
          <div className="flex-1">
            <p className="font-semibold text-white">{partiSel.label}</p>
            <p className="text-sm text-slate-400">{partiSel.bloc}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{partiSel.sieges}</p>
            <p className="text-xs text-slate-400">{Math.round(partiSel.sieges / total * 100)}% des sièges</p>
          </div>
          <div className={`text-xs px-2 py-1 rounded-lg ${
            partiSel.vote_tendance === 'soutien' ? 'bg-emerald-900/60 text-emerald-300' :
            partiSel.vote_tendance === 'opposition' ? 'bg-red-900/60 text-red-300' :
            'bg-slate-700 text-slate-300'
          }`}>
            {partiSel.vote_tendance === 'soutien' ? '🤝 Soutien' :
             partiSel.vote_tendance === 'opposition' ? '⚔️ Opposition' : '🎲 Variable'}
          </div>
        </div>
      )}

      {/* Légende partis */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {partis.map(p => (
          <button key={p.id}
            onClick={() => setSiegeSel(prev => prev?.parti === p.id ? null : { parti: p.id })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
              siegeSelectionne?.parti === p.id ? 'bg-slate-600 ring-1 ring-white/20' : 'bg-slate-800 hover:bg-slate-700'
            }`}>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.couleur }} />
            <span className="text-slate-300 truncate">{p.label}</span>
            <span className="text-slate-500 ml-auto font-bold">{p.sieges}</span>
          </button>
        ))}
      </div>

      {/* Section vote — lois disponibles (cliquables) */}
      {etatJeu && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-300">🗳️ Soumettre une loi au vote</h3>
            <span className="text-xs text-slate-500">{loisDisponibles.length} loi{loisDisponibles.length !== 1 ? 's' : ''} disponible{loisDisponibles.length !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Cliquez sur une loi pour déclencher la séquence AN → Sénat → CMP si nécessaire.
            {LOIS_BICAMERALES.length > 0 && <span className="text-blue-400"> Les lois constitutionnelles passent obligatoirement par le Sénat.</span>}
          </p>
          {loisDisponibles.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {loisDisponibles.map(loi => (
                <button
                  key={loi.id}
                  onClick={() => setModalVote(loi)}
                  className="flex items-center gap-3 text-left text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-600/50 rounded-lg px-3 py-2.5 transition-all group"
                >
                  <span className="text-base flex-shrink-0">{loi.emoji ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-semibold truncate group-hover:text-white">{loi.titre}</p>
                    {loi.description && <p className="text-slate-500 truncate mt-0.5">{loi.description}</p>}
                  </div>
                  {LOIS_BICAMERALES.includes(loi.id) && (
                    <span className="text-[9px] text-blue-400 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded flex-shrink-0">BICAMÉRAL</span>
                  )}
                  <span className="text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0">▶</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-slate-500 italic">Toutes les lois disponibles ont déjà été votées.</p>
              <p className="text-xs text-slate-600 mt-1">Ajoutez des lois dans le catalogue ou passez au tour suivant.</p>
            </div>
          )}
        </div>
      )}

      {/* Historique des votes */}
      {historiqueVotes.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-300 mb-3">📋 Historique des votes</h3>
          <div className="flex flex-col gap-2">
            {historiqueVotes.map((v, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs rounded-lg px-3 py-2 ${
                v.resultat === 'adoptee' ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-red-950/30 border border-red-800/30'
              }`}>
                <span>{v.resultat === 'adoptee' ? '✅' : '❌'}</span>
                <span className="text-slate-300 flex-1">{v.loi?.emoji} {v.loi?.titre}</span>
                <span className="text-slate-500">{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
