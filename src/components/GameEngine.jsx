import { useState, useCallback, useEffect } from 'react'

// Import des moteurs
import { tourMoteurVNU, ETAT_ENERGIE_INITIAL, calculerPrixElectricite } from '../engines/moteur-vnu.js'
import { tourMoteurGeopolitique, ETAT_GEO_INITIAL } from '../engines/moteur-geopolitique.js'
import { tourMoteurScandales, ETAT_SCANDALES_INITIAL, executerActionSecrete, appliquerStrategieGestion } from '../engines/moteur-scandales.js'
import { tourIA, PROFILS_PARTIS } from '../engines/moteur-ia-partis.js'
import { soumettreLoiAuVote } from '../engines/moteur-legislatif.js'

// ─────────────────────────────────────────────────────────────
// ÉTAT GLOBAL INITIAL
// ─────────────────────────────────────────────────────────────

const HEMICYCLE_INITIAL = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112,
  EPR: 98, LR: 62, PATRIOTES: 18,
  UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

const ETAT_JEU_INITIAL = {
  // Calendrier
  tour_actuel: 0,
  date: "1er Mars 2026",
  mois: 3,
  annee: 2026,

  // Politique
  popularite_joueur: 42,
  stabilite: 58,
  parti_joueur: null,
  premier_ministre: null,
  lois_votees: [],

  // Économie
  pib_croissance_pct: 0.9,
  inflation_pct: 2.8,
  deficit_milliards: 173,
  deficit_pib_pct: 4.9,
  dette_pib_pct: 112.4,
  reserve_budgetaire_milliards: 28,
  indice_confiance_marches: 62,

  // Social
  tension_sociale: 45,
  consentement_impot: 75,
  stabilite_institutionnelle: 80,

  // Énergie
  prix_baril: 80,
  cyber_protection: 35,
  souverainete_energetique: 55,

  // Diplomatie
  relation_ue: 20,
  dissimulation: 20,
  pression_mediatique: 15,

  // Scandales
  scandale_actif: false,

  // Hémicycle
  hemicycle: HEMICYCLE_INITIAL,

  // Popularité par bloc
  popularite_par_bloc: {
    GAUCHE: 48,
    CENTRE: 35,
    DROITE: 22,
    EXTREME_DROITE: 18,
  },
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────

const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

function calculerDate(tour) {
  const moisDepart = 3
  const anneeDepart = 2026
  const moisTotal = moisDepart + tour - 1
  const mois = ((moisTotal - 1) % 12) + 1
  const annee = anneeDepart + Math.floor((moisTotal - 1) / 12)
  return { mois, annee, label: `${MOIS_FR[mois - 1]} ${annee}` }
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val))
}

// ─────────────────────────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────────────────────────

function BadgeEvenement({ evt, onDismiss }) {
  const couleurs = {
    danger:  "bg-red-900 border-red-700 text-red-200",
    warning: "bg-yellow-900 border-yellow-700 text-yellow-200",
    info:    "bg-blue-900 border-blue-700 text-blue-200",
    success: "bg-green-900 border-green-700 text-green-200",
  }
  const bg = couleurs[evt.niveau ?? 'info']

  return (
    <div className={`rounded-lg border p-3 flex items-start gap-3 ${bg}`}>
      <span className="text-xl flex-shrink-0">{evt.emoji ?? '📌'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{evt.titre}</p>
        {evt.message && <p className="text-xs mt-0.5 opacity-80">{evt.message}</p>}
        {evt.theatre && <p className="text-xs mt-1 opacity-60">📍 {evt.theatre}</p>}
      </div>
      <button onClick={onDismiss} className="text-xs opacity-50 hover:opacity-100 flex-shrink-0">✕</button>
    </div>
  )
}

function JaugeIndicateur({ label, valeur, max = 100, inverse = false, unite = '%' }) {
  const pct = Math.round((valeur / max) * 100)
  const danger = inverse ? pct > 66 : pct < 33
  const warning = inverse ? pct > 33 : pct < 66
  const bg = danger ? 'bg-red-500' : warning ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{valeur}{unite}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${bg}`}
          style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  )
}

function PanneauIA({ reactionsIA, onDismiss }) {
  if (!reactionsIA || reactionsIA.length === 0) return null

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        ⚡ Réactions des partis adverses
      </h3>
      {reactionsIA.map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span>{r.emoji}</span>
          <div>
            <span className="font-semibold text-white">{r.nom_parti}</span>
            <span className="text-slate-400"> — {r.label}</span>
            {r.message && <p className="text-xs text-slate-500 mt-0.5">{r.message}</p>}
          </div>
        </div>
      ))}
      <button onClick={onDismiss}
        className="text-xs text-slate-500 hover:text-white self-end">
        Fermer
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GAME ENGINE PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function GameEngine({ children }) {
  const [etatJeu, setEtatJeu] = useState(ETAT_JEU_INITIAL)
  const [etatEnergie, setEtatEnergie] = useState(ETAT_ENERGIE_INITIAL)
  const [etatGeo, setEtatGeo] = useState(ETAT_GEO_INITIAL)
  const [etatScandales, setEtatScandales] = useState(ETAT_SCANDALES_INITIAL)

  const [evenements, setEvenements] = useState([])
  const [reactionsIA, setReactionsIA] = useState([])
  const [journal, setJournal] = useState([])
  const [affectation_vnu, setAffectationVNU] = useState({
    bouclier_menages: 50,
    remboursement_dette: 30,
    reserve_crise: 20,
  })

  // ── Avancer d'un tour ──────────────────────────────────────
  const passerTour = useCallback(() => {
    const nouveauxEvenements = []

    // 1. Moteur VNU
    const resultVNU = tourMoteurVNU(etatEnergie, etatJeu, affectation_vnu)
    setEtatEnergie(resultVNU.nouvelEtatEnergie)
    if (resultVNU.evenements_declenches.length > 0) {
      resultVNU.evenements_declenches.forEach(e => nouveauxEvenements.push({
        ...e, niveau: 'warning',
      }))
    }
    if (resultVNU.sante_edf.alerte) {
      nouveauxEvenements.push({
        ...resultVNU.sante_edf.alerte,
        titre: resultVNU.sante_edf.alerte.message,
        emoji: resultVNU.sante_edf.alerte.emoji,
      })
    }

    // 2. Moteur Géopolitique
    const resultGeo = tourMoteurGeopolitique(etatGeo, etatJeu)
    setEtatGeo(resultGeo.nouvelEtatGeo)
    resultGeo.evenements_declenches.forEach(e => nouveauxEvenements.push({
      ...e, niveau: e.impacts?.popularite_joueur < -10 ? 'danger' : 'warning',
    }))

    // 3. Moteur Scandales
    const resultScandales = tourMoteurScandales(etatScandales, etatJeu)
    setEtatScandales(resultScandales.nouvelEtat)
    resultScandales.nouveaux_scandales.forEach(s => nouveauxEvenements.push({
      ...s, niveau: 'danger',
    }))

    // 4. Moteur IA Partis (initiatives spontanées)
    const resultIA = tourIA(null, etatJeu, etatJeu.hemicycle)
    if (resultIA.initiatives.length > 0) {
      setReactionsIA(resultIA.initiatives)
    }

    // 5. Fusionner tous les impacts sur l'état du jeu
    let nouvelEtat = {
      ...etatJeu,
      ...resultVNU.resultat_affectation?.nouvelEtat,
      ...resultGeo.nouvelEtatJeu,
      ...resultScandales.nouvelEtatJeu,
    }

    // Appliquer impacts des initiatives IA
    for (const initiative of resultIA.initiatives) {
      for (const [ind, val] of Object.entries(initiative.impact ?? {})) {
        if (ind in nouvelEtat) {
          nouvelEtat[ind] = clamp(nouvelEtat[ind] + val)
        }
      }
    }

    // Avancer le calendrier
    const tourSuivant = etatJeu.tour_actuel + 1
    const dateCalc = calculerDate(tourSuivant)
    nouvelEtat.tour_actuel = tourSuivant
    nouvelEtat.date = dateCalc.label
    nouvelEtat.mois = dateCalc.mois
    nouvelEtat.annee = dateCalc.annee

    // Recalculer stabilité : S = P - (G + R_ue)
    const greves = nouvelEtat.tension_sociale / 10
    const contraintesUE = Math.max(0, -nouvelEtat.relation_ue) / 20
    nouvelEtat.stabilite = clamp(Math.round(
      nouvelEtat.popularite_joueur - greves - contraintesUE
    ))

    // Synchroniser prix baril
    nouvelEtat.prix_baril = resultVNU.nouvelEtatEnergie.prix_baril_dollars

    setEtatJeu(nouvelEtat)
    setEvenements(prev => [...nouveauxEvenements, ...prev].slice(0, 10))

    // Journal
    setJournal(prev => [{
      tour: tourSuivant,
      date: dateCalc.label,
      evenements: nouveauxEvenements.length,
      stabilite: nouvelEtat.stabilite,
      popularite: nouvelEtat.popularite_joueur,
    }, ...prev].slice(0, 20))

  }, [etatJeu, etatEnergie, etatGeo, etatScandales, affectation_vnu])

  // ── Voter une loi ──────────────────────────────────────────
  const voterLoi = useCallback((loiId) => {
    try {
      const resultat = soumettreLoiAuVote(loiId, etatJeu, etatJeu.hemicycle)

      if (resultat.nouvel_etat) {
        // Réactions IA suite au vote
        const resultIA = tourIA(loiId, etatJeu, etatJeu.hemicycle)
        setReactionsIA(resultIA.reactions)

        // Appliquer impacts IA
        let nouvelEtat = { ...resultat.nouvel_etat }
        for (const reaction of resultIA.reactions) {
          for (const [ind, val] of Object.entries(reaction.impact ?? {})) {
            if (ind in nouvelEtat) nouvelEtat[ind] = clamp(nouvelEtat[ind] + val)
          }
        }

        // Enregistrer la loi votée
        nouvelEtat.lois_votees = [...(etatJeu.lois_votees ?? []), loiId]

        setEtatJeu(nouvelEtat)
        setEvenements(prev => [{
          titre: `✅ ${loiId} adoptée`,
          emoji: '📜',
          message: resultat.resume,
          niveau: 'success',
        }, ...prev].slice(0, 10))
      } else {
        setEvenements(prev => [{
          titre: `❌ Loi rejetée`,
          emoji: '📜',
          message: resultat.alertes?.[0]?.message ?? "Vote insuffisant",
          niveau: 'warning',
        }, ...prev].slice(0, 10))
      }
    } catch (e) {
      console.error(e)
    }
  }, [etatJeu])

  // ── Action secrète ─────────────────────────────────────────
  const executerSecret = useCallback((actionId) => {
    const result = executerActionSecrete(actionId, etatScandales, etatJeu)
    setEtatScandales(result.nouvelEtat)
    setEtatJeu(result.nouvelEtatJeu)
    setEvenements(prev => [{
      titre: result.decouvert ? "⚠️ Action découverte !" : "🔒 Action secrète exécutée",
      emoji: result.decouvert ? '🚨' : '🕵️',
      message: result.message,
      niveau: result.decouvert ? 'danger' : 'info',
    }, ...prev].slice(0, 10))
  }, [etatScandales, etatJeu])

  // ── Gérer un scandale ──────────────────────────────────────
  const gererScandale = useCallback((scandaleId, strategieId) => {
    const result = appliquerStrategieGestion(strategieId, scandaleId, etatScandales, etatJeu)
    setEtatScandales(result.nouvelEtat)
    setEtatJeu(result.nouvelEtatJeu)

    if (result.game_over) {
      setEvenements(prev => [{
        titre: "🚪 FIN DE PARTIE",
        emoji: '🚪',
        message: result.game_over_message,
        niveau: 'danger',
      }, ...prev])
    }
  }, [etatScandales, etatJeu])

  // ─────────────────────────────────────────────────────────
  // RENDU — Barre de statut globale + enfants
  // ─────────────────────────────────────────────────────────

  const prix_elec = calculerPrixElectricite(etatEnergie)

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Barre de statut globale ── */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">

          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Tour {etatJeu.tour_actuel}</span>
            <span className="text-sm font-bold text-white">{etatJeu.date}</span>
          </div>

          <JaugeIndicateur label="Popularité" valeur={etatJeu.popularite_joueur} />
          <JaugeIndicateur label="Stabilité" valeur={etatJeu.stabilite} />
          <JaugeIndicateur label="Tension sociale" valeur={etatJeu.tension_sociale} inverse />
          <JaugeIndicateur label="Déficit" valeur={etatJeu.deficit_milliards} max={300} inverse unite=" Md€" />
          <JaugeIndicateur label="Marchés" valeur={etatJeu.indice_confiance_marches} />
          <JaugeIndicateur label="Relations UE" valeur={etatJeu.relation_ue + 100} max={200} unite="" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Énergie</span>
            <span className="text-sm font-semibold text-yellow-400">
              ⚡ {prix_elec}€/MWh
            </span>
            <span className="text-xs text-slate-400">
              🛢️ {etatEnergie.prix_baril_dollars}$/b
            </span>
          </div>

        </div>
      </div>

      {/* ── Événements actifs ── */}
      {evenements.length > 0 && (
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-col gap-2">
            {evenements.slice(0, 3).map((evt, i) => (
              <BadgeEvenement
                key={i}
                evt={evt}
                onDismiss={() => setEvenements(prev => prev.filter((_, j) => j !== i))}
              />
            ))}
            {evenements.length > 3 && (
              <button
                onClick={() => setEvenements([])}
                className="text-xs text-slate-500 hover:text-white self-end">
                +{evenements.length - 3} autres — Tout effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Réactions IA ── */}
      {reactionsIA.length > 0 && (
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <PanneauIA
              reactionsIA={reactionsIA}
              onDismiss={() => setReactionsIA([])}
            />
          </div>
        </div>
      )}

      {/* ── Scandales actifs ── */}
      {etatScandales.scandales_actifs.length > 0 && (
        <div className="px-6 py-3 bg-red-950 border-b border-red-900">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
            <span className="text-red-400 font-semibold text-sm">
              🚨 {etatScandales.scandales_actifs.length} scandale(s) actif(s) :
            </span>
            {etatScandales.scandales_actifs.map(s => (
              <span key={s.id} className="bg-red-900 text-red-200 text-xs px-2 py-1 rounded">
                {s.emoji} {s.titre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Contenu principal (children reçoivent les props) ── */}
      <main className="flex-1 p-6">
        {children({
          etatJeu,
          etatEnergie,
          etatGeo,
          etatScandales,
          journal,
          affectation_vnu,
          setAffectationVNU,
          passerTour,
          voterLoi,
          executerSecret,
          gererScandale,
        })}
      </main>

      {/* ── Bouton Passer le Tour ── */}
      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {etatScandales.scandales_actifs.length > 0 && (
              <span className="text-red-400">⚠️ Gérez vos scandales avant de passer le tour</span>
            )}
          </div>
          <button
            onClick={passerTour}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm"
          >
            ⏭️ Passer au tour suivant — {calculerDate(etatJeu.tour_actuel + 1).label}
          </button>
        </div>
      </div>

    </div>
  )
}
