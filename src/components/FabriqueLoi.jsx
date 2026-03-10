import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────
// COMPOSITION DU SÉNAT (fixe 2026, modifiable par événements)
// ─────────────────────────────────────────────────────────────
export const SENAT_INITIAL = {
  LR:     148,
  UC:      56, // Union Centriste (alliés LR)
  RDPI:    23, // Groupe Renaissance
  INDEP:   16,
  SER:     64, // Socialistes et Républicains
  CRCE:    17, // Communistes
  GEST:    17, // Gauche environnement solidarités
  RN:       4,
  DIVERS:   1,
  total:  346,
}

// ─────────────────────────────────────────────────────────────
// PROFILS SOCIAUX
// ─────────────────────────────────────────────────────────────
const PROFILS = [
  { id: 'soignant',    label: 'Soignant',     emoji: '🏥' },
  { id: 'etudiant',    label: 'Étudiant',     emoji: '🎓' },
  { id: 'commercant',  label: 'Commerçant',   emoji: '🛍️' },
  { id: 'salarie',     label: 'Salarié / RH', emoji: '💼' },
  { id: 'juriste',     label: 'Juriste',      emoji: '⚖️' },
  { id: 'agriculteur', label: 'Agriculteur',  emoji: '🌾' },
  { id: 'retraite',    label: 'Retraité',     emoji: '👴' },
  { id: 'btp',         label: 'BTP',          emoji: '🏗️' },
  { id: 'numerique',   label: 'Numérique',    emoji: '💻' },
  { id: 'industrie',   label: 'Industrie',    emoji: '🏭' },
]

const SCENARIOS_TYPES = [
  { emoji: '🏥', label: 'Ségur 2.0',              texte: 'Augmentation de 500€ net pour tous les paramédicaux et fermeture des cliniques privées ne participant pas aux gardes.' },
  { emoji: '🏥', label: 'Déserts médicaux',        texte: "Obligation pour tout nouveau médecin de s'installer 3 ans en zone sous-dense sous peine de non-remboursement par la CPAM." },
  { emoji: '🛡️', label: 'Bouclier de proximité',  texte: "Création de polices municipales renforcées sous autorité des maires pour pallier le manque d'effectifs de la Police Nationale." },
  { emoji: '🛡️', label: 'Surveillance IA',         texte: 'Généralisation de la reconnaissance faciale dans les transports pour identifier les personnes fichées S.' },
  { emoji: '⚖️', label: 'Verdict rapide',           texte: 'Suppression du jury populaire pour les délits financiers afin de diviser par deux les délais de jugement.' },
  { emoji: '⚖️', label: 'Responsabilité parentale', texte: 'Suppression des allocations familiales et amendes pour les parents de mineurs récidivistes.' },
  { emoji: '💼', label: 'Semaine 4 jours',          texte: 'Passage à 32h payées 35h pour les métiers à forte pénibilité, financé par une taxe sur les dividendes.' },
  { emoji: '💼', label: 'Revenu Jeunes',            texte: "Versement de 800€/mois pour tous les 18-25 ans sans ressources, conditionné à une formation ou un service civique." },
  { emoji: '🎓', label: 'Uniforme républicain',     texte: "Obligation du port de l'uniforme dans tous les collèges et lycées publics, financé par l'État." },
  { emoji: '🎓', label: 'Sélection post-bac',       texte: "Remplacement de Parcoursup par un concours national d'entrée pour chaque filière universitaire." },
]

// ─────────────────────────────────────────────────────────────
// CONFIG OLLAMA
// ─────────────────────────────────────────────────────────────
const OLLAMA_URL   = 'http://localhost:11434'
const OLLAMA_MODEL = 'gemma3:12b'

// ─────────────────────────────────────────────────────────────
// DÉTECTION OLLAMA
// ─────────────────────────────────────────────────────────────
async function detecterOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return false
    const data = await res.json()
    return data.models?.some(m => m.name?.startsWith('gemma3'))
  } catch { return false }
}

// ─────────────────────────────────────────────────────────────
// APPELS IA
// ─────────────────────────────────────────────────────────────
async function appelOllama(prompt) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, options: { temperature: 0.7, num_predict: 3000 } }),
  })
  if (!res.ok) throw new Error(`Ollama erreur ${res.status}`)
  const data = await res.json()
  return data.response ?? ''
}

async function appelAnthropic(prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? `Erreur ${res.status}`)
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('')
}

// ─────────────────────────────────────────────────────────────
// PROMPT ENRICHI
// ─────────────────────────────────────────────────────────────
function construirePrompt(intention, etatJeu, loisDejaVotees = []) {
  const loisResume = loisDejaVotees.length > 0
    ? loisDejaVotees.map(l => `- "${l.titre ?? l.id}" (thème: ${l.bloc ?? 'inconnu'})`).join('\n')
    : "- Aucune loi votée pour l'instant."

  return `Tu es le moteur législatif d'un jeu de simulation politique "France 2026".
Le joueur est Président de la République française. Contexte :
- Popularité : ${etatJeu?.popularite_joueur ?? 42}%
- Déficit : ${etatJeu?.deficit_milliards ?? 173} Md€
- Inflation : ${etatJeu?.inflation_pct ?? 2.8}%
- Tension sociale : ${etatJeu?.tension_sociale ?? 45}/100
- Prix du baril : ${etatJeu?.prix_baril ?? 80}$
- Relations UE : ${etatJeu?.relation_ue ?? 20}/100
- Date : ${etatJeu?.date ?? 'Mars 2026'}

Lois déjà votées par le joueur :
${loisResume}

Le joueur propose cette loi : "${intention}"

Génère UNIQUEMENT un objet JSON valide (sans balises markdown, sans texte avant ou après) avec cette structure exacte :
{
  "titre_officiel": "Nom court et officiel de la loi (max 8 mots)",
  "expose_motifs": "Résumé de 2 phrases expliquant l'objectif et le contexte.",
  "articles": ["Article 1 - ...", "Article 2 - ...", "Article 3 - ..."],
  "tags": ["TAG1", "TAG2", "TAG3"],

  "analyse_juridique": {
    "statut": "valide|conflit_loi_ordinaire|conflit_constitutionnel",
    "loi_abrogee": "Nom de la loi abrogée si conflit_loi_ordinaire, sinon null",
    "loi_abrogee_consequences": "1 phrase sur ce que cela change concrètement, sinon null",
    "article_constitutionnel_bloque": "ex: Article 66-1, Article 17 DDHC, sinon null",
    "explication_blocage": "1 phrase claire sur pourquoi c'est inconstitutionnel, sinon null",
    "voie_art11": "Description du référendum possible (Article 11) et son risque politique, ou null",
    "voie_art89": "Description de la révision constitutionnelle (Article 89) et si le Sénat actuel serait favorable, ou null",
    "etapes_deblocage": ["Étape 1...", "Étape 2...", "Étape 3..."]
  },

  "coherence_ideologique": {
    "contradictions": [
      { "loi_anterieure": "Titre de la loi en conflit idéologique parmi celles déjà votées", "detail": "1 phrase expliquant la contradiction" }
    ],
    "renforcements": [
      { "loi_anterieure": "Titre de la loi que celle-ci renforce logiquement", "detail": "1 phrase" }
    ]
  },

  "dependances_legislatives": [
    {
      "titre": "Titre de la loi fille requise pour que cette réforme soit applicable",
      "urgence": "immediate|court_terme|moyen_terme",
      "raison": "1 phrase expliquant pourquoi cette loi est nécessaire en conséquence directe"
    }
  ],

  "quatre_prismes": {
    "lettre": "Traduction juridique froide et précise de ce que fait réellement ce texte (1-2 phrases).",
    "esprit": "Impact concret sur le quotidien du citoyen lambda, sans jargon (1-2 phrases).",
    "failles": "Imprécisions ou zones grises que les avocats et opposants vont exploiter (1-2 phrases).",
    "caricature": "Comment l'opposition médiatique va tordre cette loi pour la rendre odieuse — comme un titre de journal (1 phrase percutante)."
  },

  "impacts": {
    "popularite_joueur": 0,
    "tension_sociale": 0,
    "deficit_milliards": 0,
    "inflation_pct": 0,
    "pib_croissance_pct": 0,
    "relation_ue": 0,
    "indice_confiance_marches": 0,
    "consentement_impot": 0
  },
  "profils": {
    "soignant":    { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "etudiant":    { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "commercant":  { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "salarie":     { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "juriste":     { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "agriculteur": { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "retraite":    { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "btp":         { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "numerique":   { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" },
    "industrie":   { "impact": "positif|negatif|neutre", "detail": "1 phrase courte" }
  },
  "reactions_partis": {
    "LFI":    { "position": "pour|contre|abstention", "raison": "1 phrase" },
    "PS_ECO": { "position": "pour|contre|abstention", "raison": "1 phrase" },
    "EPR":    { "position": "pour|contre|abstention", "raison": "1 phrase" },
    "LR":     { "position": "pour|contre|abstention", "raison": "1 phrase" },
    "RN":     { "position": "pour|contre|abstention", "raison": "1 phrase" }
  },
  "risques": {
    "conseil_constitutionnel": "aucun|faible|moyen|eleve",
    "detail_cc": "1 phrase si risque > aucun, sinon null",
    "conformite_ue": "conforme|risque_faible|risque_moyen|risque_eleve",
    "detail_ue": "1 phrase si risque > conforme, sinon null"
  },
  "cout_budgetaire": "gratuit|faible|modere|eleve|tres_eleve",
  "amendement_rn": "Texte de l'amendement que le RN déposerait (1 phrase)"
}`
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRE SÉNAT
// ─────────────────────────────────────────────────────────────
function calculerMajoriteSenat(senat) {
  // Groupes tendanciellement favorables à une révision de centre-droit
  const favorables = (senat.LR ?? 0) + (senat.UC ?? 0) + (senat.RDPI ?? 0) + (senat.INDEP ?? 0)
  const total = senat.total ?? 346
  return { favorables, total, majorite: favorables > total / 2 }
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS UI
// ─────────────────────────────────────────────────────────────

function BadgeSource({ source }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
      source === 'ollama'      ? 'bg-purple-900/60 border border-purple-700/50 text-purple-300'
      : source === 'anthropic' ? 'bg-blue-900/60 border border-blue-700/50 text-blue-300'
      : 'bg-slate-800 border border-slate-700 text-slate-400'
    }`}>
      {source === 'ollama'    && <><span>🟣</span><span>Gemma 3 local</span></>}
      {source === 'anthropic' && <><span>🔵</span><span>Claude Sonnet</span></>}
      {source === 'detection' && <><span className="animate-pulse">⚪</span><span>Détection...</span></>}
      {!source                && <><span>⚪</span><span>IA non connectée</span></>}
    </div>
  )
}

function BadgeImpact({ valeur, unite = '', inverse = false }) {
  if (valeur === 0 || valeur === undefined) return <span className="text-xs text-slate-500">—</span>
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-sm font-bold ${positif ? 'text-green-400' : 'text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

function CarteProfilImpact({ profil, data }) {
  const couleurs = { positif: 'border-green-700 bg-green-900/20', negatif: 'border-red-700 bg-red-900/20', neutre: 'border-slate-600 bg-slate-800' }
  const icones   = { positif: '✅', negatif: '❌', neutre: '➖' }
  return (
    <div className={`rounded-lg border p-3 flex flex-col gap-1 ${couleurs[data.impact]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{profil.emoji}</span>
        <span className="text-xs font-semibold text-white">{profil.label}</span>
        <span className="ml-auto text-sm">{icones[data.impact]}</span>
      </div>
      <p className="text-xs text-slate-400">{data.detail}</p>
    </div>
  )
}

function CartePartiReaction({ nom, data }) {
  const couleurs = {
    pour:       'bg-green-900/30 border-green-700 text-green-300',
    contre:     'bg-red-900/30 border-red-700 text-red-300',
    abstention: 'bg-slate-700 border-slate-600 text-slate-300',
  }
  const icones = { pour: '✅', contre: '❌', abstention: '🤷' }
  return (
    <div className={`rounded-lg border px-3 py-2 flex flex-col gap-1 ${couleurs[data.position]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">{nom}</span>
        <span className="text-sm">{icones[data.position]}</span>
      </div>
      <p className="text-xs opacity-75">{data.raison}</p>
    </div>
  )
}

function BadgeRisque({ niveau, label }) {
  const styles = {
    aucun: 'bg-green-900 text-green-300', conforme: 'bg-green-900 text-green-300',
    faible: 'bg-yellow-900 text-yellow-300', risque_faible: 'bg-yellow-900 text-yellow-300',
    moyen: 'bg-orange-900 text-orange-300', risque_moyen: 'bg-orange-900 text-orange-300',
    eleve: 'bg-red-900 text-red-300', risque_eleve: 'bg-red-900 text-red-300',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${styles[niveau] ?? 'bg-slate-700 text-slate-300'}`}>
      {label} : {niveau.replace(/_/g, ' ')}
    </span>
  )
}

function BadgeCout({ niveau }) {
  const styles = { gratuit: 'bg-green-900 text-green-300', faible: 'bg-green-800 text-green-300', modere: 'bg-yellow-900 text-yellow-300', eleve: 'bg-orange-900 text-orange-300', tres_eleve: 'bg-red-900 text-red-300' }
  const emojis = { gratuit: '💚', faible: '🟢', modere: '🟡', eleve: '🟠', tres_eleve: '🔴' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${styles[niveau] ?? 'bg-slate-700 text-slate-300'}`}>
      {emojis[niveau] ?? '⚪'} Coût : {niveau?.replace(/_/g, ' ')}
    </span>
  )
}

// ─── Modal Conflit Constitutionnel ───────────────────────────
function ModalConflitConstitutionnel({ loi, senat, onArt11, onArt89, onAbandon }) {
  const aj = loi.analyse_juridique ?? {}
  const { favorables, total, majorite } = calculerMajoriteSenat(senat)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-red-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 flex flex-col gap-5">

          <div className="flex items-start gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className="text-lg font-bold text-red-300">Alerte Constitutionnelle</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Votre projet <span className="text-white font-semibold">"{loi.titre_officiel}"</span> se heurte à un verrou constitutionnel.
              </p>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1">
              Verrou : {aj.article_constitutionnel_bloque ?? 'Article constitutionnel'}
            </p>
            <p className="text-sm text-slate-300">{aj.explication_blocage ?? 'Ce projet entre en contradiction avec la Constitution française.'}</p>
          </div>

          {aj.etapes_deblocage?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Feuille de route pour débloquer</p>
              <div className="flex flex-col gap-2">
                {aj.etapes_deblocage.map((etape, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-slate-500 mt-0.5 w-4 shrink-0">{i + 1}.</span>
                    <p className="text-xs text-slate-300">{etape}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Article 11 */}
            <div className="bg-orange-900/20 border border-orange-700 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold text-orange-300 mb-1">⚡ Article 11 — Référendum direct</p>
                <p className="text-xs text-slate-400">{aj.voie_art11 ?? "Court-circuiter le Parlement en consultant directement le peuple par référendum."}</p>
              </div>
              <div className="bg-orange-950/40 rounded-lg p-2 border border-orange-800">
                <p className="text-xs text-orange-400 font-semibold">⚠️ Risque maximal</p>
                <p className="text-xs text-slate-400 mt-0.5">Si le référendum est perdu → démission forcée, fin de partie.</p>
              </div>
              <button onClick={onArt11}
                className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
                🗳️ Lancer le référendum (Art. 11)
              </button>
            </div>

            {/* Article 89 */}
            <div className={`border rounded-xl p-4 flex flex-col gap-3 ${majorite ? 'bg-blue-900/20 border-blue-700' : 'bg-slate-800 border-slate-600'}`}>
              <div>
                <p className={`text-xs font-bold mb-1 ${majorite ? 'text-blue-300' : 'text-slate-400'}`}>
                  🏛️ Article 89 — Révision constitutionnelle
                </p>
                <p className="text-xs text-slate-400">{aj.voie_art89 ?? "Réunir le Parlement en Congrès à Versailles. Nécessite 3/5e des suffrages."}</p>
              </div>
              <div className={`rounded-lg p-2 border ${majorite ? 'bg-blue-950/40 border-blue-800' : 'bg-slate-700 border-slate-600'}`}>
                <p className={`text-xs font-semibold ${majorite ? 'text-blue-300' : 'text-slate-500'}`}>
                  {majorite ? '✅ Sénat favorable' : '❌ Sénat défavorable'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Groupes favorables : {favorables}/{total} sénateurs
                  {!majorite && ' — majorité insuffisante.'}
                </p>
              </div>
              <button onClick={onArt89} disabled={!majorite}
                className={`w-full py-2 text-xs font-bold rounded-lg transition-colors ${
                  majorite ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}>
                🏛️ Révision au Congrès (Art. 89)
              </button>
            </div>
          </div>

          <button onClick={onAbandon}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-lg transition-colors">
            🗑️ Abandonner ce projet de loi
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Abrogation loi ordinaire ──────────────────────────
function ModalAbrogation({ loi, onConfirmer, onAbandon }) {
  const aj = loi.analyse_juridique ?? {}
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-yellow-700 rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-yellow-300">Conflit législatif détecté</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Votre loi <span className="text-white font-semibold">"{loi.titre_officiel}"</span> entre en contradiction avec une loi existante.
              </p>
            </div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-xs text-yellow-400 font-semibold mb-1">Loi abrogée : {aj.loi_abrogee}</p>
            <p className="text-sm text-slate-300">{aj.loi_abrogee_consequences}</p>
          </div>
          <p className="text-xs text-slate-400">
            Si vous confirmez, l'ancienne loi sera automatiquement abrogée lors du vote. Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <button onClick={onConfirmer}
              className="flex-1 py-2.5 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded-lg text-sm transition-colors">
              ✅ Confirmer et abroger
            </button>
            <button onClick={onAbandon}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Panneau 4 Prismes ────────────────────────────────────────
function PanneauQuatrePrismes({ prismes }) {
  const [ouvert, setOuvert] = useState(false)
  const items = [
    { key: 'lettre',     label: 'La Lettre',    emoji: '📜', couleur: 'border-blue-700 bg-blue-900/10',     texte: prismes.lettre },
    { key: 'esprit',     label: "L'Esprit",      emoji: '💡', couleur: 'border-green-700 bg-green-900/10',   texte: prismes.esprit },
    { key: 'failles',    label: 'Les Failles',   emoji: '🔍', couleur: 'border-orange-700 bg-orange-900/10', texte: prismes.failles },
    { key: 'caricature', label: 'La Caricature', emoji: '📰', couleur: 'border-red-700 bg-red-900/10',       texte: prismes.caricature },
  ]
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setOuvert(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">🔎</span>
          <h4 className="font-semibold text-white">Analyse en 4 prismes</h4>
          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Lettre · Esprit · Failles · Caricature</span>
        </div>
        <span className="text-slate-400 text-sm">{ouvert ? '▲' : '▼'}</span>
      </button>
      {ouvert && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(({ key, label, emoji, couleur, texte }) => (
            <div key={key} className={`rounded-lg border p-4 ${couleur}`}>
              <p className="text-xs font-bold text-slate-300 mb-2">{emoji} {label}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{texte ?? '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Panneau Cohérence Idéologique ───────────────────────────
function PanneauCoherence({ coherence }) {
  const contradictions = coherence?.contradictions ?? []
  const renforcements  = coherence?.renforcements  ?? []
  if (contradictions.length === 0 && renforcements.length === 0) return null
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col gap-4">
      <h4 className="font-semibold text-white">🧠 Cohérence idéologique</h4>
      {contradictions.length > 0 && (
        <div>
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-2">⚡ Contradictions avec vos lois précédentes</p>
          <div className="flex flex-col gap-2">
            {contradictions.map((c, i) => (
              <div key={i} className="bg-red-900/15 border border-red-800 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-red-300">"{c.loi_anterieure}"</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {renforcements.length > 0 && (
        <div>
          <p className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-2">✅ Renforcements</p>
          <div className="flex flex-col gap-2">
            {renforcements.map((r, i) => (
              <div key={i} className="bg-green-900/15 border border-green-800 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-green-300">"{r.loi_anterieure}"</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Panneau Dépendances Législatives ────────────────────────
function PanneauDependances({ dependances }) {
  if (!dependances || dependances.length === 0) return null
  const urgenceStyle = {
    immediate:   { label: 'Immédiat',    cls: 'bg-red-900 text-red-300' },
    court_terme: { label: 'Court terme', cls: 'bg-orange-900 text-orange-300' },
    moyen_terme: { label: 'Moyen terme', cls: 'bg-yellow-900 text-yellow-300' },
  }
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col gap-3">
      <h4 className="font-semibold text-white">🔗 Lois impliquées — à voter ensuite</h4>
      <p className="text-xs text-slate-500">Ces textes seront nécessaires pour que votre réforme soit pleinement applicable.</p>
      <div className="flex flex-col gap-2">
        {dependances.map((d, i) => {
          const u = urgenceStyle[d.urgence] ?? urgenceStyle.moyen_terme
          return (
            <div key={i} className="bg-slate-900 rounded-lg px-3 py-3 flex items-start gap-3">
              <span className="text-slate-500 text-sm mt-0.5">→</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-xs font-semibold text-white">{d.titre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${u.cls}`}>{u.label}</span>
                </div>
                <p className="text-xs text-slate-400">{d.raison}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function FabriqueLoi({ etatJeu, voterLoi, senat: senatProp }) {
  const senat = senatProp ?? SENAT_INITIAL

  const [intention, setIntention]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [erreur, setErreur]         = useState(null)
  const [loiGeneree, setLoiGeneree] = useState(null)
  const [adoptee, setAdoptee]       = useState(false)
  const [source, setSource]         = useState(null)
  const [ollamaDisponible, setOllamaDisponible] = useState(null)
  const [modalConstitution, setModalConstitution] = useState(false)
  const [modalAbrogation, setModalAbrogation]     = useState(false)

  useEffect(() => {
    setSource('detection')
    detecterOllama().then(dispo => {
      setOllamaDisponible(dispo)
      setSource(dispo ? 'ollama' : 'anthropic')
    })
  }, [])

  // ── Génération ──────────────────────────────────────────────
  async function genererLoi() {
    if (!intention.trim() || intention.length < 10) {
      setErreur('Décrivez votre intention en au moins 10 caractères.')
      return
    }
    setLoading(true)
    setErreur(null)
    setLoiGeneree(null)
    setAdoptee(false)
    setModalConstitution(false)
    setModalAbrogation(false)

    const loisDejaVotees = etatJeu?.lois_votees ?? []
    const prompt = construirePrompt(intention, etatJeu, loisDejaVotees)
    let texte = ''
    let sourceUtilisee = 'anthropic'

    try {
      if (ollamaDisponible) {
        try {
          texte = await appelOllama(prompt)
          sourceUtilisee = 'ollama'
        } catch (errOllama) {
          console.warn('Ollama indisponible, bascule Anthropic :', errOllama.message)
          texte = await appelAnthropic(prompt)
          sourceUtilisee = 'anthropic'
          setOllamaDisponible(false)
        }
      } else {
        texte = await appelAnthropic(prompt)
        sourceUtilisee = 'anthropic'
      }

      setSource(sourceUtilisee)
      const loi = JSON.parse(texte.replace(/```json|```/g, '').trim())
      setLoiGeneree(loi)

      // Ouvrir le bon modal selon le statut juridique
      const statut = loi.analyse_juridique?.statut
      if (statut === 'conflit_constitutionnel') {
        setModalConstitution(true)
      } else if (statut === 'conflit_loi_ordinaire') {
        setModalAbrogation(true)
      }
    } catch (e) {
      setErreur(`Erreur : ${e.message}`)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── Actions modals ──────────────────────────────────────────
  function handleArt11() {
    setModalConstitution(false)
    if (voterLoi) voterLoi(loiGeneree?.titre_officiel ?? 'custom', 0, { voie_constitutionnelle: 'art11', risque_fin_partie: true })
    setAdoptee(true)
  }

  function handleArt89() {
    setModalConstitution(false)
    if (voterLoi) voterLoi(loiGeneree?.titre_officiel ?? 'custom', 0, { voie_constitutionnelle: 'art89' })
    setAdoptee(true)
  }

  function handleConfirmerAbrogation() {
    setModalAbrogation(false)
    // Le joueur confirme : on laisse la loi être soumise normalement au vote
  }

  function adopterLoi() {
    if (!loiGeneree) return
    if (voterLoi) voterLoi(loiGeneree?.titre_officiel ?? 'custom', 0)
    setAdoptee(true)
  }

  async function retenterDetection() {
    setSource('detection')
    const dispo = await detecterOllama()
    setOllamaDisponible(dispo)
    setSource(dispo ? 'ollama' : 'anthropic')
  }

  const INDICATEURS = [
    { key: 'popularite_joueur',        label: 'Popularité',         unite: '%' },
    { key: 'tension_sociale',          label: 'Tension sociale',    unite: '',     inverse: true },
    { key: 'deficit_milliards',        label: 'Déficit',            unite: ' Md€', inverse: true },
    { key: 'inflation_pct',            label: 'Inflation',          unite: '%',    inverse: true },
    { key: 'pib_croissance_pct',       label: 'PIB',                unite: '%' },
    { key: 'relation_ue',              label: 'Relations UE',       unite: '' },
    { key: 'indice_confiance_marches', label: 'Marchés',            unite: '' },
    { key: 'consentement_impot',       label: 'Consentement impôt', unite: '' },
  ]

  const statut = loiGeneree?.analyse_juridique?.statut

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">

      {/* ── Modals ── */}
      {modalConstitution && loiGeneree && (
        <ModalConflitConstitutionnel
          loi={loiGeneree}
          senat={senat}
          onArt11={handleArt11}
          onArt89={handleArt89}
          onAbandon={() => { setModalConstitution(false); setLoiGeneree(null); setIntention('') }}
        />
      )}
      {modalAbrogation && loiGeneree && (
        <ModalAbrogation
          loi={loiGeneree}
          onConfirmer={handleConfirmerAbrogation}
          onAbandon={() => { setModalAbrogation(false); setLoiGeneree(null); setIntention('') }}
        />
      )}

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">⚗️ Fabrique de loi</h2>
          <p className="text-sm text-slate-400 mt-1">
            Exprimez votre intention — l'IA la transforme en projet de loi avec analyse juridique complète.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BadgeSource source={source} />
          {source === 'anthropic' && ollamaDisponible === false && (
            <button onClick={retenterDetection} className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors">
              Relancer Ollama ?
            </button>
          )}
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400">
            🏛️ {etatJeu?.date ?? 'Mars 2026'}
          </div>
        </div>
      </div>

      {/* ── Bannières Ollama ── */}
      {ollamaDisponible === true && (
        <div className="bg-purple-950/40 border border-purple-700/40 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <span className="text-purple-400">🟣</span>
          <div>
            <p className="text-xs font-semibold text-purple-300">Ollama détecté — Gemma 3 12B actif</p>
            <p className="text-xs text-slate-500">L'IA tourne localement. Aucune donnée envoyée en ligne.</p>
          </div>
        </div>
      )}
      {ollamaDisponible === false && (
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">⚪</span>
            <div>
              <p className="text-xs font-semibold text-slate-300">Ollama non détecté — Claude Sonnet actif</p>
              <p className="text-xs text-slate-500">
                Pour Gemma 3 en local : <span className="text-blue-400">ollama.com</span> puis <code className="bg-slate-700 px-1 rounded">ollama pull gemma3:12b</code>
              </p>
            </div>
          </div>
          <button onClick={retenterDetection} className="flex-shrink-0 text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
            🔄 Vérifier
          </button>
        </div>
      )}

      {/* ── Saisie ── */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✍️</span>
          <h3 className="font-semibold text-white">Votre intention politique</h3>
        </div>
        <textarea
          value={intention}
          onChange={e => setIntention(e.target.value)}
          placeholder="Exemple : Je veux obliger les cliniques privées à participer aux gardes de nuit, ou augmenter le SMIC à 1700€ en compensant les PME via une exonération de charges..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          rows={4}
        />
        <div>
          <p className="text-xs text-slate-500 mb-2">💡 Scénarios types :</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS_TYPES.map((s, i) => (
              <button key={i} onClick={() => setIntention(s.texte)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors">
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>
        {erreur && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded p-2">⚠️ {erreur}</p>
        )}
        <button
          onClick={genererLoi}
          disabled={loading || intention.trim().length < 10}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
            loading || intention.trim().length < 10
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : source === 'ollama' ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {loading
            ? `⚙️ ${source === 'ollama' ? 'Gemma 3 analyse' : 'Claude analyse'} votre proposition...`
            : `🏛️ Soumettre au Conseil Juridique ${source === 'ollama' ? '(local)' : '(cloud)'}`}
        </button>
      </div>

      {/* ── Résultat ── */}
      {loiGeneree && !adoptee && (
        <div className="flex flex-col gap-5">

          {/* Badge alerte statut */}
          {statut && statut !== 'valide' && (
            <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              statut === 'conflit_constitutionnel' ? 'bg-red-900/20 border-red-700' : 'bg-yellow-900/20 border-yellow-700'
            }`}>
              <span className="text-xl">{statut === 'conflit_constitutionnel' ? '🚨' : '⚠️'}</span>
              <div>
                <p className={`text-xs font-bold ${statut === 'conflit_constitutionnel' ? 'text-red-300' : 'text-yellow-300'}`}>
                  {statut === 'conflit_constitutionnel'
                    ? 'Conflit constitutionnel — action requise'
                    : `Abroge une loi existante : "${loiGeneree.analyse_juridique?.loi_abrogee}"`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {statut === 'conflit_constitutionnel'
                    ? loiGeneree.analyse_juridique?.explication_blocage
                    : loiGeneree.analyse_juridique?.loi_abrogee_consequences}
                </p>
              </div>
            </div>
          )}

          {/* En-tête loi */}
          <div className="bg-slate-800 rounded-xl border border-blue-800 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-blue-400 uppercase tracking-wide">Projet de loi</p>
                  <BadgeSource source={source} />
                </div>
                <h3 className="text-xl font-bold text-white">{loiGeneree.titre_officiel}</h3>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                <BadgeCout niveau={loiGeneree.cout_budgetaire} />
                <div className="flex gap-1 flex-wrap justify-end">
                  {loiGeneree.tags?.map(t => (
                    <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">#{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-300 italic border-l-2 border-blue-600 pl-4 mb-4">
              {loiGeneree.expose_motifs}
            </p>
            <div className="flex flex-col gap-1.5">
              {loiGeneree.articles?.map((art, i) => (
                <p key={i} className="text-xs text-slate-400 bg-slate-900 rounded p-2">{art}</p>
              ))}
            </div>
          </div>

          {/* 4 Prismes */}
          {loiGeneree.quatre_prismes && <PanneauQuatrePrismes prismes={loiGeneree.quatre_prismes} />}

          {/* Cohérence idéologique */}
          {loiGeneree.coherence_ideologique && <PanneauCoherence coherence={loiGeneree.coherence_ideologique} />}

          {/* Dépendances */}
          {loiGeneree.dependances_legislatives && <PanneauDependances dependances={loiGeneree.dependances_legislatives} />}

          {/* Impacts */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h4 className="font-semibold text-white mb-4">📊 Impacts sur la République</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INDICATEURS.map(({ key, label, unite, inverse }) => (
                <div key={key} className="bg-slate-900 rounded-lg p-3 flex flex-col gap-1">
                  <p className="text-xs text-slate-500">{label}</p>
                  <BadgeImpact valeur={loiGeneree.impacts?.[key] ?? 0} unite={unite} inverse={inverse} />
                </div>
              ))}
            </div>
          </div>

          {/* Profils */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h4 className="font-semibold text-white mb-4">👥 Impact par profil social</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PROFILS.map(profil => {
                const data = loiGeneree.profils?.[profil.id]
                if (!data) return null
                return <CarteProfilImpact key={profil.id} profil={profil} data={data} />
              })}
            </div>
          </div>

          {/* Réactions partis */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h4 className="font-semibold text-white mb-4">🗣️ Réactions des partis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(loiGeneree.reactions_partis ?? {}).map(([nom, data]) => (
                <CartePartiReaction key={nom} nom={nom} data={data} />
              ))}
            </div>
            {loiGeneree.amendement_rn && (
              <div className="mt-3 bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-400 font-semibold mb-1">📋 Amendement déposé par le RN</p>
                <p className="text-xs text-slate-300">{loiGeneree.amendement_rn}</p>
              </div>
            )}
          </div>

          {/* Risques juridiques */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h4 className="font-semibold text-white mb-3">⚠️ Risques juridiques</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <BadgeRisque niveau={loiGeneree.risques?.conseil_constitutionnel ?? 'aucun'} label="Conseil Constitutionnel" />
              <BadgeRisque niveau={loiGeneree.risques?.conformite_ue ?? 'conforme'} label="Conformité UE" />
            </div>
            {loiGeneree.risques?.detail_cc && <p className="text-xs text-slate-400 mb-1">⚖️ {loiGeneree.risques.detail_cc}</p>}
            {loiGeneree.risques?.detail_ue && <p className="text-xs text-slate-400">🇪🇺 {loiGeneree.risques.detail_ue}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {statut === 'conflit_constitutionnel' ? (
              <button onClick={() => setModalConstitution(true)}
                className="flex-1 py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors">
                🚨 Voir les voies de déblocage constitutionnel
              </button>
            ) : (
              <button onClick={adopterLoi}
                className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors">
                ✅ Valider et soumettre au vote de l'Assemblée
              </button>
            )}
            <button onClick={() => { setLoiGeneree(null); setIntention('') }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition-colors">
              🗑️ Abandonner
            </button>
            <button onClick={genererLoi}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition-colors">
              🔄 Régénérer
            </button>
          </div>
        </div>
      )}

      {/* ── Écran confirmation adoption ── */}
      {adoptee && loiGeneree && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-8 text-center flex flex-col gap-4">
          <span className="text-5xl">🏛️</span>
          <h3 className="text-xl font-bold text-green-300">"{loiGeneree.titre_officiel}" soumise à l'Assemblée</h3>
          <p className="text-sm text-slate-400">
            Le projet de loi est en cours d'examen. Les partis adverses ont 24h pour déposer leurs amendements.
          </p>
          {loiGeneree.dependances_legislatives?.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 text-left">
              <p className="text-xs text-yellow-400 font-semibold mb-1">🔗 N'oubliez pas de voter les lois liées :</p>
              {loiGeneree.dependances_legislatives.map((d, i) => (
                <p key={i} className="text-xs text-slate-400">
                  → {d.titre} <span className="text-yellow-600">({d.urgence?.replace('_', ' ')})</span>
                </p>
              ))}
            </div>
          )}
          <button onClick={() => { setLoiGeneree(null); setIntention(''); setAdoptee(false) }}
            className="mx-auto px-8 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition-colors">
            ⚗️ Proposer une nouvelle loi
          </button>
        </div>
      )}
    </div>
  )
}
