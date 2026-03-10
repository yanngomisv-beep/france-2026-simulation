import { useState, useCallback, useRef, useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import anime from 'animejs'
import { soumettreLoiAuVote, getLoisDisponibles } from '../engines/moteur-legislatif.js'
import { tourIA }                  from '../engines/moteur-ia-partis.js'
import { tourMoteurVNU }           from '../engines/moteur-vnu.js'
import { tourMoteurGeopolitique }  from '../engines/moteur-geopolitique.js'
import {
  getCurseursInitiaux, genererReformesTour, calculerCrisePotentielle,
  deplacerCurseur, AXES, getCouleurCurseur,
} from '../engines/moteur-curseurs.js'
import { getEtatInitialParti } from '../data/programmes-politiques.js'
import NotifReformes from './NotifReformes.jsx'

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const HEMICYCLE_INITIAL = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112, EPR: 98,
  LR: 62, PATRIOTES: 18, UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

// Composition du Sénat 2026 — fixe par défaut, modifiable par événements
export const SENAT_INITIAL = {
  LR:     148,
  UC:      56, // Union Centriste (alliés LR)
  RDPI:    23, // Groupe Renaissance au Sénat
  INDEP:   16,
  SER:     64, // Socialistes et Républicains
  CRCE:    17, // Communistes
  GEST:    17, // Gauche environnement solidarités
  RN:       4,
  DIVERS:   1,
  total:  346,
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const ETAT_GEO_INITIAL = {
  tension_iran: 45, tension_russie: 62, tension_chine: 30, tension_usa: 15, tension_afrique_sahel: 58,
  mer_rouge_ouverte: true, jours_fermeture_mer_rouge: 0, cohesion_otan: 72, contribution_france_otan_pct: 2.1,
  relation_allemagne: 65, relation_usa: 55, relation_russie: -40, relation_chine: 20, relation_maroc: 30, relation_algerie: 15,
  taux_oat_10ans_pct: 3.2, spread_allemagne_pts: 65, notation_moodys: 'Aa2', notation_sp: 'AA-', prime_risque: 1.2,
  niveau_ingérence_russe: 35, niveau_ingérence_chinoise: 20, cyber_incidents_mois: 2, cyber_protection: 50,
  procedures_infraction: 0, amendes_ue_milliards: 0, conformite_pacte_stabilite: true, indice_souverainete: 58,
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS UI
// ─────────────────────────────────────────────────────────────

function StatTooltip({ children, content }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="bottom" sideOffset={6}
          className="z-50 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-2 shadow-xl max-w-52">
          {content}
          <Tooltip.Arrow className="fill-slate-600" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function AnimatedStat({ value, color, label, tooltip }) {
  const ref = useRef(null)
  const prevRef = useRef(value)
  useEffect(() => {
    if (!ref.current || prevRef.current === value) return
    anime({ targets: ref.current, scale: [1, 1.28, 1], duration: 380, easing: 'easeOutBack' })
    prevRef.current = value
  }, [value])
  return (
    <StatTooltip content={tooltip}>
      <div className="flex items-center gap-1.5 flex-shrink-0 cursor-default select-none">
        <span className="text-slate-500 text-xs">{label}</span>
        <span ref={ref} className={`font-bold text-xs ${color}`}>{value}</span>
      </div>
    </StatTooltip>
  )
}

function CurseurBar({ axe, info, valeur }) {
  const barRef = useRef(null)
  const prevRef = useRef(valeur)
  useEffect(() => {
    if (!barRef.current || prevRef.current === valeur) return
    anime({ targets: barRef.current, width: [`${prevRef.current}%`, `${valeur}%`], duration: 600, easing: 'easeOutExpo' })
    prevRef.current = valeur
  }, [valeur])
  return (
    <StatTooltip content={`${info.label} : ${valeur}/100`}>
      <div className="flex items-center gap-1 cursor-default">
        <span className="text-slate-600 text-xs">{info.label}</span>
        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div ref={barRef} className="h-full rounded-full"
            style={{ width: `${valeur}%`, backgroundColor: getCouleurCurseur(valeur), transition: 'none' }} />
        </div>
      </div>
    </StatTooltip>
  )
}

function BoutonTour({ onClick, loading }) {
  const ref = useRef(null)
  function handleClick() {
    if (!ref.current || loading) return
    anime({ targets: ref.current, scale: [1, 0.92, 1], duration: 200, easing: 'easeOutBack' })
    onClick()
  }
  useEffect(() => {
    if (loading || !ref.current) return
    const anim = anime({
      targets: ref.current,
      boxShadow: ['0 0 0px 0px rgba(59,130,246,0)', '0 0 16px 3px rgba(59,130,246,0.4)', '0 0 0px 0px rgba(59,130,246,0)'],
      duration: 2200, loop: true, easing: 'easeInOutSine',
    })
    return () => anim.pause()
  }, [loading])
  return (
    <button ref={ref} onClick={handleClick} disabled={loading}
      className={`px-6 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-colors ${
        loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
      }`}>
      {loading ? '⏳ En cours...' : '⏭️ Tour suivant'}
    </button>
  )
}

function TourFlash({ tour }) {
  const ref = useRef(null)
  const prev = useRef(tour)
  useEffect(() => {
    if (!ref.current || prev.current === tour) return
    anime({ targets: ref.current, opacity: [0, 0.15, 0], duration: 650, easing: 'easeOutExpo' })
    prev.current = tour
  }, [tour])
  return <div ref={ref} className="fixed inset-0 bg-blue-400 pointer-events-none z-40" style={{ opacity: 0 }} />
}

// ─────────────────────────────────────────────────────────────
// ÉTAT INITIAL
// ─────────────────────────────────────────────────────────────

function getEtatBase(partiId) {
  const etatParti = getEtatInitialParti(partiId)
  return {
    popularite_joueur: 42, tension_sociale: 45, deficit_milliards: 173, deficit_pib_pct: 5.5,
    stabilite: 58, reserve_budgetaire_milliards: 28, prix_baril: 80, prix_electricite: 72, prix_gaz: 38,
    relation_ue: 20, inflation_pct: 2.8, pib_croissance_pct: 0.8, indice_confiance_marches: 50,
    consentement_impot: 55, souverainete_energetique: 58, date: '1er Mars 2026', tour: 1,
    hemicycle: { ...HEMICYCLE_INITIAL },
    lois_votees: [],       // ← tableau des lois adoptées (catalogue + FabriqueLoi)
    scandales_actifs: [],
    dissimulation: 0, pression_mediatique: 0, parti_joueur: partiId,
    affectation_vnu: { bouclier_menages_pct: 0, subvention_industrie_pct: 0, remboursement_dette_pct: 0, financement_epr2_pct: 0, reserve_pct: 100 },
    prix_baril_dollars: 80, prix_gaz_mwh: 38, prix_electricite_marche_mwh: 72,
    edf_rentable: true, edf_dette_milliards: 54, avancement_epr2_pct: 12, recettes_vnu_milliards: 0,
    mer_rouge_fermee: false, tensions_iran: false, dependance_gaz_etranger_pct: 72,
    part_nucleaire_mix_pct: 68, part_renouvelable_mix_pct: 24,
    ...(etatParti ?? {}),
    lois_votees: [],       // ← forcé après le spread pour ne jamais être écrasé par etatParti
  }
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function GameEngine({ partiJoueur, children }) {
  const [etatJeu, setEtatJeu]               = useState(() => getEtatBase(partiJoueur ?? 'HORIZONS'))
  const [etatGeo, setEtatGeo]               = useState(() => ({ ...ETAT_GEO_INITIAL }))
  const [curseurs, setCurseurs]             = useState(() => getCurseursInitiaux(partiJoueur ?? 'HORIZONS'))
  const [senat, setSenat]                   = useState(() => ({ ...SENAT_INITIAL }))
  const [evenements, setEvenements]         = useState([])
  const [reformesTour, setReformesTour]     = useState([])
  const [crisesActives, setCrisesActives]   = useState([])
  const [crisesResolues, setCrisesResolues] = useState([])
  const [loading, setLoading]               = useState(false)

  // ── Passer un tour ─────────────────────────────────────────
  const passerTour = useCallback(() => {
    setLoading(true)
    const evs = []
    setEtatJeu(prev => {
      let etat = { ...prev }
      let geo  = { ...etatGeo }

      try {
        const r = tourIA(etat)
        if (r?.etat) etat = { ...etat, ...r.etat }
        if (r?.evenements?.length) evs.push(...r.evenements)
      } catch (e) { console.warn('tourIA:', e.message) }

      try {
        const etatEnergie = {
          prix_baril_dollars:          etat.prix_baril_dollars          ?? 80,
          prix_gaz_mwh:                etat.prix_gaz_mwh                ?? 38,
          prix_electricite_marche_mwh: etat.prix_electricite_marche_mwh ?? 72,
          mer_rouge_fermee:            etat.mer_rouge_fermee             ?? false,
          tensions_iran:               etat.tensions_iran                ?? false,
          edf_rentable:                etat.edf_rentable                 ?? true,
          edf_dette_milliards:         etat.edf_dette_milliards          ?? 54,
          avancement_epr2_pct:         etat.avancement_epr2_pct          ?? 12,
          recettes_vnu_milliards:      etat.recettes_vnu_milliards       ?? 0,
        }
        const r = tourMoteurVNU(etatEnergie, etat, etat.affectation_vnu)
        if (r?.resultat_affectation?.nouvelEtat) etat = { ...etat, ...r.resultat_affectation.nouvelEtat }
        if (r?.prix_electricite != null) {
          etat.prix_electricite              = r.prix_electricite
          etat.prix_electricite_marche_mwh   = r.prix_electricite
        }
        if (r?.evenements_declenches?.length)
          evs.push(...r.evenements_declenches.map(e => ({ titre: e.titre, emoji: e.emoji ?? '⚡' })))
      } catch (e) { console.warn('tourMoteurVNU:', e.message) }

      try {
        const r = tourMoteurGeopolitique(geo, etat)
        if (r?.nouvelEtatJeu) etat = { ...etat, ...r.nouvelEtatJeu }
        if (r?.nouvelEtatGeo) { geo = r.nouvelEtatGeo; setEtatGeo(geo) }
        if (r?.evenements_declenches?.length)
          evs.push(...r.evenements_declenches.map(e => ({ titre: e.titre, emoji: e.theatre_emoji ?? '🌍' })))
      } catch (e) { console.warn('tourMoteurGeopolitique:', e.message) }

      // Décréments automatiques
      etat.popularite_joueur = Math.max(0, Math.min(100, (etat.popularite_joueur ?? 42) - 0.5))
      etat.tension_sociale   = Math.max(0, Math.min(100, (etat.tension_sociale ?? 45)   + 0.3))
      etat.stabilite         = Math.max(0, Math.min(100, (etat.popularite_joueur ?? 42) - ((etat.tension_sociale ?? 45) / 10)))
      etat.deficit_pib_pct   = Math.round(((etat.deficit_milliards ?? 173) / 2800) * 100 * 10) / 10

      // Avancer le tour
      const tourSuivant = (etat.tour ?? 1) + 1
      etat.tour = tourSuivant
      etat.date = `1er ${MOIS[(tourSuivant - 1) % 12]} ${2026 + Math.floor((tourSuivant - 1) / 12)}`

      // Préserver lois_votees entre les tours
      etat.lois_votees = prev.lois_votees ?? []

      return etat
    })

    setEvenements(evs)
    setReformesTour(genererReformesTour(curseurs))
    setEtatJeu(prev => {
      const crise = calculerCrisePotentielle(curseurs, prev.tension_sociale ?? 45, crisesResolues)
      if (crise) setCrisesActives(c => [...c.filter(x => x.id !== crise.id), crise])
      return prev
    })

    setTimeout(() => setLoading(false), 100)
  }, [curseurs, crisesResolues, etatGeo])

  // ── Voter une loi ──────────────────────────────────────────
  const voterLoi = useCallback((loiId, bonusVote = 0, meta = {}) => {
    setEtatJeu(prev => {
      try {
        const res = soumettreLoiAuVote(loiId, prev, prev.hemicycle, bonusVote)
        if (!res?.etat) return prev

        const nouvelEtat = { ...res.etat }

        // Si la loi est adoptée, l'enregistrer dans lois_votees
        if (res.adopte !== false) {
          // Chercher les métadonnées dans le catalogue (lois standard)
          let loiMeta
          try {
            const catalogue = getLoisDisponibles(prev)
            loiMeta = catalogue.find(l => l.id === loiId)
          } catch { /* catalogue inaccessible */ }

          // Fallback pour les lois custom de la FabriqueLoi
          if (!loiMeta) {
            loiMeta = {
              id:    loiId,
              titre: meta.titre ?? loiId,
              bloc:  meta.bloc  ?? 'custom',
            }
          }

          const entree = {
            id:    loiMeta.id,
            titre: loiMeta.titre ?? loiMeta.id,
            bloc:  loiMeta.bloc  ?? 'custom',
            tour:  prev.tour,
            date:  prev.date,
            // Métadonnées constitutionnelles si passage en force
            ...(meta.voie_constitutionnelle ? { voie_constitutionnelle: meta.voie_constitutionnelle } : {}),
            ...(meta.risque_fin_partie       ? { risque_fin_partie: true }                           : {}),
          }

          nouvelEtat.lois_votees = [...(prev.lois_votees ?? []), entree]
        } else {
          // Loi rejetée — on préserve lois_votees sans rien ajouter
          nouvelEtat.lois_votees = prev.lois_votees ?? []
        }

        return nouvelEtat
      } catch (e) {
        console.warn('voterLoi:', e.message)
        return prev
      }
    })
  }, [])

  // ── Résoudre une crise ─────────────────────────────────────
  const resoudreCrise = useCallback((crise) => {
    setEtatJeu(prev => {
      let e = { ...prev }
      Object.entries(crise.impacts ?? {}).forEach(([k, v]) => {
        e[k] = Math.max(-9999, Math.min(9999, (e[k] ?? 0) + v))
      })
      return e
    })
    setCrisesActives(c => c.filter(x => x.id !== crise.id))
    setCrisesResolues(r => [...r, crise.id])
  }, [])

  // ── Déplacer un curseur ────────────────────────────────────
  const deplacerCurseurJoueur = useCallback((axe, delta) => {
    setCurseurs(prev => deplacerCurseur(prev, axe, delta))
  }, [])

  // ── Stats barre du haut ────────────────────────────────────
  const stats = [
    { label: '❤️',  val: `${Math.round(etatJeu.popularite_joueur ?? 42)}%`,        color: (etatJeu.popularite_joueur ?? 42) > 40    ? 'text-emerald-400' : 'text-red-400',   tooltip: 'Popularité du gouvernement. En dessous de 30%, risque de motion de censure.' },
    { label: '🔥',  val: `${Math.round(etatJeu.tension_sociale ?? 45)}/100`,        color: (etatJeu.tension_sociale ?? 45) > 60       ? 'text-red-400'     : 'text-amber-400', tooltip: 'Tension sociale. Au-delà de 70 : grève générale possible.' },
    { label: '💰',  val: `${Math.round(etatJeu.deficit_milliards ?? 173)} Md€`,     color: (etatJeu.deficit_milliards ?? 173) > 200   ? 'text-red-400'     : 'text-slate-300', tooltip: 'Déficit budgétaire annuel. Bruxelles exige un retour sous 5% du PIB.' },
    { label: '📊',  val: `${etatJeu.deficit_pib_pct ?? 5.5}%`,                      color: (etatJeu.deficit_pib_pct ?? 5.5) > 5       ? 'text-red-400'     : 'text-emerald-400', tooltip: 'Déficit / PIB. Seuil UE : 5%. Au-delà, procédure de sanction.' },
    { label: '🇪🇺', val: `${Math.round(etatJeu.relation_ue ?? 20)}`,                color: (etatJeu.relation_ue ?? 20) < 0            ? 'text-red-400'     : 'text-slate-300', tooltip: "Relations avec Bruxelles. En dessous de 0 : procédure d'infraction possible." },
    { label: '🛢️', val: `${etatJeu.prix_baril_dollars ?? 80}$`,                    color: (etatJeu.prix_baril_dollars ?? 80) > 100   ? 'text-red-400'     : 'text-slate-300', tooltip: "Prix du baril. Impact direct sur l'inflation." },
    { label: '⚡',  val: `${Math.round(etatJeu.prix_electricite ?? 72)}€`,          color: (etatJeu.prix_electricite ?? 72) > 110     ? 'text-red-400'     : 'text-slate-300', tooltip: "Prix de l'électricité. VNU activé au-dessus de 110€/MWh." },
    { label: '📅',  val: `T${etatJeu.tour ?? 1} — ${etatJeu.date ?? 'Mars 2026'}`, color: 'text-slate-400',                                                                    tooltip: 'Tour actuel et date.' },
  ]

  // ── Props transmises aux enfants ───────────────────────────
  const gameProps = {
    etatJeu,
    etatGeo,
    curseurs,
    senat,           // ← composition du Sénat
    setSenat,        // ← pour les événements qui font évoluer le Sénat
    passerTour,
    voterLoi,
    resoudreCrise,
    deplacerCurseur: deplacerCurseurJoueur,
    getLoisDisponibles: () => { try { return getLoisDisponibles(etatJeu) } catch { return [] } },
    evenements,
    loading,
  }

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="bg-slate-950 text-white min-h-screen flex flex-col">
        <TourFlash tour={etatJeu.tour} />

        {/* Barre de stats */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-4 flex-wrap text-xs overflow-x-auto">
          {stats.map(s => (
            <AnimatedStat key={s.label + s.val} value={s.val} color={s.color} label={s.label} tooltip={s.tooltip} />
          ))}
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {Object.entries(AXES).map(([axe, info]) => (
              <CurseurBar key={axe} axe={axe} info={info} valeur={curseurs[axe] ?? 50} />
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-4 overflow-auto">{children(gameProps)}</div>

        {/* Barre du bas */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap flex-1 overflow-hidden">
            {evenements.slice(0, 3).map((ev, i) => (
              <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded truncate max-w-xs">
                {ev.emoji ?? '📢'} {ev.titre ?? String(ev)}
              </span>
            ))}
          </div>
          <BoutonTour onClick={passerTour} loading={loading} />
        </div>

        <NotifReformes reformes={reformesTour} crises={crisesActives} onResoudreCrise={resoudreCrise} />
      </div>
    </Tooltip.Provider>
  )
}
