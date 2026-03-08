// ═══════════════════════════════════════════════════════════════
// MOTEUR DES CURSEURS D'INERTIE
// Chaque parti a des positions de départ sur 6 axes (0-100)
// 0 = gauche/ouvert/étatiste, 100 = droite/fermé/libéral
// ═══════════════════════════════════════════════════════════════

export const AXES = {
  europe:     { label: 'Europe',     gauche: 'Fédéralisme',    droite: 'Souverainisme' },
  immigration:{ label: 'Immigration',gauche: 'Intégration',    droite: 'Fermeture' },
  energie:    { label: 'Énergie',    gauche: 'Renouvelables',  droite: 'Nucléaire' },
  securite:   { label: 'Sécurité',   gauche: 'Prévention',     droite: 'Répression' },
  social:     { label: 'Social',     gauche: 'Assistance',     droite: 'Méritocratie' },
  economie:   { label: 'Économie',   gauche: 'Protectionnisme',droite: 'Libéralisme' },
}

// Position de départ des curseurs par parti (0-100)
const CURSEURS_PARTIS = {
  RN:             { europe: 85, immigration: 95, energie: 80, securite: 85, social: 40, economie: 35 },
  RE:             { europe: 25, immigration: 45, energie: 55, securite: 55, social: 55, economie: 75 },
  LFI:            { europe: 60, immigration: 10, energie: 15, securite: 20, social: 10, economie: 15 },
  PS:             { europe: 20, immigration: 25, energie: 35, securite: 40, social: 20, economie: 30 },
  LR:             { europe: 65, immigration: 80, energie: 85, securite: 80, social: 65, economie: 80 },
  EELV:           { europe: 15, immigration: 5, energie: 5, securite: 15, social: 15, economie: 20 },
  PCF:            { europe: 55, immigration: 5, energie: 40, securite: 25, social: 5, economie: 5 },
  LO:             { europe: 50, immigration: 2, energie: 45, securite: 10, social: 2, economie: 2 },
  PATRIOTES:      { europe: 98, immigration: 90, energie: 75, securite: 70, social: 35, economie: 40 },
  UPR:            { europe: 99, immigration: 85, energie: 70, securite: 60, social: 30, economie: 35 },
  HORIZONS:       { europe: 30, immigration: 55, energie: 60, securite: 65, social: 60, economie: 70 },
  DLF:            { europe: 75, immigration: 85, energie: 88, securite: 78, social: 55, economie: 60 },
  RESISTONS:      { europe: 60, immigration: 50, energie: 50, securite: 50, social: 35, economie: 40 },
  HUMANISTE:      { europe: 45, immigration: 35, energie: 55, securite: 45, social: 40, economie: 45 },
  SOLUTION:       { europe: 40, immigration: 40, energie: 45, securite: 35, social: 30, economie: 35 },
  NOUVELLE_ENERGIE:{ europe: 55, immigration: 70, energie: 72, securite: 72, social: 70, economie: 90 },
}

// ── Micro-réformes automatisées par axe et position ──────────
const MICRO_REFORMES = {
  europe: {
    souverainiste: [
      'Vos services ont suspendu 3 directives européennes non conformes à la Constitution.',
      'Le ministère des Affaires étrangères a renforcé les contrôles aux frontières Schengen.',
      'La contribution française au budget européen a été temporairement gelée.',
      'Vos équipes ont déposé un recours contre une décision de la BCE.',
      'Le Parlement a adopté une loi de "conformité nationale" pour filtrer les normes UE.',
    ],
    federaliste: [
      'La France a renforcé sa coopération avec Berlin sur le budget de défense européen.',
      'Un accord Erasmus+ étendu a été signé pour 50 000 étudiants supplémentaires.',
      'La France a proposé un plan d\'obligations européennes vertes.',
      'Vos services ont harmonisé les normes agricoles avec celles de l\'UE.',
      'Un traité bilatéral franco-allemand sur l\'énergie a été conclu.',
    ],
  },
  immigration: {
    fermeture: [
      'Les délais de traitement des demandes d\'asile ont été réduits à 30 jours.',
      'Les effectifs de la PAF aux frontières ont été renforcés de 800 agents.',
      'Un accord de réadmission a été signé avec 2 pays d\'origine.',
      'Le quota annuel d\'immigration légale a été abaissé de 15%.',
      'Les contrôles documentaires dans les transports en commun ont été renforcés.',
    ],
    integration: [
      'Un programme d\'intégration par le travail a été lancé dans 12 départements.',
      'Les cours de français langue étrangère ont été rendus gratuits et obligatoires.',
      'Un titre de séjour "travailleur essentiel" a été créé par décret.',
      'Les délais de regroupement familial ont été simplifiés.',
      'Un fonds d\'aide à l\'intégration de 500 M€ a été débloqué.',
    ],
  },
  energie: {
    nucleaire: [
      'EDF a lancé les études préliminaires pour 2 nouveaux EPR2.',
      'La durée d\'exploitation de 3 centrales existantes a été prolongée de 10 ans.',
      'Un accord de fourniture d\'uranium avec le Kazakhstan a été renouvelé.',
      'Les subventions à l\'éolien intermittent ont été réduites de 30%.',
      'Le prix de l\'électricité nucléaire a été plafonné à 70€/MWh.',
    ],
    renouvelables: [
      '2 000 MW de capacité solaire supplémentaire ont été autorisés.',
      'Le fonds pour la rénovation thermique a été abondé de 2 Md€.',
      'Un appel d\'offres éolien offshore de 3 000 MW a été lancé.',
      'La prime à la voiture électrique a été portée à 7 000€.',
      'Un plan hydrogène vert de 500 M€ a été approuvé.',
    ],
  },
  securite: {
    repression: [
      'Les peines planchers ont été rétablies pour les récidivistes par voie réglementaire.',
      '500 places de prison supplémentaires ont été ouvertes en construction modulaire.',
      'Les pouvoirs des maires en matière de couvre-feu local ont été étendus.',
      'Un fichier national des délinquants récidivistes a été créé.',
      'La vidéosurveillance a été étendue à 200 communes supplémentaires.',
    ],
    prevention: [
      '150 maisons de justice de proximité ont été ouvertes.',
      'Le budget des associations de prévention de la délinquance a augmenté de 20%.',
      'Un programme de médiation scolaire a été déployé dans 500 collèges.',
      'Les effectifs de police judiciaire ont été renforcés de 300 enquêteurs.',
      'Un plan de réinsertion des détenus courte peine a été lancé.',
    ],
  },
  social: {
    merite: [
      'Le RSA a été conditionné à 15h d\'activité hebdomadaire dans tous les départements.',
      'La prime d\'activité a été revalorisée pour les salariés au SMIC.',
      'Un système de bonus-malus sur les contrats courts a été instauré.',
      'Les allocations chômage ont été dégressives après 6 mois.',
      'Un crédit d\'impôt "emploi local" a été créé pour les TPE.',
    ],
    assistance: [
      'Le plafond des APL a été relevé de 8% dans les zones tendues.',
      'Une allocation exceptionnelle de rentrée scolaire de 200€ a été versée.',
      'Le nombre de lits en EHPAD public a augmenté de 5 000 unités.',
      'La gratuité de la cantine scolaire a été étendue aux familles sous le seuil de pauvreté.',
      'Un fonds d\'urgence logement de 800 M€ a été activé.',
    ],
  },
  economie: {
    liberalisme: [
      'Une procédure de création d\'entreprise en 24h a été mise en place.',
      'La flat tax sur les dividendes a été abaissée à 25%.',
      'Les normes administratives pour les PME ont été réduites de 20%.',
      'Un accord de libre-échange avec le Royaume-Uni post-Brexit a été amorcé.',
      'La taxe sur les transactions financières a été suspendue pour 18 mois.',
    ],
    protectionnisme: [
      'Une clause de préférence nationale dans les marchés publics >5 M€ a été instaurée.',
      'Une taxe anti-dumping sur les importations textiles asiatiques a été appliquée.',
      'Le label "Fabriqué en France" a été renforcé avec des critères stricts.',
      'Un fonds de relocalisations industrielles de 3 Md€ a été créé.',
      'Les normes douanières sur les produits alimentaires importés ont été durcies.',
    ],
  },
}

// ── Crises potentielles par axe et niveau de tension ─────────
export const CRISES_AUTOMATIQUES = {
  europe: [
    { id: 'crise_eu_1', titre: 'Mise en demeure de Bruxelles', description: 'La Commission européenne menace d\'une procédure d\'infraction suite à vos décrets souverainistes.', seuil_tension: 50, impacts: { relation_ue: -15, popularite_joueur: +3 } },
    { id: 'crise_eu_2', titre: 'Blocage des fonds européens', description: 'Bruxelles gèle 2,3 Md€ de fonds structurels en représailles à votre politique.', seuil_tension: 70, impacts: { deficit_milliards: +2, relation_ue: -20 } },
  ],
  immigration: [
    { id: 'crise_imm_1', titre: 'Naufrage en Méditerranée', description: 'Un drame migratoire éclate. Votre gestion de la crise est scrutée.', seuil_tension: 40, impacts: { popularite_joueur: -5, tension_sociale: +8 } },
    { id: 'crise_imm_2', titre: 'Émeutes dans un centre de rétention', description: 'Surpopulation critique dans les CRA. La presse internationale couvre l\'événement.', seuil_tension: 65, impacts: { popularite_joueur: -8, tension_sociale: +12 } },
  ],
  energie: [
    { id: 'crise_ener_1', titre: 'Panne sur le réseau RTE', description: 'Un incident technique sur le réseau haute tension prive 800 000 foyers d\'électricité.', seuil_tension: 35, impacts: { popularite_joueur: -6, tension_sociale: +5 } },
    { id: 'crise_ener_2', titre: 'Flambée des prix du gaz', description: 'Les cours du gaz bondissent de 40% suite à une tension géopolitique. Les factures explosent.', seuil_tension: 55, impacts: { popularite_joueur: -10, tension_sociale: +15, deficit_milliards: +3 } },
  ],
  securite: [
    { id: 'crise_sec_1', titre: 'Violences urbaines dans 3 villes', description: 'Des incidents éclatent après une intervention policière controversée.', seuil_tension: 45, impacts: { tension_sociale: +15, popularite_joueur: -7 } },
    { id: 'crise_sec_2', titre: 'Attentat déjoué de justesse', description: 'Les services de renseignement ont évité le pire. La menace terroriste remonte en Une.', seuil_tension: 60, impacts: { popularite_joueur: +5, tension_sociale: +20 } },
  ],
  social: [
    { id: 'crise_soc_1', titre: 'Grève nationale des soignants', description: 'Les infirmiers et médecins hospitaliers appellent à 72h de grève reconductible.', seuil_tension: 50, impacts: { popularite_joueur: -12, tension_sociale: +18 } },
    { id: 'crise_soc_2', titre: 'Bug informatique sur les APL', description: 'Un dysfonctionnement prive 200 000 ménages de leurs allocations pendant 3 semaines.', seuil_tension: 30, impacts: { popularite_joueur: -8, tension_sociale: +10 } },
  ],
  economie: [
    { id: 'crise_eco_1', titre: 'Dégradation de la note souveraine', description: 'Moody\'s abaisse la note de la France de AA à AA-. Les taux d\'emprunt remontent.', seuil_tension: 55, impacts: { deficit_milliards: +5, popularite_joueur: -6 } },
    { id: 'crise_eco_2', titre: 'Faillite d\'un fleuron industriel', description: 'Un grand groupe français annonce 8 000 suppressions de postes. Le chômage remonte.', seuil_tension: 65, impacts: { popularite_joueur: -10, tension_sociale: +12 } },
  ],
}

// ── Fonctions principales ────────────────────────────────────

export function getCurseursInitiaux(partiId) {
  return { ...(CURSEURS_PARTIS[partiId] ?? CURSEURS_PARTIS['HORIZONS']) }
}

export function getMicroReforme(axe, valeurCurseur) {
  const pool = MICRO_REFORMES[axe]
  if (!pool) return null
  const cote = valeurCurseur >= 50 ? Object.keys(pool)[1] : Object.keys(pool)[0]
  const liste = pool[cote]
  return liste[Math.floor(Math.random() * liste.length)]
}

export function genererReformesTour(curseurs) {
  // Génère 2-4 micro-réformes par tour selon les axes les plus actifs
  const axes = Object.keys(AXES)
  const nbReformes = 2 + Math.floor(Math.random() * 3)
  const choix = [...axes].sort(() => Math.random() - 0.5).slice(0, nbReformes)

  return choix.map(axe => ({
    axe,
    label: AXES[axe].label,
    texte: getMicroReforme(axe, curseurs[axe]),
    timestamp: Date.now(),
  })).filter(r => r.texte)
}

export function calculerCrisePotentielle(curseurs, tension, crisesActives = []) {
  // Probabilité de crise selon tension globale
  const probBase = tension / 200 // 0 à 0.5
  if (Math.random() > probBase) return null

  // Choisir un axe aléatoire
  const axes = Object.keys(CRISES_AUTOMATIQUES)
  const axe  = axes[Math.floor(Math.random() * axes.length)]
  const crises = CRISES_AUTOMATIQUES[axe]

  // Filtrer selon seuil et crises déjà actives
  const eligibles = crises.filter(c =>
    tension >= c.seuil_tension &&
    !crisesActives.includes(c.id)
  )

  if (eligibles.length === 0) return null
  return eligibles[Math.floor(Math.random() * eligibles.length)]
}

export function deplacerCurseur(curseurs, axe, delta) {
  const val = Math.max(0, Math.min(100, (curseurs[axe] ?? 50) + delta))
  return { ...curseurs, [axe]: val }
}

export function getCouleurCurseur(valeur) {
  if (valeur <= 20) return '#3b82f6'   // bleu gauche
  if (valeur <= 40) return '#6366f1'   // indigo
  if (valeur <= 60) return '#a855f7'   // violet centre
  if (valeur <= 80) return '#f97316'   // orange
  return '#ef4444'                      // rouge droite
}

export function getLabelCurseur(axe, valeur) {
  const a = AXES[axe]
  if (!a) return ''
  if (valeur <= 25) return `↑ ${a.gauche}`
  if (valeur >= 75) return `↑ ${a.droite}`
  return 'Équilibre'
}
