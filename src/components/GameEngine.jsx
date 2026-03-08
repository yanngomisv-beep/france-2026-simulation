import { useState, useCallback } from 'react'
import { soumettreLoiAuVote, getLoisDisponibles } from '../engines/moteur-legislatif.js'
import { tourIA, calculerReactionsIA }            from '../engines/moteur-ia-partis.js'
import { tourVNU }                                from '../engines/moteur-vnu.js'
import { tourGeopolitique }                       from '../engines/moteur-geopolitique.js'
import { tourScandales }                          from '../engines/moteur-scandales.js'
import {
  getCurseursInitiaux,
  genererReformesTour,
  calculerCrisePotentielle,
  deplacerCurseur,
  AXES,
  getCouleurCurseur,
  getLabelCurseur,
} from '../engines/moteur-curseurs.js'
import { getEtatInitialParti } from '../data/programmes-politiques.js'
import NotifReformes from './NotifReformes.jsx'

const HEMICYCLE_INITIAL = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112, EPR: 98,
  LR: 62, PATRIOTES: 18, UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

function getEtatBase(partiId) {
  const etatParti = getEtatInitialParti(partiId)
  return {
    ...(etatParti ?? {
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
      date: '1er Mars 2026',
      tour: 1,
    }),
    hemicycle: { ...HEMICYCLE_INITIAL },
    lois_votees: [],
    scandales_actifs: [],
    dissimulation: 0,
    pression_mediatique: 0,
    indice_confiance_marches: 50,
    consentement_impot: 55,
    parti_joueur: partiId,
  }
}

export default function GameEngine({ partiJoueur, children }) {
  const [etatJeu, setEtatJeu]   = useState(() => getEtatBase(partiJoueur ?? 'HORIZONS'))
  const [curseurs, setCurseurs] = useState(() => getCurseursInitiaux(partiJoueur ?? 'HORIZONS'))
  const [evenements, setEvenements]   = useState([])
  const [reformesTour, setReformesTour] = useState([])
  const [crisesActives, setCrisesActives] = useState([])
  const [crisesResolues, setCrisesResolues] = useState([])
  const [loading, setLoading]   = useState(false)

  // ── Passer un tour ───────────────────────────────────────
  const passerTour = useCallback(() => {
    setLoading(true)
    setEvenements([])

    setEtatJeu(prev => {
      let etat = { ...prev }
      const evs = []

      // Moteurs
      try { const r = tourIA(etat);          etat = r.etat ?? etat; evs.push(...(r.evenements ?? [])) } catch {}
      try { const r = tourVNU(etat);         etat = r.etat ?? etat; evs.push(...(r.evenements ?? [])) } catch {}
      try { const r = tourGeopolitique(etat);etat = r.etat ?? etat; evs.push(...(r.evenements ?? [])) } catch {}
      try { const r = tourScandales(etat);   etat = r.etat ?? etat; evs.push(...(r.evenements ?? [])) } catch {}

      // Dérive naturelle
      etat.popularite_joueur  = Math.max(0, Math.min(100, (etat.popularite_joueur ?? 42) - 0.5))
      etat.tension_sociale    = Math.max(0, Math.min(100, (etat.tension_sociale ?? 45) + 0.3))
      etat.stabilite          = Math.max(0, Math.min(100,
        (etat.popularite_joueur ?? 42) - ((etat.tension_sociale ?? 45) / 10)
      ))

      // Tour suivant
      etat.tour = (etat.tour ?? 1) + 1
      const mois = ['Janvier','Février','Mars','Avril','Mai','Juin',
                    'Juillet','Août','Septembre','Octobre','Novembre','Décembre']
      const idx  = ((etat.tour ?? 1) - 1) % 12
      const an   = 2026 + Math.floor(((etat.tour ?? 1) - 1) / 12)
      etat.date  = `1er ${mois[idx]} ${an}`

      setEvenements(evs)
      return etat
    })

    // Micro-réformes automatiques
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

  // ── Voter une loi ────────────────────────────────────────
  const voterLoi = useCallback((loiId, bonusVote = 0) => {
    setEtatJeu(prev => {
      const res = soumettreLoiAuVote(loiId, prev, prev.hemicycle, bonusVote)
      if (!res) return prev
      return { ...prev, ...res.etat, lois_votees: res.lois_votees ?? prev.lois_votees }
    })
  }, [])

  // ── Résoudre une crise ───────────────────────────────────
  const resoudreCrise = useCallback((crise) => {
    setEtatJeu(prev => {
      let e = { ...prev }
      Object.entries(crise.impacts).forEach(([k, v]) => {
        e[k] = Math.max(-999, Math.min(999, (e[k] ?? 0) + v))
      })
      return e
    })
    setCrisesActives(c => c.filter(x => x.id !== crise.id))
    setCrisesResolues(r => [...r, crise.id])
  }, [])

  // ── Déplacer un curseur manuellement ────────────────────
  const deplacerCurseurJoueur = useCallback((axe, delta) => {
    setCurseurs(prev => deplacerCurseur(prev, axe, delta))
  }, [])

  // ── Barre de statut ──────────────────────────────────────
  const stats = [
    { label: '❤️ Popularité', val: `${Math.round(etatJeu.popularite_joueur ?? 42)}%`,
      color: (etatJeu.popularite_joueur ?? 42) > 40 ? 'text-green-400' : 'text-red-400' },
    { label: '⚡ Tension',    val: `${Math.round(etatJeu.tension_sociale ?? 45)}/100`,
      color: (etatJeu.tension_sociale ?? 45) > 60 ? 'text-red-400' : 'text-yellow-400' },
    { label: '💰 Déficit',    val: `${etatJeu.deficit_milliards ?? 173} Md€`,
      color: (etatJeu.deficit_milliards ?? 173) > 200 ? 'text-red-400' : 'text-slate-300' },
    { label: '🇪🇺 UE',        val: `${etatJeu.relation_ue ?? 20}/100`,
      color: (etatJeu.relation_ue ?? 20) < 20 ? 'text-red-400' : 'text-slate-300' },
    { label: '🛢️ Baril',      val: `${etatJeu.prix_baril ?? 80}$`,
      color: (etatJeu.prix_baril ?? 80) > 100 ? 'text-red-400' : 'text-slate-300' },
    { label: '📅 Tour',       val: `${etatJeu.tour ?? 1} — ${etatJeu.date ?? 'Mars 2026'}`,
      color: 'text-slate-300' },
  ]

  const gameProps = {
    etatJeu,
    curseurs,
    passerTour,
    voterLoi,
    resoudreCrise,
    deplacerCurseur: deplacerCurseurJoueur,
    getLoisDisponibles: () => getLoisDisponibles(etatJeu),
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

        {/* Curseurs résumés */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {Object.entries(AXES).map(([axe, info]) => (
            <div key={axe} className="flex items-center gap-1">
              <span className="text-slate-600 text-xs">{info.label}</span>
              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${curseurs[axe] ?? 50}%`,
                    backgroundColor: getCouleurCurseur(curseurs[axe] ?? 50)
                  }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4">
        {children(gameProps)}
      </div>

      {/* Bouton passer au tour */}
      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {evenements.slice(0, 2).map((ev, i) => (
            <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
              {ev.titre ?? ev}
            </span>
          ))}
        </div>
        <button
          onClick={passerTour}
          disabled={loading}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex-shrink-0 ${
            loading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {loading ? '⏳ Traitement...' : '⏭️ Passer au tour suivant'}
        </button>
      </div>

      {/* Notifications réformes et crises */}
      <NotifReformes
        reformes={reformesTour}
        crises={crisesActives}
        onResoudreCrise={resoudreCrise}
      />
    </div>
  )
}
