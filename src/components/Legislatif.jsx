import { useState, useMemo, useRef, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import anime from 'animejs'
import { getLoisDisponibles, calculerProbaVoteLoi } from '../engines/moteur-legislatif.js'
import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'
import { AXES, getCouleurCurseur, getLabelCurseur } from '../engines/moteur-curseurs.js'

// ─────────────────────────────────────────────────────────────
// CONSTANTES PARTIS
// ─────────────────────────────────────────────────────────────

const PARTIS_INFO = {
  LFI:          { label: 'LFI',         couleur: '#cc0000', emoji: '🔴', bloc: 'Gauche radicale' },
  TRAVAILLEURS: { label: 'PT',          couleur: '#8b0000', emoji: '🔴', bloc: 'Gauche radicale' },
  PS_ECO:       { label: 'PS-Écolos',  couleur: '#ff8c00', emoji: '🟠', bloc: 'Gauche' },
  EPR:          { label: 'Renaissance', couleur: '#ffcc00', emoji: '🟡', bloc: 'Centre' },
  LR:           { label: 'LR',          couleur: '#0066cc', emoji: '🔵', bloc: 'Droite' },
  PATRIOTES:    { label: 'Patriotes',   couleur: '#003399', emoji: '🔵', bloc: 'Droite nationale' },
  RN:           { label: 'RN',          couleur: '#1a1aff', emoji: '🔵', bloc: 'Extrême droite' },
  UPR:          { label: 'UPR',         couleur: '#1a3a6b', emoji: '🔵', bloc: 'Souverainiste' },
}

const PARTIS_FILTRE = [
  { id: 'TOUS',      label: 'Tous',      couleur: '#94a3b8' },
  { id: 'EPR',       label: 'EPR',       couleur: '#ffcc00' },
  { id: 'PS_ECO',    label: 'PS-Écolos', couleur: '#ff8c00' },
  { id: 'LFI',       label: 'LFI',       couleur: '#cc0000' },
  { id: 'LR',        label: 'LR',        couleur: '#0066cc' },
  { id: 'RN',        label: 'RN',        couleur: '#1a1aff' },
  { id: 'PATRIOTES', label: 'Patriotes', couleur: '#003399' },
  { id: 'UPR',       label: 'UPR',       couleur: '#1a3a6b' },
]

// ─────────────────────────────────────────────────────────────
// BLOCS
// ─────────────────────────────────────────────────────────────

const BLOCS_META = {
  BLOC_INSTITUTIONS: { label: 'Institutions', emoji: '🏛️' },
  BLOC_ENERGIE:      { label: 'Énergie',       emoji: '⚡' },
  BLOC_ECONOMIE:     { label: 'Économie',      emoji: '📊' },
  BLOC_SOCIAL:       { label: 'Social',        emoji: '👥' },
  BLOC_SECURITE:     { label: 'Sécurité',      emoji: '🛡️' },
  BLOC_SCANDALES:    { label: 'Événements',    emoji: '📰' },
}

// ─────────────────────────────────────────────────────────────
// LEVIERS
// ─────────────────────────────────────────────────────────────

const LEVIERS = [
  { id: 'campagne_com',        label: 'Campagne de communication', emoji: '📣', description: 'Dépensez 3 Md€ pour une campagne nationale. +5% popularité, −3 tension.',            cout_budget: 3, bonus_vote: 5,  couleur: 'blue'   },
  { id: 'negotiation_parti',   label: 'Négociation inter-partis',  emoji: '🤝', description: 'Cédez une concession à un parti allié. +15% sur le vote de la loi ciblée.',          cout_budget: 1, bonus_vote: 15, couleur: 'green', risque: 'Fuite possible si trop visible.' },
  { id: 'art_50_1',            label: 'Débat Article 50.1',        emoji: '🗣️', description: "Ouvre un débat à l'Assemblée sans vote. +8% sur la loi ciblée, sans risque.",         cout_budget: 0, bonus_vote: 8,  couleur: 'green'  },
  { id: 'lobbying_mediatique', label: 'Lobbying médiatique',       emoji: '📺', description: 'Placer des narratifs dans les médias proches. +10% vote, risque scandale.',           cout_budget: 2, bonus_vote: 10, couleur: 'purple', secret: true, risque: 'Augmente la dissimulation.' },
  { id: 'art_49_3',            label: 'Forçage Article 49.3',      emoji: '⚖️', description: "Force une loi sans vote. Outil constitutionnel extrême. Motion de censure probable.", cout_budget: 0, force_adoption: true, couleur: 'red', usage_max: 3, risque: 'Motion de censure automatique. Limité à 3 fois.' },
]

const COULEURS_LEVIER = {
  blue:   'bg-blue-700 hover:bg-blue-600',
  green:  'bg-green-700 hover:bg-green-600',
  red:    'bg-red-800 hover:bg-red-700',
  purple: 'bg-purple-700 hover:bg-purple-600',
}

// ─────────────────────────────────────────────────────────────
// GÉNÉRATION AMENDEMENTS
// ─────────────────────────────────────────────────────────────

const TEMPLATES_AMENDEMENTS = {
  RN: [
    { article: "Priorité nationale pour l'attribution des bénéfices de cette loi aux ressortissants français.", impacts_delta: { tension_sociale: +5, popularite_joueur: -4 }, position_apres: 'abstention', cout: 0 },
    { article: "Conditionnement des aides à un critère de résidence de 5 ans minimum sur le territoire.",       impacts_delta: { relation_ue: -8,  tension_sociale: +3 },         position_apres: 'abstention', cout: 0 },
  ],
  LFI: [
    { article: "Extension du dispositif aux travailleurs précaires et sans-domicile via un fonds d'urgence.",   impacts_delta: { deficit_milliards: +4, tension_sociale: -6, popularite_joueur: +3 }, position_apres: 'abstention', cout: 4 },
    { article: "Financement intégral par une taxe exceptionnelle sur les dividendes supérieurs à 100 000€.",    impacts_delta: { indice_confiance_marches: -8, deficit_milliards: -3 },                 position_apres: 'pour',       cout: 0 },
  ],
  PS_ECO: [
    { article: "Intégration d'un volet environnemental obligatoire avec bilan carbone annuel.",                 impacts_delta: { relation_ue: +4, pib_croissance_pct: -0.2 }, position_apres: 'pour', cout: 2 },
    { article: "Création d'un comité de suivi paritaire incluant syndicats et associations.",                   impacts_delta: { tension_sociale: -4, popularite_joueur: +2 }, position_apres: 'pour', cout: 1 },
  ],
  LR: [
    { article: "Clause de révision automatique après 3 ans avec évaluation coût-bénéfice obligatoire.",         impacts_delta: { indice_confiance_marches: +5, stabilite: +3 }, position_apres: 'pour',       cout: 0 },
    { article: "Décentralisation de la mise en œuvre aux régions avec enveloppe budgétaire dédiée.",            impacts_delta: { deficit_milliards: +3, stabilite: +2 },          position_apres: 'abstention', cout: 3 },
  ],
  EPR: [
    { article: "Harmonisation avec les directives européennes en vigueur et rapport de conformité annuel.",     impacts_delta: { relation_ue: +6, indice_confiance_marches: +3 }, position_apres: 'pour', cout: 0 },
  ],
  PATRIOTES: [
    { article: "Clause de souveraineté : non-application des règlements européens contradictoires.",            impacts_delta: { relation_ue: -12, indice_souverainete: +8 }, position_apres: 'abstention', cout: 0 },
  ],
}

function genererAmendements(loi) {
  if (!loi) return []
  const amendements = []
  const partisHostiles   = loi.partis_hostiles   ?? []
  const partisFavorables = loi.partis_favorables ?? []
  const partisVariables  = ['PS_ECO', 'LR', 'EPR'].filter(p => !partisHostiles.includes(p) && !partisFavorables.includes(p))

  for (const partiId of partisHostiles.slice(0, 3)) {
    const templates = TEMPLATES_AMENDEMENTS[partiId]
    if (!templates?.length) continue
    const tpl = templates[Math.floor(Math.random() * templates.length)]
    amendements.push({
      id: `${partiId}_${Date.now()}_${Math.random()}`,
      parti_id: partiId,
      parti: PARTIS_INFO[partiId] ?? { label: partiId, couleur: '#888', emoji: '⚪' },
      article: tpl.article,
      impacts_delta: tpl.impacts_delta,
      position_actuelle: 'contre',
      position_apres_acceptation: tpl.position_apres,
      cout_acceptation: tpl.cout,
      statut: 'en_attente',
      type: 'hostile',
    })
  }

  for (const partiId of partisVariables.slice(0, 2)) {
    if (Math.random() < 0.5) continue
    const templates = TEMPLATES_AMENDEMENTS[partiId]
    if (!templates?.length) continue
    const tpl = templates[Math.floor(Math.random() * templates.length)]
    amendements.push({
      id: `${partiId}_${Date.now()}_${Math.random()}`,
      parti_id: partiId,
      parti: PARTIS_INFO[partiId] ?? { label: partiId, couleur: '#888', emoji: '⚪' },
      article: tpl.article,
      impacts_delta: tpl.impacts_delta,
      position_actuelle: 'abstention',
      position_apres_acceptation: 'pour',
      cout_acceptation: tpl.cout,
      statut: 'en_attente',
      type: 'variable',
    })
  }

  return amendements
}

// ─────────────────────────────────────────────────────────────
// BARRE DE PROBA ANIMÉE
// ─────────────────────────────────────────────────────────────

function BarreProba({ pct_bonus, pct_base, bonusActif }) {
  const barRef  = useRef(null)
  const prevRef = useRef(0)
  const passerait = pct_bonus > 50

  useEffect(() => {
    if (!barRef.current) return
    anime({ targets: barRef.current, width: [`${prevRef.current}%`, `${Math.min(100, pct_bonus)}%`], duration: 700, easing: 'easeOutExpo' })
    prevRef.current = pct_bonus
  }, [pct_bonus])

  useEffect(() => {
    if (!barRef.current) return
    if (passerait) anime({ targets: barRef.current, opacity: [0.7, 1, 0.7], duration: 1600, loop: true, easing: 'easeInOutSine' })
    else           anime({ targets: barRef.current, opacity: 1, duration: 200 })
  }, [passerait])

  return (
    <div className={`rounded-xl p-3 border ${passerait ? 'bg-emerald-950/50 border-emerald-700/40' : 'bg-red-950/50 border-red-700/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">Probabilité de vote</span>
        <span className={`text-2xl font-black ${passerait ? 'text-emerald-400' : 'text-red-400'}`}>{pct_bonus}%</span>
      </div>
      <div className="relative h-2.5 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div ref={barRef} className={`h-full rounded-full ${passerait ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: '0%', transition: 'none' }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/25" style={{ left: '50%' }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mb-1"><span>0%</span><span>50% requis</span><span>100%</span></div>
      {bonusActif > 0 && (
        <div className="flex justify-between text-xs pt-2 border-t border-slate-700">
          <span className="text-slate-500">Base {pct_base}%</span>
          <span className="text-emerald-400 font-bold">+{bonusActif}% bonus → {pct_bonus}%</span>
        </div>
      )}
      <p className={`text-xs mt-2 font-bold text-center ${passerait ? 'text-emerald-400' : 'text-red-400'}`}>
        {passerait ? '✅ Passerait au vote' : `❌ Manque ${Math.max(0, 51 - pct_bonus)}% — utilisez un levier`}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CARTE AMENDEMENT
// ─────────────────────────────────────────────────────────────

function CarteAmendement({ amendement, budget, onAccepter, onRefuser, onContreProposer }) {
  const ref = useRef(null)
  const [detaille, setDetaille] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    anime({ targets: ref.current, translateX: [-30, 0], opacity: [0, 1], duration: 400, easing: 'easeOutExpo' })
  }, [])

  const peutAccepter = budget >= (amendement.cout_acceptation ?? 0)
  const statutColor = {
    en_attente:     'border-slate-600 bg-slate-800/60',
    accepte:        'border-emerald-600/60 bg-emerald-950/30',
    refuse:         'border-red-700/40 bg-red-950/20 opacity-60',
    contre_propose: 'border-amber-600/50 bg-amber-950/20',
  }

  if (amendement.statut !== 'en_attente') {
    return (
      <div ref={ref} className={`rounded-xl border p-3 flex items-center gap-3 ${statutColor[amendement.statut]}`} style={{ opacity: 0 }}>
        <span className="text-lg">{amendement.parti.emoji}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-300">{amendement.parti.label}</p>
          <p className="text-xs text-slate-500 truncate">{amendement.article}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          amendement.statut === 'accepte'        ? 'bg-emerald-900/60 text-emerald-300' :
          amendement.statut === 'refuse'         ? 'bg-red-900/60 text-red-300' :
                                                   'bg-amber-900/60 text-amber-300'
        }`}>
          {amendement.statut === 'accepte' ? '✅ Accepté' : amendement.statut === 'refuse' ? '❌ Refusé' : '🔄 Négocié'}
        </span>
      </div>
    )
  }

  return (
    <div ref={ref} className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${statutColor.en_attente}`} style={{ opacity: 0 }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
          style={{ backgroundColor: amendement.parti.couleur + '30', border: `1px solid ${amendement.parti.couleur}60` }}>
          {amendement.parti.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white">{amendement.parti.label}</p>
            <span className={`text-xs px-2 py-0.5 rounded ${
              amendement.type === 'hostile' ? 'bg-red-900/50 text-red-300' : 'bg-amber-900/50 text-amber-300'
            }`}>
              {amendement.type === 'hostile' ? '⚔️ Hostile' : '🤔 Variable'}
            </span>
            <span className="text-xs text-slate-500">
              actuellement {amendement.position_actuelle === 'contre' ? '❌ contre' : '🤷 abstention'}
            </span>
          </div>
        </div>
        <button onClick={() => setDetaille(d => !d)} className="text-slate-500 hover:text-slate-300 text-xs flex-shrink-0">
          {detaille ? '▲' : '▼'}
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/40">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">📋 Article proposé</p>
        <p className="text-xs text-slate-300 leading-relaxed italic">"{amendement.article}"</p>
      </div>

      {detaille && (
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Impact si accepté</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(amendement.impacts_delta ?? {}).map(([k, v]) => (
                <div key={k} className="bg-slate-900 rounded px-2 py-1 flex gap-1 items-center">
                  <span className="text-slate-600" style={{ fontSize: '9px' }}>{k.replace(/_/g, ' ')}</span>
                  <span className={`text-xs font-bold ${
                    ['deficit_milliards', 'tension_sociale', 'inflation_pct'].includes(k)
                      ? v > 0 ? 'text-red-400' : 'text-emerald-400'
                      : v > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>{v > 0 ? '+' : ''}{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Position après acceptation :</span>
            <span className={`font-bold ${amendement.position_apres_acceptation === 'pour' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {amendement.position_apres_acceptation === 'pour' ? '✅ Vote pour' : '🤷 Abstention'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button disabled={!peutAccepter} onClick={() => onAccepter(amendement)}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                peutAccepter ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}>
              ✅ Accepter
              {amendement.cout_acceptation > 0 && <span className="block text-xs opacity-70">−{amendement.cout_acceptation} Md€</span>}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={4} className="z-50 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 shadow-xl max-w-48">
              {peutAccepter
                ? `Accepter → ${amendement.parti.label} passe ${amendement.position_apres_acceptation === 'pour' ? 'pour' : 'en abstention'}`
                : `Budget insuffisant (manque ${amendement.cout_acceptation - budget} Md€)`}
              <Tooltip.Arrow className="fill-slate-600" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <button onClick={() => onRefuser(amendement)}
          className="py-2 rounded-lg text-xs font-bold bg-red-900/50 hover:bg-red-800 text-red-300 transition-all">
          ❌ Refuser
        </button>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button onClick={() => onContreProposer(amendement)}
              className="py-2 rounded-lg text-xs font-bold bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 transition-all">
              🔄 Négocier
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={4} className="z-50 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg px-2 py-1.5 shadow-xl max-w-48">
              Contre-propose : position → abstention, impacts réduits de moitié.
              <Tooltip.Arrow className="fill-slate-600" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MODAL PHASE AMENDEMENTS
// ─────────────────────────────────────────────────────────────

function ModalAmendements({ open, onOpenChange, loi, etatJeu, bonusVoteActif, onPasserAuVote }) {
  const [amendements,    setAmendements]    = useState([])
  const [probaCourante,  setProbaCourante]  = useState(0)
  const [impactsCumules, setImpactsCumules] = useState({})
  const headerRef = useRef(null)

  useEffect(() => {
    if (open && loi) {
      setAmendements(genererAmendements(loi))
      setImpactsCumules({})
      try {
        const { pct_bonus } = calculerProbaVoteLoi(loi.id, etatJeu, etatJeu?.hemicycle, bonusVoteActif)
        setProbaCourante(pct_bonus)
      } catch { setProbaCourante(40) }
    }
  }, [open, loi?.id])

  useEffect(() => {
    if (!loi || !open) return
    let bonusAmendements = 0
    for (const a of amendements.filter(a => a.statut === 'accepte')) {
      if (a.position_apres_acceptation === 'pour')            bonusAmendements += 8
      else if (a.position_apres_acceptation === 'abstention') bonusAmendements += 4
    }
    try {
      const { pct_bonus } = calculerProbaVoteLoi(loi.id, etatJeu, etatJeu?.hemicycle, bonusVoteActif + bonusAmendements)
      setProbaCourante(Math.min(99, pct_bonus))
    } catch { }
  }, [amendements, bonusVoteActif])

  function accepterAmendement(amendement) {
    setAmendements(prev => prev.map(a => a.id === amendement.id ? { ...a, statut: 'accepte' } : a))
    setImpactsCumules(prev => {
      const next = { ...prev }
      Object.entries(amendement.impacts_delta ?? {}).forEach(([k, v]) => { next[k] = (next[k] ?? 0) + v })
      return next
    })
    if (headerRef.current) anime({ targets: headerRef.current, scale: [1, 1.02, 1], duration: 300, easing: 'easeOutBack' })
  }

  function refuserAmendement(amendement) {
    setAmendements(prev => prev.map(a => a.id === amendement.id ? { ...a, statut: 'refuse' } : a))
  }

  function contreProposerAmendement(amendement) {
    const impactsReduits = {}
    Object.entries(amendement.impacts_delta ?? {}).forEach(([k, v]) => { impactsReduits[k] = Math.round(v / 2) })
    setAmendements(prev => prev.map(a => a.id === amendement.id
      ? { ...a, statut: 'contre_propose', impacts_delta: impactsReduits, position_apres_acceptation: 'abstention', cout_acceptation: 0 }
      : a
    ))
    setImpactsCumules(prev => {
      const next = { ...prev }
      Object.entries(impactsReduits).forEach(([k, v]) => { next[k] = (next[k] ?? 0) + v })
      return next
    })
  }

  const budget      = etatJeu?.reserve_budgetaire_milliards ?? 0
  const nbEnAttente = amendements.filter(a => a.statut === 'en_attente').length
  const nbAcceptes  = amendements.filter(a => a.statut === 'accepte').length

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl">

          <div ref={headerRef} className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-amber-400 uppercase tracking-wide font-semibold">📋 Phase d'amendements</span>
                  {nbEnAttente > 0 && (
                    <span className="text-xs bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded animate-pulse">{nbEnAttente} en attente</span>
                  )}
                </div>
                <p className="font-bold text-white">{loi?.emoji} {loi?.titre}</p>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
              </Dialog.Close>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={`rounded-lg px-3 py-2 border ${probaCourante > 50 ? 'bg-emerald-950/40 border-emerald-700/40' : 'bg-red-950/40 border-red-700/40'}`}>
                <p className="text-xs text-slate-500 mb-0.5">Probabilité de passage</p>
                <p className={`text-xl font-black ${probaCourante > 50 ? 'text-emerald-400' : 'text-red-400'}`}>{probaCourante}%</p>
              </div>
              <div className="rounded-lg px-3 py-2 bg-slate-800/60 border border-slate-700/40">
                <p className="text-xs text-slate-500 mb-0.5">Amendements acceptés</p>
                <p className="text-xl font-black text-white">{nbAcceptes} <span className="text-sm text-slate-400">/ {amendements.length}</span></p>
              </div>
            </div>

            {Object.keys(impactsCumules).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-slate-500">Impacts ajoutés :</span>
                {Object.entries(impactsCumules).map(([k, v]) => v !== 0 && (
                  <span key={k} className={`text-xs font-bold ${
                    ['deficit_milliards', 'tension_sociale'].includes(k)
                      ? v > 0 ? 'text-red-400' : 'text-emerald-400'
                      : v > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>{k.replace(/_/g, ' ')} {v > 0 ? '+' : ''}{v}</span>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col gap-3">
            {amendements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🕊️</p>
                <p className="text-slate-400 font-semibold">Aucun amendement déposé</p>
                <p className="text-slate-500 text-sm mt-1">Aucun parti hostile n'a déposé d'amendement sur cette loi.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  {amendements.length} amendement{amendements.length > 1 ? 's' : ''} déposé{amendements.length > 1 ? 's' : ''}.
                  Accepter un amendement améliore vos chances de vote mais modifie la loi.
                </p>
                {amendements.map(a => (
                  <CarteAmendement key={a.id} amendement={a} budget={budget}
                    onAccepter={accepterAmendement} onRefuser={refuserAmendement} onContreProposer={contreProposerAmendement} />
                ))}
              </>
            )}

            <div className="border-t border-slate-800 pt-4 mt-2">
              {nbEnAttente > 0 && (
                <p className="text-xs text-amber-500/80 text-center mb-3">
                  ⚠️ {nbEnAttente} amendement{nbEnAttente > 1 ? 's' : ''} en attente — vous pouvez quand même passer au vote.
                </p>
              )}
              <button onClick={() => onPasserAuVote(amendements, impactsCumules)}
                className={`w-full py-3.5 rounded-xl font-black text-sm transition-all ${
                  probaCourante > 50
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}>
                🗳️ Passer au vote — {probaCourante}% de passage
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─────────────────────────────────────────────────────────────
// DIALOG 49.3
// ─────────────────────────────────────────────────────────────

function Dialog493({ open, onOpenChange, loi, onConfirmer, usage, usageMax }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-slate-900 border border-red-700/60 rounded-2xl p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-black text-red-400 mb-1">⚖️ Recours à l'Article 49.3</Dialog.Title>
          <Dialog.Description className="text-sm text-slate-400 mb-4">Forçage constitutionnel sans vote. Usage {usage + 1}/{usageMax}.</Dialog.Description>
          {loi && (
            <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{loi.emoji}</span>
                <div><p className="font-bold text-white">{loi.titre}</p><p className="text-xs text-slate-400">{loi.bloc}</p></div>
              </div>
              <p className="text-xs text-slate-400">{loi.description}</p>
            </div>
          )}
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-3 mb-5">
            <p className="text-xs text-red-300 font-semibold mb-1.5">⚠️ Conséquences immédiates</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded">Stabilité −20</span>
              <span className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded">Tension +18</span>
              <span className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded">Popularité −12</span>
              <span className="bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded">Motion de censure probable</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog.Close asChild>
              <button className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">Annuler</button>
            </Dialog.Close>
            <button onClick={onConfirmer} className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black transition-colors">
              ⚖️ Forcer l'adoption
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─────────────────────────────────────────────────────────────
// CARTE LOI
// ─────────────────────────────────────────────────────────────

function CarteLoi({ loi, selectionnee, onClick, pct_bonus, pct_base, bonusActif, onOuvrirAmendements }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !selectionnee) return
    anime({ targets: ref.current, translateY: [-6, 0], opacity: [0.7, 1], duration: 300, easing: 'easeOutBack' })
  }, [selectionnee])

  return (
    <div ref={ref} onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all ${
        selectionnee
          ? 'border-blue-500/70 bg-slate-700/80 shadow-lg shadow-blue-900/20'
          : 'border-slate-700/60 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
      }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{loi.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-white text-sm leading-tight">{loi.titre}</p>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{loi.bloc}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${pct_bonus > 50 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'}`}>{pct_bonus}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{loi.description}</p>
        </div>
      </div>

      {selectionnee && (
        <div className="mt-4 flex flex-col gap-3">
          <BarreProba pct_base={pct_base} pct_bonus={pct_bonus} bonusActif={bonusActif} />

          {loi.impacts && Object.keys(loi.impacts).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Effets si adoptée</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(loi.impacts).map(([k, v]) => (
                  <div key={k} className="bg-slate-900 rounded-lg px-2 py-1.5 flex flex-col items-center">
                    <span className="text-slate-500" style={{ fontSize: '9px' }}>{k.replace(/_/g, ' ')}</span>
                    <span className={`text-xs font-bold ${
                      ['deficit_milliards', 'tension_sociale', 'inflation_pct'].includes(k)
                        ? v > 0 ? 'text-red-400' : 'text-emerald-400'
                        : v > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>{v > 0 ? '+' : ''}{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-lg p-2">
              <p className="text-emerald-400 font-semibold mb-1.5">✅ Favorables</p>
              <div className="flex flex-wrap gap-1">
                {loi.partis_favorables?.map(p => (
                  <span key={p} className="bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded"
                    style={{ borderLeft: `2px solid ${PARTIS_INFO[p]?.couleur ?? '#22c55e'}` }}>{p}</span>
                ))}
                {!loi.partis_favorables?.length && <span className="text-slate-500">Aucun</span>}
              </div>
            </div>
            <div className="bg-red-950/40 border border-red-800/30 rounded-lg p-2">
              <p className="text-red-400 font-semibold mb-1.5">❌ Hostiles</p>
              <div className="flex flex-wrap gap-1">
                {loi.partis_hostiles?.map(p => (
                  <span key={p} className="bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded"
                    style={{ borderLeft: `2px solid ${PARTIS_INFO[p]?.couleur ?? '#ef4444'}` }}>{p}</span>
                ))}
                {!loi.partis_hostiles?.length && <span className="text-slate-500">Aucun</span>}
              </div>
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onOuvrirAmendements(loi) }}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all ${
              pct_bonus > 50 ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40' : 'bg-slate-600/80 hover:bg-slate-500'
            }`}>
            📋 Gérer les amendements → Soumettre au vote
            {bonusActif > 0 && <span className="ml-2 text-xs opacity-70">(+{bonusActif}% bonus)</span>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CARTE LEVIER
// ─────────────────────────────────────────────────────────────

function CarteLevier({ levier, etatJeu, usage49_3, onAppliquer, loiCiblee }) {
  const bloque         = levier.id === 'art_49_3' && usage49_3 >= (levier.usage_max ?? 3)
  const pasAssezBudget = (levier.cout_budget ?? 0) > 0 && (etatJeu?.reserve_budgetaire_milliards ?? 0) < levier.cout_budget
  const desactive      = bloque || pasAssezBudget

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${desactive ? 'border-slate-700/40 bg-slate-800/20 opacity-40' : 'border-slate-700 bg-slate-800/70 hover:border-slate-500'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levier.emoji}</span>
              <div>
                <p className="font-semibold text-white text-xs">{levier.label}</p>
                {levier.secret && <span className="text-xs text-purple-400">🔒 Secrète</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {levier.cout_budget > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">−{levier.cout_budget} Md€</span>}
              {levier.bonus_vote  && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">+{levier.bonus_vote}% vote</span>}
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{levier.description}</p>
          {levier.risque && <p className="text-xs text-amber-600/80">⚠️ {levier.risque}</p>}
          {levier.id === 'art_49_3' && <p className="text-xs text-slate-600">Utilisé {usage49_3}/{levier.usage_max ?? 3} fois</p>}
          <button disabled={desactive} onClick={() => !desactive && onAppliquer(levier)}
            className={`w-full py-1.5 rounded-lg text-white text-xs font-semibold border transition-all ${
              desactive ? 'bg-slate-700 border-slate-600 cursor-not-allowed' : `${COULEURS_LEVIER[levier.couleur] ?? COULEURS_LEVIER.blue} border-transparent`
            }`}>
            {bloque ? '🔒 Épuisé' : pasAssezBudget ? '💸 Budget insuffisant' :
              (levier.id === 'art_49_3' || levier.id === 'art_50_1') && !loiCiblee ? '← Sélectionnez une loi' : 'Appliquer'}
          </button>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="right" sideOffset={8} className="z-50 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-2 shadow-xl max-w-56">
          {levier.description}
          {levier.risque && <p className="text-amber-400 mt-1">⚠️ {levier.risque}</p>}
          <Tooltip.Arrow className="fill-slate-600" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

// ─────────────────────────────────────────────────────────────
// PANNEAU CURSEURS
// ─────────────────────────────────────────────────────────────

function PanneauCurseurs({ curseurs, onDeplacer }) {
  const [ouvert, setOuvert] = useState(false)
  if (!curseurs || !onDeplacer) return null

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl overflow-hidden">
      <button onClick={() => setOuvert(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-base">🎚️</span>
          <span className="text-sm font-bold text-slate-200">Positionnement idéologique</span>
          <span className="text-xs text-slate-500 hidden sm:inline">— influence les probabilités de vote</span>
        </div>
        <span className={`text-slate-500 text-xs transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {ouvert && (
        <div className="px-4 pb-4 border-t border-slate-700/40">
          <div className="flex flex-col gap-4 mt-4">
            {Object.entries(AXES).map(([axe, config]) => {
              const val = curseurs[axe] ?? 50
              const couleur = getCouleurCurseur(val)
              return (
                <div key={axe}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">{config.label ?? axe}</span>
                    <span className="text-xs font-mono" style={{ color: couleur }}>{getLabelCurseur(axe, val)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 w-20 text-right leading-tight">{config.gauche}</span>
                    <div className="relative flex-1 h-2 bg-slate-700 rounded-full">
                      <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                        style={{ width: `${val}%`, backgroundColor: couleur + '80' }} />
                      <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white/80 shadow-lg transition-all duration-300"
                        style={{ left: `calc(${val}% - 7px)`, backgroundColor: couleur }} />
                      <input type="range" min="0" max="100" value={val}
                        onChange={e => onDeplacer(axe, parseInt(e.target.value) - val)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <span className="text-[10px] text-orange-400 w-20 leading-tight">{config.droite}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function Legislatif({ etatJeu, voterLoi, curseurs, deplacerCurseur: deplacerCurseurJoueur }) {
  const [loiSelectionnee, setLoiSelectionnee] = useState(null)
  const [filtreBloc,      setFiltreBloc]      = useState('TOUS')
  const [filtreParti,     setFiltreParti]     = useState('TOUS')
  const [usage49_3,       setUsage49_3]       = useState(0)
  const [bonusVoteActif,  setBonusVoteActif]  = useState(0)
  const [notifications,   setNotifications]   = useState([])
  const [dialog493Open,   setDialog493Open]   = useState(false)
  const [modalAmendOpen,  setModalAmendOpen]  = useState(false)
  const [loiEnAmendement, setLoiEnAmendement] = useState(null)

  const loisDispo = useMemo(() => {
    if (!etatJeu) return []
    try { return getLoisDisponibles(etatJeu) } catch { return [] }
  }, [etatJeu])

  const loisAdoptees = useMemo(() => {
    const ids    = etatJeu?.lois_votees ?? []
    const toutes = Object.values(CATALOGUE_LOIS).flat()
    return ids.map(id => toutes.find(l => l.id === id)).filter(Boolean)
  }, [etatJeu?.lois_votees])

  const getBlocDeLoi = (loi) =>
    Object.entries(CATALOGUE_LOIS).find(([, arr]) => arr.some(x => x.id === loi.id))?.[0] ?? ''

  const loisFiltrees = useMemo(() => {
    return loisDispo.filter(loi => {
      if (filtreBloc  !== 'TOUS' && getBlocDeLoi(loi) !== filtreBloc)             return false
      if (filtreParti !== 'TOUS' &&
          loi.parti_auteur !== filtreParti &&
          !loi.partis_favorables?.includes(filtreParti))                           return false
      return true
    })
  }, [loisDispo, filtreBloc, filtreParti])

  const countParBloc = useMemo(() => {
    const c = {}
    for (const loi of loisDispo) { const b = getBlocDeLoi(loi); c[b] = (c[b] ?? 0) + 1 }
    return c
  }, [loisDispo])

  function notif(type, msg) {
    setNotifications([{ type, msg }])
    setTimeout(() => setNotifications([]), 5000)
  }

  function ouvrirAmendements(loi) {
    setLoiEnAmendement(loi)
    setModalAmendOpen(true)
  }

  function passerAuVoteApresAmendements(amendements) {
    setModalAmendOpen(false)
    const amendAcceptes = amendements.filter(a => a.statut === 'accepte' || a.statut === 'contre_propose')
    let bonusTotal = bonusVoteActif
    for (const a of amendAcceptes) {
      if (a.position_apres_acceptation === 'pour')            bonusTotal += 8
      else if (a.position_apres_acceptation === 'abstention') bonusTotal += 4
    }
    voterLoi(loiEnAmendement.id, bonusTotal)
    setBonusVoteActif(0)
    setLoiSelectionnee(null)
    setLoiEnAmendement(null)
    const msg = amendAcceptes.length > 0
      ? `🗳️ "${loiEnAmendement.titre}" soumise avec ${amendAcceptes.length} amendement${amendAcceptes.length > 1 ? 's' : ''} intégré${amendAcceptes.length > 1 ? 's' : ''}.`
      : `🗳️ "${loiEnAmendement.titre}" soumise au vote.`
    notif('success', msg)
  }

  function appliquerLevier(levier) {
    if (levier.id === 'art_49_3') {
      if (!loiSelectionnee) { notif('warning', "⚠️ Sélectionnez d'abord une loi dans le Catalogue."); return }
      setDialog493Open(true); return
    }
    if (levier.id === 'art_50_1') {
      if (!loiSelectionnee) { notif('warning', "⚠️ Sélectionnez une loi dans le Catalogue d'abord."); return }
      setBonusVoteActif(b => b + (levier.bonus_vote ?? 8))
      notif('success', `🗣️ Débat ouvert sur "${loiSelectionnee.titre}". +${levier.bonus_vote}% de soutien.`); return
    }
    if (levier.bonus_vote) setBonusVoteActif(b => b + levier.bonus_vote)
    notif(levier.id === 'lobbying_mediatique' ? 'warning' : 'success', {
      campagne_com:        '📣 Campagne lancée — popularité en hausse.',
      negotiation_parti:   '🤝 Négociation réussie — +15% sur le prochain vote.',
      lobbying_mediatique: '📺 Lobbying en cours — +10% vote, dissimulation augmentée.',
    }[levier.id] ?? 'Levier appliqué.')
  }

  function confirmer49_3() {
    voterLoi(loiSelectionnee.id, 100)
    setUsage49_3(u => u + 1)
    setDialog493Open(false)
    setLoiSelectionnee(null)
    setBonusVoteActif(0)
    notif('danger', `⚖️ 49.3 activé — "${loiSelectionnee.titre}" forcée. Motion de censure probable.`)
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="max-w-7xl mx-auto flex flex-col gap-4">

        <Dialog493
          open={dialog493Open} onOpenChange={setDialog493Open}
          loi={loiSelectionnee} onConfirmer={confirmer49_3}
          usage={usage49_3} usageMax={3}
        />
        <ModalAmendements
          open={modalAmendOpen} onOpenChange={setModalAmendOpen}
          loi={loiEnAmendement} etatJeu={etatJeu}
          bonusVoteActif={bonusVoteActif} onPasserAuVote={passerAuVoteApresAmendements}
        />

        {/* Notifications */}
        {notifications.map((n, i) => (
          <div key={i} className={`rounded-lg px-4 py-3 text-sm font-medium ${
            n.type === 'danger'  ? 'bg-red-950/80 border border-red-700/50 text-red-200' :
            n.type === 'warning' ? 'bg-amber-950/80 border border-amber-700/50 text-amber-200' :
            n.type === 'success' ? 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-200' :
                                   'bg-blue-950/80 border border-blue-700/50 text-blue-200'
          }`}>{n.msg}</div>
        ))}

        {/* Curseurs positionnement idéologique */}
        <PanneauCurseurs curseurs={curseurs} onDeplacer={deplacerCurseurJoueur} />

        {/* Onglets principaux */}
        <Tabs.Root defaultValue="catalogue">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <Tabs.List className="flex bg-slate-800 rounded-xl p-1 gap-1">
              {[
                { val: 'catalogue', label: '📜 Catalogue', count: loisDispo.length },
                { val: 'adoptees',  label: '✅ Adoptées',   count: loisAdoptees.length },
                { val: 'leviers',   label: '🎮 Leviers',    count: null },
              ].map(tab => (
                <Tabs.Trigger key={tab.val} value={tab.val}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:text-white hover:bg-slate-700">
                  {tab.label}
                  {tab.count != null && (
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-700">{tab.count}</span>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <div className="flex gap-2 flex-wrap">
              {etatJeu && [
                { l: '❤️', v: `${Math.round(etatJeu.popularite_joueur ?? 42)}%`,     d: (etatJeu.popularite_joueur ?? 42) < 30 },
                { l: '🔥', v: `${Math.round(etatJeu.tension_sociale ?? 45)}`,         d: (etatJeu.tension_sociale ?? 45) > 70 },
                { l: '🏦', v: `${etatJeu.reserve_budgetaire_milliards ?? 0} Md€`,     d: (etatJeu.reserve_budgetaire_milliards ?? 0) < 10 },
              ].map(({ l, v, d }) => (
                <div key={l} className="bg-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">{l}</span>
                  <span className={`text-xs font-bold ${d ? 'text-red-400' : 'text-white'}`}>{v}</span>
                </div>
              ))}
              {bonusVoteActif > 0 && (
                <div className="bg-emerald-900/60 border border-emerald-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300">+{bonusVoteActif}% bonus</span>
                  <button onClick={() => setBonusVoteActif(0)} className="text-emerald-600 hover:text-emerald-300 text-xs">✕</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Catalogue ── */}
          <Tabs.Content value="catalogue" className="flex flex-col gap-4">

            {/* Filtre blocs */}
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setFiltreBloc('TOUS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreBloc === 'TOUS' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>
                Tous ({loisDispo.length})
              </button>
              {Object.entries(BLOCS_META).map(([bloc, info]) => {
                const count = countParBloc[bloc] ?? 0
                if (!count) return null
                return (
                  <button key={bloc} onClick={() => setFiltreBloc(bloc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreBloc === bloc ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>
                    {info.emoji} {info.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Filtre partis */}
            <div className="flex gap-1.5 flex-wrap border-t border-slate-800/60 pt-2">
              {PARTIS_FILTRE.map(p => (
                <button key={p.id} onClick={() => setFiltreParti(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                    filtreParti === p.id ? '' : 'bg-slate-900 text-slate-400 border-slate-700/50 hover:border-slate-600'
                  }`}
                  style={filtreParti === p.id ? { backgroundColor: p.couleur + '33', borderColor: p.couleur + '80', color: p.couleur } : {}}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.couleur }} />
                  {p.label}
                </button>
              ))}
            </div>

            {loiSelectionnee && (
              <div className="bg-blue-950/40 border border-blue-700/40 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-blue-300">🎯 Loi ciblée : <strong>{loiSelectionnee.titre}</strong></span>
                <button onClick={() => setLoiSelectionnee(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
              </div>
            )}

            {loisFiltrees.length === 0 ? (
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-10 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-slate-400">Aucune loi disponible pour ces filtres.</p>
                <p className="text-xs text-slate-600 mt-1">
                  {(filtreBloc !== 'TOUS' || filtreParti !== 'TOUS') ? 'Essayez de changer les filtres.' : 'Votre popularité ou réserve budgétaire est insuffisante.'}
                </p>
              </div>
            ) : loisFiltrees.map(loi => {
              const { pct_base, pct_bonus } = (() => {
                try { return calculerProbaVoteLoi(loi.id, etatJeu, etatJeu?.hemicycle, bonusVoteActif) }
                catch { return { pct_base: 35, pct_bonus: 35 } }
              })()
              return (
                <CarteLoi key={loi.id} loi={loi}
                  selectionnee={loiSelectionnee?.id === loi.id}
                  onClick={() => setLoiSelectionnee(prev => prev?.id === loi.id ? null : loi)}
                  pct_bonus={pct_bonus} pct_base={pct_base} bonusActif={bonusVoteActif}
                  onOuvrirAmendements={ouvrirAmendements}
                />
              )
            })}
          </Tabs.Content>

          {/* ── Adoptées ── */}
          <Tabs.Content value="adoptees" className="flex flex-col gap-3">
            {loisAdoptees.length === 0 ? (
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-10 text-center">
                <p className="text-4xl mb-3">📜</p>
                <p className="text-slate-400">Aucune loi adoptée pour l'instant.</p>
              </div>
            ) : loisAdoptees.map(loi => (
              <div key={loi.id} className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{loi.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-white">{loi.titre}</p>
                      <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">✅ Adoptée</span>
                    </div>
                    <p className="text-xs text-slate-400">{loi.description}</p>
                    {loi.impacts && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(loi.impacts).map(([k, v]) => (
                          <div key={k} className="bg-slate-900 rounded px-1.5 py-0.5 flex gap-1 items-center">
                            <span className="text-slate-600" style={{ fontSize: '9px' }}>{k.replace(/_/g, ' ')}</span>
                            <span className={`text-xs font-bold ${v > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{v > 0 ? '+' : ''}{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Tabs.Content>

          {/* ── Leviers ── */}
          <Tabs.Content value="leviers" className="flex flex-col gap-3">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilisez les leviers pour augmenter la probabilité d'une loi ou la forcer.
                <strong className="text-slate-300"> Sélectionnez d'abord une loi dans le Catalogue</strong> avant le 49.3 ou le 50.1.
              </p>
              {loiSelectionnee && (
                <p className="text-xs text-blue-300 mt-2">🎯 Loi ciblée : <strong>{loiSelectionnee.titre}</strong></p>
              )}
            </div>
            {LEVIERS.map(levier => (
              <CarteLevier key={levier.id} levier={levier} etatJeu={etatJeu}
                usage49_3={usage49_3} onAppliquer={appliquerLevier} loiCiblee={loiSelectionnee} />
            ))}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wide">Réserve budgétaire</span>
                <span className="text-lg font-black text-white">{etatJeu?.reserve_budgetaire_milliards ?? 0} <span className="text-sm text-slate-400">Md€</span></span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (etatJeu?.reserve_budgetaire_milliards ?? 0) / 1.5)}%` }} />
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        {/* Tip contextuel */}
        <div className="bg-slate-800/30 border border-yellow-900/30 rounded-lg px-4 py-2.5">
          <span className="text-xs text-yellow-600">💡 </span>
          <span className="text-xs text-slate-400">
            {(etatJeu?.popularite_joueur ?? 42) < 35
              ? "Popularité trop basse. Lancez une campagne dans les Leviers avant de voter."
              : (etatJeu?.tension_sociale ?? 45) > 65
                ? "Tensions élevées. Évitez le 49.3 — négociez les amendements à la place."
                : bonusVoteActif > 0
                  ? `Bonus +${bonusVoteActif}% actif — cliquez sur une loi puis gérez ses amendements !`
                  : loisAdoptees.length === 0
                    ? "Cliquez sur une loi pour la développer, puis gérez les amendements avant de voter."
                    : `${loisAdoptees.length} loi${loisAdoptees.length > 1 ? 's' : ''} adoptée${loisAdoptees.length > 1 ? 's' : ''}. Continuez à réformer !`}
          </span>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
