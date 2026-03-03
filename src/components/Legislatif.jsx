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
    id: 'art_49_3',
    label: 'Forçage 49.3',
    emoji: '⚖️',
    description: 'Passer la loi sans vote. Risque élevé sur la stabilité.',
    cout_budget: 0,
    effet: { stabilite: -20, tension_sociale: +18, popularite_joueur: -12 },
    force_adoption: true,
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
    bonus_vote: 10,
    risque: 'Augmente la dissimulation. Risque de scandale si découvert.',
    couleur: 'purple',
    secret: true,
  },
  {
    id: 'attendre',
    label: 'Passer un tour',
    emoji: '⏳',
    description: 'Laisser le temps jouer. La popularité monte naturellement si stable.',
    cout_budget: 0,
    effet: {},
    couleur: 'slate',
  },
]

const COULEURS = {
  blue:   { btn: 'bg-blue-700 hover:bg-blue-600 border-blue-600',      badge: 'bg-blue-900 text-blue-300' },
  green:  { btn: 'bg-green-700 hover:bg-green-600 border-green-600',   badge: 'bg-green-900 text-green-300' },
  red:    { btn: 'bg-red-700 hover:bg-red-600 border-red-600',         badge: 'bg-red-900 text-red-300' },
  purple: { btn: 'bg-purple-700 hover:bg-purple-600 border-purple-600',badge: 'bg-purple-900 text-purple-300' },
  slate:  { btn: 'bg-slate-600 hover:bg-slate-500 border-slate-500',   badge: 'bg-slate-800 text-slate-300' },
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

      {/* Bonus actif */}
      {bonusVoteActif > 0 && (
        <div className="flex justify-between text-xs border-t border-slate-700 pt-2 mt-1">
          <span className="text-slate-500">Sans bonus</span>
          <span className="text-slate-400">{pct_base}%</span>
        </div>
      )}
      {bonusVoteActif > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-green-500">Avec bonus</span>
          <span className="text-green-400 font-semibold">+{bonusVoteActif}% → {pct_bonus}%</span>
        </div>
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
            <Delta valeur={v}
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

      {levier.risque && (
        <p className="text-xs text-yellow-600">⚠️ {levier.risque}</p>
      )}

      {levier.id === 'art_49_3' && (
        <p className="text-xs text-slate-600">
          Utilisé : {usage49_3}/{levier.usage_max} fois
        </p>
      )}

      <button
        disabled={desactive}
        onClick={() => onAppliquer(levier)}
        className={`w-full py-1.5 rounded-lg text-white text-xs font-semibold border transition-colors ${
          desactive ? 'bg-slate-700 border-slate-600 cursor-not-allowed' : c.btn
        }`}
      >
        {bloque ? '🔒 Épuisé' :
         pasAssezBudget ? '💸 Budget insuffisant' :
         levier.id === 'attendre' ? '⏭️ Passer le
