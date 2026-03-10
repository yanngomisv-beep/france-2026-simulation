/**
 * France 2026 — Profils Idéologiques des Partis
 * Source de vérité pour la cohérence politique de l'IA
 * Chaque profil encode : positions, lignes rouges, amendements-types, discours
 */

// ─────────────────────────────────────────────────────────────
// RN — RASSEMBLEMENT NATIONAL
// Le Pen / Bardella — nationalisme économique, priorité nationale
// ─────────────────────────────────────────────────────────────

export const PROFIL_RN = {
  id: 'RN',
  nom: 'Rassemblement National',
  chefs: ['Jordan Bardella', 'Marine Le Pen'],
  couleur: '#1a1aff',
  slogan: 'La France d\'abord',

  // ── ADN IDÉOLOGIQUE ────────────────────────────────────
  ideologie: {
    economie: 'nationalisme_economique',       // Protection des industries françaises, anti-délocalisations
    social: 'protectionnisme_social',          // Aides réservées aux Français, défense des retraités
    immigration: 'restriction_maximale',       // Immigration zéro, expulsions, priorité nationale
    europe: 'souverainisme_pragmatique',       // Anti-fédéralisme, mais pas Frexit direct
    securite: 'ordre_maximum',                 // Tolérance zéro, peines planchers, police renforcée
    energie: 'nucleaire_souverain',            // Pro-nucléaire fort, anti-éolien offshore
    laicite: 'laicite_identitaire',            // Contre le voile dans l'espace public, défense des racines chrétiennes
  },

  // ── POSITIONS PAR THÈME ────────────────────────────────
  positions: {
    // Économie
    smic: 'pour_augmentation_moderee',         // +5% max, financé sans taxer les PME
    impots_riches: 'contre',                   // Anti-ISF "punition du succès français"
    impots_multinationales: 'pour',            // Taxe sur les GAFA et délocalisateurs
    retraites: 'contre_reforme_64',            // Retour à 60 ans pour les carrières longues
    privatisations: 'contre',                  // Secteurs stratégiques = souveraineté nationale
    nationalisations_energie: 'pour_partiel',  // Rachat d'EDF 100% public
    deficit: 'reduction_par_immigration',      // Économies sur les "flux migratoires coûteux"
    protectionnisme: 'pour_fort',              // Préférence nationale dans les marchés publics
    // Immigration
    immigration_economique: 'quasi_zero',
    regroupement_familial: 'suppression',
    aide_sociale_etrangers: 'conditionnelle',  // Réservée aux Français et résidents de longue date
    // Sécurité
    peines_planchers: 'pour_absolu',
    police_nationale: 'renforcement_massif',
    rsa_conditionnel: 'pour',
    // Énergie
    nucleaire: 'pour_massif',                  // 20 nouveaux réacteurs
    eolien_offshore: 'contre',                 // "Enlaidit les côtes, enrichit des fonds étrangers"
    taxe_carburant: 'baisse_tva',              // TVA carburant à 5.5%
    // Europe
    traites_europeens: 'renégociation',
    cour_justice_ue: 'non_application_selective',
    euro: 'maintien_pragmatique',              // Pas de sortie de l'euro
  },

  // ── LIGNES ROUGES (jamais voter pour) ─────────────────
  lignes_rouges: [
    'regularisation_migrants_masse',
    'pacte_migration_ue',
    'aide_developpement_augmentation',
    'loi_anti_discrimination_positive',
    'mariage_pour_tous_extension',
    'euthanasie',
    'cannabis_legalisation',
    'retraite_maintien_64',  // Le RN s'est positionné contre les 64 ans
  ],

  // ── AMENDEMENTS TYPES ─────────────────────────────────
  // Selon le thème de la loi, le RN propose systématiquement l'un de ces amendements
  amendements_par_theme: {
    social: [
      {
        titre: 'Amendement priorité nationale',
        article: "Les bénéfices de la présente loi sont accordés en priorité aux ressortissants français et aux résidents justifiant de 5 ans de présence régulière sur le territoire national.",
        justification: "Bardella : 'L'argent des Français doit d'abord servir les Français.'",
        impacts_delta: { tension_sociale: +4, relation_ue: -6, popularite_joueur: -3 },
        position_apres: 'abstention',
        cout: 0,
      },
      {
        titre: 'Amendement conditionnalité RSA',
        article: "Le versement des prestations sociales est conditionné à un engagement d'activité ou de formation de 15 heures par semaine minimum.",
        justification: "Le Pen : 'Les droits vont avec les devoirs.'",
        impacts_delta: { tension_sociale: +6, deficit_milliards: -4, consentement_impot: +3 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    economie: [
      {
        titre: 'Amendement préférence nationale marchés publics',
        article: "Les appels d'offres publics supérieurs à 500 000 € accordent une préférence de 15% aux entreprises dont le siège social et la production sont localisés en France.",
        justification: "Bardella : 'Nos impôts doivent financer nos emplois, pas ceux de l'étranger.'",
        impacts_delta: { pib_croissance_pct: +0.2, relation_ue: -10, indice_confiance_marches: -5 },
        position_apres: 'pour',
        cout: 0,
      },
      {
        titre: 'Amendement taxe délocalisation',
        article: "Toute entreprise déplaçant plus de 50 emplois hors du territoire national dans les 5 ans suivant une aide publique sera soumise à une taxe de remboursement intégral majorée de 20%.",
        justification: "Le Pen : 'On ne peut pas toucher l'argent public et licencier les Français.'",
        impacts_delta: { pib_croissance_pct: -0.1, tension_sociale: -5, popularite_joueur: +4 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    immigration: [
      {
        titre: 'Amendement expulsion accélérée',
        article: "Tout étranger en situation irrégulière faisant l'objet d'une OQTF est placé en rétention immédiate dans l'attente de son éloignement effectif sous 72 heures.",
        justification: "Bardella : 'Une OQTF doit signifier un départ, pas un bout de papier.'",
        impacts_delta: { tension_sociale: +8, relation_ue: -12, popularite_joueur: -5 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    securite: [
      {
        titre: 'Amendement peines planchers',
        article: "Pour tout crime commis en récidive, une peine plancher incompressible égale aux deux tiers du maximum légal est instaurée, sans possibilité d'aménagement.",
        justification: "Le Pen : 'La récidive est un choix. Elle doit être sanctionnée comme telle.'",
        impacts_delta: { tension_sociale: -4, deficit_milliards: +3, relation_ue: -5 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    energie: [
      {
        titre: 'Amendement TVA carburant',
        article: "La TVA applicable aux carburants à la pompe est ramenée à 5,5% pour les particuliers et les transporteurs routiers indépendants.",
        justification: "Bardella : 'Les Français ne peuvent plus se chauffer ni conduire pour aller travailler.'",
        impacts_delta: { popularite_joueur: +7, deficit_milliards: +8, inflation_pct: -0.3 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    institutions: [
      {
        titre: 'Amendement référendum obligatoire',
        article: "Toute réforme constitutionnelle ou modification substantielle des traités internationaux est soumise à référendum populaire obligatoire dans un délai de 6 mois.",
        justification: "Le Pen : 'Le peuple est le seul souverain légitime.'",
        impacts_delta: { stabilite: -8, tension_sociale: -3, relation_ue: -8 },
        position_apres: 'abstention',
        cout: 0,
      },
    ],
  },

  // ── ATTAQUES MÉDIATIQUES ───────────────────────────────
  attaques_mediatiques: {
    // Déclenchées selon le contexte du tour
    si_inflation_haute: {
      titre: 'RN — Tribune nationale : "Le pouvoir d\'achat en chute libre"',
      texte: "Bardella en conférence de presse : 'Pendant que les Français choisissent entre se chauffer et manger, le gouvernement choisit entre ses amis de Bruxelles et ses amis du CAC40. Il est temps de mettre la France d'abord.'",
      impact: { popularite_joueur: -6, tension_sociale: +5 },
    },
    si_immigration_visible: {
      titre: 'RN — Campagne "La France qu\'on vous cache"',
      texte: "Marine Le Pen sur les réseaux : 'Les chiffres de l'immigration que le gouvernement ne publie pas. Les Français méritent la vérité sur ce qui se passe dans leur pays.'",
      impact: { popularite_joueur: -5, tension_sociale: +7 },
    },
    si_popularite_joueur_basse: {
      titre: 'RN — "Ce gouvernement est à bout de souffle"',
      texte: "Bardella à l'Assemblée : 'Avec {popularite}% de confiance, ce gouvernement n'a plus aucune légitimité pour gouverner. Dissolution ou démission : il n'y a pas d'autre chemin.'",
      impact: { popularite_joueur: -8, stabilite: -6 },
    },
    si_deficit_haut: {
      titre: 'RN — "La dette que vous laisserez à vos enfants"',
      texte: "Le Pen au JT de TF1 : 'Ce gouvernement emprunte {deficit} milliards. Ce n'est pas de la gestion, c'est de l'irresponsabilité. Nos enfants paieront les factures de leur incompétence.'",
      impact: { popularite_joueur: -5, indice_confiance_marches: -4 },
    },
    si_scandale: {
      titre: 'RN — "L\'État profond se démasque"',
      texte: "Bardella : 'Nous avions prévenu. Ce scandale illustre l'arrogance d'une élite qui se croit au-dessus des lois qu'elle impose aux autres. Les coupables doivent rendre des comptes.'",
      impact: { popularite_joueur: -10, tension_sociale: +8, dissimulation: +5 },
    },
  },

  // ── DISCOURS TYPES ────────────────────────────────────
  discours: {
    vote_pour: [
      "Nous votons pour, car cette mesure va dans le sens de l'intérêt national — même si elle est insuffisante.",
      "Pour une fois, le gouvernement écoute les Français. Le RN vote pour, sans naïveté.",
      "Bardella : 'Nous soutenons ce texte car nos électeurs l'ont réclamé. Nous resterons vigilants sur son application.'",
    ],
    vote_contre: [
      "Ce texte est une insulte aux travailleurs français. Le RN vote contre, sans ambiguïté.",
      "Bardella : 'Nous refusons de cautionner une politique qui tourne le dos aux Français de souche comme d'adoption.'",
      "Le Pen : 'Ce n'est pas la France que nous voulons construire. Non.'",
    ],
    vote_abstention: [
      "Le RN s'abstient : des points positifs existent, mais le compte n'y est pas.",
      "Bardella : 'Nous ne cautionnons pas, mais nous ne bloquons pas. Les Français jugeront.'",
    ],
    motion_censure: [
      "Bardella à la tribune : 'Ce gouvernement a perdu la confiance des Français et celle de l'Assemblée. Motion de censure.'",
      "Le Pen : 'Quand on ne peut plus gouverner, on part. Nous déposons cette motion au nom du peuple français.'",
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// LR — LES RÉPUBLICAINS
// Wauquiez — droite gaulliste, ordre, rigueur budgétaire
// ─────────────────────────────────────────────────────────────

export const PROFIL_LR = {
  id: 'LR',
  nom: 'Les Républicains',
  chefs: ['Laurent Wauquiez', 'Éric Ciotti (contesté)'],
  couleur: '#0066cc',
  slogan: 'La droite républicaine',

  // ── ADN IDÉOLOGIQUE ────────────────────────────────────
  ideologie: {
    economie: 'liberalisme_ordonne',           // Marché libre mais régulé, rigueur budgétaire absolue
    social: 'merite_responsabilite',           // Travail, famille, patrie — aides ciblées
    immigration: 'restriction_ferme',          // Maîtrise des flux, intégration exigeante
    europe: 'gaullisme_europeen',              // Pro-UE mais souveraineté nationale préservée
    securite: 'autorite_republicaine',         // Rétablissement de l'autorité de l'État
    energie: 'nucleaire_classique',            // Filière nucléaire française, pragmatisme énergétique
    laicite: 'laicite_stricte',               // Laïcité de combat, contre le communautarisme
  },

  // ── POSITIONS PAR THÈME ────────────────────────────────
  positions: {
    // Économie — rigueur avant tout
    smic: 'gel_relatif',                       // Indexation inflation seulement
    impots_riches: 'contre_absolu',            // "L'ISF a fait fuir les capitaux"
    impots_entreprises: 'baisse',              // IS à 20% pour relancer l'investissement
    retraites: 'maintien_64_minimum',          // 64 ans est un minimum, il faudrait 67
    privatisations: 'pour_selectif',           // EDF reste public, le reste peut être privé
    deficit: 'reduction_urgente',              // Retour sous 3% en 5 ans maximum
    dette: 'obsession_centrale',               // La dette = hypothéquer l'avenir des enfants
    flexibilite_travail: 'pour',               // Assouplissement du code du travail
    // Immigration
    immigration_economique: 'quotas_stricts',
    regroupement_familial: 'conditions_dures',
    aide_sociale_etrangers: 'apres_5_ans',
    double_nationalite: 'remise_en_question',
    // Sécurité
    peines_planchers: 'pour',
    police_nationale: 'revalorisation',
    justice: 'ferme_humaniste',                // Peines effectives + réinsertion
    // Énergie
    nucleaire: 'pour_maintien',                // Conserver l'existant + 6 EPR2
    renouvelables: 'complement_nucleaire',     // Pas de substitution
    // Europe
    traites_europeens: 'respect_strict',
    budget_ue: 'maîtrise',
    subsidiarite: 'renforcement',
  },

  // ── LIGNES ROUGES ──────────────────────────────────────
  lignes_rouges: [
    'retraite_60',
    'smic_2000',
    'isf_retour',
    'nationalisation_banques',
    'sortie_euro',
    'frexit',
    'sortie_otan',
    'regularisation_migrants_masse',
    'cannabis_legalisation',
    'revenu_universel',
    'semaine_4_jours_obligatoire',
  ],

  // ── AMENDEMENTS TYPES ─────────────────────────────────
  amendements_par_theme: {
    social: [
      {
        titre: 'Amendement clause de révision budgétaire',
        article: "La présente loi est assortie d'une clause de révision automatique à 3 ans : un rapport d'évaluation coût-bénéfice devra être remis au Parlement, avec possibilité de suspension si le coût dépasse l'enveloppe initiale de plus de 20%.",
        justification: "Wauquiez : 'On ne peut pas dépenser sans compter. Chaque euro dépensé doit être justifié.'",
        impacts_delta: { deficit_milliards: -2, indice_confiance_marches: +4, stabilite: +2 },
        position_apres: 'pour',
        cout: 0,
      },
      {
        titre: 'Amendement conditionnalité travail',
        article: "Les dispositifs d'aide sociale créés par la présente loi sont conditionnés à une démarche active d'insertion professionnelle, évaluée tous les 6 mois par un référent emploi.",
        justification: "Wauquiez : 'Les droits sans devoirs, ce n'est pas la République.'",
        impacts_delta: { tension_sociale: +3, deficit_milliards: -3, consentement_impot: +4 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    economie: [
      {
        titre: 'Amendement allègement charges PME',
        article: "Les entreprises de moins de 250 salariés bénéficient d'une exonération de cotisations patronales de 10% pour toute création nette d'emploi dans les 24 mois suivant la promulgation de la loi.",
        justification: "Wauquiez : 'Les PME sont l'épine dorsale de l'économie française. Il faut les libérer.'",
        impacts_delta: { pib_croissance_pct: +0.3, deficit_milliards: +4, indice_confiance_marches: +6 },
        position_apres: 'pour',
        cout: 4,
      },
      {
        titre: 'Amendement plafonnement dépenses',
        article: "Les crédits alloués par la présente loi sont plafonnés à l'enveloppe initiale sans possibilité de dépassement par décret. Tout dépassement requiert une loi de finances rectificative.",
        justification: "Wauquiez : 'La rigueur budgétaire n'est pas une option, c'est une obligation.'",
        impacts_delta: { deficit_milliards: -5, indice_confiance_marches: +7, stabilite: +3 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    immigration: [
      {
        titre: 'Amendement intégration renforcée',
        article: "L'obtention du titre de séjour longue durée est conditionnée à la réussite d'un test de langue française niveau B1 et à la signature d'un contrat d'intégration républicaine avec engagement ferme.",
        justification: "Wauquiez : 'S'intégrer, c'est adopter les valeurs de la République, pas juste y vivre.'",
        impacts_delta: { tension_sociale: +2, relation_ue: -3, consentement_impot: +3 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    securite: [
      {
        titre: 'Amendement moyens police judiciaire',
        article: "La mise en œuvre de la présente loi est accompagnée d'un renforcement des effectifs de police judiciaire de 2000 postes supplémentaires financés par redéploiement budgétaire.",
        justification: "Wauquiez : 'La sécurité sans moyens, c'est de la com. La droite donne les moyens.'",
        impacts_delta: { tension_sociale: -5, deficit_milliards: +2, popularite_joueur: +3 },
        position_apres: 'pour',
        cout: 2,
      },
    ],
    energie: [
      {
        titre: 'Amendement accélération EPR2',
        article: "Le dispositif prévu par la présente loi inclut une clause d'accélération du programme EPR2 : les délais d'instruction des permis de construire pour les nouvelles tranches nucléaires sont réduits à 18 mois maximum.",
        justification: "Wauquiez : 'L'énergie nucléaire française, c'est notre souveraineté. On ne peut pas se passer de ça.'",
        impacts_delta: { souverainete_energetique: +8, pib_croissance_pct: +0.2, deficit_milliards: +3 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
    institutions: [
      {
        titre: 'Amendement évaluation parlementaire',
        article: "Un comité d'évaluation parlementaire composé de 12 députés et 6 sénateurs est chargé du suivi annuel de la mise en œuvre de la présente loi, avec rapport public obligatoire.",
        justification: "Wauquiez : 'Le Parlement doit contrôler, pas juste voter. C'est ça, la démocratie.'",
        impacts_delta: { stabilite: +3, indice_confiance_marches: +2 },
        position_apres: 'pour',
        cout: 0,
      },
    ],
  },

  // ── ATTAQUES MÉDIATIQUES ───────────────────────────────
  attaques_mediatiques: {
    si_deficit_haut: {
      titre: 'LR — "La dette, c\'est l\'impôt de demain"',
      texte: "Wauquiez sur BFMTV : 'Ce gouvernement emprunte {deficit} milliards cette année. Chaque Français naît avec une dette de 40 000 euros sur les épaules. C'est une faute morale contre nos enfants.'",
      impact: { popularite_joueur: -5, indice_confiance_marches: -4 },
    },
    si_tension_haute: {
      titre: 'LR — "L\'autorité de l\'État s\'effondre"',
      texte: "Wauquiez : 'Quand la tension sociale atteint ce niveau, c'est l'échec de l'autorité de l'État. LR demande un plan de rétablissement de l'ordre républicain dans les 48 heures.'",
      impact: { popularite_joueur: -4, stabilite: -5 },
    },
    si_popularite_basse: {
      titre: 'LR — "Ce gouvernement gouverne dans le vide"',
      texte: "Wauquiez en conférence de presse : 'Avec {popularite}% de soutien, ce gouvernement n'a plus l'autorité morale pour réformer la France. LR propose une alternative crédible et sérieuse.'",
      impact: { popularite_joueur: -6, stabilite: -4 },
    },
    si_relation_ue_mauvaise: {
      titre: 'LR — "La France s\'isole en Europe"',
      texte: "Wauquiez : 'Nos partenaires européens s'interrogent sur la fiabilité de la France. LR a toujours défendu une Europe forte avec une France respectée. Ce gouvernement détruit ce capital.'",
      impact: { popularite_joueur: -4, relation_ue: -3 },
    },
    si_loi_depense_excessive: {
      titre: 'LR — "Encore de la dépense, jamais de la réforme"',
      texte: "Wauquiez à l'Assemblée : 'Vous dépensez des milliards sans jamais réformer les structures. LR refuse cette fuite en avant. La France a besoin de rigueur, pas de chèques en bois.'",
      impact: { popularite_joueur: -3, indice_confiance_marches: -5 },
    },
  },

  // ── DISCOURS TYPES ────────────────────────────────────
  discours: {
    vote_pour: [
      "Wauquiez : 'LR vote pour ce texte, qui va dans le bon sens même s'il manque d'ambition budgétaire.'",
      "Les Républicains soutiennent cette réforme, conforme à nos valeurs de responsabilité et d'autorité.",
      "'C'est un pas dans la bonne direction. LR sera vigilant sur l'application et le coût réel.' — Wauquiez",
    ],
    vote_contre: [
      "Wauquiez : 'Non. Ce texte aggrave la dette, affaiblit l'autorité et donne de mauvais signaux aux marchés.'",
      "LR vote contre une mesure idéologique qui va à l'encontre du redressement de la France.",
      "'La droite républicaine ne peut pas cautionner cette politique irresponsable.' — Wauquiez",
    ],
    vote_abstention: [
      "LR s'abstient : des dispositions positives existent, mais l'ensemble manque de sérieux budgétaire.",
      "Wauquiez : 'Ni pour ni contre, mais vigilants. Le diable sera dans les décrets d'application.'",
    ],
    motion_censure: [
      "Wauquiez à la tribune : 'Ce gouvernement a perdu le contrôle de la dépense publique et de l'ordre social. LR dépose cette motion de censure au nom de la responsabilité.'",
      "'La France mérite mieux. Nous votons la censure.' — Wauquiez",
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES — SÉLECTION D'AMENDEMENT COHÉRENT
// ─────────────────────────────────────────────────────────────

/**
 * Retourne l'amendement le plus cohérent pour un parti et une loi donnés
 */
export function choisirAmendement(partiId, loi) {
  const profil = partiId === 'RN' ? PROFIL_RN : partiId === 'LR' ? PROFIL_LR : null
  if (!profil) return null

  // Déterminer le thème de la loi
  const bloc = loi.bloc?.toLowerCase() ?? ''
  let theme = 'social'
  if (bloc.includes('énergie') || bloc.includes('energie')) theme = 'energie'
  else if (bloc.includes('économie') || bloc.includes('economie')) theme = 'economie'
  else if (bloc.includes('sécurité') || bloc.includes('securite')) theme = 'securite'
  else if (bloc.includes('institution')) theme = 'institutions'
  else if (loi.tags?.some(t => ['IMMIGRATION', 'MIGRATION', 'FRONTIERE'].includes(t))) theme = 'immigration'

  const pool = profil.amendements_par_theme[theme] ?? profil.amendements_par_theme.social
  if (!pool?.length) return null

  const tpl = pool[Math.floor(Math.random() * pool.length)]
  return {
    ...tpl,
    parti_id: partiId,
    parti: { label: profil.nom, couleur: profil.couleur, emoji: partiId === 'RN' ? '🔵' : '🔵' },
    id: `${partiId}_${Date.now()}`,
    statut: 'en_attente',
    type: 'hostile',
    position_actuelle: 'contre',
    position_apres_acceptation: tpl.position_apres,
    cout_acceptation: tpl.cout ?? 0,
  }
}

/**
 * Retourne l'attaque médiatique la plus pertinente selon l'état du jeu
 */
export function choisirAttaqueMediatique(partiId, etatJeu) {
  const profil = partiId === 'RN' ? PROFIL_RN : partiId === 'LR' ? PROFIL_LR : null
  if (!profil?.attaques_mediatiques) return null

  const atqs = profil.attaques_mediatiques
  const candidats = []

  if (etatJeu.inflation_pct > 3 && atqs.si_inflation_haute) candidats.push(atqs.si_inflation_haute)
  if (etatJeu.deficit_pib_pct > 5 && atqs.si_deficit_haut) candidats.push(atqs.si_deficit_haut)
  if (etatJeu.tension_sociale > 60 && atqs.si_tension_haute) candidats.push(atqs.si_tension_haute)
  if (etatJeu.popularite_joueur < 35 && atqs.si_popularite_joueur_basse) candidats.push(atqs.si_popularite_joueur_basse)
  if (etatJeu.popularite_joueur < 35 && atqs.si_popularite_basse) candidats.push(atqs.si_popularite_basse)
  if (etatJeu.relation_ue < 0 && atqs.si_relation_ue_mauvaise) candidats.push(atqs.si_relation_ue_mauvaise)
  if (etatJeu.scandales_actifs?.length > 0 && atqs.si_scandale) candidats.push(atqs.si_scandale)

  if (!candidats.length) return null

  // Choisir aléatoirement parmi les attaques pertinentes
  const attaque = candidats[Math.floor(Math.random() * candidats.length)]

  // Remplacer les variables dynamiques
  const texte = attaque.texte
    .replace('{popularite}', Math.round(etatJeu.popularite_joueur))
    .replace('{deficit}', Math.round(etatJeu.deficit_milliards))
    .replace('{inflation}', etatJeu.inflation_pct?.toFixed(1))

  return { ...attaque, texte, parti_id: partiId, nom_parti: profil.nom }
}

/**
 * Vérifie si une loi franchit une ligne rouge d'un parti
 */
export function verifierLigneRouge(partiId, loiId) {
  const profil = partiId === 'RN' ? PROFIL_RN : partiId === 'LR' ? PROFIL_LR : null
  return profil?.lignes_rouges?.includes(loiId) ?? false
}

/**
 * Génère le discours cohérent d'un parti pour un vote
 */
export function genererDiscours(partiId, position) {
  const profil = partiId === 'RN' ? PROFIL_RN : partiId === 'LR' ? PROFIL_LR : null
  if (!profil?.discours) return null
  const pool = profil.discours[`vote_${position}`] ?? []
  return pool[Math.floor(Math.random() * pool.length)] ?? null
}
