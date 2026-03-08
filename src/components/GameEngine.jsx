import { useState, useCallback } from 'react'
import { soumettreLoiAuVote, getLoisDisponibles } from '../engines/moteur-legislatif.js'
import { tourIA }             from '../engines/moteur-ia-partis.js'
import { tourMoteurVNU }      from '../engines/moteur-vnu.js'
import { tourGeopolitique }   from '../engines/moteur-geopolitique.js'
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

const HEMICYCLE_INITIAL = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112, EPR: 98,
  LR: 62, PATRIOTES: 18, UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

const MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
]

function getEtatBase(partiId) {
  const etatParti = getEtatInitialParti(partiId)
  return {
    popularite_joueur: 42,
    tension_sociale: 45,
    deficit_milliards: 173,
    stabilite: 58,
    reserve_budgetaire_milliards: 28,
    prix_baril: 80,
    prix_electricite: 72,
    prix_gaz: 38,
    relation_ue: 20,
    inflation_pct: 2.8,
    pib_croissance_pct: 0.8,
    indice_confiance_marches: 50,
    consentement_impot: 55,
    date: '1er Mars 2026',
    tour: 1,
    hemicycle: { ...HEMICYCLE_INITIAL },
    lois_votees: [],
    scandales_actifs: [],
    dissimulation: 0,
    pression_mediatique: 0,
    parti_joueur: partiId,
    affectation_vnu: {
      bouclier_menages_pct: 0,
      subvention_industrie_pct: 0,
      remboursement_dette_pct: 0,
      financement_epr2_pct: 0,
      reserve_pct: 100,
    },
    // Énergie
    prix_baril_dollars: 80,
    prix_gaz_mwh: 38,
    prix_electricite_marche_mwh: 72,
    edf_rentable: true,
    edf_dette_milliards: 54,
    avancement_epr2_pct: 12,
    recettes_vnu_milliards: 0,
    mer_rouge_fermee: false,
    tensions_iran: false,
    dependance_gaz_etranger_pct: 72,
    part_nucleaire_mix_pct: 68,
    part_renouvelable_mix_pct: 24,
    // Override avec données du parti
    ...(etatParti ?? {}),
  }
}

export default function GameEngine({ partiJoueur, children }) {
  const [etatJeu, setEtatJeu]           = useState(() => getEtatBase(partiJoueur ?? 'HORIZONS'))
  const [curseurs, setCurseurs]         = useState(() => getCurseursInitiaux(partiJoueur ?? 'HORIZONS'))
  const [evenements, setEvenements]     = useState([])
  const [reformesTour, setReformesTour] = useState([])
  const [crisesActives, setCrisesActives]   = useState([])
  const [crisesResolues, setCrisesResolues] = useState([])
  const [loading, setLoading]           = useState(false)

  // ── Passer un tour ───────────────────────────────────────
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
      } catch (e) { console.warn('tourIA:', e.message) }

      // Moteur VNU énergétique
      try {
        const r = tourMoteurVNU(etat, etat, etat.affectation_vnu)
        if (r?.resultat_affectation?.nouvelEtat) {
          etat = { ...etat, ...r.resultat_affectation.nouvelEtat }
        }
        if (r?.prix_electricite) etat.prix_electricite = r.prix_electricite
        if (r?.prix_electricite) etat.prix_electricite_marche_mwh = r.prix_electricite
        if (r?.evenements_declenches?.length) {
          evs.push(...r.evenements_declenches.map(e => ({ titre: e.titre, emoji: e.emoji })))
        }
      } catch (e) { console.warn('tourMoteurVNU:', e.message) }

      // Moteur géopolitique
      try {
        const r = tourGeopolitique(etat)
        if (r?.etat) etat = { ...etat, ...r.etat }
        if (r?.evenements?.length) evs.push(...r.evenements)
      } catch (e) { console.warn('tourGeopolitique:', e.message) }

      // Moteur scandales
      try {
  const r = tourMoteurScandales(etat)
  if (r?.etat) etat = { ...etat, ...r.etat }
  if (r?.evenements?.length) evs.push(...r.evenements)
} catch (e) { console.warn('tourMoteurScandales:', e.message) }

      // Dérive naturelle
      etat.popularite_joueur = Math.max(0, Math.min(100,
        (etat.popularite_joueur ?? 42) - 0.5
      ))
      etat.tension_sociale = Math.max(0, Math.min(100,
        (etat.tension_sociale ?? 45) + 0.3
      ))
      etat.stabilite = Math.max(0, Math.min(100,
        (etat.popularite_joueur ?? 42) - ((etat.tension_sociale ?? 45) / 10)
      ))

      // Tour suivant + date
      const tourSuivant = (etat.tour ?? 1) + 1
      const idx = (tourSuivant - 1) % 12
      const an  = 2026 + Math.floor((tourSuivant - 1) / 12)
      etat.tour = tourSuivant
      etat.date = `1er ${MOIS[idx]} ${an}`

      return etat
    })

    setEvenements(evs)

    // Micro-réformes automatiques selon curseurs
    const reformes = genererReformesTour(curseurs)
    setReformesTour(reformes)

    // Crise potentielle
    setEtatJeu(prev => {
      const crise = calculerCrisePotentielle(
        curseurs,
        prev.tension_sociale ?? 45,
        crisesResolues
      )
      if (crise) {
        setCrisesActives(c => [...c.filter(x => x.id !== crise.id), crise])
      }
      return prev
    })

    setLoading(false)
  }, [curseurs, crisesResolues])

  // ── Voter une loi ────────────────────────────────────────
  const voterLoi = useCallback((loiId, bonusVote = 0) => {
    setEtatJeu(prev => {
      try {
        const res = soumettreLoiAuVote(loiId, prev, prev.hemicycle, bonusVote)
        if (!res) return prev
        return {
          ...prev,
          ...(res.etat ?? {}),
          lois_votees: res.lois_votees ?? prev.lois_votees,
        }
      } catch (e) {
        console.warn('voterLoi:', e.message)
        return prev
      }
    })
  }, [])

  // ── Résoudre une crise ───────────────────────────────────
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

  // ── Déplacer un curseur ──────────────────────────────────
  const deplacerCurseurJoueur = useCallback((axe, delta) => {
    setCurseurs(prev => deplacerCurseur(prev, axe, delta))
  }, [])

  // ── Statistiques barre de statut ─────────────────────────
  const stats = [
    {
      label: '❤️ Popularité',
      val: `${Math.round(etatJeu.popularite_joueur ?? 42)}%`,
      color: (etatJeu.popularite_joueur ?? 42) > 40 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: '⚡ Tension',
      val: `${Math.round(etatJeu.tension_sociale ?? 45)}/100`,
      color: (etatJeu.tension_sociale ?? 45) > 60 ? 'text-red-400' : 'text-yellow-400',
    },
    {
      label: '💰 Déficit',
      val: `${Math.round(etatJeu.deficit_milliards ?? 173)} Md€`,
      color: (etatJeu.deficit_milliards ?? 173) > 200 ? 'text-red-400' : 'text-slate-300',
    },
    {
      label: '🇪🇺 UE',
      val: `${Math.round(etatJeu.relation_ue ?? 20)}/100`,
      color: (etatJeu.relation_ue ?? 20) < 20 ? 'text-red-400' : 'text-slate-300',
    },
    {
      label: '🛢️ Baril',
      val: `${etatJeu.prix_baril_dollars ?? etatJeu.prix_baril ?? 80}$`,
      color: (etatJeu.prix_baril_dollars ?? 80) > 100 ? 'text-red-400' : 'text-slate-300',
    },
    {
      label: '⚡ Élec',
      val: `${Math.round(etatJeu.prix_electricite ?? 72)}€/MWh`,
      color: (etatJeu.prix_electricite ?? 72) > 110 ? 'text-red-400' : 'text-slate-300',
    },
    {
      label: '📅',
      val: `T${etatJeu.tour ?? 1} — ${etatJeu.date ?? 'Mars 2026'}`,
      color: 'text-slate-300',
    },
  ]

  const gameProps = {
    etatJeu,
    curseurs,
    passerTour,
    voterLoi,
    resoudreCrise,
    deplacerCurseur: deplacerCurseurJoueur,
    getLoisDisponibles: () => {
      try { return getLoisDisponibles(etatJeu) } catch { return [] }
    },
    evenements,
    loading,
  }

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">

      {/* ── Barre de statut ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-4 flex-wrap text-xs overflow-x-auto">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-slate-500">{s.label}</span>
            <span className={`font-bold ${s.color}`}>{s.val}</span>
          </div>
        ))}

        {/* Curseurs en barre */}
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {Object.entries(AXES).map(([axe, info]) => (
            <div key={axe} className="flex items-center gap-1">
              <span className="text-slate-600 text-xs">{info.label}</span>
              <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${curseurs[axe] ?? 50}%`,
                    backgroundColor: getCouleurCurseur(curseurs[axe] ?? 50),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div className="flex-1 p-4 overflow-auto">
        {children(gameProps)}
      </div>

      {/* ── Barre du bas ── */}
      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap flex-1">
          {evenements.slice(0, 3).map((ev, i) => (
            <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded truncate max-w-xs">
              {ev.emoji ?? '📢'} {ev.titre ?? String(ev)}
            </span>
          ))}
        </div>
        <button
          onClick={passerTour}
          disabled={loading}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex-shrink-0 ${
            loading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
          }`}
        >
          {loading ? '⏳ En cours...' : '⏭️ Tour suivant'}
        </button>
      </div>

      {/* ── Notifications ── */}
      <NotifReformes
        reformes={reformesTour}
        crises={crisesActives}
        onResoudreCrise={resoudreCrise}
      />
    </div>
  )
}
