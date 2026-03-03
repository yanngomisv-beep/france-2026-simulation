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
    delai_tours: 0,
    risque: null,
    couleur: 'blue',
  },
  {
    id: 'negotiation_parti',
    label: 'Négociation inter-partis',
    emoji: '🤝',
    description: 'Cédez quelque chose à un parti pour obtenir son soutien sur la prochaine loi.',
    cout_budget: 1,
    effet: { popularite_joueur: -2, stabilite: +3 },
    bonus_vote: +15,
    delai_tours: 0,
    risque: 'Fuite possible si le deal est trop visible.',
    couleur: 'green',
  },
  {
    id: 'art_49_3',
    label: 'Forçage 49.3',
    emoji: '⚖️',
    description: 'Passer la loi sans vote. Risque élevé sur la stabilité.',
    cout_budget: 0,
    effet: { stabilite: -20, tension_sociale: +18, popularite_joueur: -12 },
    force_adoption: true,
    delai_tours: 0,
    risque: 'Motion de censure automatique. Usage limité à 3 fois.',
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
    bonus_vote: +10,
    delai_tours: 0,
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
    bonus_popularite_si_stable: +3,
    delai_tours: 1,
    risque: null,
    couleur: 'slate',
  },
]

const COULEURS = {
  blue:   { btn: 'bg-blue-700 hover:bg-blue-600 border-blue-600',   badge: 'bg-blue-900 text-blue-300' },
  green:  { btn: 'bg-green-700 hover:bg-green-600 border-green-600', badge: 'bg-green-900 text-green-300' },
  red:    { btn: 'bg-red-700 hover:bg-red-600 border-red-600',       badge: 'bg-red-900 text-red-300' },
  purple: { btn: 'bg-purple-700 hover:bg-purple-600 border-purple-600', badge: 'bg-purple-900 text-purple-300' },
  slate:  { btn: 'bg-slate-600 hover:bg-slate-500 border-slate-500', badge: 'bg-slate-800 text-slate-300' },
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function Delta({ valeur, unite = '', inverse = false }) {
  if (valeur === undefined || valeur === null || valeur === 0) return null
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-xs font-semibold ${positif ? 'text-green-400' : 'text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

function CarteLevier({ levier, etatJeu, usage49_3, onAppliquer, loiCiblee }) {
  const bloque = levier.id === 'art_49_3' && usage49_3 >= (levier.usage_max ?? 3)
  const pasAssezBudget = levier.cout_budget > 0 &&
    (etatJeu?.reserve_budgetaire_milliards ?? 0) < levier.cout_budget
  const desactive = bloque || pasAssezBudget
  const c = COULEURS[levier.couleur]

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
      desactive ? 'border-slate-700 bg-slate-800 opacity-50' : 'border-slate-600 bg-slate-800 hover:border-slate-500'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{levier.emoji}</span>
          <div>
            <p className="font-semibold text-white text-sm">{levier.label}</p>
            {levier.secret && (
              <span className="text-xs text-purple-400">🔒 Action secrète</span>
            )}
          </div>
        </div>
        {levier.cout_budget > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded ${c.badge}`}>
            -{levier.cout_budget} Md€
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400">{levier.description}</p>

      {/* Effets */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(levier.effet).map(([k, v]) => (
          <div key={k} className="bg-slate-900 rounded px-2 py-1 flex flex-col items-center">
            <span className="text-xs text-slate-500" style={{ fontSize: '10px' }}>
              {k.replace(/_/g, ' ')}
            </span>
            <Delta valeur={v}
              unite={['deficit_milliards'].includes(k) ? ' Md€' : '%'}
              inverse={['tension_sociale', 'dissimulation', 'pression_mediatique'].includes(k)}
            />
          </div>
        ))}
        {levier.bonus_vote && (
          <div className="bg-slate-900 rounded px-2 py-1 flex flex-col items-center">
            <span className="text-xs text-slate-500" style={{ fontSize: '10px' }}>vote</span>
            <span className="text-xs font-semibold text-green-400">+{levier.bonus_vote}%</span>
          </div>
        )}
      </div>

      {/* Risque */}
      {levier.risque && (
        <p className="text-xs text-yellow-500">⚠️ {levier.risque}</p>
      )}

      {/* Usage 49.3 */}
      {levier.id === 'art_49_3' && (
        <p className="text-xs text-slate-500">
          Utilisé : {usage49_3}/{levier.usage_max} fois ce mandat
        </p>
      )}

      {/* Bouton */}
      <button
        disabled={desactive}
        onClick={() => onAppliquer(levier)}
        className={`w-full py-2 rounded-lg text-white text-sm font-semibold border transition-colors ${
          desactive ? 'bg-slate-700 border-slate-600 cursor-not-allowed' : c.btn
        }`}
      >
        {bloque ? '🔒 Épuisé' :
         pasAssezBudget ? '💸 Budget insuffisant' :
         levier.id === 'attendre' ? '⏭️ Passer le tour' :
         loiCiblee ? `Appliquer sur "${loiCiblee.titre.substring(0, 20)}..."` :
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

  // ── Appliquer un levier ──────────────────────────────────
  function appliquerLevier(levier) {
    const notifs = []

    if (levier.id === 'art_49_3') {
      if (!loiSelectionnee) {
        setNotifications([{
          type: 'warning',
          msg: '⚠️ Sélectionnez d\'abord une loi à forcer.'
        }])
        return
      }
      // Forcer l'adoption directement
      voterLoi(loiSelectionnee.id)
      setUsage49_3(u => u + 1)
      setLoiSelectionnee(null)
      notifs.push({ type: 'danger', msg: `⚖️ 49.3 activé — "${loiSelectionnee.titre}" forcée. Motion de censure probable.` })
    }

    else if (levier.id === 'attendre') {
      passerTour()
      notifs.push({ type: 'info', msg: '⏳ Tour passé. La situation évolue...' })
    }

    else if (levier.id === 'negotiation_parti') {
      setBonusVoteActif(b => b + (levier.bonus_vote ?? 0))
      notifs.push({ type: 'success', msg: '🤝 Négociation réussie. +15% de soutien sur la prochaine loi.' })
    }

    else if (levier.id === 'lobbying_mediatique') {
      setBonusVoteActif(b => b + (levier.bonus_vote ?? 0))
      notifs.push({ type: 'warning', msg: '📺 Lobbying en cours. +10% de soutien mais dissimulation augmentée.' })
    }

    else if (levier.id === 'campagne_com') {
      notifs.push({ type: 'success', msg: '📣 Campagne lancée. Popularité en hausse.' })
    }

    setNotifications(notifs)
    setTimeout(() => setNotifications([]), 4000)
  }

  // ── Voter une loi (avec bonus éventuels) ─────────────────
  function handleVoterLoi(loiId) {
    voterLoi(loiId)
    setBonusVoteActif(0)
    setLoiSelectionnee(null)
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">

      {/* ══ Panneau latéral gauche — Leviers ══ */}
      <div className="xl:col-span-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            🎮 Leviers politiques
          </h2>
          {bonusVoteActif > 0 && (
            <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">
              +{bonusVoteActif}% vote actif
            </span>
          )}
        </div>

        {/* Notifications */}
        {notifications.map((n, i) => (
          <div key={i} className={`rounded-lg p-3 text-xs ${
            n.type === 'danger'  ? 'bg-red-900 text-red-200' :
            n.type === 'warning' ? 'bg-yellow-900 text-yellow-200' :
            n.type === 'success' ? 'bg-green-900 text-green-200' :
            'bg-blue-900 text-blue-200'
          }`}>
            {n.msg}
          </div>
        ))}

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

        {/* Indicateur budget */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Budget disponible</h3>
          <p className="text-2xl font-bold text-white">
            {etatJeu?.reserve_budgetaire_milliards ?? 0}
            <span className="text-sm text-slate-400 ml-1">Md€</span>
          </p>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (etatJeu?.reserve_budgetaire_milliards ?? 0) / 100 * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ══ Colonne centrale — Catalogue des lois ══ */}
      <div className="xl:col-span-2 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">📜 Propositions de loi</h2>

        {loisDispo.length === 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-500 text-sm">Aucune loi disponible.</p>
            <p className="text-slate-600 text-xs mt-1">
              Utilisez les leviers pour améliorer votre popularité.
            </p>
          </div>
        )}

        {loisDispo.map(loi => {
          const selectionnee = loiSelectionnee?.id === loi.id
          const dejà_votee = etatJeu?.lois_votees?.includes(loi.id)

          if (dejà_votee) return null

          return (
            <div key={loi.id}
              onClick={() => setLoiSelectionnee(selectionnee ? null : loi)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                selectionnee
                  ? 'border-blue-500 bg-slate-700'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-500'
              }`}>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{loi.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{loi.titre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{loi.description}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded flex-shrink-0">
                  {loi.bloc}
                </span>
              </div>

              {selectionnee && (
                <>
                  {/* Impacts */}
                  {loi.impacts && Object.keys(loi.impacts).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-600">
                      {Object.entries(loi.impacts).map(([k, v]) => (
                        <div key={k} className="bg-slate-900 rounded px-2 py-1.5 flex flex-col items-center">
                          <span className="text-slate-500" style={{ fontSize: '10px' }}>
                            {k.replace(/_/g, ' ')}
                          </span>
                          <Delta valeur={v}
                            unite={['deficit_milliards'].includes(k) ? ' Md€' : '%'}
                            inverse={['deficit_milliards', 'tension_sociale', 'inflation_pct'].includes(k)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Partis */}
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
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
                    <div className="mt-3 flex flex-wrap gap-1">
                      {loi.evenements_secondaires.map((e, i) => (
                        <span key={i} className="text-xs bg-slate-900 text-yellow-400 px-2 py-1 rounded">
                          ⚡ {e}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bouton voter */}
                  <button
                    onClick={e => { e.stopPropagation(); handleVoterLoi(loi.id) }}
                    className="mt-4 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                  >
                    🗳️ Soumettre au vote
                    {bonusVoteActif > 0 && (
                      <span className="ml-2 text-xs text-blue-200">(+{bonusVoteActif}% bonus actif)</span>
                    )}
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ══ Colonne droite — État + Journal ══ */}
      <div className="xl:col-span-1 flex flex-col gap-4">

        {/* État live */}
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
          ].map(({ label, val, unite, danger }) => (
            <div key={label} className="flex justify-between text-sm items-center">
              <span className="text-slate-400">{label}</span>
              <span className={`font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>
                {val}{unite}
              </span>
            </div>
          ))}
        </div>

        {/* Lois déjà votées */}
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
            {etatJeu?.popularite_joueur < 35
              ? "Votre popularité est trop basse. Lancez une campagne de communication avant de voter des lois impopulaires."
              : etatJeu?.tension_sociale > 65
              ? "Les tensions sociales sont élevées. Évitez le 49.3 — préférez la négociation."
              : etatJeu?.reserve_budgetaire_milliards < 10
              ? "Vos réserves sont quasi vides. Votez d'abord des lois qui réduisent le déficit."
              : etatJeu?.dissimulation > 55
              ? "Votre jauge de dissimulation est dangereuse. Un scandale peut éclater à tout moment."
              : "La situation est stable. C'est le bon moment pour pousser vos réformes."}
          </p>
        </div>

      </div>
    </div>
  )
}
