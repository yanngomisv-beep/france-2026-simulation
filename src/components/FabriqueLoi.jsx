import { useState } from 'react'

// ─────────────────────────────────────────────────────────────
// PROFILS SOCIAUX
// ─────────────────────────────────────────────────────────────

const PROFILS = [
  { id: 'soignant',   label: 'Soignant',    emoji: '🏥' },
  { id: 'etudiant',   label: 'Étudiant',    emoji: '🎓' },
  { id: 'commercant', label: 'Commerçant',  emoji: '🛍️' },
  { id: 'salarie',    label: 'Salarié / RH',emoji: '💼' },
  { id: 'juriste',    label: 'Juriste',     emoji: '⚖️' },
  { id: 'agriculteur',label: 'Agriculteur', emoji: '🌾' },
  { id: 'retraite',   label: 'Retraité',    emoji: '👴' },
  { id: 'btp',        label: 'BTP',         emoji: '🏗️' },
  { id: 'numerique',  label: 'Numérique',   emoji: '💻' },
  { id: 'industrie',  label: 'Industrie',   emoji: '🏭' },
]

// ─────────────────────────────────────────────────────────────
// 10 SCÉNARIOS TYPES
// ─────────────────────────────────────────────────────────────

const SCENARIOS_TYPES = [
  { emoji: '🏥', label: 'Ségur 2.0',             texte: 'Augmentation de 500€ net pour tous les paramédicaux et fermeture des cliniques privées ne participant pas aux gardes.' },
  { emoji: '🏥', label: 'Déserts médicaux',       texte: "Obligation pour tout nouveau médecin de s'installer 3 ans en zone sous-dense sous peine de non-remboursement par la CPAM." },
  { emoji: '🛡️', label: 'Bouclier de proximité',  texte: "Création de polices municipales renforcées sous autorité des maires pour pallier le manque d'effectifs de la Police Nationale." },
  { emoji: '🛡️', label: 'Surveillance IA',        texte: 'Généralisation de la reconnaissance faciale dans les transports pour identifier les personnes fichées S.' },
  { emoji: '⚖️', label: 'Verdict rapide',          texte: 'Suppression du jury populaire pour les délits financiers afin de diviser par deux les délais de jugement.' },
  { emoji: '⚖️', label: 'Responsabilité parentale',texte: 'Suppression des allocations familiales et amendes pour les parents de mineurs récidivistes.' },
  { emoji: '💼', label: 'Semaine 4 jours',         texte: 'Passage à 32h payées 35h pour les métiers à forte pénibilité, financé par une taxe sur les dividendes.' },
  { emoji: '💼', label: 'Revenu Jeunes',           texte: "Versement de 800€/mois pour tous les 18-25 ans sans ressources, conditionné à une formation ou un service civique." },
  { emoji: '🎓', label: 'Uniforme républicain',    texte: "Obligation du port de l'uniforme dans tous les collèges et lycées publics, financé par l'État." },
  { emoji: '🎓', label: 'Sélection post-bac',      texte: 'Remplacement de Parcoursup par un concours national d\'entrée pour chaque filière universitaire.' },
]

// ─────────────────────────────────────────────────────────────
// PROMPT SYSTÈME
// ─────────────────────────────────────────────────────────────

function construirePrompt(intention, etatJeu) {
  return `Tu es le moteur législatif d'un jeu de simulation politique "France 2026".
Le joueur est Président de la République française en mars 2026. Contexte économique :
- Popularité : ${etatJeu?.popularite_joueur ?? 42}%
- Déficit : ${etatJeu?.deficit_milliards ?? 173} Md€
- Inflation : ${etatJeu?.inflation_pct ?? 2.8}%
- Tension sociale : ${etatJeu?.tension_sociale ?? 45}/100
- Prix du baril : ${etatJeu?.prix_baril ?? 80}$
- Relations UE : ${etatJeu?.relation_ue ?? 20}/100

Le joueur propose cette loi : "${intention}"

Génère UNIQUEMENT un objet JSON valide (sans balises markdown, sans texte avant ou après) avec cette structure exacte :
{
  "titre_officiel": "Nom court et officiel de la loi (max 8 mots)",
  "expose_motifs": "Résumé de 2 phrases expliquant l'objectif et le contexte.",
  "articles": ["Article 1 - ...", "Article 2 - ...", "Article 3 - ..."],
  "tags": ["TAG1", "TAG2", "TAG3"],
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
    "detail_cc": "1 phrase si risque > aucun",
    "conformite_ue": "conforme|risque_faible|risque_moyen|risque_eleve",
    "detail_ue": "1 phrase si risque > conforme"
  },
  "cout_budgetaire": "gratuit|faible|modere|eleve|tres_eleve",
  "amendement_rn": "Texte de l'amendement que le RN déposerait (1 phrase)"
}`
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function BadgeImpact({ valeur, unite = '', inverse = false }) {
  if (valeur === 0 || valeur === undefined) return (
    <span className="text-xs text-slate-500">—</span>
  )
  const positif = inverse ? valeur < 0 : valeur > 0
  return (
    <span className={`text-sm font-bold ${positif ? 'text-green-400' : 'text-red-400'}`}>
      {valeur > 0 ? '+' : ''}{valeur}{unite}
    </span>
  )
}

function CarteProfilImpact({ profil, data }) {
  const couleurs = {
    positif: 'border-green-700 bg-green-900/20',
    negatif: 'border-red-700 bg-red-900/20',
    neutre:  'border-slate-600 bg-slate-800',
  }
  const icones = { positif: '✅', negatif: '❌', neutre: '➖' }

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
    aucun:         'bg-green-900 text-green-300',
    conforme:      'bg-green-900 text-green-300',
    faible:        'bg-yellow-900 text-yellow-300',
    risque_faible: 'bg-yellow-900 text-yellow-300',
    moyen:         'bg-orange-900 text-orange-300',
    risque_moyen:  'bg-orange-900 text-orange-300',
    eleve:         'bg-red-900 text-red-300',
    risque_eleve:  'bg-red-900 text-red-300',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${styles[niveau] ?? 'bg-slate-700 text-slate-300'}`}>
      {label} : {niveau.replace(/_/g, ' ')}
    </span>
  )
}

function BadgeCout({ niveau }) {
  const styles = {
    gratuit:    'bg-green-900 text-green-300',
    faible:     'bg-green-800 text-green-300',
    modere:     'bg-yellow-900 text-yellow-300',
    eleve:      'bg-orange-900 text-orange-300',
    tres_eleve: 'bg-red-900 text-red-300',
  }
  const emojis = {
    gratuit: '💚', faible: '🟢', modere: '🟡', eleve: '🟠', tres_eleve: '🔴'
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${styles[niveau] ?? 'bg-slate-700 text-slate-300'}`}>
      {emojis[niveau] ?? '⚪'} Coût : {niveau?.replace(/_/g, ' ')}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function FabriqueLoi({ etatJeu, voterLoi }) {
  const [intention, setIntention]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [erreur, setErreur]         = useState(null)
  const [loiGeneree, setLoiGeneree] = useState(null)
  const [adoptee, setAdoptee]       = useState(false)

  // ── Appel via proxy Vercel ───────────────────────────────
  async function genererLoi() {
    if (!intention.trim() || intention.length < 10) {
      setErreur("Décrivez votre intention en au moins 10 caractères.")
      return
    }
    setLoading(true)
    setErreur(null)
    setLoiGeneree(null)
    setAdoptee(false)

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: construirePrompt(intention, etatJeu),
          }],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message ?? `Erreur ${response.status}`)
      }

      const texte = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('')

      const loi = JSON.parse(texte.replace(/```json|```/g, '').trim())
      setLoiGeneree(loi)
    } catch (e) {
      setErreur(`Erreur : ${e.message}`)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── Valider la loi ───────────────────────────────────────
  function adopterLoi() {
    if (!loiGeneree) return
    setAdoptee(true)
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

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">⚗️ Fabrique de loi</h2>
          <p className="text-sm text-slate-400 mt-1">
            Exprimez votre intention en langage naturel — l'IA la transforme en projet de loi.
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400">
          🏛️ {etatJeu?.date ?? 'Mars 2026'}
        </div>
      </div>

      {/* Saisie */}
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

        {/* Scénarios types */}
        <div>
          <p className="text-xs text-slate-500 mb-2">💡 Scénarios types — cliquez pour pré-remplir :</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS_TYPES.map((s, i) => (
              <button key={i}
                onClick={() => setIntention(s.texte)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors">
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        {erreur && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded p-2">
            ⚠️ {erreur}
          </p>
        )}

        <button
          onClick={genererLoi}
          disabled={loading || intention.trim().length < 10}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
            loading || intention.trim().length < 10
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {loading
            ? '⚙️ Le Conseil Juridique analyse votre proposition...'
            : '🏛️ Soumettre au Conseil Juridique'}
        </button>
      </div>

      {/* Résultat */}
      {loiGeneree && !adoptee && (
        <div className="flex flex-col gap-5">

          {/* Titre + exposé */}
          <div className="bg-slate-800 rounded-xl border border-blue-800 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">
                  Projet de loi généré
                </p>
                <h3 className="text-xl font-bold text-white">{loiGeneree.titre_officiel}</h3>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                <BadgeCout niveau={loiGeneree.cout_budgetaire} />
                <div className="flex gap-1 flex-wrap justify-end">
                  {loiGeneree.tags?.map(t => (
                    <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      #{t}
                    </span>
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

          {/* Impacts variables */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h4 className="font-semibold text-white mb-4">📊 Impacts sur la République</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INDICATEURS.map(({ key, label, unite, inverse }) => (
                <div key={key} className="bg-slate-900 rounded-lg p-3 flex flex-col gap-1">
                  <p className="text-xs text-slate-500">{label}</p>
                  <BadgeImpact
                    valeur={loiGeneree.impacts?.[key] ?? 0}
                    unite={unite}
                    inverse={inverse}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Profils sociaux */}
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
                <p className="text-xs text-blue-400 font-semibold mb-1">
                  📋 Amendement déposé par le RN
                </p>
                <p className="text-xs text-slate-300">{loiGeneree.amendement_rn}</p>
              </div>
            )}
          </div>

          {/* Risques */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h4 className="font-semibold text-white mb-3">⚠️ Risques juridiques</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <BadgeRisque
                niveau={loiGeneree.risques?.conseil_constitutionnel ?? 'aucun'}
                label="Conseil Constitutionnel"
              />
              <BadgeRisque
                niveau={loiGeneree.risques?.conformite_ue ?? 'conforme'}
                label="Conformité UE"
              />
            </div>
            {loiGeneree.risques?.detail_cc && (
              <p className="text-xs text-slate-400 mb-1">⚖️ {loiGeneree.risques.detail_cc}</p>
            )}
            {loiGeneree.risques?.detail_ue && (
              <p className="text-xs text-slate-400">🇪🇺 {loiGeneree.risques.detail_ue}</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={adopterLoi}
              className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              ✅ Valider et soumettre au vote de l'Assemblée
            </button>
            <button
              onClick={() => { setLoiGeneree(null); setIntention('') }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              🗑️ Abandonner
            </button>
            <button
              onClick={genererLoi}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              🔄 Régénérer
            </button>
          </div>
        </div>
      )}

      {/* Confirmation adoption */}
      {adoptee && loiGeneree && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-8 text-center flex flex-col gap-4">
          <span className="text-5xl">🏛️</span>
          <h3 className="text-xl font-bold text-green-300">
            "{loiGeneree.titre_officiel}" soumise à l'Assemblée
          </h3>
          <p className="text-sm text-slate-400">
            Le projet de loi est en cours d'examen. Les partis adverses ont 24h pour déposer leurs amendements.
          </p>
          <button
            onClick={() => { setLoiGeneree(null); setIntention(''); setAdoptee(false) }}
            className="mx-auto px-8 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            ⚗️ Proposer une nouvelle loi
          </button>
        </div>
      )}

    </div>
  )
}
