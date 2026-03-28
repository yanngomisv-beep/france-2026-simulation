import { useState, useCallback } from 'react'
import { soumettreLoiAuVote, getLoisDisponibles, getLoi } from '../engines/moteur-legislatif.js'
import { tourIA }              from '../engines/moteur-ia-partis.js'
import { tourMoteurVNU }       from '../engines/moteur-vnu.js'
import { tourMoteurScandales } from '../engines/moteur-scandales.js'
import {
  getCurseursInitiaux,
  genererReformesTour,
  calculerCrisePotentielle,
  deplacerCurseur,
  AXES,
  getCouleurCurseur,
} from '../engines/moteur-curseurs.js'
import { getEtatInitialParti } from '../data/programmes-politiques.js'
import NotifReformes from './NotifReformes.jsx'

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const HEMICYCLE_INITIAL = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112, EPR: 98,
  LR: 62, PATRIOTES: 18, UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

const MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

const ETAT_SCANDALES_INITIAL = {
  dissimulation:               20,
  pression_mediatique:         15,
  stabilite_institutionnelle:  80,
  scandales_actifs:            [],
  actions_secretes_actives:    [],
  fuites_passees:              [],
  nouveau_president_assemblee: false,
  president_assemblee_parti:   'EPR',
  commissions_enquete_actives:  0,
  mises_en_examen:              0,
  procedure_art68_active:      false,
}

// ═══════════════════════════════════════════════════════════
// ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════

function getEtatBase(partiId) {
  const etatParti = getEtatInitialParti(partiId)
  return {
    // Politique
    popularite_joueur:             42,
    tension_sociale:               45,
    stabilite:                     58,
    deficit_milliards:            173,
    reserve_budgetaire_milliards:  28,
    relation_ue:                   20,
    inflation_pct:                2.8,
    pib_croissance_pct:           0.8,
    indice_confiance_marches:      50,
    consentement_impot:            55,
    date:                 '1er Mars 2026',
    tour:                           1,
    parti_joueur:              partiId,
    hemicycle:         { ...HEMICYCLE_INITIAL },
    lois_votees:                   [],
    // Énergie
    prix_baril:                    80,
    prix_baril_dollars:            80,
    prix_gaz:                      38,
    prix_gaz_mwh:                  38,
    prix_electricite:              72,
    prix_electricite_marche_mwh:   72,
    edf_rentable:                true,
    edf_dette_milliards:           54,
    avancement_epr2_pct:           12,
    recettes_vnu_milliards:         0,
    mer_rouge_fermee:           false,
    tensions_iran:              false,
    dependance_gaz_etranger_pct:   72,
    part_nucleaire_mix_pct:        68,
    part_renouvelable_mix_pct:     24,
    affectation_vnu: {
      bouclier_menages_pct:      0,
      subvention_industrie_pct:  0,
      remboursement_dette_pct:   0,
      financement_epr2_pct:      0,
      reserve_pct:             100,
    },
    // Scandales
    ...ETAT_SCANDALES_INITIAL,
    // Override avec données du parti choisi
    ...(etatParti ?? {}),
  }
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

export default function GameEngine({ partiJoueur, children }) {
  const [etatJeu, setEtatJeu]               = useState(() => getEtatBase(partiJoueur ?? 'HORIZONS'))
  const [curseurs, setCurseurs]             = useState(() => getCurseursInitiaux(partiJoueur ?? 'HORIZONS'))
  const [evenements, setEvenements]         = useState([])
  const [reformesTour, setReformesTour]     = useState([])
  const [crisesActives, setCrisesActives]   = useState([])
  const [crisesResolues, setCrisesResolues] = useState([])
  const [loading, setLoading]               = useState(false)

  // ── Passer un tour ──────────────────────────────────────
  const passerTour = useCallback(() => {
    setLoading(true)
    const evs = []

    setEtatJeu(prev => {
      let etat = { ...prev }

      // Moteur IA partis
      try {
        const r = tourIA(etat)
        if (r?.etat) etat = { ...etat, ...r.etat }
        if (r?.evenements?.length) evs.push(...r.evenements)
      } catch (e) { console.warn('[tourIA]', e.message) }

      // Moteur VNU énergétique
      try {
        const etatEnergie = {
          prix_baril_dollars:          etat.prix_baril_dollars          ?? 80,
          prix_gaz_mwh:                etat.prix_gaz_mwh                ?? 38,
          prix_electricite_marche_mwh: etat.prix_electricite_marche_mwh ?? 72,
          mer_rouge_fermee:            etat.mer_rouge_fermee             ?? false,
          tensions_iran:               etat.tensions_iran                ?? false,
          recettes_vnu_milliards:      etat.recettes_vnu_milliards       ?? 0,
          avancement_epr2_pct:         etat.avancement_epr2_pct          ?? 12,
          edf_rentable:                etat.edf_rentable                 ?? true,
        }
        const r = tourMoteurVNU(etatEnergie, etat, etat.affectation_vnu)
        if (r?.nouvelEtatEnergie)                etat = { ...etat, ...r.nouvelEtatEnergie }
        if (r?.resultat_affectation?.nouvelEtat) etat = { ...etat, ...r.resultat_affectation.nouvelEtat }
        if (r?.prix_electricite != null) {
          etat.prix_electricite            = r.prix_electricite
          etat.prix_electricite_marche_mwh = r.prix_electricite
        }
        if (r?.evenements_declenches?.length) {
          evs.push(...r.evenements_declenches.map(e => ({
            titre: e.titre,
            emoji: e.emoji ?? '⚡',
          })))
        }
      } catch (e) { console.warn('[tourMoteurVNU]', e.message) }

      // Moteur géopolitique — import dynamique ES compatible (pas de require)
      try {
        // Si moteur-geopolitique.js exporte tourGeopolitique ou tourMoteurGeopolitique
        // l'import est fait dynamiquement pour éviter les erreurs si le nom change
        void import('../engines/moteur-geopolitique.js').then(mod => {
          const fn = mod.tourGeopolitique ?? mod.tourMoteurGeopolitique ?? mod.default
          if (typeof fn === 'function') {
            setEtatJeu(current => {
              try {
                const r = fn(current)
                if (!r?.etat && !r?.evenements) return current
                return { ...current, ...(r.etat ?? {}) }
              } catch { return current }
            })
          }
        }).catch(() => {})
      } catch (e) { console.warn('[tourGeopolitique]', e.message) }

      // Moteur scandales
      try {
        const etatScandales = {
          dissimulation:               etat.dissimulation               ?? 20,
          pression_mediatique:         etat.pression_mediatique         ?? 15,
          consentement_impot:          etat.consentement_impot          ?? 55,
          stabilite_institutionnelle:  etat.stabilite_institutionnelle  ?? 80,
          scandales_actifs:            etat.scandales_actifs            ?? [],
          actions_secretes_actives:    etat.actions_secretes_actives    ?? [],
          nouveau_president_assemblee: etat.nouveau_president_assemblee ?? false,
          commissions_enquete_actives: etat.commissions_enquete_actives ?? 0,
        }
        const r = tourMoteurScandales(etatScandales, etat)
        if (r?.nouvelEtat)    etat = { ...etat, ...r.nouvelEtat }
        if (r?.nouvelEtatJeu) etat = { ...etat, ...r.nouvelEtatJeu }
        if (r?.nouveaux_scandales?.length) {
          evs.push(...r.nouveaux_scandales.map(s => ({
            titre: s.titre ?? s.nom,
            emoji: s.emoji ?? '🚨',
          })))
        }
        if (r?.evenements?.length) evs.push(...r.evenements)
      } catch (e) { console.warn('[tourMoteurScandales]', e.message) }

      // ── Dérive naturelle + dynamique économique ──
      const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v ?? 0))

      // Politique : érosion lente de la popularité et montée des tensions
      etat.popularite_joueur  = clamp((etat.popularite_joueur ?? 42) - 0.5, 0, 100)
      etat.tension_sociale    = clamp((etat.tension_sociale   ?? 45) + 0.4, 0, 100)
      etat.consentement_impot = clamp((etat.consentement_impot ?? 55) - 0.2, 0, 100)

      // Économie : interaction entre pib, inflation et confiance
      const pib    = etat.pib_croissance_pct ?? 0.8
      const inflat = etat.inflation_pct      ?? 2.8

      // Si croissance positive → légère amélioration des marchés
      etat.indice_confiance_marches = clamp(
        (etat.indice_confiance_marches ?? 50) + (pib > 0.5 ? 0.3 : pib < 0 ? -0.5 : 0),
        0, 100
      )

      // Inflation influence le consentement à l'impôt et la tension sociale
      if (inflat > 3.5) {
        etat.consentement_impot = clamp((etat.consentement_impot ?? 55) - 0.4, 0, 100)
        etat.tension_sociale    = clamp((etat.tension_sociale    ?? 45) + 0.3, 0, 100)
      } else if (inflat < 1.5) {
        etat.consentement_impot = clamp((etat.consentement_impot ?? 55) + 0.1, 0, 100)
      }

      // Déficit croissant si PIB faible
      if (pib < 0) {
        etat.deficit_milliards = Math.max(0, (etat.deficit_milliards ?? 173) + 1.5)
      } else if (pib > 1.5) {
        etat.deficit_milliards = Math.max(0, (etat.deficit_milliards ?? 173) - 0.8)
      }

      // Réserve diminue légèrement chaque tour (coûts de fonctionnement)
      etat.reserve_budgetaire_milliards = Math.max(0,
        (etat.reserve_budgetaire_milliards ?? 28) - 0.5
      )

      // Recalcul stabilité
      etat.stabilite = Math.round(clamp(
        (etat.popularite_joueur ?? 42)
          - ((etat.tension_sociale ?? 45) / 10)
          - (Math.max(0, -(etat.relation_ue ?? 20)) / 20),
        0, 100
      ))

      // Avancer la date
      const tourSuivant = (etat.tour ?? 1) + 1
      const idx = (tourSuivant - 1) % 12
      const an  = 2026 + Math.floor((tourSuivant - 1) / 12)
      etat.tour = tourSuivant
      etat.date = `1er ${MOIS[idx]} ${an}`

      return etat
    })

    setEvenements(evs)

    // Micro-réformes
    const reformes = genererReformesTour(curseurs)
    setReformesTour(reformes)

    // Crise potentielle
    setEtatJeu(prev => {
      const crise = calculerCrisePotentielle(curseurs, prev.tension_sociale ?? 45, crisesResolues)
      if (crise) setCrisesActives(c => [...c.filter(x => x.id !== crise.id), crise])
      return prev
    })

    setLoading(false)
  }, [curseurs, crisesResolues])

  // ── Voter une loi ───────────────────────────────────────
  const voterLoi = useCallback((loiId, bonusVote = 0) => {
    setEtatJeu(prev => {
      try {
        const res = soumettreLoiAuVote(loiId, prev, prev.hemicycle, bonusVote)
        if (!res) return prev
        return { ...prev, ...(res.etat ?? {}), lois_votees: res.lois_votees ?? prev.lois_votees }
      } catch (e) { console.warn('[voterLoi]', e.message); return prev }
    })
  }, [])

  // ── Appliquer une loi adoptée (impacts directs) ─────────
  const appliquerLoiAdoptee = useCallback((loiId, impactsDirects = null) => {
    setEtatJeu(prev => {
      try {
        // Pour les leviers (id commence par LEVIER_), pas de déduplication
        const estLevier = loiId.startsWith('LEVIER_')
        if (!estLevier && prev.lois_votees?.includes(loiId)) return prev

        let impacts = impactsDirects
        if (!impacts) {
          const loi = getLoi(loiId)
          if (!loi) return prev
          impacts = loi.impacts ?? {}
        }

        let etat = { ...prev }

        // Appliquer TOUS les impacts — même les clés pas encore dans l'état
        Object.entries(impacts).forEach(([cle, valeur]) => {
          if (typeof valeur !== 'number') return
          const actuel = etat[cle] ?? 0
          etat[cle] = Math.round((actuel + valeur) * 10) / 10
        })

        // Clamp des indicateurs clés
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v ?? 0))
        etat.popularite_joueur        = clamp(etat.popularite_joueur,        0,   100)
        etat.tension_sociale          = clamp(etat.tension_sociale,          0,   100)
        etat.stabilite                = clamp(etat.stabilite,                0,   100)
        etat.relation_ue              = clamp(etat.relation_ue,              -100, 100)
        etat.deficit_milliards        = Math.max(0, etat.deficit_milliards         ?? 173)
        etat.reserve_budgetaire_milliards = Math.max(0, etat.reserve_budgetaire_milliards ?? 28)
        etat.inflation_pct            = clamp(etat.inflation_pct,            -5,  20)
        etat.pib_croissance_pct       = clamp(etat.pib_croissance_pct,       -10, 10)
        etat.indice_confiance_marches = clamp(etat.indice_confiance_marches, 0,   100)
        etat.consentement_impot       = clamp(etat.consentement_impot,       0,   100)
        etat.pression_mediatique      = clamp(etat.pression_mediatique,      0,   100)
        etat.dissimulation            = clamp(etat.dissimulation,            0,   100)
        etat.prix_electricite         = Math.max(0, etat.prix_electricite          ?? 72)
        etat.prix_baril               = Math.max(0, etat.prix_baril                ?? 80)
        etat.prix_baril_dollars       = Math.max(0, etat.prix_baril_dollars        ?? 80)
        etat.avancement_epr2_pct      = clamp(etat.avancement_epr2_pct,     0,   100)

        // Recalcul stabilité si modifiée indirectement
        const greves = (etat.tension_sociale ?? 45) / 10
        const contraintesUE = Math.max(0, -(etat.relation_ue ?? 20)) / 20
        etat.stabilite = Math.round(clamp(
          (etat.popularite_joueur ?? 42) - greves - contraintesUE,
          0, 100
        ))

        if (!estLevier) {
          etat.lois_votees = [...(etat.lois_votees ?? []), loiId]
        }
        return etat
      } catch (e) { console.warn('[appliquerLoiAdoptee]', e.message); return prev }
    })
  }, [])

  // ── Résoudre une crise ──────────────────────────────────
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

  // ── Déplacer un curseur ─────────────────────────────────
  const deplacerCurseurJoueur = useCallback((axe, delta) => {
    setCurseurs(prev => deplacerCurseur(prev, axe, delta))
  }, [])

  // ── Barre de statut ─────────────────────────────────────
  const stats = [
    { label: '❤️ Popularité', val: `${Math.round(etatJeu.popularite_joueur ?? 42)}%`,
      color: (etatJeu.popularite_joueur ?? 42) > 40 ? 'text-green-400' : 'text-red-400' },
    { label: '⚡ Tension',    val: `${Math.round(etatJeu.tension_sociale ?? 45)}/100`,
      color: (etatJeu.tension_sociale ?? 45) > 60 ? 'text-red-400' : 'text-yellow-400' },
    { label: '💰 Déficit',    val: `${Math.round(etatJeu.deficit_milliards ?? 173)} Md€`,
      color: (etatJeu.deficit_milliards ?? 173) > 200 ? 'text-red-400' : 'text-slate-300' },
    { label: '🇪🇺 UE',        val: `${Math.round(etatJeu.relation_ue ?? 20)}/100`,
      color: (etatJeu.relation_ue ?? 20) < 10 ? 'text-red-400' : 'text-slate-300' },
    { label: '🛢️ Baril',      val: `${etatJeu.prix_baril_dollars ?? etatJeu.prix_baril ?? 80}$`,
      color: (etatJeu.prix_baril_dollars ?? 80) > 100 ? 'text-red-400' : 'text-slate-300' },
    { label: '⚡ Élec',       val: `${Math.round(etatJeu.prix_electricite ?? 72)}€/MWh`,
      color: (etatJeu.prix_electricite ?? 72) > 110 ? 'text-red-400' : 'text-slate-300' },
    { label: '📅',            val: `T${etatJeu.tour ?? 1} — ${etatJeu.date ?? 'Mars 2026'}`,
      color: 'text-slate-300' },
  ]

  const gameProps = {
    etatJeu,
    curseurs,
    passerTour,
    voterLoi,
    appliquerLoiAdoptee,
    resoudreCrise,
    deplacerCurseur:    deplacerCurseurJoueur,
    getLoisDisponibles: () => { try { return getLoisDisponibles(etatJeu) } catch { return [] } },
    evenements,
    loading,
  }

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">

      {/* Barre de statut */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-4 flex-wrap text-xs overflow-x-auto">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-slate-500">{s.label}</span>
            <span className={`font-bold ${s.color}`}>{s.val}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {Object.entries(AXES).map(([axe, info]) => (
            <div key={axe} className="flex items-center gap-1">
              <span className="text-slate-600 text-xs">{info.label}</span>
              <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${curseurs[axe] ?? 50}%`, backgroundColor: getCouleurCurseur(curseurs[axe] ?? 50) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-auto">
        {children(gameProps)}
      </div>

      {/* Barre du bas */}
      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap flex-1 overflow-hidden">
          {evenements.slice(0, 3).map((ev, i) => (
            <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded truncate max-w-xs">
              {ev.emoji ?? '📢'} {ev.titre ?? String(ev)}
            </span>
          ))}
        </div>
        <button onClick={passerTour} disabled={loading}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex-shrink-0 ${
            loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
          }`}>
          {loading ? '⏳ En cours...' : '⏭️ Tour suivant'}
        </button>
      </div>

      {/* Notifications */}
      <NotifReformes reformes={reformesTour} crises={crisesActives} onResoudreCrise={resoudreCrise} />
    </div>
  )
}
