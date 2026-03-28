import { useState, useMemo } from 'react'

// ═══════════════════════════════════════════════════════════
// ÉVÉNEMENTS ALÉATOIRES
// ═══════════════════════════════════════════════════════════

const EVENTS_CATALOGUE = [
  // Économiques
  { id: 'hausse_taux_bce', titre: 'La BCE relève ses taux de 0,25%', emoji: '📈', categorie: 'economie', impact: { deficit_milliards: +3, indice_confiance_marches: -8, inflation_pct: -0.2 }, probabilite: 0.12, condition: e => (e.inflation_pct ?? 2.8) > 2.5 },
  { id: 'crash_bourse', titre: 'Correction boursière de 8% au CAC 40', emoji: '📉', categorie: 'economie', impact: { indice_confiance_marches: -18, pib_croissance_pct: -0.4 }, probabilite: 0.06, condition: () => Math.random() > 0.7 },
  { id: 'solde_commercial', titre: 'Excédent commercial inattendu : +4 Md€', emoji: '⚖️', categorie: 'economie', impact: { pib_croissance_pct: +0.3, indice_confiance_marches: +6 }, probabilite: 0.10 },
  { id: 'fuite_capitaux', titre: 'Fuite de capitaux vers la Suisse — 12 Md€', emoji: '💸', categorie: 'economie', impact: { deficit_milliards: +5, indice_confiance_marches: -12 }, probabilite: 0.08, condition: e => (e.relation_ue ?? 20) < 10 },
  // Sociaux
  { id: 'greve_sncf', titre: 'Grève nationale SNCF — 3e jour', emoji: '🚆', categorie: 'social', impact: { tension_sociale: +12, popularite_joueur: -5, pib_croissance_pct: -0.1 }, probabilite: 0.10, condition: e => (e.tension_sociale ?? 45) > 40 },
  { id: 'manifestation_retraites', titre: 'Manifestation — 400 000 personnes dans les rues', emoji: '✊', categorie: 'social', impact: { tension_sociale: +18, popularite_joueur: -8 }, probabilite: 0.08, condition: e => (e.tension_sociale ?? 45) > 55 },
  { id: 'mouvement_agriculteurs', titre: "Blocage d'autoroutes par les agriculteurs", emoji: '🚜', categorie: 'social', impact: { tension_sociale: +10, popularite_joueur: -4, pib_croissance_pct: -0.05 }, probabilite: 0.09 },
  { id: 'hausse_sondage', titre: 'Sondage favorable — votre popularité rebondit', emoji: '📊', categorie: 'social', impact: { popularite_joueur: +4 }, probabilite: 0.08, condition: e => (e.popularite_joueur ?? 42) < 35 },
  // Géopolitiques
  { id: 'conflit_moyen_orient', titre: "Escalade au Moyen-Orient — prix du baril +15$", emoji: '🛢️', categorie: 'geopolitique', impact: { prix_baril: +15, inflation_pct: +0.5, tension_sociale: +8 }, probabilite: 0.10 },
  { id: 'cyberattaque_russe', titre: 'Cyberattaque sur les ministères (source : Moscou)', emoji: '🔐', categorie: 'geopolitique', impact: { stabilite: -8, relation_ue: +5 }, probabilite: 0.07 },
  { id: 'accord_ue_usa', titre: 'Accord commercial UE-USA signé à Bruxelles', emoji: '🤝', categorie: 'geopolitique', impact: { pib_croissance_pct: +0.2, relation_ue: +8, indice_confiance_marches: +5 }, probabilite: 0.08 },
  { id: 'crise_ukraine', titre: "Nouvelle offensive en Ukraine — inquiétudes énergétiques", emoji: '⚔️', categorie: 'geopolitique', impact: { prix_baril: +8, tension_sociale: +5, relation_ue: +10 }, probabilite: 0.09 },
  // Climatiques
  { id: 'canicule', titre: 'Canicule précoce — records de chaleur en mai', emoji: '🌡️', categorie: 'climatique', impact: { tension_sociale: +6, popularite_joueur: -3 }, probabilite: 0.08 },
  { id: 'inondations_sud', titre: 'Inondations dans le Var — état de catastrophe naturelle', emoji: '🌊', categorie: 'climatique', impact: { deficit_milliards: +2, popularite_joueur: +3, tension_sociale: +4 }, probabilite: 0.07 },
  { id: 'tempete_nord', titre: 'Tempête Aurore — 120 km/h en Bretagne', emoji: '🌪️', categorie: 'climatique', impact: { deficit_milliards: +1, tension_sociale: +3 }, probabilite: 0.07 },
  // Politiques
  { id: 'fuite_document', titre: "Fuite d'un document confidentiel de l'Élysée", emoji: '📄', categorie: 'politique', impact: { popularite_joueur: -7, pression_mediatique: +15 }, probabilite: 0.07, condition: e => (e.dissimulation ?? 20) > 30 },
  { id: 'soutien_pape', titre: 'Déclaration favorable du Vatican sur la politique sociale', emoji: '⛪', categorie: 'politique', impact: { popularite_joueur: +3, tension_sociale: -3 }, probabilite: 0.05 },
  { id: 'scandale_elu', titre: "Scandale financier d'un élu de la majorité", emoji: '💼', categorie: 'politique', impact: { popularite_joueur: -6, tension_sociale: +6, pression_mediatique: +12 }, probabilite: 0.08 },
  { id: 'ralliment_opposant', titre: 'Ralliement surprise d\'un élu LR à votre coalition', emoji: '🎯', categorie: 'politique', impact: { popularite_joueur: +2, stabilite: +4 }, probabilite: 0.06 },
]

function tirerEvenement(etatJeu, eventsDejaVus = []) {
  const eligibles = EVENTS_CATALOGUE.filter(e =>
    !eventsDejaVus.includes(e.id) &&
    (!e.condition || e.condition(etatJeu)) &&
    Math.random() < e.probabilite
  )
  if (eligibles.length === 0) return null
  return eligibles[Math.floor(Math.random() * eligibles.length)]
}

// ═══════════════════════════════════════════════════════════
// COMPOSANTS UI
// ═══════════════════════════════════════════════════════════

function KPI({ label, valeur, unite = '', tendance, icon, sous_label }) {
  const couleur = tendance === 'bon' ? 'text-emerald-400'
    : tendance === 'mauvais' ? 'text-red-400'
    : tendance === 'warning' ? 'text-yellow-400'
    : 'text-slate-200'
  const bg = tendance === 'bon' ? 'border-emerald-800/40 bg-emerald-950/20'
    : tendance === 'mauvais' ? 'border-red-800/40 bg-red-950/20'
    : tendance === 'warning' ? 'border-yellow-800/40 bg-yellow-950/20'
    : 'border-slate-700/60 bg-slate-800/60'
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1.5 ${bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <span className={`text-2xl font-black ${couleur}`}>{valeur}<span className="text-sm font-normal ml-1 text-slate-400">{unite}</span></span>
      {sous_label && <span className="text-xs text-slate-500">{sous_label}</span>}
    </div>
  )
}

function BarreProgression({ label, valeur, max = 100, inverse = false, unite = '' }) {
  const pct = Math.max(0, Math.min(100, (valeur / max) * 100))
  const danger  = inverse ? pct > 66 : pct < 25
  const warning = inverse ? pct > 40 : pct < 50
  const couleur = danger ? '#ef4444' : warning ? '#eab308' : '#22c55e'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{valeur}{unite}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: couleur }} />
      </div>
    </div>
  )
}

function BadgeVariation({ valeur, unite = '', inverse = false }) {
  if (!valeur || valeur === 0) return <span className="text-xs text-slate-600">—</span>
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${positif ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

function CarteEvenement({ evt, onDismiss }) {
  const cats = {
    economie:    'border-blue-700/40 bg-blue-950/20 text-blue-400',
    social:      'border-orange-700/40 bg-orange-950/20 text-orange-400',
    geopolitique:'border-red-700/40 bg-red-950/20 text-red-400',
    climatique:  'border-cyan-700/40 bg-cyan-950/20 text-cyan-400',
    politique:   'border-purple-700/40 bg-purple-950/20 text-purple-400',
  }
  const style = cats[evt.categorie] ?? 'border-slate-700/40 bg-slate-800/60 text-slate-400'
  return (
    <div className={`border rounded-xl p-3 flex items-start gap-3 ${style}`}>
      <span className="text-xl flex-shrink-0 mt-0.5">{evt.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{evt.titre}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {Object.entries(evt.impact).map(([k, v]) => (
            <BadgeVariation key={k} valeur={v} unite={k.includes('pct') ? '%' : k.includes('milliards') ? ' Md€' : k.includes('baril') ? '$' : ''} inverse={['tension_sociale','deficit_milliards','inflation_pct','pression_mediatique'].includes(k)} />
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1 capitalize">{evt.categorie}</p>
      </div>
      <button onClick={onDismiss} className="text-slate-600 hover:text-slate-300 text-xs flex-shrink-0 mt-0.5">✕</button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

export default function Dashboard({ etatJeu, passerTour, evenements, loading }) {
  const [eventsVus, setEventsVus]       = useState([])
  const [eventsActifs, setEventsActifs] = useState([])
  const [loiRecente, setLoiRecente]     = useState(null)

  // Lire les vraies valeurs depuis etatJeu (syncées avec GameEngine)
  const pop    = Math.round(etatJeu?.popularite_joueur             ?? 42)
  const stab   = Math.round(etatJeu?.stabilite                    ?? 58)
  const defic  = Math.round(etatJeu?.deficit_milliards             ?? 173)
  const reserv = Math.round(etatJeu?.reserve_budgetaire_milliards  ?? 28)
  const inflat = etatJeu?.inflation_pct                            ?? 2.8
  const pib    = etatJeu?.pib_croissance_pct                       ?? 0.8
  const tens   = Math.round(etatJeu?.tension_sociale               ?? 45)
  const ue     = Math.round(etatJeu?.relation_ue                   ?? 20)
  const march  = Math.round(etatJeu?.indice_confiance_marches       ?? 50)
  const consen = Math.round(etatJeu?.consentement_impot             ?? 55)
  const baril  = etatJeu?.prix_baril_dollars ?? etatJeu?.prix_baril ?? 80
  const elec   = Math.round(etatJeu?.prix_electricite              ?? 72)
  const press  = Math.round(etatJeu?.pression_mediatique           ?? 15)
  const dissim = Math.round(etatJeu?.dissimulation                 ?? 20)
  const tour   = etatJeu?.tour  ?? 1
  const date   = etatJeu?.date  ?? 'Mars 2026'
  const loisVotees = etatJeu?.lois_votees ?? []
  const scandales  = etatJeu?.scandales_actifs ?? []

  // Calcul dette / PIB (approximé)
  const dettePIB = Math.round(112.4 + (defic - 173) * 0.3)

  // Score global situation
  const scoreGlobal = Math.round(
    (pop * 0.25) +
    (stab * 0.20) +
    (Math.max(0, 100 - tens) * 0.15) +
    (march * 0.15) +
    (consen * 0.10) +
    (Math.max(0, Math.min(100, (ue + 100) / 2)) * 0.15)
  )
  const niveauScore = scoreGlobal > 65 ? { label: 'Solide', color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-700/40' }
    : scoreGlobal > 45 ? { label: 'Fragile', color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-700/40' }
    : { label: 'Critique', color: 'text-red-400', bg: 'bg-red-950/30 border-red-700/40' }

  // Événements depuis GameEngine + catalogue aléatoire au survol de tour
  const tousEvenements = useMemo(() => {
    const evtsMoteur = (evenements ?? []).slice(0, 3).map(e => ({
      id: `moteur_${e.titre ?? e}`,
      titre: e.titre ?? String(e),
      emoji: e.emoji ?? '📢',
      categorie: 'politique',
      impact: {},
    }))
    return [...eventsActifs, ...evtsMoteur]
  }, [evenements, eventsActifs])

  function dismissEvent(id) {
    setEventsActifs(prev => prev.filter(e => e.id !== id))
  }

  // Déclencher un événement aléatoire au clic "Passer tour"
  function handlePasserTour() {
    const evt = tirerEvenement(etatJeu ?? {}, eventsVus)
    if (evt) {
      setEventsActifs(prev => [evt, ...prev].slice(0, 5))
      setEventsVus(prev => [...prev, evt.id])
    }
    passerTour?.()
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5">

      {/* ── En-tête contexte ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-white">🏛️ Tableau de bord — Élysée</h2>
          <p className="text-sm text-slate-400 mt-0.5">Tour {tour} · {date}</p>
        </div>

        {/* Score global */}
        <div className={`rounded-xl border px-4 py-2.5 ${niveauScore.bg} flex items-center gap-3`}>
          <div className="text-right">
            <p className="text-xs text-slate-400">Situation globale</p>
            <p className={`text-2xl font-black ${niveauScore.color}`}>{scoreGlobal}<span className="text-sm font-normal">/100</span></p>
          </div>
          <div className={`text-lg font-bold ${niveauScore.color}`}>{niveauScore.label}</div>
        </div>
      </div>

      {/* ── Scandales actifs ── */}
      {scandales.length > 0 && (
        <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-3 flex items-start gap-3">
          <span className="text-xl">🚨</span>
          <div>
            <p className="text-sm font-bold text-red-300">{scandales.length} scandale{scandales.length > 1 ? 's' : ''} actif{scandales.length > 1 ? 's' : ''}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {scandales.map(s => (
                <span key={s.id} className="text-xs bg-red-900/50 text-red-300 border border-red-700/40 px-2 py-0.5 rounded">{s.emoji ?? '💼'} {s.titre}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Événements récents ── */}
      {tousEvenements.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Événements récents</p>
          {tousEvenements.slice(0, 4).map(evt => (
            <CarteEvenement key={evt.id} evt={evt} onDismiss={() => dismissEvent(evt.id)} />
          ))}
        </div>
      )}

      {/* ── KPI principaux ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Popularité" valeur={pop} unite="%" icon="❤️"
          tendance={pop > 50 ? 'bon' : pop > 35 ? 'warning' : 'mauvais'}
          sous_label={pop > 50 ? 'Soutien majoritaire' : pop > 35 ? 'Soutien fragile' : 'Soutien minoritaire'} />
        <KPI label="Stabilité" valeur={stab} unite="/100" icon="⚖️"
          tendance={stab > 55 ? 'bon' : stab > 35 ? 'warning' : 'mauvais'} />
        <KPI label="Tension sociale" valeur={tens} unite="/100" icon="⚡"
          tendance={tens < 40 ? 'bon' : tens < 65 ? 'warning' : 'mauvais'}
          sous_label={tens > 65 ? 'Risque de crise' : ''} />
        <KPI label="Confiance marchés" valeur={march} unite="/100" icon="📈"
          tendance={march > 60 ? 'bon' : march > 35 ? 'warning' : 'mauvais'} />
      </div>

      {/* ── 2 colonnes : Finances + Social/Diplo ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Finances publiques */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">💰 Finances Publiques</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 rounded-lg p-3">
              <p className="text-xs text-slate-400">Déficit annuel</p>
              <p className={`text-xl font-black mt-0.5 ${defic > 200 ? 'text-red-400' : defic > 150 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                −{defic} <span className="text-xs font-normal text-slate-500">Md€</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">Bruxelles limite : −{Math.round(defic * 0.4)} Md€</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3">
              <p className="text-xs text-slate-400">Dette / PIB</p>
              <p className={`text-xl font-black mt-0.5 ${dettePIB > 120 ? 'text-red-400' : dettePIB > 100 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {dettePIB}<span className="text-xs font-normal text-slate-500">%</span>
              </p>
            </div>
          </div>

          <BarreProgression label="Réserve budgétaire" valeur={reserv} max={80} unite=" Md€" />
          <BarreProgression label="Confiance des marchés" valeur={march} />
          <BarreProgression label="Consentement à l'impôt" valeur={consen} />

          <div className="border-t border-slate-700/40 pt-3 flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">PIB croissance</span>
              <span className={`font-bold ${pib > 1 ? 'text-emerald-400' : pib > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{pib > 0 ? '+' : ''}{pib}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Inflation</span>
              <span className={`font-bold ${inflat < 2 ? 'text-emerald-400' : inflat < 3.5 ? 'text-yellow-400' : 'text-red-400'}`}>{inflat}%</span>
            </div>
          </div>
        </div>

        {/* Climat social & diplomatique */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">🌍 Social & Diplomatie</h3>

          <BarreProgression label="Tension sociale" valeur={tens} inverse />
          <BarreProgression label="Relations UE" valeur={ue + 100} max={200} />
          <BarreProgression label="Pression médiatique" valeur={press} inverse />

          <div className="border-t border-slate-700/40 pt-3 grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 rounded-lg p-2.5">
              <p className="text-xs text-slate-400">Dissimulation</p>
              <p className={`text-lg font-black mt-0.5 ${dissim > 60 ? 'text-red-400' : dissim > 35 ? 'text-yellow-400' : 'text-emerald-400'}`}>{dissim}<span className="text-xs font-normal text-slate-500">/100</span></p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2.5">
              <p className="text-xs text-slate-400">Lois promulguées</p>
              <p className="text-lg font-black text-blue-400 mt-0.5">{loisVotees.length}<span className="text-xs font-normal text-slate-500"> ce mandat</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Énergie & Prix ── */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">⚡ Énergie & Marchés</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="Baril pétrole" valeur={baril} unite="$" icon="🛢️"
            tendance={baril > 110 ? 'mauvais' : baril > 90 ? 'warning' : 'bon'} />
          <KPI label="Électricité" valeur={elec} unite="€/MWh" icon="⚡"
            tendance={elec > 110 ? 'mauvais' : elec > 80 ? 'warning' : 'bon'} />
          <KPI label="Gaz" valeur={etatJeu?.prix_gaz ?? 38} unite="€/MWh" icon="🔥"
            tendance={(etatJeu?.prix_gaz ?? 38) > 60 ? 'mauvais' : 'bon'} />
          <KPI label="Avancement EPR2" valeur={etatJeu?.avancement_epr2_pct ?? 12} unite="%" icon="☢️"
            tendance={(etatJeu?.avancement_epr2_pct ?? 12) > 30 ? 'bon' : 'warning'} />
        </div>
      </div>

      {/* ── Actions rapides ── */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3">⚡ Indicateurs de risque</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Risque social */}
          <div className={`rounded-lg border p-3 ${tens > 65 ? 'border-red-700/50 bg-red-950/20' : tens > 45 ? 'border-yellow-700/50 bg-yellow-950/20' : 'border-emerald-700/50 bg-emerald-950/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">👥</span>
              <p className="text-xs font-bold text-white">Climat social</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ml-auto ${tens > 65 ? 'bg-red-900/60 text-red-400' : tens > 45 ? 'bg-yellow-900/60 text-yellow-400' : 'bg-emerald-900/60 text-emerald-400'}`}>
                {tens > 65 ? 'CRITIQUE' : tens > 45 ? 'TENDU' : 'STABLE'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{tens > 65 ? 'Grève générale imminente. Agissez.' : tens > 45 ? 'Tensions perceptibles dans plusieurs secteurs.' : 'Pas de mouvement social majeur prévu.'}</p>
          </div>

          {/* Risque budgétaire */}
          <div className={`rounded-lg border p-3 ${defic > 200 ? 'border-red-700/50 bg-red-950/20' : defic > 160 ? 'border-yellow-700/50 bg-yellow-950/20' : 'border-emerald-700/50 bg-emerald-950/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">💰</span>
              <p className="text-xs font-bold text-white">Risque budgétaire</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ml-auto ${defic > 200 ? 'bg-red-900/60 text-red-400' : defic > 160 ? 'bg-yellow-900/60 text-yellow-400' : 'bg-emerald-900/60 text-emerald-400'}`}>
                {defic > 200 ? 'ALERTE' : defic > 160 ? 'SURVEILLER' : 'OK'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{defic > 200 ? 'Procédure de déficit excessif probable.' : defic > 160 ? 'Bruxelles surveille. Des coupes sont attendues.' : 'Trajectoire budgétaire dans les clous.'}</p>
          </div>

          {/* Risque médiatique / scandale */}
          <div className={`rounded-lg border p-3 ${press > 60 || dissim > 50 ? 'border-red-700/50 bg-red-950/20' : press > 35 ? 'border-yellow-700/50 bg-yellow-950/20' : 'border-emerald-700/50 bg-emerald-950/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">📺</span>
              <p className="text-xs font-bold text-white">Risque médiatique</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ml-auto ${press > 60 || dissim > 50 ? 'bg-red-900/60 text-red-400' : press > 35 ? 'bg-yellow-900/60 text-yellow-400' : 'bg-emerald-900/60 text-emerald-400'}`}>
                {press > 60 || dissim > 50 ? 'ÉLEVÉ' : press > 35 ? 'MODÉRÉ' : 'FAIBLE'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{press > 60 ? 'Un scandale peut éclater à tout moment.' : press > 35 ? 'La presse creuse. Surveillance renforcée.' : 'Aucune fuite imminente détectée.'}</p>
          </div>
        </div>
      </div>

    </div>
  )
}
