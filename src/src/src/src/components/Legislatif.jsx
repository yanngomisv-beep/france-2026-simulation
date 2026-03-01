import { useState } from 'react'

const ETAT_INITIAL = {
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
  popularite_par_bloc: { GAUCHE: 48, CENTRE: 35, DROITE: 22, EXTREME_DROITE: 18 },
}

const HEMICYCLE = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112,
  EPR: 98, LR: 62, PATRIOTES: 18,
  RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

const CATALOGUE_LOIS = [
  {
    id: 'retraite_60',
    titre: 'Retraite à 60 ans',
    emoji: '👴',
    parti_auteur: 'LFI',
    description: 'Abaissement de l\'âge légal de la retraite de 64 à 60 ans.',
    partis_favorables: ['LFI', 'PS_ECO', 'TRAVAILLEURS'],
    partis_hostiles: ['EPR', 'LR', 'RN'],
    impacts: {
      deficit_milliards: +18,
      popularite: +12,
      tension_sociale: -20,
      relation_ue: -15,
      indice_confiance_marches: -8,
    },
    evenements: ['⚠️ Avertissement BCE', '📉 Hausse prime de risque OAT'],
    conditions: { popularite_min: 30, reserve_min: 0 },
  },
  {
    id: 'nationalisation_energie',
    titre: 'Nationalisation de l\'énergie',
    emoji: '⚡',
    parti_auteur: 'LFI',
    description: 'Rachat public d\'EDF, Engie et TotalÉnergies.',
    partis_favorables: ['LFI', 'TRAVAILLEURS', 'PATRIOTES'],
    partis_hostiles: ['EPR', 'LR'],
    impacts: {
      deficit_milliards: +65,
      pib_croissance_pct: -0.6,
      popularite: +8,
      relation_ue: -30,
      indice_confiance_marches: -20,
    },
    evenements: ['🇪🇺 Procédure d\'infraction UE', '📈 Fuite de capitaux'],
    conditions: { popularite_min: 40, reserve_min: 80 },
  },
  {
    id: 'isf_retour',
    titre: 'Rétablissement de l\'ISF',
    emoji: '💰',
    parti_auteur: 'PS_ECO',
    description: 'Extension de l\'IFI à l\'ensemble du patrimoine financier.',
    partis_favorables: ['PS_ECO', 'LFI', 'ANIMALISTE'],
    partis_hostiles: ['LR', 'EPR'],
    impacts: {
      deficit_milliards: -14,
      pib_croissance_pct: -0.2,
      popularite: +5,
      relation_ue: -5,
      indice_confiance_marches: -12,
    },
    evenements: ['✈️ Menace d\'exil fiscal', '👍 Approbation syndicale'],
    conditions: { popularite_min: 28, reserve_min: 0 },
  },
  {
    id: 'immigration_controle',
    titre: 'Contrôle renforcé de l\'immigration',
    emoji: '🛂',
    parti_auteur: 'RN',
    description: 'Durcissement des conditions de titre de séjour et expulsions.',
    partis_favorables: ['RN', 'LR', 'PATRIOTES'],
    partis_hostiles: ['LFI', 'PS_ECO'],
    impacts: {
      deficit_milliards: +2,
      tension_sociale: +15,
      popularite: +4,
      relation_ue: -10,
      indice_confiance_marches: -3,
    },
    evenements: ['🏛️ Recours au Conseil d\'État', '📣 Manifestations associations'],
    conditions: { popularite_min: 25, reserve_min: 0 },
  },
  {
    id: 'referendum_ue',
    titre: 'Référendum sur l\'appartenance à l\'UE',
    emoji: '🗳️',
    parti_auteur: 'PATRIOTES',
    description: 'Organisation d\'un référendum Frexit.',
    partis_favorables: ['PATRIOTES', 'RN'],
    partis_hostiles: ['EPR', 'PS_ECO', 'LFI', 'LR'],
    impacts: {
      pib_croissance_pct: -1.8,
      inflation_pct: +1.2,
      popularite: +3,
      tension_sociale: +30,
      relation_ue: -80,
      indice_confiance_marches: -35,
    },
    evenements: ['💥 Crise obligataire', '🚨 Sommet d\'urgence UE'],
    conditions: { popularite_min: 55, reserve_min: 0 },
  },
  {
    id: 'plan_relance',
    titre: 'Plan de relance industrielle',
    emoji: '🏭',
    parti_auteur: 'EPR',
    description: 'Investissement de 40 Md€ pour réindustrialiser la France.',
    partis_favorables: ['EPR', 'LR', 'PS_ECO'],
    partis_hostiles: ['LFI', 'RN'],
    impacts: {
      deficit_milliards: +40,
      pib_croissance_pct: +0.8,
      popularite: +6,
      relation_ue: +5,
      indice_confiance_marches: +10,
    },
    evenements: ['📊 Notation Fitch maintenue', '🤝 Soutien patronat'],
    conditions: { popularite_min: 25, reserve_min: 20 },
  },
]

function calculerVote(loi, hemicycle) {
  const total = Object.values(hemicycle).reduce((a, b) => a + b, 0)
  let pour = 0
  for (const [parti, sieges] of Object.entries(hemicycle)) {
    if (loi.partis_favorables.includes(parti)) pour += sieges * 0.90
    else if (loi.partis_hostiles.includes(parti)) pour += sieges * 0.05
    else pour += sieges * 0.35
  }
  return Math.round((pour / total) * 100)
}

function Delta({ valeur, unite = '', inverse = false }) {
  if (!valeur) return null
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-xs font-semibold ${positif ? 'text-green-400' : 'text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

export default function Legislatif() {
  const [etat, setEtat] = useState(ETAT_INITIAL)
  const [loiSelectionnee, setLoiSelectionnee] = useState(null)
  const [journal, setJournal] = useState([])
  const [animation, setAnimation] = useState(null)

  function verifierConditions(loi) {
    const errs = []
    if (etat.popularite < loi.conditions.popularite_min)
      errs.push(`Popularité insuffisante (${etat.popularite}% < ${loi.conditions.popularite_min}%)`)
    if (etat.reserve_budgetaire_milliards < loi.conditions.reserve_min)
      errs.push(`Réserve insuffisante (${etat.reserve_budgetaire_milliards} Md€ < ${loi.conditions.reserve_min} Md€)`)
    return errs
  }

  function voterLoi(loi) {
    const pctVote = calculerVote(loi, HEMICYCLE)
    const adoptee = pctVote > 50
    const erreurs = verifierConditions(loi)

    if (erreurs.length > 0 || !adoptee) {
      setJournal(j => [{
        id: Date.now(),
        titre: loi.titre,
        emoji: loi.emoji,
        adoptee: false,
        pct: pctVote,
        raison: erreurs[0] ?? `Rejetée à ${pctVote}% des voix`,
      }, ...j])
      setAnimation('rejet')
      setTimeout(() => setAnimation(null), 1000)
      return
    }

    const nouvelEtat = { ...etat }
    for (const [indicateur, valeur] of Object.entries(loi.impacts)) {
      if (indicateur === 'popularite') nouvelEtat.popularite = Math.max(0, Math.min(100, etat.popularite + valeur))
      else if (indicateur in nouvelEtat) nouvelEtat[indicateur] = Math.round((nouvelEtat[indicateur] + valeur) * 10) / 10
    }
    // Recalcul stabilité
    const greves = nouvelEtat.tension_sociale / 10
    const contraintesUE = Math.max(0, -nouvelEtat.relation_ue) / 20
    nouvelEtat.stabilite = Math.round(Math.max(0, Math.min(100, nouvelEtat.popularite - greves - contraintesUE)))

    setEtat(nouvelEtat)
    setJournal(j => [{
      id: Date.now(),
      titre: loi.titre,
      emoji: loi.emoji,
      adoptee: true,
      pct: pctVote,
      evenements: loi.evenements,
      impacts: loi.impacts,
    }, ...j])
    setAnimation('adoption')
    setLoiSelectionnee(null)
    setTimeout(() => setAnimation(null), 1000)
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Colonne gauche — catalogue */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">📜 Propositions de loi</h2>
        {CATALOGUE_LOIS.map(loi => {
          const pct = calculerVote(loi, HEMICYCLE)
          const erreurs = verifierConditions(loi)
          const bloquee = erreurs.length > 0
          const selectionnee = loiSelectionnee?.id === loi.id

          return (
            <div key={loi.id}
              onClick={() => setLoiSelectionnee(selectionnee ? null : loi)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                selectionnee
                  ? 'border-blue-500 bg-slate-700'
                  : bloquee
                  ? 'border-slate-700 bg-slate-800 opacity-60'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-500'
              }`}>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{loi.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">{loi.titre}</p>
                    <p className="text-xs text-slate-400">{loi.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-sm font-bold ${pct > 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {pct}% pour
                  </span>
                  <span className="text-xs text-slate-500">{loi.parti_auteur}</span>
                </div>
              </div>

              {/* Barre de vote */}
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Impacts résumés */}
              {selectionnee && (
                <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-slate-600">
                  {Object.entries(loi.impacts).map(([k, v]) => (
                    <div key={k} className="flex flex-col items-center bg-slate-900 rounded px-3 py-1.5">
                      <span className="text-xs text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                      <Delta valeur={v}
                        unite={k.includes('pct') || k === 'popularite' || k === 'tension_sociale' ? '%' : ' Md€'}
                        inverse={['deficit_milliards', 'tension_sociale', 'inflation_pct'].includes(k)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Événements secondaires */}
              {selectionnee && loi.evenements.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {loi.evenements.map((e, i) => (
                    <span key={i} className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded">
                      {e}
                    </span>
                  ))}
                </div>
              )}

              {/* Blocage */}
              {bloquee && (
                <p className="mt-2 text-xs text-red-400">🔒 {erreurs[0]}</p>
              )}

              {/* Bouton voter */}
              {selectionnee && !bloquee && (
                <button
                  onClick={e => { e.stopPropagation(); voterLoi(loi) }}
                  className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
                >
                  Soumettre au vote de l'Assemblée
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Colonne droite — état + journal */}
      <div className="flex flex-col gap-4">

        {/* Indicateurs live */}
        <div className={`bg-slate-800 rounded-xl border p-4 flex flex-col gap-3 transition-all ${
          animation === 'adoption' ? 'border-green-500' : animation === 'rejet' ? 'border-red-500' : 'border-slate-700'
        }`}>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">État de la République</h3>
          {[
            { label: 'Popularité', val: etat.popularite, unite: '%' },
            { label: 'Stabilité', val: etat.stabilite, unite: '/100' },
            { label: 'Déficit', val: etat.deficit_milliards, unite: ' Md€' },
            { label: 'PIB', val: etat.pib_croissance_pct, unite: '%' },
            { label: 'Inflation', val: etat.inflation_pct, unite: '%' },
            { label: 'Tension sociale', val: etat.tension_sociale, unite: '/100' },
            { label: 'Relations UE', val: etat.relation_ue, unite: '' },
            { label: 'Marchés', val: etat.indice_confiance_marches, unite: '/100' },
          ].map(({ label, val, unite }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="text-white font-semibold">{val}{unite}</span>
            </div>
          ))}
        </div>

        {/* Journal des votes */}
        {journal.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Journal législatif</h3>
            {journal.slice(0, 5).map(entry => (
              <div key={entry.id} className={`rounded-lg p-3 text-sm ${
                entry.adoptee ? 'bg-green-900/40 border border-green-800' : 'bg-red-900/40 border border-red-900'
              }`}>
                <p className="font-semibold text-white">{entry.emoji} {entry.titre}</p>
                <p className={`text-xs mt-0.5 ${entry.adoptee ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.adoptee ? `✅ Adoptée à ${entry.pct}%` : `❌ ${entry.raison}`}
                </p>
                {entry.evenements?.map((e, i) => (
                  <p key={i} className="text-xs text-slate-400 mt-1">{e}</p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
