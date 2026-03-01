import { useState } from 'react'

const ETAT_INITIAL = {
  date: "1er Mars 2026",
  popularite: 42,
  stabilite: 58,
  deficit_milliards: 173,
  dette_pib_pct: 112.4,
  inflation_pct: 2.8,
  pib_croissance_pct: 0.9,
  tension_sociale: 45,
  relation_ue: 20,
  indice_confiance_marches: 62,
  reserve_budgetaire_milliards: 28,
}

function Jauge({ label, valeur, max = 100, couleur, inverse = false }) {
  const pct = Math.round((valeur / max) * 100)
  const danger = inverse ? pct > 66 : pct < 33
  const warning = inverse ? pct > 33 : pct < 66
  const bg = danger ? 'bg-red-500' : warning ? 'bg-yellow-500' : `bg-${couleur}-500`

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{valeur}{max === 100 ? '%' : ' Md€'}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bg}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Stat({ label, valeur, unite = '', tendance }) {
  const couleur = tendance === 'bon' ? 'text-green-400' : tendance === 'mauvais' ? 'text-red-400' : 'text-slate-300'
  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${couleur}`}>{valeur}<span className="text-sm ml-1">{unite}</span></span>
    </div>
  )
}

export default function Dashboard() {
  const [etat] = useState(ETAT_INITIAL)

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">

      {/* Bannière contextuelle */}
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 flex items-center gap-3">
        <span className="text-2xl">🗳️</span>
        <div>
          <p className="font-semibold text-white">Élections Municipales — Dans 21 jours</p>
          <p className="text-sm text-blue-300">La campagne bat son plein. Votre popularité influence directement les résultats locaux.</p>
        </div>
      </div>

      {/* Stats clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Popularité" valeur={etat.popularite} unite="%" tendance={etat.popularite > 50 ? 'bon' : 'mauvais'} />
        <Stat label="Stabilité" valeur={etat.stabilite} unite="/100" tendance={etat.stabilite > 50 ? 'bon' : 'mauvais'} />
        <Stat label="Croissance PIB" valeur={etat.pib_croissance_pct} unite="%" tendance={etat.pib_croissance_pct > 1 ? 'bon' : 'mauvais'} />
        <Stat label="Inflation" valeur={etat.inflation_pct} unite="%" tendance={etat.inflation_pct < 2 ? 'bon' : 'mauvais'} />
      </div>

      {/* Jauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Finances publiques</h2>
          <Jauge label="Réserve budgétaire" valeur={etat.reserve_budgetaire_milliards} max={100} couleur="green" />
          <Jauge label="Confiance des marchés" valeur={etat.indice_confiance_marches} couleur="blue" />
          <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
            <span className="text-slate-400">Déficit annuel</span>
            <span className="text-red-400 font-semibold">−{etat.deficit_milliards} Md€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Dette / PIB</span>
            <span className="text-orange-400 font-semibold">{etat.dette_pib_pct}%</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Climat social & diplomatique</h2>
          <Jauge label="Tension sociale" valeur={etat.tension_sociale} couleur="orange" inverse />
          <Jauge label="Relations UE" valeur={etat.relation_ue + 100} max={200} couleur="blue" />
          <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
            <span className="text-slate-400">Formule stabilité</span>
            <span className="text-slate-300 font-mono text-xs">S = P − (G + R_ue)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Résultat</span>
            <span className={`font-semibold ${etat.stabilite > 50 ? 'text-green-400' : 'text-red-400'}`}>
              {etat.stabilite} / 100
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
