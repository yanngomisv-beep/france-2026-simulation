import { useState, useMemo, useRef, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import anime from 'animejs'
import { getLoisDisponibles, calculerProbaVoteLoi } from '../engines/moteur-legislatif.js'
import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

const LEVIERS = [
  { id: 'campagne_com',        label: 'Campagne de communication', emoji: '📣', description: 'Dépensez 3 Md€ pour une campagne nationale. +5% popularité, -3 tension.', cout_budget: 3, bonus_vote: 5,  couleur: 'blue' },
  { id: 'negotiation_parti',   label: 'Négociation inter-partis',  emoji: '🤝', description: 'Cédez une concession à un parti allié. +15% sur le vote de la loi ciblée.', cout_budget: 1, bonus_vote: 15, risque: 'Fuite possible si trop visible.', couleur: 'green' },
  { id: 'art_50_1',            label: 'Débat Article 50.1',        emoji: '🗣️', description: "Ouvre un débat à l'Assemblée sans vote. +8% sur la loi ciblée, sans risque.", cout_budget: 0, bonus_vote: 8,  couleur: 'green' },
  { id: 'lobbying_mediatique', label: 'Lobbying médiatique',       emoji: '📺', description: 'Placer des narratifs dans les médias proches. +10% vote, risque scandale.', cout_budget: 2, bonus_vote: 10, risque: 'Augmente la dissimulation.', couleur: 'purple', secret: true },
  { id: 'art_49_3',            label: 'Forçage Article 49.3',      emoji: '⚖️', description: "Force une loi sans vote. Outil constitutionnel extrême.", cout_budget: 0, force_adoption: true, risque: 'Motion de censure automatique. Limité à 3 fois.', couleur: 'red', usage_max: 3 },
]

const BLOCS_META = {
  BLOC_INSTITUTIONS: { label: 'Institutions', emoji: '🏛️' },
  BLOC_ENERGIE:      { label: 'Énergie',       emoji: '⚡' },
  BLOC_ECONOMIE:     { label: 'Économie',      emoji: '📊' },
  BLOC_SOCIAL:       { label: 'Social',        emoji: '👥' },
  BLOC_SECURITE:     { label: 'Sécurité',      emoji: '🛡️' },
  BLOC_SCANDALES:    { label: 'Événements',    emoji: '📰' },
}

const PARTIS_INFO = {
  LFI:          { label: 'LFI',         couleur: '#cc0000', bloc: 'Gauche radicale',  tendance: 'gauche'  },
  TRAVAILLEURS: { label: 'PT',          couleur: '#8b0000', bloc: 'Gauche radicale',  tendance: 'gauche'  },
  PS_ECO:       { label: 'PS-Écolos',  couleur: '#ff8c00', bloc: 'Gauche',           tendance: 'gauche'  },
  EPR:          { label: 'Renaissance', couleur: '#ffcc00', bloc: 'Centre',           tendance: 'centre'  },
  LR:           { label: 'LR',          couleur: '#0066cc', bloc: 'Droite',           tendance: 'droite'  },
  PATRIOTES:    { label: 'Patriotes',   couleur: '#003399', bloc: 'Droite nationale', tendance: 'droite'  },
  UPR:          { label: 'UPR',         couleur: '#001a66', bloc: 'Souverainiste',    tendance: 'droite'  },
  RN:           { label: 'RN',          couleur: '#1a1aff', bloc: 'Extrême droite',   tendance: 'extreme' },
}

const TEMPLATES = {
  gauche: [
    { s: 'solidarité',  t: "Étendre aux travailleurs précaires, financement par taxe sur dividendes.", impacts: { tension_sociale: -4, deficit_milliards: 2 }, art: "Article add. : Extension du dispositif aux personnes en situation de précarité." },
    { s: 'financement', t: "Conditionner à un fonds alimenté par les grandes entreprises du CAC 40.", impacts: { popularite_joueur: 2, indice_confiance_marches: -5 }, art: "Article add. : Contribution exceptionnelle des grandes entreprises." },
    { s: 'service pub', t: "Mise en oeuvre exclusivement par les services publics, sans recours au privé.", impacts: { tension_sociale: -3, deficit_milliards: 3 }, art: "Article add. : Exclusivité du service public." },
  ],
  droite: [
    { s: 'simplification',  t: "Supprimer les seuils administratifs excessifs et alléger les démarches PME.", impacts: { pib_croissance_pct: 0.2, deficit_milliards: -1 }, art: "Article add. : Simplification pour les entreprises de moins de 50 salariés." },
    { s: 'conditionnalité', t: "Conditionner les aides à la recherche active d'emploi.", impacts: { consentement_impot: 3, tension_sociale: 5 }, art: "Article add. : Obligation de contrepartie pour les bénéficiaires." },
    { s: 'délai',           t: "Reporter l'entrée en vigueur à 18 mois pour étude d'impact budgétaire.", impacts: { indice_confiance_marches: 3 }, art: "Article add. : Entrée en vigueur différée et rapport au Parlement." },
  ],
  extreme: [
    { s: 'national',   t: "Limiter l'application aux citoyens français de naissance.", impacts: { tension_sociale: 8, relation_ue: -10 }, art: "Article add. : Restriction aux ressortissants français." },
    { s: 'référendum', t: "Soumettre la loi à référendum populaire avant promulgation.", impacts: { popularite_joueur: -3, stabilite: -5 }, art: "Article add. : Consultation populaire obligatoire." },
  ],
  centre: [
    { s: 'évaluation',   t: "Clause de révision automatique à 2 ans avec rapport d'évaluation.", impacts: { indice_confiance_marches: 2 }, art: "Article add. : Clause de révision et évaluation biennale." },
    { s: 'expérimental', t: "Phase expérimentale dans 5 régions pilotes avant généralisation.", impacts: { deficit_milliards: -2, pib_croissance_pct: 0.1 }, art: "Article add. : Expérimentation régionale préalable." },
  ],
}

function genererAmendements(loi) {
  if (!loi) return []
  const candidats = [...(loi.partis_hostiles ?? []), ...Object.keys(PARTIS_INFO).filter(p => !loi.partis_favorables?.includes(p) && !loi.partis_hostiles?.includes(p))].filter((v,i,a) => a.indexOf(v)===i).slice(0,4)
  return candidats.map(pid => {
    const info = PARTIS_INFO[pid]; if (!info) return null
    const tpls = TEMPLATES[info.tendance] ?? TEMPLATES.centre
    const tpl  = tpls[Math.floor(Math.random()*tpls.length)]
    return { id: `${pid}_${Date.now()}_${Math.random()}`, parti_id: pid, parti_label: info.label, parti_couleur: info.couleur, parti_bloc: info.bloc, suffixe: tpl.s, texte: tpl.t, article_ajoute: tpl.art, impacts_modifies: tpl.impacts, cout_negociation: info.tendance==='extreme'?5:info.tendance==='droite'?2:3, effet_vote: info.tendance==='extreme'?'abstention':'pour', statut: 'en_attente' }
  }).filter(Boolean)
}

function ModalAmendements({ open, onOpenChange, loi, etatJeu, bonusVoteBase, onLancerVote }) {
  const [amendements, setAmendements] = useState([])
  const [budgetRestant, setBudgetRestant] = useState(0)
  const [bonusVote, setBonusVote] = useState(0)
  const refs = useRef({})

  useEffect(() => {
    if (open && loi) { setAmendements(genererAmendements(loi)); setBudgetRestant(etatJeu?.reserve_budgetaire_milliards??0); setBonusVote(bonusVoteBase??0) }
  }, [open, loi])

  function accepter(id) {
    const am = amendements.find(a=>a.id===id); if(!am||am.cout_negociation>budgetRestant) return
    const el = refs.current[id]; if(el) anime({targets:el,scale:[1,1.02,1],duration:350,easing:'easeOutBack'})
    setBudgetRestant(b=>b-am.cout_negociation); setBonusVote(b=>b+(am.effet_vote==='pour'?12:6))
    setAmendements(prev=>prev.map(a=>a.id===id?{...a,statut:'accepte'}:a))
  }

  function refuser(id) {
    const el = refs.current[id]
    if(el) anime({targets:el,translateX:[0,-8,8,-4,0],duration:350,easing:'easeOutQuart',complete:()=>setAmendements(prev=>prev.map(a=>a.id===id?{...a,statut:'refuse'}:a))})
    else setAmendements(prev=>prev.map(a=>a.id===id?{...a,statut:'refuse'}:a))
  }

  const acceptes = amendements.filter(a=>a.statut==='accepte')
  const impacts = acceptes.reduce((acc,am)=>{ Object.entries(am.impacts_modifies??{}).forEach(([k,v])=>{acc[k]=(acc[k]??0)+v}); return acc },{})
  const nbPour = acceptes.filter(a=>a.effet_vote==='pour').length
  const nbAbst = acceptes.filter(a=>a.effet_vote==='abstention').length

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm"/>
        <Dialog.Content className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl">
          <div className="sticky top-0 bg-slate-950 border-b border-slate-800 px-5 pt-5 pb-4 z-10">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Phase d'amendements</p>
                <h2 className="text-lg font-black text-white">{loi?.emoji} {loi?.titre}</h2>
              </div>
              <Dialog.Close asChild><button className="text-slate-500 hover:text-white text-lg transition-colors">✕</button></Dialog.Close>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-500 mb-0.5">Budget restant</p>
                <p className={`text-lg font-black ${budgetRestant<3?'text-red-400':'text-white'}`}>{budgetRestant} <span className="text-xs font-normal text-slate-400">Md€</span></p>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-800/30 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-500 mb-0.5">Bonus vote</p>
                <p className="text-lg font-black text-emerald-400">+{bonusVote}%</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className="text-xs text-slate-500 mb-0.5">Partis ralliés</p>
                <p className="text-lg font-black text-blue-300">{nbPour} <span className="text-xs font-normal text-slate-400">+{nbAbst} abst.</span></p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 flex flex-col gap-3">
            <p className="text-xs text-slate-400 bg-slate-800/50 border border-slate-700/40 rounded-lg px-4 py-2.5 leading-relaxed">
              Les partis ont déposé leurs amendements. <strong className="text-slate-300">Accepter</strong> coûte du budget mais rallie le parti. <strong className="text-slate-300">Refuser</strong> préserve le budget mais maintient l'hostilité.
            </p>

            {amendements.map(am => (
              <div key={am.id} ref={el=>refs.current[am.id]=el}
                className={`rounded-xl border p-4 transition-all ${am.statut==='accepte'?'border-emerald-700/50 bg-emerald-950/20':am.statut==='refuse'?'border-slate-700/30 bg-slate-800/20 opacity-50':'border-slate-700/60 bg-slate-800/50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:am.parti_couleur}}/>
                  <span className="font-bold text-white text-sm">{am.parti_label}</span>
                  <span className="text-xs text-slate-500">{am.parti_bloc}</span>
                  {am.statut==='accepte'&&<span className="ml-auto text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full">✅ Accepté</span>}
                  {am.statut==='refuse'&&<span className="ml-auto text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">❌ Refusé</span>}
                </div>
                <div className="bg-slate-900/80 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">📋 Amendement « {am.suffixe} »</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{am.texte}</p>
                  <p className="text-xs text-blue-400/70 italic mt-2 border-l border-blue-800/40 pl-2">{am.article_ajoute}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(am.impacts_modifies??{}).map(([k,v])=>(
                      <div key={k} className="bg-slate-900 rounded px-1.5 py-1 flex gap-1 items-center">
                        <span className="text-slate-600" style={{fontSize:'9px'}}>{k.replace(/_/g,' ')}</span>
                        <span className={`text-xs font-bold ${['deficit_milliards','tension_sociale','inflation_pct'].includes(k)?v>0?'text-red-400':'text-emerald-400':v>0?'text-emerald-400':'text-red-400'}`}>{v>0?'+':''}{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`ml-auto text-xs px-2 py-1 rounded-lg font-semibold ${am.effet_vote==='pour'?'bg-emerald-900/50 text-emerald-300':'bg-slate-700 text-slate-300'}`}>
                    {am.effet_vote==='pour'?'🤝 Rallie +12% vote':'🤷 Abstention +6% vote'}
                  </div>
                </div>
                {am.statut==='en_attente'&&(
                  <div className="flex gap-2">
                    <button onClick={()=>accepter(am.id)} disabled={am.cout_negociation>budgetRestant}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${am.cout_negociation>budgetRestant?'bg-slate-700 text-slate-500 cursor-not-allowed':'bg-emerald-700 hover:bg-emerald-600 text-white'}`}>
                      ✅ Accepter ({am.cout_negociation} Md€)
                    </button>
                    <button onClick={()=>refuser(am.id)} className="flex-1 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-red-900/60 hover:text-red-300 text-slate-300 border border-slate-600 transition-all">
                      ❌ Refuser (gratuit)
                    </button>
                  </div>
                )}
              </div>
            ))}

            {acceptes.length>0&&(
              <div className="bg-blue-950/40 border border-blue-700/40 rounded-xl p-4">
                <p className="text-xs text-blue-300 font-semibold mb-2">📊 Bilan de la négociation</p>
                <p className="text-xs text-slate-300">✅ {acceptes.length} amendement{acceptes.length>1?'s':''} accepté{acceptes.length>1?'s':''} — <span className="text-emerald-400 font-bold">+{bonusVote}% sur le vote</span></p>
                {Object.keys(impacts).length>0&&<div className="flex flex-wrap gap-1.5 mt-2">{Object.entries(impacts).map(([k,v])=><span key={k} className={`text-xs font-bold ${v>0?'text-emerald-400':'text-red-400'}`}>{k.replace(/_/g,' ')} {v>0?'+':''}{v}</span>)}</div>}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-slate-950 border-t border-slate-800 px-5 py-4">
            <button onClick={()=>onLancerVote(bonusVote,acceptes,impacts)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm transition-colors shadow-lg shadow-blue-900/30">
              🗳️ Lancer le vote — {bonusVote>0?`+${bonusVote}% bonus`:'aucun bonus'}
              {amendements.some(a=>a.statut==='en_attente')&&<span className="ml-2 text-xs opacity-60">(amendements en attente)</span>}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function BarreProba({ pct_base, pct_bonus, bonusActif }) {
  const barRef=useRef(null); const prevRef=useRef(0); const ok=pct_bonus>50
  useEffect(()=>{ if(!barRef.current)return; anime({targets:barRef.current,width:[`${prevRef.current}%`,`${Math.min(100,pct_bonus)}%`],duration:700,easing:'easeOutExpo'}); prevRef.current=pct_bonus },[pct_bonus])
  useEffect(()=>{ if(!barRef.current)return; if(ok) anime({targets:barRef.current,opacity:[0.7,1,0.7],duration:1600,loop:true,easing:'easeInOutSine'}); else anime({targets:barRef.current,opacity:1,duration:200}) },[ok])
  return (
    <div className={`rounded-xl p-3 border ${ok?'bg-emerald-950/50 border-emerald-700/40':'bg-red-950/50 border-red-700/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">Probabilité de vote</span>
        <span className={`text-2xl font-black ${ok?'text-emerald-400':'text-red-400'}`}>{pct_bonus}%</span>
      </div>
      <div className="relative h-2.5 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div ref={barRef} className={`h-full rounded-full ${ok?'bg-emerald-500':'bg-red-500'}`} style={{width:'0%',transition:'none'}}/>
        <div className="absolute top-0 bottom-0 w-px bg-white/25" style={{left:'50%'}}/>
      </div>
      <div className="flex justify-between text-xs text-slate-600 mb-1"><span>0%</span><span>50% requis</span><span>100%</span></div>
      {bonusActif>0&&<div className="flex justify-between text-xs pt-2 border-t border-slate-700"><span className="text-slate-500">Base {pct_base}%</span><span className="text-emerald-400 font-bold">+{bonusActif}% bonus</span></div>}
      <p className={`text-xs mt-2 font-bold text-center ${ok?'text-emerald-400':'text-red-400'}`}>{ok?'✅ Passerait au vote':`❌ Manque ${Math.max(0,51-pct_bonus)}% — négociez des amendements`}</p>
    </div>
  )
}

function Dialog493({ open, onOpenChange, loi, onConfirmer, usage, usageMax }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"/>
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-slate-900 border border-red-700/60 rounded-2xl p-6 shadow-2xl">
          <Dialog.Title className="text-xl font-black text-red-400 mb-1">⚖️ Recours à l'Article 49.3</Dialog.Title>
          <Dialog.Description className="text-sm text-slate-400 mb-4">Forçage constitutionnel sans vote. Usage {usage+1}/{usageMax} ce mandat.</Dialog.Description>
          {loi&&<div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700"><div className="flex items-center gap-3 mb-2"><span className="text-2xl">{loi.emoji}</span><div><p className="font-bold text-white">{loi.titre}</p><p className="text-xs text-slate-400">{loi.bloc}</p></div></div><p className="text-xs text-slate-400">{loi.description}</p></div>}
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
            <Dialog.Close asChild><button className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">Annuler</button></Dialog.Close>
            <button onClick={onConfirmer} className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black transition-colors">⚖️ Forcer l'adoption</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CarteLoi({ loi, selectionnee, onClick, pct_bonus, pct_base, bonusActif, onOuvrirAmendements }) {
  const ref=useRef(null)
  useEffect(()=>{ if(!ref.current||!selectionnee)return; anime({targets:ref.current,translateY:[-6,0],opacity:[0.7,1],duration:300,easing:'easeOutBack'}) },[selectionnee])
  return (
    <div ref={ref} onClick={onClick} className={`rounded-xl border p-4 cursor-pointer transition-all ${selectionnee?'border-blue-500/70 bg-slate-700/80 shadow-lg shadow-blue-900/20':'border-slate-700/60 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{loi.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-white text-sm leading-tight">{loi.titre}</p>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{loi.bloc}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${pct_bonus>50?'bg-emerald-900/60 text-emerald-300':'bg-red-900/60 text-red-300'}`}>{pct_bonus}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{loi.description}</p>
        </div>
      </div>
      {selectionnee&&(
        <div className="mt-4 flex flex-col gap-3">
          <BarreProba pct_base={pct_base} pct_bonus={pct_bonus} bonusActif={bonusActif}/>
          {loi.impacts&&Object.keys(loi.impacts).length>0&&(
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Effets si adoptée</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(loi.impacts).map(([k,v])=>(
                  <div key={k} className="bg-slate-900 rounded-lg px-2 py-1.5 flex flex-col items-center">
                    <span className="text-slate-500" style={{fontSize:'9px'}}>{k.replace(/_/g,' ')}</span>
                    <span className={`text-xs font-bold ${['deficit_milliards','tension_sociale','inflation_pct'].includes(k)?v>0?'text-red-400':'text-emerald-400':v>0?'text-emerald-400':'text-red-400'}`}>{v>0?'+':''}{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-lg p-2">
              <p className="text-emerald-400 font-semibold mb-1.5">✅ Favorables</p>
              <div className="flex flex-wrap gap-1">{loi.partis_favorables?.map(p=><span key={p} className="bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded">{p}</span>)}{!loi.partis_favorables?.length&&<span className="text-slate-500">Aucun</span>}</div>
            </div>
            <div className="bg-red-950/40 border border-red-800/30 rounded-lg p-2">
              <p className="text-red-400 font-semibold mb-1.5">❌ Hostiles</p>
              <div className="flex flex-wrap gap-1">{loi.partis_hostiles?.map(p=><span key={p} className="bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">{p}</span>)}{!loi.partis_hostiles?.length&&<span className="text-slate-500">Aucun</span>}</div>
            </div>
          </div>
          {loi.evenements_secondaires?.length>0&&<div className="flex flex-wrap gap-1">{loi.evenements_secondaires.map((e,i)=><span key={i} className="text-xs bg-amber-950/40 text-amber-400 border border-amber-800/30 px-2 py-0.5 rounded">⚡ {e}</span>)}</div>}
          {loi.note&&<p className="text-xs text-blue-400/60 italic border-l-2 border-blue-700/40 pl-2">{loi.note}</p>}
          <button onClick={e=>{e.stopPropagation();onOuvrirAmendements(loi)}} className="w-full py-2.5 rounded-xl text-sm font-bold border border-amber-700/50 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 transition-all">
            📋 Négocier les amendements avant le vote
          </button>
        </div>
      )}
    </div>
  )
}

const COULEURS_LEVIER = { blue:'bg-blue-700 hover:bg-blue-600 border-blue-600', green:'bg-green-700 hover:bg-green-600 border-green-600', red:'bg-red-800 hover:bg-red-700 border-red-700', purple:'bg-purple-700 hover:bg-purple-600 border-purple-600' }

function CarteLevier({ levier, etatJeu, usage49_3, onAppliquer, loiCiblee }) {
  const bloque = levier.id==='art_49_3'&&usage49_3>=(levier.usage_max??3)
  const pasBudget = levier.cout_budget>0&&(etatJeu?.reserve_budgetaire_milliards??0)<levier.cout_budget
  const off = bloque||pasBudget
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${off?'border-slate-700/40 bg-slate-800/20 opacity-40':'border-slate-700 bg-slate-800/70 hover:border-slate-500'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levier.emoji}</span>
              <div><p className="font-semibold text-white text-xs">{levier.label}</p>{levier.secret&&<span className="text-xs text-purple-400">🔒 Secrète</span>}</div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {levier.cout_budget>0&&<span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">-{levier.cout_budget} Md€</span>}
              {levier.bonus_vote&&<span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">+{levier.bonus_vote}% vote</span>}
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{levier.description}</p>
          {levier.risque&&<p className="text-xs text-amber-600/80">⚠️ {levier.risque}</p>}
          {levier.id==='art_49_3'&&<p className="text-xs text-slate-600">Utilisé {usage49_3}/{levier.usage_max??3} fois</p>}
          <button disabled={off} onClick={()=>!off&&onAppliquer(levier)} className={`w-full py-1.5 rounded-lg text-white text-xs font-semibold border transition-all ${off?'bg-slate-700 border-slate-600 cursor-not-allowed':`${COULEURS_LEVIER[levier.couleur]??COULEURS_LEVIER.blue} border`}`}>
            {bloque?'🔒 Épuisé':pasBudget?'💸 Budget insuffisant':(levier.id==='art_49_3'||levier.id==='art_50_1')&&!loiCiblee?'← Sélectionnez une loi':'Appliquer'}
          </button>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="right" sideOffset={8} className="z-50 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-2 shadow-xl max-w-56">
          {levier.description}{levier.risque&&<p className="text-amber-400 mt-1">⚠️ {levier.risque}</p>}
          <Tooltip.Arrow className="fill-slate-600"/>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function Legislatif({ etatJeu, voterLoi }) {
  const [loiSel, setLoiSel]         = useState(null)
  const [usage493, setUsage493]     = useState(0)
  const [bonus, setBonus]           = useState(0)
  const [notifs, setNotifs]         = useState([])
  const [filtreBloc, setFiltreBloc] = useState('TOUS')
  const [open493, setOpen493]       = useState(false)
  const [openAmend, setOpenAmend]   = useState(false)
  const [loiAmend, setLoiAmend]     = useState(null)

  const loisDispo   = useMemo(()=>{ if(!etatJeu)return[]; try{return getLoisDisponibles(etatJeu)}catch{return[]} },[etatJeu])
  const loisAdoptees = useMemo(()=>{ const ids=etatJeu?.lois_votees??[]; const t=Object.values(CATALOGUE_LOIS).flat(); return ids.map(id=>t.find(l=>l.id===id)).filter(Boolean) },[etatJeu?.lois_votees])
  const loisFiltrees = useMemo(()=>{ if(filtreBloc==='TOUS')return loisDispo; return loisDispo.filter(l=>Object.entries(CATALOGUE_LOIS).find(([,arr])=>arr.some(x=>x.id===l.id))?.[0]===filtreBloc) },[loisDispo,filtreBloc])

  function notif(type,msg){ setNotifs([{type,msg}]); setTimeout(()=>setNotifs([]),5000) }

  function handleLancerVote(bonusTotal,accepts,impacts) {
    setOpenAmend(false); if(!loiAmend)return
    voterLoi(loiAmend.id,bonusTotal); setBonus(0); setLoiSel(null); setLoiAmend(null)
    const nb=accepts.length; notif('success',`🗳️ "${loiAmend.titre}" soumise au vote${nb>0?` avec ${nb} amendement${nb>1?'s':''} accepté${nb>1?'s':''}`:''}${bonusTotal>0?` (+${bonusTotal}%)`:''}`)
  }

  function appliquer(levier) {
    if(levier.id==='art_49_3'){if(!loiSel){notif('warning',"⚠️ Sélectionnez d'abord une loi.");return};setOpen493(true);return}
    if(levier.id==='art_50_1'){if(!loiSel){notif('warning',"⚠️ Sélectionnez une loi d'abord.");return};setBonus(b=>b+(levier.bonus_vote??8));notif('success',`🗣️ Débat ouvert. +${levier.bonus_vote}% de soutien.`);return}
    if(levier.bonus_vote)setBonus(b=>b+levier.bonus_vote)
    notif(levier.id==='lobbying_mediatique'?'warning':'success',{campagne_com:'📣 Campagne lancée.',negotiation_parti:'🤝 Négociation réussie — +15%.',lobbying_mediatique:'📺 Lobbying en cours.'}[levier.id]??'Levier appliqué.')
  }

  function confirmer493() {
    voterLoi(loiSel.id,100); setUsage493(u=>u+1); setOpen493(false); setLoiSel(null); setBonus(0)
    notif('danger',`⚖️ 49.3 activé — "${loiSel.titre}" forcée.`)
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <Dialog493 open={open493} onOpenChange={setOpen493} loi={loiSel} onConfirmer={confirmer493} usage={usage493} usageMax={3}/>
        <ModalAmendements open={openAmend} onOpenChange={setOpenAmend} loi={loiAmend} etatJeu={etatJeu} bonusVoteBase={bonus} onLancerVote={handleLancerVote}/>

        {notifs.map((n,i)=>(
          <div key={i} className={`rounded-lg px-4 py-3 text-sm font-medium ${n.type==='danger'?'bg-red-950/80 border border-red-700/50 text-red-200':n.type==='warning'?'bg-amber-950/80 border border-amber-700/50 text-amber-200':n.type==='success'?'bg-emerald-950/80 border border-emerald-700/50 text-emerald-200':'bg-blue-950/80 border border-blue-700/50 text-blue-200'}`}>{n.msg}</div>
        ))}

        <Tabs.Root defaultValue="catalogue">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <Tabs.List className="flex bg-slate-800 rounded-xl p-1 gap-1">
              {[{val:'catalogue',label:'📜 Catalogue',count:loisDispo.length},{val:'adoptees',label:'✅ Adoptées',count:loisAdoptees.length},{val:'leviers',label:'🎮 Leviers',count:null}].map(tab=>(
                <Tabs.Trigger key={tab.val} value={tab.val} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:text-white hover:bg-slate-700">
                  {tab.label}{tab.count!=null&&<span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-700 data-[state=active]:bg-blue-500">{tab.count}</span>}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <div className="flex gap-2 flex-wrap">
              {etatJeu&&[{l:'❤️',v:`${Math.round(etatJeu.popularite_joueur??42)}%`,d:(etatJeu.popularite_joueur??42)<30},{l:'🔥',v:`${Math.round(etatJeu.tension_sociale??45)}`,d:(etatJeu.tension_sociale??45)>70},{l:'🏦',v:`${etatJeu.reserve_budgetaire_milliards??0} Md€`,d:(etatJeu.reserve_budgetaire_milliards??0)<10}].map(({l,v,d})=>(
                <div key={l} className="bg-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5"><span className="text-xs text-slate-500">{l}</span><span className={`text-xs font-bold ${d?'text-red-400':'text-white'}`}>{v}</span></div>
              ))}
              {bonus>0&&<div className="bg-emerald-900/60 border border-emerald-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2"><span className="text-xs font-bold text-emerald-300">+{bonus}% bonus</span><button onClick={()=>setBonus(0)} className="text-emerald-600 hover:text-emerald-300 text-xs">✕</button></div>}
            </div>
          </div>

          <Tabs.Content value="catalogue" className="flex flex-col gap-4">
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={()=>setFiltreBloc('TOUS')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreBloc==='TOUS'?'bg-blue-600 text-white':'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>Tous ({loisDispo.length})</button>
              {Object.entries(BLOCS_META).map(([bloc,info])=>{ const count=loisDispo.filter(l=>Object.entries(CATALOGUE_LOIS).find(([,arr])=>arr.some(x=>x.id===l.id))?.[0]===bloc).length; if(!count)return null; return <button key={bloc} onClick={()=>setFiltreBloc(bloc)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtreBloc===bloc?'bg-blue-600 text-white':'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}>{info.emoji} {info.label} ({count})</button> })}
            </div>
            {loiSel&&<div className="bg-blue-950/40 border border-blue-700/40 rounded-lg px-4 py-2.5 flex items-center justify-between"><span className="text-xs text-blue-300">🎯 Loi ciblée : <strong>{loiSel.titre}</strong></span><button onClick={()=>setLoiSel(null)} className="text-slate-500 hover:text-white text-xs">✕</button></div>}
            {loisFiltrees.length===0?(
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-10 text-center"><p className="text-4xl mb-3">📋</p><p className="text-slate-400">Aucune loi disponible dans ce bloc.</p></div>
            ):loisFiltrees.map(loi=>{ const {pct_base,pct_bonus}=calculerProbaVoteLoi(loi.id,etatJeu,etatJeu?.hemicycle,bonus); return <CarteLoi key={loi.id} loi={loi} selectionnee={loiSel?.id===loi.id} onClick={()=>setLoiSel(loiSel?.id===loi.id?null:loi)} pct_bonus={pct_bonus} pct_base={pct_base} bonusActif={bonus} onOuvrirAmendements={loi=>{setLoiAmend(loi);setOpenAmend(true)}}/>})}
          </Tabs.Content>

          <Tabs.Content value="adoptees" className="flex flex-col gap-3">
            {loisAdoptees.length===0?(
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-10 text-center"><p className="text-4xl mb-3">📜</p><p className="text-slate-400">Aucune loi adoptée pour l'instant.</p></div>
            ):<>
              <p className="text-sm text-slate-400">{loisAdoptees.length} loi{loisAdoptees.length>1?'s':''} adoptée{loisAdoptees.length>1?'s':''} depuis le début du mandat</p>
              {loisAdoptees.map(loi=>(
                <div key={loi.id} className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{loi.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1"><p className="font-semibold text-white">{loi.titre}</p><span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">✅ Adoptée</span><span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{loi.bloc}</span></div>
                      <p className="text-xs text-slate-400">{loi.description}</p>
                      {loi.impacts&&<div className="flex flex-wrap gap-1 mt-2">{Object.entries(loi.impacts).map(([k,v])=><div key={k} className="bg-slate-900 rounded px-1.5 py-0.5 flex gap-1 items-center"><span className="text-slate-600" style={{fontSize:'9px'}}>{k.replace(/_/g,' ')}</span><span className={`text-xs font-bold ${v>0?'text-emerald-400':'text-red-400'}`}>{v>0?'+':''}{v}</span></div>)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </>}
          </Tabs.Content>

          <Tabs.Content value="leviers" className="flex flex-col gap-3">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 leading-relaxed">Les leviers augmentent la probabilité de vote. <strong className="text-slate-300">Sélectionnez une loi dans le Catalogue</strong> avant le 49.3 ou le 50.1.</p>
              {loiSel&&<p className="text-xs text-blue-300 mt-2">🎯 Loi ciblée : <strong>{loiSel.titre}</strong></p>}
            </div>
            {LEVIERS.map(lev=><CarteLevier key={lev.id} levier={lev} etatJeu={etatJeu} usage49_3={usage493} onAppliquer={appliquer} loiCiblee={loiSel}/>)}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mt-1">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-400 uppercase tracking-wide">Réserve budgétaire</span><span className="text-lg font-black text-white">{etatJeu?.reserve_budgetaire_milliards??0} <span className="text-sm text-slate-400">Md€</span></span></div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${Math.min(100,(etatJeu?.reserve_budgetaire_milliards??0)/1.5)}%`}}/></div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <div className="bg-slate-800/30 border border-yellow-900/30 rounded-lg px-4 py-2.5">
          <span className="text-xs text-yellow-600">💡 </span>
          <span className="text-xs text-slate-400">
            {(etatJeu?.popularite_joueur??42)<35?"Popularité trop basse. Lancez une campagne dans l'onglet Leviers avant de voter.":(etatJeu?.tension_sociale??45)>65?"Tensions élevées. Évitez le 49.3 — négociez des amendements.":bonus>0?`Bonus +${bonus}% actif — ouvrez une loi et négociez !`:loisAdoptees.length===0?"Cliquez sur une loi puis 'Négocier les amendements' pour rallier des partis.":loisAdoptees.length+" loi"+(loisAdoptees.length>1?"s":"")+" adoptée"+(loisAdoptees.length>1?"s":"")+". Continuez à réformer !"}
          </span>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
