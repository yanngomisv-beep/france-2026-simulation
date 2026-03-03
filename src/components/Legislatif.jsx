import { useState } from 'react'
import { getLoisDisponibles } from '../engines/moteur-legislatif.js'

// ─────────────────────────────────────────────────────────────
// LEVIERS POLITIQUES
// ─────────────────────────────────────────────────────────────

const LEVIERS = [
  {
    id: 'campagne_com',
    label: 'Campagne de communication',
    emoji: '📣',
    description: 'Dépensez du budget pour monter votre popularité avant de voter une loi.',
    cout_budget: 3,
    effet: { popularite_joueur: +5, tension_sociale: -3 },
    couleur: 'blue',
  },
  {
    id: 'negotiation_parti',
    label: 'Négociation inter-partis',
    emoji: '🤝',
    description: 'Cédez quelque chose à un parti pour obtenir son soutien sur la prochaine loi.',
    cout_budget: 1,
    effet: { popularite_joueur: -2, stabilite: +3 },
    bonus_vote: 15,
    risque: 'Fuite possible si le deal est trop visible.',
    couleur: 'green',
  },
  {
    id: 'art_50_1',
    label: 'Débat Article 50.1',
    emoji: '🗣️',
    description: "Ouvre un débat à l'Assemblée sans vote. Tâte le terrain, convainc des indécis. Aucune conséquence si ça tourne mal.",
    cout_budget: 0,
    effet: { stabilite: +2, tension_sociale: -3 },
    bonus_vote: 8,
    risque: null,
    couleur: 'green',
  },
  {
    id: 'art_49_3',
    label: 'Forçage Article 49.3',
    emoji: '⚖️',
    description: "Force le passage d'une loi sans vote. L'opinion publique française y est très allergique en 2026.",
    cout_budget: 0,
    effet: { stabilite: -20, tension_sociale: +18, popularite_joueur: -12 },
    force_adoption: true,
    risque: 'Motion de censure automatique probable. Colère sociale garantie. Limité à 3 fois.',
    couleur: 'red',
    usage_max: 3,
  },
  {
    id: 'lobbying_mediatique',
    label: 'Lobbying médiatique',
    emoji: '📺',
    description: 'Action secrète — placer des narratifs favorables dans les médias proches.',
    cout_budget: 2,
    effet: { popularite_joueur: +4, pression_mediatique: +8, dissimulation: +6 },
    bonus_vote: 10,
    risque: 'Augmente la dissimulation. Risque de scandale si découvert.',
    couleur: 'purple',
    secret: true,
  },
  {
    id: 'attendre',
    label: 'Passer un tour',
    emoji: '⏳',
    description: 'Laisser le temps jouer. La popularité monte naturellement si la situation est stable.',
    cout_budget: 0,
    effet: {},
    couleur: 'slate',
  },
]

const COULEURS = {
  blue:   { btn: 'bg-blue-700 hover:bg-blue-600 border-blue-600',       badge: 'bg-blue-900 text-blue-300' },
  green:  { btn: 'bg-green-700 hover:bg-green-600 border-green-600',    badge: 'bg-green-900 text-green-300' },
  red:    { btn: 'bg-red-700 hover:bg-red-600 border-red-600',          badge: 'bg-red-900 text-red-300' },
  purple: { btn: 'bg-purple-700 hover:bg-purple-600 border-purple-600', badge: 'bg-purple-900 text-purple-300' },
  slate:  { btn: 'bg-slate-600 hover:bg-slate-500 border-slate-500',    badge: 'bg-slate-800 text-slate-300' },
}

const HEMICYCLE_DEFAUT = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112,
  EPR: 98, LR: 62, PATRIOTES: 18,
  UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

// ─────────────────────────────────────────────────────────────
// CALCUL PROBABILITÉ DE VOTE
// ─────────────────────────────────────────────────────────────

function calculerProbaVote(loi, hemicycle, bonusVote = 0) {
  const h = hemicycle ?? HEMICYCLE_DEFAUT
  const total = Object.values(h).reduce((a, b) => a + b, 0)
  let pour = 0
  for (const [parti, sieges] of Object.entries(h)) {
    if (loi.partis_favorables?.includes(parti)) pour += sieges * 0.90
    else if (loi.partis_hostiles?.includes(parti)) pour += sieges * 0.05
    else pour += sieges * 0.35
  }
  const pct_base = Math.round((pour / total) * 100)
  const pct_bonus = Math.min(99, pct_base + bonusVote)
  return { pct_base, pct_bonus }
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function Delta({ valeur, unite = '', inverse = false }) {
  if (!valeur) return null
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-xs font-semibold ${positif ? 'text-green-400' : 'text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

function BarreProba({ pct_base, pct_bonus, bonusVoteActif }) {
  const passerait = pct_bonus > 50
  const manque = Math.max(0, 51 - pct_bonus)

  return (
    <div className={`rounded-lg p-3 border ${
      passerait ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">Probabilité de vote</span>
        <span className={`text-xl font-bold ${passerait ? 'text-green-400' : 'text-red-400'}`}>
          {pct_bonus}%
        </span>
      </div>

      {/* Barre */}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            passerait ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, pct_bonus)}%` }}
        />
        {/* Ligne seuil 50% */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white opacity-40"
          style={{ left: '50%' }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mb-2">
        <span>0%</span>
        <span>50% requis</span>
        <span>100%</span>
      </div>

      {/* Comparaison avant/après bonus */}
      {bonusVoteActif > 0 && (
        <>
          <div className="flex justify-between text-xs border-t border-slate-700 pt-2 mt-1">
            <span className="text-slate-500">Sans bonus</span>
            <span className="text-slate-400">{pct_base}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-green-500">Avec bonus</span>
            <span className="text-green-400 font-semibold">
              +{bonusVoteActif}% → {pct_bonus}%
            </span>
          </div>
        </>
      )}

      <p className={`text-xs mt-2 font-semibold text-center ${
        passerait ? 'text-green-400' : 'text-red-400'
      }`}>
        {passerait
          ? '✅ Cette loi passerait au vote'
          : `❌ Manque ${manque}% — utilisez un levier`}
      </p>
    </div>
  )
}

function CarteLevier({ levier, etatJeu, usage49_3, onAppliquer, loiCiblee }) {
  const bloque = levier.id === 'art_49_3' && usage49_3 >= (levier.usage_max ?? 3)
  const pasAssezBudget = levier.cout_budget > 0 &&
    (etatJeu?.reserve_budgetaire_milliards ?? 0) < levier.cout_budget
  const desactive = bloque || pasAssezBudget
  const c = COULEURS[levier.couleur]

  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${
      desactive
        ? 'border-slate-700 bg-slate-800 opacity-50'
        : 'border-slate-600 bg-slate-800 hover:border-slate-500'
    }`}>

      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{levier.emoji}</span>
          <div>
            <p className="font-semibold text-white text-xs">{levier.label}</p>
            {levier.secret && (
              <span className="text-xs text-purple-400">🔒 Secrète</span>
            )}
          </div>
        </div>
        {levier.cout_budget > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${c.badge}`}>
            -{levier.cout_budget} Md€
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">{levier.description}</p>

      {/* Effets */}
      <div className="flex flex-wrap gap-1">
        {Object.entries(levier.effet).map(([k, v]) => (
          <div key={k} className="bg-slate-900 rounded px-1.5 py-1 flex gap-1 items-center">
            <span className="text-slate-600" style={{ fontSize: '9px' }}>
              {k.replace(/_/g, ' ')}
            </span>
            <Delta
              valeur={v}
              unite={k === 'deficit_milliards' ? ' Md€' : '%'}
              inverse={['tension_sociale', 'dissimulation', 'pression_mediatique'].includes(k)}
            />
          </div>
        ))}
        {levier.bonus_vote && (
          <div className="bg-slate-900 rounded px-1.5 py-1 flex gap-1 items-center">
            <span className="text-slate-600" style={{ fontSize: '9px' }}>vote</span>
            <span className="text-xs font-semibold text-green-400">+{levier.bonus_vote}%</span>
          </div>
        )}
      </div>

      {/* Risque */}
      {levier.risque && (
        <p className="text-xs text-yellow-600">⚠️ {levier.risque}</p>
      )}

      {/* Compteur 49.3 */}
      {levier.id === 'art_49_3' && (
        <p className="text-xs text-slate-600">
          Utilisé : {usage49_3}/{levier.usage_max} fois ce mandat
        </p>
      )}

      {/* Bouton */}
      <button
        disabled={desactive}
        onClick={() => onAppliquer(levier)}
        className={`w-full py-1.5 rounded-lg text-white text-xs font-semibold border transition-colors ${
          desactive
            ? 'bg-slate-700 border-slate-600 cursor-not-allowed'
            : c.btn
        }`}
      >
        {bloque          ? '🔒 Épuisé' :
         pasAssezBudget  ? '💸 Budget insuffisant' :
         levier.id === 'attendre'   ? '⏭️ Passer le tour' :
         levier.id === 'art_49_3'  ? (loiCiblee ? `⚠️ Forcer "${loiCiblee.titre.substring(0, 20)}..."` : '⚠️ Sélectionnez une loi') :
         levier.id === 'art_50_1'  ? (loiCiblee ? `🗣️ Débattre de "${loiCiblee.titre.substring(0, 20)}..."` : '🗣️ Sélectionnez une loi') :
         'Appliquer'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function Legislatif({ etatJeu, voterLoi, passerTour }) {
  const [loiSelectionnee, setLoiSelectionnee] = useState(null)
  const [usage49_3, setUsage49_3] = useState(0)
  const [bonusVoteActif, setBonusVoteActif] = useState(0)
  const [notifications, setNotifications] = useState([])

  const loisDispo = etatJeu ? getLoisDisponibles(etatJeu) : []

  function afficherNotif(type, msg) {
    setNotifications([{ type, msg }])
    setTimeout(() => setNotifications([]), 4000)
  }

  // ── Appliquer un levier ──────────────────────────────────
  function appliquerLevier(levier) {

    // 49.3 — forçage
    if (levier.id === 'art_49_3') {
      if (!loiSelectionnee) {
        afficherNotif('warning', "⚠️ Sélectionnez d'abord une loi à forcer.")
        return
      }
      voterLoi(loiSelectionnee.id)
      setUsage49_3(u => u + 1)
      setLoiSelectionnee(null)
      afficherNotif('danger',
        `⚖️ 49.3 activé — "${loiSelectionnee.titre}" forcée. Motion de censure probable.`
      )
      return
    }

    // 50.1 — débat sans vote
    if (levier.id === 'art_50_1') {
      if (!loiSelectionnee) {
        afficherNotif('warning', "⚠️ Sélectionnez d'abord une loi à débattre.")
        return
      }
      setBonusVoteActif(b => b + (levier.bonus_vote ?? 8))
      afficherNotif('info',
        `🗣️ Débat ouvert sur "${loiSelectionnee.titre}". +8% de soutien gagné sans risque.`
      )
      return
    }

    // Passer un tour
    if (levier.id === 'attendre') {
      passerTour()
      afficherNotif('info', '⏳ Tour passé. La situation évolue...')
      return
    }

    // Autres leviers avec bonus vote
    if (levier.bonus_vote) {
      setBonusVoteActif(b => b + levier.bonus_vote)
    }

    const msgs = {
      campagne_com:        '📣 Campagne lancée. Popularité en hausse.',
      negotiation_parti:   '🤝 Négociation réussie. +15% de soutien sur la prochaine loi.',
      lobbying_mediatique: '📺 Lobbying en cours. +10% de soutien mais dissimulation augmentée.',
    }
    afficherNotif(
      levier.id === 'lobbying_mediatique' ? 'warning' : 'success',
      msgs[levier.id] ?? 'Levier appliqué.'
    )
  }

  // ── Voter une loi ────────────────────────────────────────
  function handleVoterLoi(loiId) {
    voterLoi(loiId)
    setBonusVoteActif(0)
    setLoiSelectionnee(null)
  }

  // ─────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">

      {/* ══ Panneau gauche — Leviers ══ */}
      <div className="xl:col-span-1 flex flex-col gap-3">

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            🎮 Leviers politiques
          </h2>
          {bonusVoteActif > 0 && (
            <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">
              +{bonusVoteActif}% actif
            </span>
          )}
        </div>

        {/* Notifications */}
        {notifications.map((n, i) => (
          <div key={i} className={`rounded-lg p-2.5 text-xs ${
            n.type === 'danger'  ? 'bg-red-900 text-red-200' :
            n.type === 'warning' ? 'bg-yellow-900 text-yellow-200' :
            n.type === 'success' ? 'bg-green-900 text-green-200' :
            'bg-blue-900 text-blue-200'
          }`}>
            {n.msg}
          </div>
        ))}

        {/* Loi ciblée */}
        {loiSelectionnee && (
          <div className="bg-slate-900 border border-blue-700 rounded-lg p-2.5">
            <p className="text-xs text-blue-400 font-semibold">🎯 Loi ciblée</p>
            <p className="text-xs text-white mt-0.5">{loiSelectionnee.titre}</p>
            <button
              onClick={() => setLoiSelectionnee(null)}
              className="text-xs text-slate-500 hover:text-white mt-1"
            >
              ✕ Désélectionner
            </button>
          </div>
        )}

        {/* Cartes leviers */}
        {LEVIERS.map(levier => (
          <CarteLevier
            key={levier.id}
            levier={levier}
            etatJeu={etatJeu}
            usage49_3={usage49_3}
            onAppliquer={appliquerLevier}
            loiCiblee={loiSelectionnee}
          />
        ))}

        {/* Budget */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">
            Budget disponible
          </h3>
          <p className="text-2xl font-bold text-white">
            {etatJeu?.reserve_budgetaire_milliards ?? 0}
            <span className="text-sm text-slate-400 ml-1">Md€</span>
          </p>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, etatJeu?.reserve_budgetaire_milliards ?? 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ══ Colonne centrale — Catalogue des lois ══ */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">📜 Propositions de loi</h2>

        {loisDispo.filter(l => !etatJeu?.lois_votees?.includes(l.id)).length === 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-500 text-sm">Aucune loi disponible.</p>
            <p className="text-slate-600 text-xs mt-1">
              Utilisez les leviers pour améliorer votre popularité.
            </p>
          </div>
        )}

        {loisDispo
          .filter(l => !etatJeu?.lois_votees?.includes(l.id))
          .map(loi => {
            const selectionnee = loiSelectionnee?.id === loi.id
            const { pct_base, pct_bonus } = calculerProbaVote(
              loi,
              etatJeu?.hemicycle,
              bonusVoteActif
            )

            return (
              <div
                key={loi.id}
                onClick={() => setLoiSelectionnee(selectionnee ? null : loi)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selectionnee
                    ? 'border-blue-500 bg-slate-700'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                }`}
              >
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{loi.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{loi.titre}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{loi.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-600 bg-slate-900 px-2 py-0.5 rounded">
                      {loi.bloc}
                    </span>
                    {/* Badge probabilité toujours visible */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      pct_bonus > 50
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {pct_bonus}%
                    </span>
                  </div>
                </div>

                {/* Détail si sélectionnée */}
                {selectionnee && (
                  <>
                    {/* Barre de probabilité */}
                    <div className="mt-4">
                      <BarreProba
                        pct_base={pct_base}
                        pct_bonus={pct_bonus}
                        bonusVoteActif={bonusVoteActif}
                      />
                    </div>

                    {/* Impacts */}
                    {loi.impacts && Object.keys(loi.impacts).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-600">
                        {Object.entries(loi.impacts).map(([k, v]) => (
                          <div key={k} className="bg-slate-900 rounded px-2 py-1.5 flex flex-col items-center">
                            <span className="text-slate-500" style={{ fontSize: '10px' }}>
                              {k.replace(/_/g, ' ')}
                            </span>
                            <Delta
                              valeur={v}
                              unite={k === 'deficit_milliards' ? ' Md€' : '%'}
                              inverse={['deficit_milliards', 'tension_sociale', 'inflation_pct'].includes(k)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Partis pour/contre */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-900/30 rounded p-2">
                        <p className="text-green-400 font-semibold mb-1">✅ Pour</p>
                        {loi.partis_favorables?.map(p => (
                          <span key={p} className="inline-block text-green-300 mr-1">{p}</span>
                        ))}
                      </div>
                      <div className="bg-red-900/30 rounded p-2">
                        <p className="text-red-400 font-semibold mb-1">❌ Contre</p>
                        {loi.partis_hostiles?.map(p => (
                          <span key={p} className="inline-block text-red-300 mr-1">{p}</span>
                        ))}
                      </div>
                    </div>

                    {/* Événements secondaires */}
                    {loi.evenements_secondaires?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {loi.evenements_secondaires.map((e, i) => (
                          <span key={i} className="text-xs bg-slate-900 text-yellow-400 px-2 py-0.5 rounded">
                            ⚡ {e}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bouton voter */}
                    <button
                      onClick={e => { e.stopPropagation(); handleVoterLoi(loi.id) }}
                      className={`mt-4 w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-colors ${
                        pct_bonus > 50
                          ? 'bg-blue-600 hover:bg-blue-500'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    >
                      🗳️ Soumettre au vote — {pct_bonus}%
                      {bonusVoteActif > 0 && (
                        <span className="ml-2 text-xs opacity-75">
                          (+{bonusVoteActif}% bonus)
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            )
          })}
      </div>

      {/* ══ Colonne droite — État + Conseil ══ */}
      <div className="xl:col-span-1 flex flex-col gap-4">

        {/* Indicateurs */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            État de la République
          </h3>
          {etatJeu && [
            { label: 'Popularité',      val: etatJeu.popularite_joueur,            unite: '%',    danger: etatJeu.popularite_joueur < 30 },
            { label: 'Stabilité',       val: etatJeu.stabilite,                    unite: '/100', danger: etatJeu.stabilite < 40 },
            { label: 'Déficit',         val: etatJeu.deficit_milliards,            unite: ' Md€', danger: etatJeu.deficit_milliards > 200 },
            { label: 'Inflation',       val: etatJeu.inflation_pct,                unite: '%',    danger: etatJeu.inflation_pct > 4 },
            { label: 'Tension sociale', val: etatJeu.tension_sociale,              unite: '/100', danger: etatJeu.tension_sociale > 70 },
            { label: 'Relations UE',    val: etatJeu.relation_ue,                  unite: '',     danger: etatJeu.relation_ue < -30 },
            { label: 'Marchés',         val: etatJeu.indice_confiance_marches,     unite: '/100', danger: etatJeu.indice_confiance_marches < 40 },
            { label: 'Dissimulation',   val: etatJeu.dissimulation,                unite: '/100', danger: etatJeu.dissimulation > 60 },
            { label: 'Réserve',         val: etatJeu.reserve_budgetaire_milliards, unite: ' Md€', danger: etatJeu.reserve_budgetaire_milliards < 10 },
          ].map(({ label, val, unite, danger }) => (
            <div key={label} className="flex justify-between text-sm items-center">
              <span className="text-slate-400">{label}</span>
              <span className={`font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>
                {val}{unite}
              </span>
            </div>
          ))}
        </div>

        {/* Lois adoptées */}
        {etatJeu?.lois_votees?.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
              ✅ Lois adoptées ({etatJeu.lois_votees.length})
            </h3>
            <div className="flex flex-col gap-1">
              {etatJeu.lois_votees.map(id => (
                <p key={id} className="text-xs text-green-400 py-1 border-b border-slate-700 last:border-0">
                  ✓ {id.replace(/_/g, ' ')}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Conseil stratégique */}
        <div className="bg-slate-800 rounded-xl border border-yellow-900 p-4">
          <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">
            💡 Conseil stratégique
          </h3>
          <p className="text-xs text-slate-400">
            {!etatJeu
              ? 'Chargement...'
              : etatJeu.popularite_joueur < 35
              ? "Popularité trop basse. Lancez une campagne ou utilisez le 50.1 pour débattre sans risque avant de voter."
              : etatJeu.tension_sociale > 65
              ? "Tensions sociales élevées. Évitez absolument le 49.3 — préférez la négociation ou le 50.1."
              : etatJeu.reserve_budgetaire_milliards < 10
              ? "Réserves quasi vides. Votez d'abord des lois qui réduisent le déficit."
              : etatJeu.dissimulation > 55
              ? "Dissimulation dangereuse. Évitez le lobbying médiatique — un scandale peut éclater."
              : bonusVoteActif > 0
              ? `Bonus de +${bonusVoteActif}% actif. Profitez-en pour voter une loi difficile !`
              : "Situation stable. C'est le bon moment pour pousser vos réformes."}
          </p>
        </div>
      </div>

    </div>
  )
}
