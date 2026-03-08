import { useState, useMemo } from 'react'
import { getLoisDisponibles, calculerProbaVoteLoi } from '../engines/moteur-legislatif.js'
import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

// ─────────────────────────────────────────────────────────────
// LEVIERS POLITIQUES (49.3 et 50.1 sont ICI uniquement)
// ─────────────────────────────────────────────────────────────

const LEVIERS = [
  {
    id: 'campagne_com',
    label: 'Campagne de communication',
    emoji: '📣',
    description: 'Dépensez 3 Md€ de réserve pour une campagne nationale. +5% de popularité, moins de tension.',
    cout_budget: 3,
    effet: { popularite_joueur: +5, tension_sociale: -3 },
    bonus_vote: 5,
    couleur: 'blue',
  },
  {
    id: 'negotiation_parti',
    label: 'Négociation inter-partis',
    emoji: '🤝',
    description: 'Cédez une concession à un parti allié pour obtenir +15% sur le vote de la loi ciblée.',
    cout_budget: 1,
    effet: { stabilite: +3 },
    bonus_vote: 15,
    risque: 'Fuite possible si le deal est trop visible.',
    couleur: 'green',
  },
  {
    id: 'art_50_1',
    label: 'Débat Article 50.1',
    emoji: '🗣️',
    description: "Ouvre un débat à l'Assemblée sans vote. Convainc les indécis. +8% sur la loi ciblée sans risque.",
    cout_budget: 0,
    effet: { stabilite: +2, tension_sociale: -3 },
    bonus_vote: 8,
    couleur: 'green',
  },
  {
    id: 'lobbying_mediatique',
    label: 'Lobbying médiatique',
    emoji: '📺',
    description: 'Placez des narratifs favorables dans les médias proches. +10% sur le vote mais risque de scandale.',
    cout_budget: 2,
    effet: { popularite_joueur: +4, pression_mediatique: +8, dissimulation: +6 },
    bonus_vote: 10,
    risque: 'Augmente la dissimulation. Risque de scandale si découvert.',
    couleur: 'purple',
    secret: true,
  },
  {
    id: 'art_49_3',
    label: 'Forçage Article 49.3',
    emoji: '⚖️',
    description: "Force le passage d'une loi sans vote. Outil constitutionnel extrême, très impopulaire en 2026.",
    cout_budget: 0,
    effet: { stabilite: -20, tension_sociale: +18, popularite_joueur: -12 },
    force_adoption: true,
    risque: 'Motion de censure automatique probable. Limité à 3 utilisations.',
    couleur: 'red',
    usage_max: 3,
  },
]

const COULEURS = {
  blue:   { btn: 'bg-blue-700 hover:bg-blue-600 border-blue-600',       badge: 'bg-blue-900/60 text-blue-300',   ring: 'ring-blue-500/40' },
  green:  { btn: 'bg-green-700 hover:bg-green-600 border-green-600',    badge: 'bg-green-900/60 text-green-300', ring: 'ring-green-500/40' },
  red:    { btn: 'bg-red-800 hover:bg-red-700 border-red-700',          badge: 'bg-red-900/60 text-red-300',     ring: 'ring-red-500/40' },
  purple: { btn: 'bg-purple-700 hover:bg-purple-600 border-purple-600', badge: 'bg-purple-900/60 text-purple-300', ring: 'ring-purple-500/40' },
}

const BLOCS_LABELS = {
  BLOC_INSTITUTIONS: { label: 'Institutions', emoji: '🏛️' },
  BLOC_ENERGIE:      { label: 'Énergie',       emoji: '⚡' },
  BLOC_ECONOMIE:     { label: 'Économie',      emoji: '📊' },
  BLOC_SOCIAL:       { label: 'Social',        emoji: '👥' },
  BLOC_SECURITE:     { label: 'Sécurité',      emoji: '🛡️' },
  BLOC_SCANDALES:    { label: 'Événements',    emoji: '📰' },
}

const HEMICYCLE_DEFAUT = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112,
  EPR: 98, LR: 62, PATRIOTES: 18,
  UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function Delta({ valeur, unite = '', inverse = false }) {
  if (valeur == null || valeur === 0) return null
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-xs font-bold ${positif ? 'text-emerald-400' : 'text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

function BarreProba({ pct_base, pct_bonus, bonusActif }) {
  const passerait = pct_bonus > 50
  const manque = Math.max(0, 51 - pct_bonus)
  return (
    <div className={`rounded-lg p-3 border ${
      passerait ? 'bg-emerald-950/50 border-emerald-700/50' : 'bg-red-950/50 border-red-700/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">Probabilité de vote</span>
        <span className={`text-2xl font-black ${passerait ? 'text-emerald-400' : 'text-red-400'}`}>
          {pct_bonus}%
        </span>
      </div>
      <div className="relative h-2.5 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all duration-700 ${passerait ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(100, pct_bonus)}%` }}
        />
        <div className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: '50%' }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mb-2">
        <span>0%</span><span>50% requis</span><span>100%</span>
      </div>
      {bonusActif > 0 && (
        <div className="flex justify-between text-xs pt-2 border-t border-slate-700">
          <span className="text-slate-500">Base : {pct_base}%</span>
          <span className="text-emerald-400 font-bold">+{bonusActif}% bonus → {pct_bonus}%</span>
        </div>
      )}
      <p className={`text-xs mt-2 font-semibold text-center ${passerait ? 'text-emerald-400' : 'text-red-400'}`}>
        {passerait ? '✅ Passerait au vote' : `❌ Manque ${manque}% — utilisez un levier`}
      </p>
    </div>
  )
}

function CarteLevier({ levier, etatJeu, usage49_3, onAppliquer, loiCiblee, bonusActif }) {
  const bloque = levier.id === 'art_49_3' && usage49_3 >= (levier.usage_max ?? 3)
  const pasAssezBudget = levier.cout_budget > 0 &&
    (etatJeu?.reserve_budgetaire_milliards ?? 0) < levier.cout_budget
  const desactive = bloque || pasAssezBudget
  const c = COULEURS[levier.couleur] ?? COULEURS.blue

  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${
      desactive
        ? 'border-slate-700/50 bg-slate-800/30 opacity-40'
        : `border-slate-700 bg-slate-800/80 hover:border-slate-500 hover:bg-slate-800 ring-1 ring-transparent hover:${c.ring}`
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{levier.emoji}</span>
          <div>
            <p className="font-semibold text-white text-xs leading-tight">{levier.label}</p>
            {levier.secret && <span className="text-xs text-purple-400">🔒 Action secrète</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {levier.cout_budget > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${c.badge}`}>-{levier.cout_budget} Md€</span>
          )}
          {levier.bonus_vote && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
              +{levier.bonus_vote}% vote
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{levier.description}</p>

      {/* Effets sur indicateurs */}
      {Object.keys(levier.effet).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(levier.effet).map(([k, v]) => (
            <div key={k} className="bg-slate-900 rounded px-1.5 py-0.5 flex gap-1 items-center">
              <span className="text-slate-600" style={{ fontSize: '9px' }}>{k.replace(/_/g, ' ')}</span>
              <Delta valeur={v} unite={k === 'deficit_milliards' ? ' Md€' : ''} inverse={['tension_sociale','dissimulation','pression_mediatique'].includes(k)} />
            </div>
          ))}
        </div>
      )}

      {levier.risque && <p className="text-xs text-amber-600/80">⚠️ {levier.risque}</p>}
      {levier.id === 'art_49_3' && (
        <p className="text-xs text-slate-600">Utilisé {usage49_3}/{levier.usage_max ?? 3} fois ce mandat</p>
      )}

      <button
        disabled={desactive}
        onClick={() => onAppliquer(levier)}
        className={`w-full py-1.5 rounded-lg text-white text-xs font-semibold border transition-all ${
          desactive
            ? 'bg-slate-700 border-slate-600 cursor-not-allowed'
            : `${c.btn} border`
        }`}
      >
        {bloque ? '🔒 Épuisé' :
         pasAssezBudget ? '💸 Budget insuffisant' :
         levier.id === 'attendre' ? '⏭️ Passer le tour' :
         (levier.id === 'art_49_3' || levier.id === 'art_50_1') && !loiCiblee
           ? '← Sélectionnez une loi d\'abord'
           : 'Appliquer'}
      </button>
    </div>
  )
}

function CarteLoi({ loi, selectionnee, onClick, pct_bonus, pct_base, bonusActif, onVoter, etatJeu }) {
  const hemicycle = etatJeu?.hemicycle ?? HEMICYCLE_DEFAUT
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all ${
        selectionnee
          ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-900/20'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800'
      }`}
    >
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{loi.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-white text-sm leading-tight">{loi.titre}</p>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{loi.bloc}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${
                pct_bonus > 50 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
              }`}>{pct_bonus}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{loi.description}</p>
        </div>
      </div>

      {/* Détail si sélectionnée */}
      {selectionnee && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Barre probabilité */}
          <BarreProba pct_base={pct_base} pct_bonus={pct_bonus} bonusActif={bonusActif} />

          {/* Impacts */}
          {loi.impacts && Object.keys(loi.impacts).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Effets si adoptée</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(loi.impacts).map(([k, v]) => (
                  <div key={k} className="bg-slate-900 rounded-lg px-2 py-1.5 flex flex-col items-center min-w-14">
                    <span className="text-slate-500" style={{ fontSize: '9px' }}>{k.replace(/_/g, ' ')}</span>
                    <Delta valeur={v}
                      unite={k === 'deficit_milliards' ? ' Md€' : k.includes('pct') ? '%' : ''}
                      inverse={['deficit_milliards','tension_sociale','inflation_pct'].includes(k)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partis pour/contre */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-lg p-2">
              <p className="text-emerald-400 font-semibold mb-1.5">✅ Favorables</p>
              <div className="flex flex-wrap gap-1">
                {loi.partis_favorables?.map(p => (
                  <span key={p} className="bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded text-xs">{p}</span>
                ))}
                {(!loi.partis_favorables?.length) && <span className="text-slate-500 text-xs">Aucun</span>}
              </div>
            </div>
            <div className="bg-red-950/40 border border-red-800/30 rounded-lg p-2">
              <p className="text-red-400 font-semibold mb-1.5">❌ Hostiles</p>
              <div className="flex flex-wrap gap-1">
                {loi.partis_hostiles?.map(p => (
                  <span key={p} className="bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded text-xs">{p}</span>
                ))}
                {(!loi.partis_hostiles?.length) && <span className="text-slate-500 text-xs">Aucun</span>}
              </div>
            </div>
          </div>

          {/* Événements secondaires */}
          {loi.evenements_secondaires?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {loi.evenements_secondaires.map((e, i) => (
                <span key={i} className="text-xs bg-amber-950/40 text-amber-400 border border-amber-800/30 px-2 py-0.5 rounded">
                  ⚡ {e}
                </span>
              ))}
            </div>
          )}

          {/* Note */}
          {loi.note && (
            <p className="text-xs text-blue-400/70 italic border-l-2 border-blue-700/40 pl-2">{loi.note}</p>
          )}

          {/* Bouton voter */}
          <button
            onClick={e => { e.stopPropagation(); onVoter(loi.id) }}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all ${
              pct_bonus > 50
                ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40'
                : 'bg-slate-600/80 hover:bg-slate-500'
            }`}
          >
            🗳️ Soumettre au vote — {pct_bonus}%
            {bonusActif > 0 && <span className="ml-2 text-xs opacity-70">(+{bonusActif}% bonus)</span>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function Legislatif({ etatJeu, voterLoi, passerTour }) {
  const [onglet, setOnglet]                   = useState('catalogue')   // catalogue | adoptees | leviers
  const [loiSelectionnee, setLoiSelectionnee] = useState(null)
  const [usage49_3, setUsage49_3]             = useState(0)
  const [bonusVoteActif, setBonusVoteActif]   = useState(0)
  const [notifications, setNotifications]     = useState([])
  const [filtreBloc, setFiltreBloc]           = useState('TOUS')

  // Lois disponibles
  const loisDispo = useMemo(() => {
    if (!etatJeu) return []
    try { return getLoisDisponibles(etatJeu) } catch { return [] }
  }, [etatJeu])

  // Lois adoptées — on récupère les objets complets
  const loisAdoptees = useMemo(() => {
    const ids = etatJeu?.lois_votees ?? []
    const toutes = Object.values(CATALOGUE_LOIS).flat()
    return ids.map(id => toutes.find(l => l.id === id)).filter(Boolean)
  }, [etatJeu?.lois_votees])

  // Lois filtrées par bloc
  const loisFiltrees = useMemo(() => {
    if (filtreBloc === 'TOUS') return loisDispo
    return loisDispo.filter(l => {
      const bloc = Object.entries(CATALOGUE_LOIS).find(([, arr]) =>
        arr.some(x => x.id === l.id)
      )?.[0]
      return bloc === filtreBloc
    })
  }, [loisDispo, filtreBloc])

  function afficherNotif(type, msg) {
    setNotifications([{ type, msg }])
    setTimeout(() => setNotifications([]), 5000)
  }

  // ── Appliquer un levier ──────────────────────────────
  function appliquerLevier(levier) {
    if (levier.id === 'art_49_3') {
      if (!loiSelectionnee) {
        afficherNotif('warning', "⚠️ Allez dans l'onglet Catalogue et sélectionnez une loi d'abord.")
        return
      }
      voterLoi(loiSelectionnee.id, 100)
      setUsage49_3(u => u + 1)
      setLoiSelectionnee(null)
      setBonusVoteActif(0)
      afficherNotif('danger', `⚖️ 49.3 activé — "${loiSelectionnee.titre}" forcée. Motion de censure probable.`)
      return
    }
    if (levier.id === 'art_50_1') {
      if (!loiSelectionnee) {
        afficherNotif('warning', "⚠️ Sélectionnez d'abord une loi dans le Catalogue.")
        return
      }
      setBonusVoteActif(b => b + (levier.bonus_vote ?? 8))
      afficherNotif('success', `🗣️ Débat ouvert sur "${loiSelectionnee.titre}". +${levier.bonus_vote}% de soutien.`)
      return
    }
    if (levier.bonus_vote) setBonusVoteActif(b => b + levier.bonus_vote)
    const msgs = {
      campagne_com:        '📣 Campagne lancée — popularité en hausse.',
      negotiation_parti:   '🤝 Négociation réussie — +15% sur le prochain vote.',
      lobbying_mediatique: '📺 Lobbying en cours — +10% vote, dissimulation augmentée.',
    }
    afficherNotif(levier.id === 'lobbying_mediatique' ? 'warning' : 'success', msgs[levier.id] ?? 'Levier appliqué.')
  }

  // ── Voter une loi ────────────────────────────────────
  function handleVoterLoi(loiId) {
    voterLoi(loiId, bonusVoteActif)
    setBonusVoteActif(0)
    setLoiSelectionnee(null)
    // Feedback
    const loi = loisDispo.find(l => l.id === loiId)
    afficherNotif('success', `🗳️ "${loi?.titre ?? loiId}" soumise au vote.`)
  }

  // ── ONGLET CATALOGUE ────────────────────────────────
  const renderCatalogue = () => (
    <div className="flex flex-col gap-4">
      {/* Filtres par bloc */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltreBloc('TOUS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filtreBloc === 'TOUS' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Tous ({loisDispo.length})
        </button>
        {Object.entries(BLOCS_LABELS).map(([bloc, info]) => {
          const count = loisDispo.filter(l => {
            const b = Object.entries(CATALOGUE_LOIS).find(([, arr]) => arr.some(x => x.id === l.id))?.[0]
            return b === bloc
          }).length
          if (count === 0) return null
          return (
            <button key={bloc} onClick={() => setFiltreBloc(bloc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtreBloc === bloc ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {info.emoji} {info.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Bonus actif */}
      {bonusVoteActif > 0 && (
        <div className="bg-emerald-950/50 border border-emerald-700/50 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-emerald-300">
            🎯 Bonus vote actif : <strong>+{bonusVoteActif}%</strong> sur la prochaine loi votée
          </span>
          <button onClick={() => setBonusVoteActif(0)} className="text-xs text-slate-500 hover:text-white">✕ Annuler</button>
        </div>
      )}

      {/* Loi ciblée */}
      {loiSelectionnee && (
        <div className="bg-blue-950/40 border border-blue-700/50 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-blue-300">
            🎯 Loi ciblée pour les leviers : <strong>{loiSelectionnee.titre}</strong>
          </span>
          <button onClick={() => setLoiSelectionnee(null)} className="text-xs text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Liste des lois */}
      {loisFiltrees.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400">Aucune loi disponible dans ce bloc.</p>
          <p className="text-slate-600 text-sm mt-1">Améliorez votre popularité via les leviers.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {loisFiltrees.map(loi => {
            const { pct_base, pct_bonus } = calculerProbaVoteLoi(loi.id, etatJeu, etatJeu?.hemicycle, bonusVoteActif)
            const selectionnee = loiSelectionnee?.id === loi.id
            return (
              <CarteLoi
                key={loi.id}
                loi={loi}
                selectionnee={selectionnee}
                onClick={() => setLoiSelectionnee(selectionnee ? null : loi)}
                pct_bonus={pct_bonus}
                pct_base={pct_base}
                bonusActif={bonusVoteActif}
                onVoter={handleVoterLoi}
                etatJeu={etatJeu}
              />
            )
          })}
        </div>
      )}
    </div>
  )

  // ── ONGLET LOIS ADOPTÉES ─────────────────────────────
  const renderAdoptees = () => (
    <div className="flex flex-col gap-3">
      {loisAdoptees.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-10 text-center">
          <p className="text-4xl mb-3">📜</p>
          <p className="text-slate-400">Aucune loi adoptée pour l'instant.</p>
          <p className="text-slate-600 text-sm mt-1">Les lois votées avec succès apparaîtront ici.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400">
            {loisAdoptees.length} loi{loisAdoptees.length > 1 ? 's' : ''} adoptée{loisAdoptees.length > 1 ? 's' : ''} depuis le début du mandat
          </p>
          {loisAdoptees.map(loi => (
            <div key={loi.id} className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{loi.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{loi.titre}</p>
                    <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded">✅ Adoptée</span>
                    <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{loi.bloc}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{loi.description}</p>
                  {/* Impacts rappelés */}
                  {loi.impacts && Object.keys(loi.impacts).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(loi.impacts).map(([k, v]) => (
                        <div key={k} className="bg-slate-900 rounded px-1.5 py-0.5 flex gap-1 items-center">
                          <span className="text-slate-600" style={{ fontSize: '9px' }}>{k.replace(/_/g, ' ')}</span>
                          <Delta valeur={v}
                            unite={k === 'deficit_milliards' ? ' Md€' : k.includes('pct') ? '%' : ''}
                            inverse={['deficit_milliards','tension_sociale','inflation_pct'].includes(k)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )

  // ── ONGLET LEVIERS ───────────────────────────────────
  const renderLeviers = () => (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          Les leviers vous permettent d'augmenter la probabilité de passage d'une loi ou de la forcer.
          <strong className="text-slate-300"> Sélectionnez d'abord une loi dans le Catalogue</strong> avant d'utiliser le 49.3 ou le 50.1.
        </p>
        {loiSelectionnee && (
          <p className="text-xs text-blue-300 mt-2">🎯 Loi ciblée : <strong>{loiSelectionnee.titre}</strong></p>
        )}
        {bonusVoteActif > 0 && (
          <p className="text-xs text-emerald-300 mt-1">✨ Bonus actif : +{bonusVoteActif}% sur le prochain vote</p>
        )}
      </div>

      {LEVIERS.map(levier => (
        <CarteLevier
          key={levier.id}
          levier={levier}
          etatJeu={etatJeu}
          usage49_3={usage49_3}
          onAppliquer={appliquerLevier}
          loiCiblee={loiSelectionnee}
          bonusActif={bonusVoteActif}
        />
      ))}

      {/* Budget */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Réserve budgétaire</h3>
          <span className="text-lg font-black text-white">
            {etatJeu?.reserve_budgetaire_milliards ?? 0} <span className="text-sm text-slate-400">Md€</span>
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (etatJeu?.reserve_budgetaire_milliards ?? 0) / 1.5)}%` }}
          />
        </div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">

      {/* Navigation onglets */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
          {[
            { id: 'catalogue', label: '📜 Catalogue', count: loisDispo.length },
            { id: 'adoptees',  label: '✅ Adoptées',   count: loisAdoptees.length },
            { id: 'leviers',   label: '🎮 Leviers',    count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setOnglet(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                onglet === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.label}
              {tab.count != null && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  onglet === tab.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Indicateurs rapides */}
        <div className="flex gap-3 flex-wrap">
          {etatJeu && [
            { label: '❤️ Pop', val: `${Math.round(etatJeu.popularite_joueur ?? 42)}%`, danger: (etatJeu.popularite_joueur ?? 42) < 30 },
            { label: '⚡ Tension', val: `${Math.round(etatJeu.tension_sociale ?? 45)}`, danger: (etatJeu.tension_sociale ?? 45) > 70 },
            { label: '🏦 Réserve', val: `${etatJeu.reserve_budgetaire_milliards ?? 0} Md€`, danger: (etatJeu.reserve_budgetaire_milliards ?? 0) < 10 },
          ].map(({ label, val, danger }) => (
            <div key={label} className="bg-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs text-slate-500">{label}</span>
              <span className={`text-xs font-bold ${danger ? 'text-red-400' : 'text-white'}`}>{val}</span>
            </div>
          ))}
          {bonusVoteActif > 0 && (
            <div className="bg-emerald-900/60 border border-emerald-700/50 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold text-emerald-300">+{bonusVoteActif}% bonus actif</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((n, i) => (
        <div key={i} className={`rounded-lg px-4 py-3 text-sm font-medium ${
          n.type === 'danger'  ? 'bg-red-950/80 border border-red-700/50 text-red-200' :
          n.type === 'warning' ? 'bg-amber-950/80 border border-amber-700/50 text-amber-200' :
          n.type === 'success' ? 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-200' :
          'bg-blue-950/80 border border-blue-700/50 text-blue-200'
        }`}>
          {n.msg}
        </div>
      ))}

      {/* Conseil contextuel */}
      {etatJeu && (
        <div className="bg-slate-800/40 border border-yellow-900/40 rounded-lg px-4 py-2.5">
          <span className="text-xs text-yellow-600">💡 </span>
          <span className="text-xs text-slate-400">
            {(etatJeu.popularite_joueur ?? 42) < 35
              ? "Popularité trop basse. Lancez une campagne (onglet Leviers) avant de voter."
              : (etatJeu.tension_sociale ?? 45) > 65
              ? "Tensions élevées. Évitez le 49.3 — préférez la négociation ou le 50.1."
              : (etatJeu.reserve_budgetaire_milliards ?? 28) < 10
              ? "Réserves quasi vides. Votez d'abord des lois qui réduisent le déficit."
              : (etatJeu.dissimulation ?? 0) > 55
              ? "Dissimulation dangereuse. Évitez le lobbying — un scandale peut éclater."
              : bonusVoteActif > 0
              ? `Bonus +${bonusVoteActif}% actif — profitez-en pour voter une loi difficile dans le Catalogue !`
              : loisAdoptees.length === 0
              ? "Conseil : sélectionnez une loi dans le Catalogue pour voir sa probabilité de passage."
              : `${loisAdoptees.length} loi${loisAdoptees.length > 1 ? 's' : ''} adoptée${loisAdoptees.length > 1 ? 's' : ''}. Continuez à réformer !`}
          </span>
        </div>
      )}

      {/* Contenu onglet */}
      <div className="min-h-96">
        {onglet === 'catalogue' && renderCatalogue()}
        {onglet === 'adoptees'  && renderAdoptees()}
        {onglet === 'leviers'   && renderLeviers()}
      </div>
    </div>
  )
}
