/**
 * France 2026 — Profils Idéologiques Complets — Tous les Partis
 * Sources : datan.fr (17e législature), europarl.europa.eu, touteleurope.eu
 * Données réelles : votes AN, taux présence, cohésion, PE (déc. 2025)
 */

// ─────────────────────────────────────────────────────────────
// DONNÉES PARLEMENTAIRES RÉELLES — AN 17e LÉGISLATURE
// Source : datan.fr — décembre 2025
// ─────────────────────────────────────────────────────────────

export const STATS_AN = {
  RN: {
    siege_an: 122, chef_groupe: 'Marine Le Pen',
    participation_votes: 0.40,   // Le plus élevé de l'AN
    cohesion: 0.98,              // Très soudé
    soutien_gouvernement: 0.78,  // 78% soutien Bayrou
    proximite_avec: { UDDPLR: 0.76, DR: 0.61, HOR: 0.49, EPR: 0.49 },
    opposition_avec: { GDR: 0.18, LFI: 0.19, ECOS: 0.20 },
    votes_recents: [
      { loi: 'PLFSS 2026 lecture définitive',  vote: 'CONTRE',     date: '2025-12-16' },
      { loi: 'PLFSS 2026 partie dépenses',     vote: 'ABSTENTION', date: '2025-12-09' },
      { loi: 'PLF 2026 partie recettes',       vote: 'CONTRE',     date: '2025-11-21' },
    ],
    pe_groupe: 'Patriotes pour l\'Europe (PfE)', pe_sieges_fr: 30,
    pe_rapports_deposes_2019_2024: 6,
  },
  LFI: {
    siege_an: 71, chef_groupe: 'Mathilde Panot',
    participation_votes: 0.34, cohesion: 0.98, soutien_gouvernement: 0.11,
    proximite_avec: { ECOS: 0.81, SOC: 0.71, GDR: 0.64 },
    opposition_avec: { UDDPLR: 0.14, RN: 0.19, DR: 0.21 },
    votes_recents: [
      { loi: 'PLFSS 2026 lecture définitive',  vote: 'CONTRE', date: '2025-12-16' },
      { loi: 'PLFSS 2026 partie dépenses',     vote: 'CONTRE', date: '2025-12-09' },
      { loi: 'PLF 2026 partie recettes',       vote: 'CONTRE', date: '2025-11-21' },
    ],
    pe_groupe: 'La Gauche (GUE/NGL)', pe_sieges_fr: 9, pe_copresident: 'Manon Aubry',
    pe_rapports_deposes: 21,
  },
  PS_ECO: {
    siege_an_soc: 69, siege_an_ecos: 38, chef_groupe: 'Boris Vallaud / Cyrielle Chatelain',
    participation_votes: 0.31, cohesion_soc: 0.93, cohesion_ecos: 0.95,
    soutien_gouvernement_soc: 0.53, soutien_gouvernement_ecos: 0.28,
    proximite_avec: { ECOS: 0.78, LFI: 0.71, GDR: 0.61 },
    opposition_avec: { UDDPLR: 0.16, RN: 0.23, DR: 0.31 },
    votes_recents: [
      { loi: 'PLFSS 2026 (SOC)',               vote: 'POUR',       date: '2025-12-16' },
      { loi: 'PLFSS 2026 (ECOS)',              vote: 'ABSTENTION', date: '2025-12-16' },
      { loi: 'PLF 2026 partie recettes',       vote: 'CONTRE',     date: '2025-11-21' },
    ],
    pe_groupe_soc: 'S&D', pe_sieges_fr_soc: 13,
    pe_groupe_ecos: 'Verts/ALE', pe_sieges_fr_ecos: 5, pe_rapports_ecos: 19,
  },
  EPR: {
    siege_an: 91, chef_groupe: 'Gabriel Attal',
    participation_votes: 0.25, cohesion: 0.93, soutien_gouvernement: 0.95,
    proximite_avec: { DEM: 0.86, HOR: 0.81, DR: 0.65 },
    votes_recents: [
      { loi: 'PLFSS 2026 lecture définitive',  vote: 'POUR',       date: '2025-12-16' },
      { loi: 'PLF 2026 partie recettes',       vote: 'ABSTENTION', date: '2025-11-21' },
    ],
    pe_groupe: 'Renew Europe', pe_sieges_fr: 13, pe_presidente: 'Valérie Hayer',
  },
  LR: {
    siege_an: 49, chef_groupe: 'Laurent Wauquiez',
    participation_votes: 0.19,   // Sous la moyenne — moins présent
    cohesion: 0.89,              // Moins soudé (divisions)
    soutien_gouvernement: 0.95,
    proximite_avec: { HOR: 0.66, EPR: 0.65, DEM: 0.63, RN: 0.63 },
    opposition_avec: { GDR: 0.20, LFI: 0.21, ECOS: 0.24 },
    votes_recents: [
      { loi: 'PLFSS 2026 lecture définitive',  vote: 'ABSTENTION', date: '2025-12-16' },
      { loi: 'PLFSS 2026 partie dépenses',     vote: 'ABSTENTION', date: '2025-12-09' },
      { loi: 'PLF 2026 partie recettes',       vote: 'CONTRE',     date: '2025-11-21' },
    ],
    pe_groupe: 'PPE', pe_sieges_fr: 6,
    note: 'Scission : Ciotti parti au RN avec 17 députés (groupe UDDPLR)',
  },
  PATRIOTES: { siege_an: 0, note: 'Aucun siège AN. Micro-parti médiatique.', pe_sieges_fr: 0 },
  UPR:       { siege_an: 0, note: 'Aucun élu. Parti doctrinaire, très structuré.',  pe_sieges_fr: 0 },
}

// ─────────────────────────────────────────────────────────────
// PROFIL RN
// ─────────────────────────────────────────────────────────────
export const PROFIL_RN = {
  id: 'RN', nom: 'Rassemblement National',
  chefs: ['Jordan Bardella', 'Marine Le Pen'], couleur: '#1a1aff',
  stats_an: STATS_AN.RN,
  lignes_rouges: ['regularisation_migrants_masse','pacte_migration_ue','aide_developpement_augmentation','euthanasie','cannabis_legalisation','retraite_maintien_64'],
  comportement_reel: {
    vote_pour:    ['Motion de censure Barnier (déc. 2024)','Baisse TVA carburant (amendements répétés)'],
    vote_contre:  ['PLFSS 2026','PLF 2026 recettes','Accord UE-Mercosur'],
    abstention:   ['PLFSS 2026 partie dépenses'],
    amendements:  ['Priorité nationale aides sociales','Conditionnalité RSA 15h','Expulsion accélérée OQTF','TVA carburant 5.5%'],
    pe: 'PfE avec Orbán/Babiš. ~60% opposition aux textes UE. 6 rapports déposés 2019-2024 (très peu).',
  },
  amendements_par_theme: {
    social: [{
      titre: 'Priorité nationale',
      article: "Les bénéfices de la présente loi sont accordés en priorité aux ressortissants français et aux résidents justifiant de 5 ans de présence régulière sur le territoire.",
      justification: "Bardella : 'L'argent des Français doit d'abord servir les Français.'",
      impacts_delta: { tension_sociale: +4, relation_ue: -6, popularite_joueur: -3 },
      position_apres: 'abstention', cout: 0,
    },{
      titre: 'Conditionnalité RSA',
      article: "Le versement des prestations sociales est conditionné à un engagement d'activité de 15 heures minimum par semaine.",
      justification: "Le Pen : 'Les droits vont avec les devoirs.'",
      impacts_delta: { tension_sociale: +6, deficit_milliards: -4, consentement_impot: +3 },
      position_apres: 'pour', cout: 0,
    }],
    economie: [{
      titre: 'Préférence nationale marchés publics',
      article: "Les appels d'offres supérieurs à 500 000 € accordent une préférence de 15% aux entreprises dont le siège et la production sont en France.",
      justification: "Bardella : 'Nos impôts doivent financer nos emplois, pas ceux de l'étranger.'",
      impacts_delta: { pib_croissance_pct: +0.2, relation_ue: -10, indice_confiance_marches: -5 },
      position_apres: 'pour', cout: 0,
    },{
      titre: 'Taxe délocalisation',
      article: "Toute entreprise déplaçant plus de 50 emplois hors de France dans les 5 ans suivant une aide publique sera soumise à une taxe de remboursement intégral majorée de 20%.",
      justification: "Le Pen : 'On ne peut pas toucher l'argent public et licencier les Français.'",
      impacts_delta: { tension_sociale: -5, popularite_joueur: +4 },
      position_apres: 'pour', cout: 0,
    }],
    immigration: [{
      titre: 'Expulsion accélérée OQTF',
      article: "Tout étranger en situation irrégulière faisant l'objet d'une OQTF est placé en rétention immédiate pour éloignement sous 72 heures.",
      justification: "Bardella : 'Une OQTF doit signifier un départ, pas un bout de papier.'",
      impacts_delta: { tension_sociale: +8, relation_ue: -12 },
      position_apres: 'pour', cout: 0,
    }],
    securite: [{
      titre: 'Peines planchers récidive',
      article: "Pour tout crime en récidive, une peine plancher incompressible égale aux deux tiers du maximum légal est instaurée.",
      justification: "Le Pen : 'La récidive est un choix. Elle doit être sanctionnée comme telle.'",
      impacts_delta: { tension_sociale: -4, deficit_milliards: +3 },
      position_apres: 'pour', cout: 0,
    }],
    energie: [{
      titre: 'TVA carburant 5.5%',
      article: "La TVA applicable aux carburants à la pompe est ramenée à 5.5% pour les particuliers et transporteurs indépendants.",
      justification: "Bardella : 'Les Français ne peuvent plus conduire pour travailler.'",
      impacts_delta: { popularite_joueur: +7, deficit_milliards: +8, inflation_pct: -0.3 },
      position_apres: 'pour', cout: 0,
    }],
    institutions: [{
      titre: 'Référendum obligatoire',
      article: "Toute modification substantielle des traités internationaux est soumise à référendum populaire obligatoire dans les 6 mois.",
      justification: "Le Pen : 'Le peuple est le seul souverain légitime.'",
      impacts_delta: { stabilite: -8, relation_ue: -8 },
      position_apres: 'abstention', cout: 0,
    }],
  },
  attaques_mediatiques: {
    si_inflation_haute:       { titre: 'RN — "Le pouvoir d\'achat en chute libre"',        texte: "Bardella : 'Pendant que les Français choisissent entre se chauffer et manger, le gouvernement choisit entre Bruxelles et le CAC40.'",    impact: { popularite_joueur: -6, tension_sociale: +5 } },
    si_deficit_haut:          { titre: 'RN — "La dette de vos enfants"',                   texte: "Le Pen : 'Ce gouvernement emprunte {deficit} milliards. Ce n'est pas de la gestion, c'est de l'irresponsabilité.'",                      impact: { popularite_joueur: -5, indice_confiance_marches: -4 } },
    si_popularite_joueur_basse:{ titre: 'RN — "Ce gouvernement est à bout de souffle"',   texte: "Bardella : 'Avec {popularite}% de confiance, ce gouvernement n'a plus aucune légitimité. Dissolution ou démission.'",                   impact: { popularite_joueur: -8, stabilite: -6 } },
    si_scandale:              { titre: 'RN — "L\'État profond se démasque"',               texte: "Bardella : 'Ce scandale illustre l'arrogance d'une élite qui se croit au-dessus des lois qu'elle impose aux autres.'",                   impact: { popularite_joueur: -10, tension_sociale: +8 } },
  },
  discours: {
    vote_pour:      ["Bardella : 'Nous soutenons ce texte car nos électeurs l'ont réclamé. Nous resterons vigilants.'", "Pour l'intérêt national — même si la mesure est insuffisante."],
    vote_contre:    ["Le Pen : 'Ce n'est pas la France que nous voulons construire. Non.'", "Ce texte est une insulte aux travailleurs français."],
    vote_abstention:["Bardella : 'Nous ne cautionnons pas, mais nous ne bloquons pas. Les Français jugeront.'"],
    motion_censure: ["Bardella : 'Ce gouvernement a perdu la confiance des Français. Motion de censure.'"],
  },
}

// ─────────────────────────────────────────────────────────────
// PROFIL LFI
// ─────────────────────────────────────────────────────────────
export const PROFIL_LFI = {
  id: 'LFI', nom: 'La France Insoumise',
  chefs: ['Jean-Luc Mélenchon', 'Mathilde Panot'], couleur: '#cc0000',
  stats_an: STATS_AN.LFI,
  lignes_rouges: ['retraite_64_maintien','baisse_allocations','privatisation_service_public','peines_planchers','surveillance_de_masse','reforme_code_travail_flexibilite'],
  comportement_reel: {
    vote_pour:   ['Motions de censure (Borne 49.3, Barnier déc. 2024)','Budget alternatif ISF + nationalisations'],
    vote_contre: ['Réforme retraites 2023 (opposition totale)','Loi immigration 2023','PLFSS 2026 (tous votes)','PLF 2026'],
    abstention:  [],
    amendements: ['Extension ISF patrimoines financiers','Blocage prix alimentaires','Financement services publics par taxe dividendes'],
    pe: 'GUE/NGL, co-présidence Manon Aubry. 21 rapports. Vote contre libre-échange et directives austérité.',
  },
  amendements_par_theme: {
    social: [{
      titre: 'Fonds d\'urgence sociale',
      article: "Extension aux précaires et sans-domicile via un fonds d'urgence abondé par une contribution exceptionnelle sur les dividendes supérieurs à 100 000€.",
      justification: "Mélenchon : 'On ne peut pas réformer sans protéger ceux d'en bas.'",
      impacts_delta: { deficit_milliards: +4, tension_sociale: -6, popularite_joueur: +3 },
      position_apres: 'pour', cout: 4,
    }],
    economie: [{
      titre: 'Taxe sur dividendes',
      article: "Financement par une taxe exceptionnelle de 35% sur les dividendes distribués au-delà de 100 000€ par foyer fiscal.",
      justification: "Panot : 'Les ultra-riches doivent contribuer à l'effort national.'",
      impacts_delta: { indice_confiance_marches: -8, deficit_milliards: -3 },
      position_apres: 'pour', cout: 0,
    }],
    energie: [{
      titre: 'Plan sortie nucléaire',
      article: "Complément obligatoire : plan de sortie progressive du nucléaire sur 10 ans avec investissement prioritaire dans les renouvelables.",
      justification: "Chaibi : 'L'avenir ne peut reposer sur une technologie vieillissante.'",
      impacts_delta: { relation_ue: +5, deficit_milliards: +6 },
      position_apres: 'abstention', cout: 6,
    }],
    securite: [{
      titre: 'Suppression peines planchers',
      article: "Toute disposition instaurant des peines minimales incompressibles est supprimée au profit d'une individualisation renforcée des peines.",
      justification: "Mélenchon : 'La justice, ça ne se fabrique pas à la chaîne.'",
      impacts_delta: { tension_sociale: +3 },
      position_apres: 'contre', cout: 0,
    }],
    immigration: [{
      titre: 'Régularisation travailleurs',
      article: "Tout travailleur étranger justifiant de 12 mois de cotisations sociales bénéficie d'un titre de séjour de plein droit.",
      justification: "Panot : 'On ne peut pas travailler, payer des impôts et rester sans papiers.'",
      impacts_delta: { tension_sociale: +8, relation_ue: +3, popularite_joueur: -4 },
      position_apres: 'pour', cout: 0,
    }],
    institutions: [{
      titre: 'Assemblée constituante',
      article: "La présente réforme devra être soumise à une assemblée constituante élue au suffrage universel direct.",
      justification: "Mélenchon : 'Toute réforme majeure nécessite un nouveau contrat social.'",
      impacts_delta: { stabilite: -10, tension_sociale: +4 },
      position_apres: 'contre', cout: 0,
    }],
  },
  attaques_mediatiques: {
    si_deficit_haut:           { titre: 'LFI — "Austérité ou justice sociale ?"',          texte: "Mélenchon : 'Ce gouvernement invoque la dette pour couper les services publics mais refuse de faire payer les milliardaires.'",            impact: { popularite_joueur: -5, tension_sociale: +4 } },
    si_tension_haute:          { titre: 'LFI — Appel à la mobilisation',                   texte: "Panot : 'La rue exprime ce que les urnes ont dit. Ce gouvernement n'entend que les marchés. Le peuple doit se faire entendre plus fort.'",  impact: { popularite_joueur: -6, tension_sociale: +8 } },
    si_popularite_joueur_basse:{ titre: 'LFI — "Motion de censure, maintenant"',           texte: "Mélenchon : 'Avec {popularite}% d'opinions favorables, ce gouvernement gouverne contre le peuple.'",                                       impact: { popularite_joueur: -7, stabilite: -8 } },
    si_scandale:               { titre: 'LFI — "Le système se démasque"',                  texte: "Panot : 'Ce scandale prouve ce que nous disions : oligarchie, médias, politique — tous liés. Le peuple mérite mieux.'",                    impact: { popularite_joueur: -9, tension_sociale: +7 } },
  },
  discours: {
    vote_pour:      ["Mélenchon : 'Nous soutenons ce texte car il répond partiellement à l'urgence sociale. Mais c'est trop peu.'"],
    vote_contre:    ["Panot : 'La France Insoumise refuse de cautionner cette politique au service des ultra-riches.'"],
    vote_abstention:["LFI s'abstient : des avancées existent mais le texte reste marqué par l'idéologie libérale."],
    motion_censure: ["Mélenchon : 'Au nom du peuple français, nous déposons cette motion. Ce gouvernement doit partir.'"],
  },
}

// ─────────────────────────────────────────────────────────────
// PROFIL PS_ECO
// ─────────────────────────────────────────────────────────────
export const PROFIL_PS_ECO = {
  id: 'PS_ECO', nom: 'Socialistes & Écologistes',
  chefs: ['Boris Vallaud', 'Cyrielle Chatelain', 'Raphaël Glucksmann (PE)'], couleur: '#ff8c00',
  stats_an: STATS_AN.PS_ECO,
  lignes_rouges: ['retraite_64_maintien','baisse_allocations','alliance_rn','privatisation_education','suppression_aide_medicale_etat'],
  comportement_reel: {
    vote_pour:   ['PLFSS 2026 (SOC vote pour, ECOS s\'abstient)','Budget partiel Bayrou (SOC 53%)'],
    vote_contre: ['PLF 2026 recettes','Réforme retraites 2023','Loi immigration durcissement 2023'],
    abstention:  ['PLFSS 2026 (ECOS)'],
    amendements: ['Volet environnemental + bilan carbone','Comité suivi paritaire syndicats','Extension précaires et travailleurs pauvres'],
    pe: 'S&D (13 élus PS-PP). Verts/ALE (5 élus ECOS, 19 rapports). Vote Ursula von der Leyen. Mandat social-climatique.',
  },
  amendements_par_theme: {
    social: [{
      titre: 'Comité paritaire syndicats',
      article: "Création d'un comité de suivi paritaire incluant représentants syndicaux (CGT, CFDT, FO) et associations de terrain, évaluant annuellement la présente loi.",
      justification: "Vallaud : 'Les réformes sans les travailleurs, ça ne dure pas.'",
      impacts_delta: { tension_sociale: -4, popularite_joueur: +2 },
      position_apres: 'pour', cout: 1,
    }],
    economie: [{
      titre: 'Clause sociale emploi',
      article: "Les bénéfices fiscaux sont conditionnés au maintien ou à la création nette d'emplois en CDI sur le territoire national pendant 3 ans.",
      justification: "Glucksmann : 'L'argent public ne doit pas financer les délocalisations.'",
      impacts_delta: { pib_croissance_pct: +0.1, tension_sociale: -3 },
      position_apres: 'pour', cout: 0,
    }],
    energie: [{
      titre: 'Bilan carbone obligatoire',
      article: "Tout projet de plus de 10 millions d'euros inclus dans la présente loi fera l'objet d'un bilan carbone annuel publié.",
      justification: "Chatelain : 'On ne peut plus dissocier politique économique et climat.'",
      impacts_delta: { relation_ue: +4, pib_croissance_pct: -0.2 },
      position_apres: 'pour', cout: 2,
    }],
    immigration: [{
      titre: 'Parcours d\'intégration renforcé',
      article: "Financement d'un parcours d'intégration renforcé (langue, civisme, emploi) accessible à tous les résidents légaux dans les 6 mois suivant leur arrivée.",
      justification: "Vallaud : 'L'intégration, ça se prépare avec des moyens, pas des slogans.'",
      impacts_delta: { tension_sociale: -3, deficit_milliards: +2 },
      position_apres: 'pour', cout: 2,
    }],
    institutions: [{
      titre: 'Consultation citoyenne',
      article: "Mise en place d'une consultation citoyenne nationale avant promulgation, avec publication des résultats et obligation de réponse motivée du gouvernement.",
      justification: "Chatelain : 'La démocratie ne s'arrête pas au vote.'",
      impacts_delta: { stabilite: +2, popularite_joueur: +3 },
      position_apres: 'pour', cout: 1,
    }],
  },
  attaques_mediatiques: {
    si_tension_haute:      { titre: 'PS-ECOS — "Gouvernement sourd à la souffrance"',  texte: "Vallaud : 'Quand les Français descendent dans la rue, ce gouvernement répond par des injonctions. Dialogue social immédiat.'",               impact: { popularite_joueur: -4, tension_sociale: +3 } },
    si_relation_ue_mauvaise:{ titre: 'PS — "La France s\'isole en Europe"',             texte: "Glucksmann : 'Nous avions construit une Europe sociale. Ce gouvernement la détruit par populisme et irresponsabilité.'",                       impact: { popularite_joueur: -3, relation_ue: -2 } },
  },
  discours: {
    vote_pour:      ["Vallaud : 'Ce n'est pas tout ce que nous voulions, mais c'est un progrès que nous assumons.'"],
    vote_contre:    ["Chatelain : 'Nous ne pouvons pas soutenir une loi qui ignore l'urgence climatique et sociale.'"],
    vote_abstention:["Nous nous abstenons : des avancées méritent d'être reconnues, mais les insuffisances sont trop importantes."],
    motion_censure: ["Vallaud : 'Ce gouvernement a perdu la confiance des Français. La gauche unie dépose cette motion.'"],
  },
}

// ─────────────────────────────────────────────────────────────
// PROFIL EPR
// ─────────────────────────────────────────────────────────────
export const PROFIL_EPR = {
  id: 'EPR', nom: 'Ensemble pour la République',
  chefs: ['Gabriel Attal', 'François Bayrou (PM)'], couleur: '#ffcc00',
  stats_an: STATS_AN.EPR,
  lignes_rouges: ['frexit','sortie_otan','nationalisation_banques','retraite_60','isf_retour_pur'],
  comportement_reel: {
    vote_pour:   ['PLFSS 2026 (95% soutien)','Budget Bayrou quasi-total'],
    vote_contre: [],
    abstention:  ['PLF 2026 partie recettes (équilibres budgétaires)'],
    amendements: ['Harmonisation directives européennes','Rapport conformité annuel','Indicateurs de performance économique'],
    pe: 'Renew Europe (13 élus, Valérie Hayer présidente). Pro-UE. Vote Ursula von der Leyen. Soutien grands textes climatiques européens.',
  },
  amendements_par_theme: {
    social: [{
      titre: 'Conformité européenne',
      article: "Les dispositions de la présente loi font l'objet d'une notification préalable à la Commission européenne et d'un rapport de conformité avec les directives sociales en vigueur.",
      justification: "Attal : 'La France honore ses engagements européens. C'est une question de crédibilité.'",
      impacts_delta: { relation_ue: +6, indice_confiance_marches: +3 },
      position_apres: 'pour', cout: 0,
    }],
    economie: [{
      titre: 'Tableau de bord performance',
      article: "Un tableau de bord d'indicateurs économiques (emploi, croissance, dette) est publié trimestriellement pour évaluer l'impact de la présente loi.",
      justification: "Attal : 'On ne peut pas dépenser sans mesurer. La transparence est notre engagement.'",
      impacts_delta: { indice_confiance_marches: +5, stabilite: +2 },
      position_apres: 'pour', cout: 0,
    }],
    energie: [{
      titre: 'Mix énergétique européen',
      article: "La présente loi s'inscrit dans le cadre du mix énergétique 2030 : 50% nucléaire, 40% renouvelables, 10% autres.",
      justification: "Attal : 'L'énergie décarbonée, c'est notre souveraineté et notre compétitivité.'",
      impacts_delta: { relation_ue: +4, pib_croissance_pct: +0.2 },
      position_apres: 'pour', cout: 2,
    }],
    institutions: [{
      titre: 'Évaluation experts indépendants',
      article: "Une évaluation par des experts indépendants mandatés sera conduite dans les 18 mois suivant l'entrée en vigueur.",
      justification: "Attal : 'Les meilleures pratiques internationales nous guident.'",
      impacts_delta: { indice_confiance_marches: +4, stabilite: +3 },
      position_apres: 'pour', cout: 0,
    }],
  },
  attaques_mediatiques: {
    si_relation_ue_mauvaise: { titre: 'EPR — "S\'isoler de l\'Europe coûte cher"',     texte: "Attal : 'Chaque fois que la France s'isole de ses partenaires, elle perd en crédibilité. Ce gouvernement joue avec l'avenir économique du pays.'", impact: { popularite_joueur: -4, relation_ue: -3 } },
    si_deficit_haut:         { titre: 'EPR — "La rigueur s\'impose"',                   texte: "Attal : 'Nous avions réduit le déficit. Ce gouvernement repart dans l'autre sens. C'est irresponsable pour la crédibilité de la France.'",          impact: { popularite_joueur: -3, indice_confiance_marches: -4 } },
  },
  discours: {
    vote_pour:      ["Attal : 'Nous soutenons ce texte car il avance dans la bonne direction pour les Français et pour l'Europe.'"],
    vote_contre:    ["Nous votons contre. Ce texte n'est pas compatible avec nos engagements budgétaires et européens."],
    vote_abstention:["Renaissance s'abstient : des éléments positifs coexistent avec des dispositions que nous ne pouvons cautionner."],
    motion_censure: ["Attal : 'Cette motion de censure est un acte de responsabilité face à un gouvernement en dérive.'"],
  },
}

// ─────────────────────────────────────────────────────────────
// PROFIL LR
// ─────────────────────────────────────────────────────────────
export const PROFIL_LR = {
  id: 'LR', nom: 'Les Républicains / Droite Républicaine',
  chefs: ['Laurent Wauquiez'], couleur: '#0066cc',
  stats_an: STATS_AN.LR,
  lignes_rouges: ['retraite_60','smic_2000','isf_retour','nationalisation_banques','sortie_euro','frexit','sortie_otan','regularisation_migrants_masse','cannabis_legalisation','revenu_universel'],
  comportement_reel: {
    vote_pour:   ['Loi immigration durcissement 2023','Budget Barnier initial','Loi sécurité quotidienne'],
    vote_contre: ['PLF 2026 partie recettes'],
    abstention:  ['PLFSS 2026 (toutes lectures — signal insatisfaction)'],
    amendements: ['Clause révision budgétaire automatique','Conditionnalité travail aides','Allègement charges PME','Plafonnement dépenses publiques','Accélération EPR2'],
    pe: 'PPE (6 élus). Vote Ursula von der Leyen. Pro-UE mais souverainiste sur certains dossiers. Bellamy : rapports bioéthique.',
    note: 'Scission Ciotti : 17 députés partis au RN (groupe UDDPLR). Wauquiez reconstruit.',
  },
  amendements_par_theme: {
    social: [{
      titre: 'Clause révision budgétaire',
      article: "La présente loi est assortie d'une clause de révision automatique à 3 ans : rapport coût-bénéfice au Parlement, suspension possible si coût dépasse l'enveloppe de plus de 20%.",
      justification: "Wauquiez : 'On ne peut pas dépenser sans compter. Chaque euro doit être justifié.'",
      impacts_delta: { deficit_milliards: -2, indice_confiance_marches: +4, stabilite: +2 },
      position_apres: 'pour', cout: 0,
    },{
      titre: 'Conditionnalité travail',
      article: "Les aides sociales créées par la présente loi sont conditionnées à une démarche active d'insertion professionnelle évaluée tous les 6 mois.",
      justification: "Wauquiez : 'Les droits sans devoirs, ce n'est pas la République.'",
      impacts_delta: { tension_sociale: +3, deficit_milliards: -3, consentement_impot: +4 },
      position_apres: 'pour', cout: 0,
    }],
    economie: [{
      titre: 'Allègement charges PME',
      article: "Exonération de cotisations patronales de 10% pour les PME (<250 salariés) pour toute création nette d'emploi dans les 24 mois suivant la promulgation.",
      justification: "Wauquiez : 'Les PME sont l'épine dorsale de l'économie française.'",
      impacts_delta: { pib_croissance_pct: +0.3, deficit_milliards: +4, indice_confiance_marches: +6 },
      position_apres: 'pour', cout: 4,
    },{
      titre: 'Plafonnement dépenses',
      article: "Les crédits sont plafonnés à l'enveloppe initiale sans possibilité de dépassement par décret. Tout dépassement requiert une LFR.",
      justification: "Wauquiez : 'La rigueur budgétaire n'est pas une option, c'est une obligation.'",
      impacts_delta: { deficit_milliards: -5, indice_confiance_marches: +7, stabilite: +3 },
      position_apres: 'pour', cout: 0,
    }],
    immigration: [{
      titre: 'Intégration exigeante',
      article: "Le titre de séjour longue durée est conditionné à la réussite d'un test de langue française niveau B1 et à la signature d'un contrat d'intégration républicaine.",
      justification: "Wauquiez : 'S'intégrer, c'est adopter les valeurs de la République.'",
      impacts_delta: { tension_sociale: +2, relation_ue: -3, consentement_impot: +3 },
      position_apres: 'pour', cout: 0,
    }],
    securite: [{
      titre: 'Renforcement police judiciaire',
      article: "2000 postes de police judiciaire supplémentaires financés par redéploiement budgétaire accompagnent la mise en œuvre de la présente loi.",
      justification: "Wauquiez : 'La sécurité sans moyens, c'est de la com.'",
      impacts_delta: { tension_sociale: -5, deficit_milliards: +2, popularite_joueur: +3 },
      position_apres: 'pour', cout: 2,
    }],
    energie: [{
      titre: 'Accélération EPR2',
      article: "Les délais d'instruction des permis de construire pour les nouvelles tranches nucléaires sont réduits à 18 mois maximum.",
      justification: "Wauquiez : 'L'énergie nucléaire française, c'est notre souveraineté.'",
      impacts_delta: { pib_croissance_pct: +0.2, deficit_milliards: +3 },
      position_apres: 'pour', cout: 0,
    }],
    institutions: [{
      titre: 'Évaluation parlementaire',
      article: "Un comité d'évaluation composé de 12 députés et 6 sénateurs assure le suivi annuel de la présente loi avec rapport public obligatoire.",
      justification: "Wauquiez : 'Le Parlement doit contrôler, pas juste voter.'",
      impacts_delta: { stabilite: +3, indice_confiance_marches: +2 },
      position_apres: 'pour', cout: 0,
    }],
  },
  attaques_mediatiques: {
    si_deficit_haut:          { titre: 'LR — "La dette, c\'est l\'impôt de demain"',      texte: "Wauquiez : 'Ce gouvernement emprunte {deficit} milliards. Chaque Français naît avec une dette de 40 000 euros sur les épaules. C'est une faute morale.'", impact: { popularite_joueur: -5, indice_confiance_marches: -4 } },
    si_tension_haute:         { titre: 'LR — "L\'autorité de l\'État s\'effondre"',        texte: "Wauquiez : 'Ce niveau de tension sociale, c'est l'échec de l'autorité de l'État. LR demande un plan de rétablissement de l'ordre républicain.'",         impact: { popularite_joueur: -4, stabilite: -5 } },
    si_popularite_basse:      { titre: 'LR — "Ce gouvernement gouverne dans le vide"',   texte: "Wauquiez : 'Avec {popularite}% de soutien, ce gouvernement n'a plus l'autorité morale pour réformer. LR propose une alternative crédible.'",               impact: { popularite_joueur: -6, stabilite: -4 } },
    si_loi_depense_excessive: { titre: 'LR — "Encore de la dépense, jamais de réforme"', texte: "Wauquiez : 'Vous dépensez des milliards sans jamais réformer les structures. La France a besoin de rigueur, pas de chèques en bois.'",                     impact: { popularite_joueur: -3, indice_confiance_marches: -5 } },
  },
  discours: {
    vote_pour:      ["Wauquiez : 'LR vote pour ce texte, qui va dans le bon sens même s'il manque d'ambition budgétaire.'"],
    vote_contre:    ["Wauquiez : 'Non. Ce texte aggrave la dette, affaiblit l'autorité et envoie de mauvais signaux aux marchés.'"],
    vote_abstention:["LR s'abstient : des dispositions positives existent, mais l'ensemble manque de sérieux budgétaire."],
    motion_censure: ["Wauquiez : 'Ce gouvernement a perdu le contrôle. LR dépose cette motion au nom de la responsabilité.'"],
  },
}

// ─────────────────────────────────────────────────────────────
// PROFIL PATRIOTES
// ─────────────────────────────────────────────────────────────
export const PROFIL_PATRIOTES = {
  id: 'PATRIOTES', nom: 'Les Patriotes', chefs: ['Florian Philippot'], couleur: '#003399',
  stats_an: STATS_AN.PATRIOTES,
  lignes_rouges: ['accord_ue', 'renforcement_otan', 'libre_echange_ue'],
  comportement_reel: { note: 'Aucun élu AN. Présence médiatique YouTube/réseaux. Anti-RN (rivaux idéologiques). Aucun siège PE 2024.' },
  amendements_par_theme: {
    institutions: [{
      titre: 'Clause de souveraineté',
      article: "La présente loi ne saurait s'appliquer si son application implique le respect d'un règlement ou d'une directive européenne contraire aux intérêts souverains de la France.",
      justification: "Philippot : 'La France avant Bruxelles, toujours.'",
      impacts_delta: { relation_ue: -15, indice_confiance_marches: -6 },
      position_apres: 'abstention', cout: 0,
    }],
    energie: [{
      titre: 'Indépendance énergétique totale',
      article: "Les ressources énergétiques françaises sont placées sous contrôle public intégral avec interdiction de revente à des entités étrangères.",
      justification: "Philippot : 'L'énergie française appartient aux Français.'",
      impacts_delta: { relation_ue: -8, indice_confiance_marches: -6 },
      position_apres: 'pour', cout: 0,
    }],
  },
  attaques_mediatiques: {
    si_accord_ue: { titre: 'Patriotes — "Encore Bruxelles qui commande"', texte: "Philippot : 'Ce gouvernement obéit à Bruxelles comme avant lui. La France n'est plus souveraine. Il faut sortir de cette Union européenne qui nous étouffe.'", impact: { popularite_joueur: -4, tension_sociale: +3 } },
  },
  discours: {
    vote_pour:      ["Les Patriotes soutiennent cette mesure souveraine — trop rare pour ne pas être soutenue."],
    vote_contre:    ["Philippot : 'Non à cette capitulation devant Bruxelles et les mondialistes.'"],
    vote_abstention:["Les Patriotes s'abstiennent : des éléments souverains positifs mais insuffisants."],
  },
}

// ─────────────────────────────────────────────────────────────
// PROFIL UPR
// ─────────────────────────────────────────────────────────────
export const PROFIL_UPR = {
  id: 'UPR', nom: 'Union Populaire Républicaine', chefs: ['François Asselineau'], couleur: '#1a3a6b',
  stats_an: STATS_AN.UPR,
  lignes_rouges: ['maintien_ue','maintien_euro','maintien_otan','accord_libre_echange'],
  comportement_reel: { note: 'Aucun élu AN ni PE. Parti très discipliné et doctrinaire. Forte présence internet. Considère RN et Patriotes comme des imposteurs souverainistes.' },
  amendements_par_theme: {
    institutions: [{
      titre: 'Article 50 préalable',
      article: "La présente loi ne peut être mise en œuvre qu'après notification de l'article 50 du TUE, condition nécessaire à la récupération de la souveraineté nationale.",
      justification: "Asselineau : 'Toute réforme réelle passe d'abord par le Frexit.'",
      impacts_delta: { relation_ue: -20, stabilite: -10 },
      position_apres: 'contre', cout: 0,
    }],
  },
  discours: {
    vote_contre:    ["Asselineau : 'Réformer dans les chaînes de l'UE, c'est repeindre les murs d'une prison. Non.'"],
    vote_abstention:["UPR s'abstient. Toute réforme hors du Frexit est cosmétique."],
  },
}

// ─────────────────────────────────────────────────────────────
// REGISTRE GLOBAL
// ─────────────────────────────────────────────────────────────
export const TOUS_PROFILS = { RN: PROFIL_RN, LFI: PROFIL_LFI, PS_ECO: PROFIL_PS_ECO, EPR: PROFIL_EPR, LR: PROFIL_LR, PATRIOTES: PROFIL_PATRIOTES, UPR: PROFIL_UPR }

// ─────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────

export function choisirAmendement(partiId, loi) {
  const profil = TOUS_PROFILS[partiId]
  if (!profil?.amendements_par_theme) return null
  const bloc = loi.bloc?.toLowerCase() ?? ''
  let theme = 'social'
  if (bloc.includes('énergie') || bloc.includes('energie'))        theme = 'energie'
  else if (bloc.includes('économie') || bloc.includes('economie')) theme = 'economie'
  else if (bloc.includes('sécurité') || bloc.includes('securite')) theme = 'securite'
  else if (bloc.includes('institution'))                            theme = 'institutions'
  else if (loi.tags?.some(t => ['IMMIGRATION','MIGRATION','FRONTIERE'].includes(t))) theme = 'immigration'
  const pool = profil.amendements_par_theme[theme] ?? profil.amendements_par_theme.social ?? []
  if (!pool.length) return null
  const tpl = pool[Math.floor(Math.random() * pool.length)]
  return {
    ...tpl,
    parti_id: partiId,
    parti: { label: profil.nom, couleur: profil.couleur, emoji: '🔵' },
    id: `${partiId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    statut: 'en_attente', type: 'hostile',
    position_actuelle: 'contre',
    position_apres_acceptation: tpl.position_apres,
    cout_acceptation: tpl.cout ?? 0,
  }
}

export function choisirAttaqueMediatique(partiId, etatJeu) {
  const profil = TOUS_PROFILS[partiId]
  if (!profil?.attaques_mediatiques) return null
  const atqs = profil.attaques_mediatiques
  const candidats = []
  if (etatJeu.inflation_pct > 3          && atqs.si_inflation_haute)         candidats.push(atqs.si_inflation_haute)
  if (etatJeu.deficit_pib_pct > 5        && atqs.si_deficit_haut)            candidats.push(atqs.si_deficit_haut)
  if (etatJeu.tension_sociale > 60       && atqs.si_tension_haute)           candidats.push(atqs.si_tension_haute)
  if (etatJeu.popularite_joueur < 35     && atqs.si_popularite_joueur_basse) candidats.push(atqs.si_popularite_joueur_basse)
  if (etatJeu.popularite_joueur < 35     && atqs.si_popularite_basse)        candidats.push(atqs.si_popularite_basse)
  if (etatJeu.relation_ue < 0            && atqs.si_relation_ue_mauvaise)    candidats.push(atqs.si_relation_ue_mauvaise)
  if (etatJeu.scandales_actifs?.length   && atqs.si_scandale)                candidats.push(atqs.si_scandale)
  if (etatJeu.accord_ue_recent           && atqs.si_accord_ue)               candidats.push(atqs.si_accord_ue)
  if (!candidats.length) return null
  const attaque = candidats[Math.floor(Math.random() * candidats.length)]
  const texte = attaque.texte
    .replace('{popularite}', Math.round(etatJeu.popularite_joueur ?? 42))
    .replace('{deficit}',    Math.round(etatJeu.deficit_milliards ?? 173))
    .replace('{inflation}',  (etatJeu.inflation_pct ?? 2.8).toFixed(1))
  return { ...attaque, texte, parti_id: partiId, nom_parti: profil.nom }
}

export function verifierLigneRouge(partiId, loiId) {
  return TOUS_PROFILS[partiId]?.lignes_rouges?.includes(loiId) ?? false
}

export function genererDiscours(partiId, typeVote) {
  const profil = TOUS_PROFILS[partiId]
  if (!profil?.discours) return null
  const cle = typeVote === 'motion_censure' ? 'motion_censure'
    : typeVote === 'pour' ? 'vote_pour'
    : typeVote === 'contre' ? 'vote_contre'
    : 'vote_abstention'
  const pool = profil.discours[cle] ?? []
  return pool[Math.floor(Math.random() * pool.length)] ?? null
}

export function getStatsAN(partiId) { return STATS_AN[partiId] ?? null }

// ─────────────────────────────────────────────────────────────
// PROPOSITIONS DE LOI RÉELLES DÉPOSÉES (17e législature 2024–)
// Source : assemblee-nationale.fr / comptes-rendus séances
// ─────────────────────────────────────────────────────────────

export const PROPOSITIONS_LOI_REELLES = {

  LFI: {
    deposees: [
      {
        titre: 'Abrogation réforme retraites 2023',
        objet: 'Supprime le recul de l\'âge légal à 64 ans et le relèvement de la durée d\'assurance (loi du 14 avril 2023). Rétablit le droit antérieur.',
        date: '2025-11-27',
        statut: 'Adoptée en journée réservée NFP — adoptée en commission, examinée en séance',
        notes: 'Proposition phare LFI. Bloquée au Sénat. Sera retentée à chaque journée réservée.',
      },
      {
        titre: 'Résolution contre accord UE-Mercosur',
        objet: 'Invite le gouvernement à constituer une minorité de blocage au Conseil UE et à saisir la CJUE pour vérifier la conformité de l\'accord.',
        date: '2025-11-27',
        statut: 'Adoptée en séance (journée réservée LFI-NFP)',
        notes: 'Vote trans-partis : RN, LFI, LR, SOC, ECOS favorables. Accord très impopulaire.',
      },
      {
        titre: 'Abolition du délit d\'apologie du terrorisme',
        objet: 'Abroge le délit d\'apologie du terrorisme du code pénal.',
        date: '2024-11-26',
        statut: 'Rejetée — tollé général. Tous groupes contre sauf LFI.',
        notes: 'Proposition très controversée, unanimement rejetée. Défendue par LFI comme protection de la liberté d\'expression.',
      },
      {
        titre: 'Exonération CSG/CRDS apprentis',
        objet: 'Supprime pour 3 ans l\'assujettissement à CSG/CRDS de la rémunération des apprentis au-delà de 50% du SMIC.',
        date: '2025-11-27',
        statut: 'Adoptée sans modification majeure en commission',
      },
      {
        titre: 'Fiscalité pension alimentaire',
        objet: 'Réforme la fiscalité des pensions alimentaires (déductibilité pour le payeur, non-imposition pour le bénéficiaire).',
        date: '2025-11-27',
        statut: 'Adoptée en commission affaires sociales',
      },
    ],
    amendements_adoptes_notables: [
      'ISF climatique (sous-amendé avec RN sur le principe, non adopté final)',
      'Taxe sur les dividendes supérieurs à 100 000€ (PLF 2025 — adopté en commission finances, rejeté en séance globale)',
    ],
  },

  RN: {
    deposees: [
      {
        titre: 'Motion de censure contre Barnier',
        objet: 'Renverse le gouvernement Barnier.',
        date: '2024-12-02',
        statut: 'Adoptée avec LFI et gauche — gouvernement renversé',
        notes: 'Moment historique : RN vote avec LFI pour la première fois sur une motion de censure. Barnier démissionne le 13 décembre 2024.',
      },
      {
        titre: 'Propositions TVA carburant 5.5%',
        objet: 'Ramène la TVA sur les carburants à 5.5% pour les particuliers.',
        date: 'Multiples dépôts PLF 2024, PLF 2025',
        statut: 'Rejetée à chaque fois par la majorité',
        notes: 'Marronnier RN. Très populaire auprès de leur électorat rural.',
      },
      {
        titre: 'Suppression regroupement familial',
        objet: 'Supprime ou restreint fortement le regroupement familial.',
        date: 'Loi immigration 2023 (amendements) et propositions séparées',
        statut: 'Partiellement intégré dans la loi immigration 2023 (durée de résidence allongée)',
      },
    ],
    amendements_adoptes_notables: [
      'Certains durcissements dans la loi immigration 2023 (avec LR)',
      'Amendements sur peines planchers dans textes sécurité',
    ],
    note_strategie: 'Dépose peu de propositions de loi propres (stratégie d\'opposition constructive). Préfère les amendements et les motions de censure. Soutient ponctuellement certains textes gouvernementaux.',
  },

  PS_ECO: {
    deposees_soc: [
      {
        titre: 'Proposition abrogation réforme retraites (co-déposée NFP)',
        objet: 'Retour à 62 ans minimum (compromis PS vs 60 ans LFI).',
        date: '2024-2025 (multiple)',
        statut: 'Adoption AN impossible sans majorité. Portée symbolique.',
      },
      {
        titre: 'Proposition loi encadrement loyers national',
        objet: 'Étend l\'encadrement des loyers à toutes les agglomérations de plus de 100 000 habitants.',
        date: '2024',
        statut: 'Examinée, non adoptée définitivement',
      },
    ],
    deposees_ecos: [
      {
        titre: 'Résolution opposition accord UE-Mercosur',
        date: '2025-11-27',
        statut: 'Co-portée avec LFI, adoptée',
      },
      {
        titre: 'Proposition loi planification écologique',
        objet: 'Instaure un plan contraignant de réduction des émissions avec objectifs annuels opposables.',
        date: '2024',
        statut: 'Journée réservée ECOS — examinée, non adoptée',
      },
    ],
    amendements_adoptes_notables: [
      'Volets sociaux dans loi logement',
      'Bilans carbone dans textes économiques (partiels)',
    ],
  },

  EPR: {
    deposees: [
      {
        titre: 'Budget 2025 (co-responsable)',
        objet: 'PLF 2025 — premier budget Barnier. Rejeté par l\'AN avant motion de censure.',
        date: '2024-10-10',
        statut: 'Rejeté par l\'AN (12 nov. 2024). Repris via loi spéciale.',
      },
      {
        titre: 'Transposition directive équilibre femmes-hommes CA',
        objet: 'Transpose la directive UE 2022/2381 sur l\'équilibre F/H dans les conseils d\'administration.',
        date: '2024',
        statut: 'Adoptée',
        notes: 'Texte technique, pas controversé.',
      },
    ],
    amendements_adoptes_notables: [
      '27 amendements intégrés dans le PLF 2025 version finale (plus que tout autre groupe)',
      'Amendements de conformité UE dans multiples textes',
    ],
    note_strategie: 'En position de minorité depuis 2024. Soutient le gouvernement à 95%. Joue sur les amendements techniques intégrés par le gouvernement plutôt que les grandes propositions.',
  },

  LR: {
    deposees: [
      {
        titre: 'Propositions immigration (durcissement)',
        objet: 'Multiples propositions : quotas annuels, fin du droit du sol automatique, expulsions facilitées.',
        date: '2023-2024',
        statut: 'Partiellement intégré dans loi immigration 2023 (Darmanin)',
        notes: 'LR a négocié avec le gouvernement pour intégrer ses dispositions. Succès partiel.',
      },
      {
        titre: 'Proposition loi SRP+10 (marchés alimentaires)',
        objet: 'Renouvelle et étend le dispositif de relèvement du seuil de revente à perte alimentaire.',
        date: '2025-03-17',
        statut: 'Co-déposée avec EPR. Adoptée.',
        notes: 'Rare proposition co-déposée LR-EPR adoptée sous le gouvernement Bayrou.',
      },
      {
        titre: 'Proposition loi rigueur budgétaire',
        objet: 'Introduit une règle d\'or constitutionnelle interdisant les budgets en déséquilibre structurel.',
        date: '2024',
        statut: 'Non adoptée — manque de majorité',
      },
    ],
    amendements_adoptes_notables: [
      '16 amendements intégrés dans PLF 2025 version finale (2e groupe le plus intégré)',
      'Durcissements loi immigration 2023',
      'Dispositions peines planchers sécurité',
    ],
    note_strategie: 'Stratégie hybride : soutient le gouvernement (95%) mais dépose des amendements pour marquer sa différence. Cherche à récupérer les ex-électeurs partis au RN via des positions dures immigration/sécurité.',
  },

}

// ─────────────────────────────────────────────────────────────
// PARLEMENT EUROPÉEN — DONNÉES COMPLÈTES 2024-2029
// Source : touteleurope.eu, wikipedia, europarl
// ─────────────────────────────────────────────────────────────

export const STATS_PE = {
  RN: {
    sieges_fr: 30,           // 1ère délégation française
    score_fr_2024: '31.37%', // 1er parti en France
    groupe_pe: 'Patriotes pour l\'Europe (PfE)',
    membres_notables: ['Jordan Bardella (tête liste)', 'Thierry Mariani', 'André Rougé'],
    note_malika_sorel: 'Malika Sorel a quitté le RN en avril 2025 → non-inscrite',
    comportement_pe: {
      opposition_textes_ue: 0.60,    // ~60% d'opposition aux textes UE
      rapports_deposes_2019_2024: 6, // Très peu — Jordan Bardella cité comme "rapporteur fictif" par France Info
      vote_von_der_leyen: 'CONTRE',
      positions_cles: [
        'Contre le Pacte vert (Green Deal)',
        'Contre la taxonomie verte',
        'Contre le devoir de vigilance entreprises',
        'Pour la renégociation des accords de libre-échange',
        'Contre accord UE-Mercosur',
      ],
      alliés_pe: ['Fidesz (Hongrie - Orbán)', 'ANO (Tchéquie - Babiš)', 'Ligue (Italie - Salvini)'],
    },
  },

  EPR: {
    sieges_fr: 13,
    score_fr_2024: '14.60%',
    groupe_pe: 'Renew Europe',
    presidente_groupe: 'Valérie Hayer',
    membres_notables: ['Valérie Hayer', 'Pascal Canfin', 'Fabienne Keller', 'Stéphanie Yon-Courtin'],
    note: 'Marie-Pierre Vedrenne nommée au gouvernement oct. 2025 → remplacée par Jérémy Decerle',
    comportement_pe: {
      vote_von_der_leyen: 'POUR',
      positions_cles: [
        'Pro Green Deal (Pascal Canfin ex-rapporteur)',
        'Pour taxonomie verte',
        'Pour accord libre-échange avec garde-fous',
        'Pour fédéralisme économique et budgétaire',
        'Pour soutien à l\'Ukraine',
      ],
      alliés_pe: ['FDP (Allemagne)', 'VVD (Pays-Bas)', 'Ciudadanos/En Comú (Espagne)'],
    },
  },

  PS_ECO: {
    sieges_fr_soc: 13,  // PS + Place Publique
    score_fr_2024_soc: '13.83%',
    groupe_pe_soc: 'S&D (Socialistes et Démocrates)',
    chefs_delegation_soc: ['Raphaël Glucksmann', 'Nora Mebarek'],
    membres_notables_soc: ['Raphaël Glucksmann', 'Aurore Lalucq', 'Thomas Pellerin-Carlin'],
    sieges_fr_ecos: 5,
    score_fr_2024_ecos: 'inclus dans résultat EELV (moins de 6%)',
    groupe_pe_ecos: 'Verts/ALE',
    membres_notables_ecos: ['Marie Toussaint', 'Mounir Satouri', 'David Cormand', 'Majdouline Sbai', 'Mélissa Camara'],
    rapports_deposes_ecos_2019_2024: 19,
    comportement_pe: {
      vote_von_der_leyen_soc: 'POUR (avec réserves)',
      vote_von_der_leyen_ecos: 'CONTRE',
      positions_cles_soc: [
        'Pour salaire minimum européen',
        'Pour taxation des multinationales',
        'Pour devoir de vigilance entreprises',
        'Pro-Ukraine, pro-sanctions Russie',
        'Pour accord UE-Mercosur avec garde-fous sociaux',
      ],
      positions_cles_ecos: [
        'Pour Green Deal renforcé',
        'Contre accord UE-Mercosur (agriculture)',
        'Pour taxe carbone aux frontières',
        'Pour fin des énergies fossiles en 2035',
        'Pour dette commune européenne green',
      ],
    },
  },

  LFI: {
    sieges_fr: 9,
    score_fr_2024: '9.89%',
    groupe_pe: 'La Gauche (GUE/NGL)',
    co_presidente: 'Manon Aubry',
    membres_notables: ['Manon Aubry', 'Leïla Chaibi', 'Rima Hassan', 'Emma Fourreau', 'Damien Carême', 'Younous Omarjee'],
    rapports_deposes_2019_2024: 21,
    comportement_pe: {
      vote_von_der_leyen: 'CONTRE',
      positions_cles: [
        'Contre accord UE-Mercosur (résolution adoptée AN)',
        'Contre libre-échange en général',
        'Pour fin de l\'austérité — pacte de stabilité',
        'Ambiguïté Ukraine (ni armes ni capitulation)',
        'Pour Green Deal mais financé par taxation richesse',
        'Contre OTAN (au sein du groupe)',
      ],
      alliés_pe: ['Syriza (Grèce)', 'Podemos/Sumar (Espagne)', 'Die Linke (Allemagne)'],
    },
  },

  LR: {
    sieges_fr: 6,
    score_fr_2024: '7.25%',
    groupe_pe: 'PPE (Parti Populaire Européen)',
    membres_notables: ['François-Xavier Bellamy', 'Nadine Morano', 'Céline Imart', 'Laurent Castillo'],
    comportement_pe: {
      vote_von_der_leyen: 'POUR',
      positions_cles: [
        'Pro-UE mais souverainiste sur certains dossiers',
        'Pour rigueur budgétaire européenne',
        'Pour politique migratoire commune stricte',
        'Bellamy : rapporteur bioéthique et numérique',
        'Pour soutien Ukraine',
        'Pour accord UE-Mercosur (avec garde-fous agricoles)',
      ],
      alliés_pe: ['CDU/CSU (Allemagne)', 'PP (Espagne)', 'Forza Italia'],
    },
  },

  RECONQUETE: {
    sieges_fr: 5,
    score_fr_2024: 'juste au-dessus 5%',
    note: '4 membres ont rejoint CRE après scission. Sarah Knafo → ENS (groupe Farage/AfD).',
    groupe_pe_majorite: 'CRE (Conservateurs et Réformistes Européens)',
    groupe_pe_knafo: 'ENS (Europe des Nations Souveraines)',
    membres: ['Sarah Knafo (ENS)', '4 élus CRE'],
  },
}

// ─────────────────────────────────────────────────────────────
// VOTES CLÉS COMMUNS — LIGNE DE FRACTURE PAR LOI
// (Pour alimenter les probabilités de vote dans Legislatif.jsx)
// ─────────────────────────────────────────────────────────────

export const VOTES_CLES_AN = [
  {
    loi: 'Réforme retraites (loi LFRSS 2023 — 64 ans)',
    date: '2023-03',
    votes: { RN: 'CONTRE', LFI: 'CONTRE', PS_ECO: 'CONTRE', EPR: 'POUR (49.3)', LR: 'POUR' },
    note: 'Adoptée au 49.3. Motion de censure à 9 voix près. Crise politique majeure.',
  },
  {
    loi: 'Loi immigration Darmanin 2023',
    date: '2023-12',
    votes: { RN: 'POUR', LFI: 'CONTRE', PS_ECO: 'CONTRE', EPR: 'POUR', LR: 'POUR (co-auteur)' },
    note: 'Texte LR/RN intégré. Censuré partiellement par le Conseil constitutionnel.',
  },
  {
    loi: 'Motion de censure contre Barnier',
    date: '2024-12-04',
    votes: { RN: 'POUR (co-dépositaire)', LFI: 'POUR', PS_ECO: 'POUR', EPR: 'CONTRE', LR: 'CONTRE' },
    note: 'Adoptée — gouvernement renversé. Moment historique RN + gauche.',
  },
  {
    loi: 'PLF 2026 partie recettes',
    date: '2025-11-21',
    votes: { RN: 'CONTRE', LFI: 'CONTRE', PS_ECO: 'CONTRE', EPR: 'ABSTENTION', LR: 'CONTRE' },
    note: 'Rejet quasi-unanime de la partie recettes.',
  },
  {
    loi: 'PLFSS 2026 (lecture définitive)',
    date: '2025-12-16',
    votes: { RN: 'CONTRE', LFI: 'CONTRE', PS_ECO: 'POUR (SOC) / ABSTENTION (ECOS)', EPR: 'POUR', LR: 'ABSTENTION' },
    note: 'Adopté grâce à SOC + EPR + DEM + HOR. Coalition inhabituelle gauche modérée + centre.',
  },
  {
    loi: 'Résolution contre accord UE-Mercosur',
    date: '2025-11-27',
    votes: { RN: 'POUR', LFI: 'POUR', PS_ECO: 'POUR', EPR: 'CONTRE/ABSTENTION', LR: 'POUR' },
    note: 'Vote trans-partis contre Mercosur. Renaissance isolée.',
  },
]

// Fonction utilitaire pour obtenir la position historique d'un parti sur un type de loi
export function getPositionHistorique(partiId, typeLoiTags = []) {
  const positions = {
    RN: {
      RETRAITES: 'contre',
      IMMIGRATION_DURCISSEMENT: 'pour',
      IMMIGRATION_REGULARISATION: 'contre',
      BUDGET_AUSTERITE: 'contre',
      BUDGET_DEPENSES_SOCIALES: 'contre',
      EUROPE_ACCORD: 'contre',
      SECURITE: 'pour',
      ENERGIE_NUCLEAIRE: 'pour',
      ENERGIE_RENOUVELABLE: 'abstention',
      FISCALITE_RICHES: 'abstention',
    },
    LFI: {
      RETRAITES: 'contre',
      IMMIGRATION_DURCISSEMENT: 'contre',
      IMMIGRATION_REGULARISATION: 'pour',
      BUDGET_AUSTERITE: 'contre',
      BUDGET_DEPENSES_SOCIALES: 'pour',
      EUROPE_ACCORD: 'contre',
      SECURITE: 'contre',
      ENERGIE_NUCLEAIRE: 'contre',
      ENERGIE_RENOUVELABLE: 'pour',
      FISCALITE_RICHES: 'pour',
    },
    PS_ECO: {
      RETRAITES: 'contre',
      IMMIGRATION_DURCISSEMENT: 'contre',
      IMMIGRATION_REGULARISATION: 'pour',
      BUDGET_AUSTERITE: 'abstention',
      BUDGET_DEPENSES_SOCIALES: 'pour',
      EUROPE_ACCORD: 'pour',
      SECURITE: 'abstention',
      ENERGIE_NUCLEAIRE: 'abstention',
      ENERGIE_RENOUVELABLE: 'pour',
      FISCALITE_RICHES: 'pour',
    },
    EPR: {
      RETRAITES: 'pour',
      IMMIGRATION_DURCISSEMENT: 'pour',
      IMMIGRATION_REGULARISATION: 'contre',
      BUDGET_AUSTERITE: 'pour',
      BUDGET_DEPENSES_SOCIALES: 'abstention',
      EUROPE_ACCORD: 'pour',
      SECURITE: 'pour',
      ENERGIE_NUCLEAIRE: 'pour',
      ENERGIE_RENOUVELABLE: 'pour',
      FISCALITE_RICHES: 'contre',
    },
    LR: {
      RETRAITES: 'pour',
      IMMIGRATION_DURCISSEMENT: 'pour',
      IMMIGRATION_REGULARISATION: 'contre',
      BUDGET_AUSTERITE: 'pour',
      BUDGET_DEPENSES_SOCIALES: 'abstention',
      EUROPE_ACCORD: 'pour',
      SECURITE: 'pour',
      ENERGIE_NUCLEAIRE: 'pour',
      ENERGIE_RENOUVELABLE: 'abstention',
      FISCALITE_RICHES: 'contre',
    },
    PATRIOTES: {
      EUROPE_ACCORD: 'contre',
      RETRAITES: 'contre',
      IMMIGRATION_DURCISSEMENT: 'pour',
    },
    UPR: {
      EUROPE_ACCORD: 'contre',
      RETRAITES: 'contre',
    },
  }

  const partiPositions = positions[partiId] ?? {}
  for (const tag of typeLoiTags) {
    if (partiPositions[tag]) return partiPositions[tag]
  }
  return null
}
// ─────────────────────────────────────────────────────────────
// DONNÉES PARLEMENTAIRES RÉELLES — LE SÉNAT (2024-2026)
// Source : nossenateurs.fr / senat.fr
// ─────────────────────────────────────────────────────────────

export const STATS_SENAT = {
  LR: {
    nom: 'Groupe Les Républicains',
    sieges: 143, // Premier groupe du Sénat
    participation_commissions: 0.88, // Très élevé
    influence_amendements: 'Maximale',
    position: 'Majorité sénatoriale',
    notes: 'Pivot de toutes les adoptions législatives. Peut bloquer n\'importe quel texte du NFP ou du Gouvernement.'
  },
  UC: {
    nom: 'Union Centriste',
    sieges: 56,
    participation_commissions: 0.82,
    alliance: 'LR (Majorité sénatoriale)',
    notes: 'Groupe charnière indispensable pour la majorité de droite.'
  },
  SOC: {
    nom: 'Socialiste, Écologiste et Républicain',
    sieges: 64,
    participation_commissions: 0.75,
    position: 'Opposition',
    notes: 'Premier groupe d\'opposition au Sénat.'
  },
  RN: {
    nom: 'Rassemblement National',
    sieges: 3, 
    participation_commissions: 0.65,
    position: 'Opposition marginale',
    notes: 'Influence quasi-nulle au Sénat malgré leur force à l\'Assemblée.'
  },
  LFI: {
    nom: 'Groupe CRCE-K (incluant LFI/Communistes)',
    sieges: 17,
    participation_commissions: 0.70,
    notes: 'Forte activité d\'amendements de rejet.'
  }
}

// ─────────────────────────────────────────────────────────────
// AJOUT DES COMPORTEMENTS SPÉCIFIQUES AU SÉNAT DANS LES PROFILS
// ─────────────────────────────────────────────────────────────

// Exemple d'intégration pour le profil LR (à ajouter dans PROFIL_LR)
export const COMPLEMENT_SENAT_LR = {
  comportement_senat: {
    strategie: "Réécriture des textes de l'Assemblée pour plus de rigueur budgétaire.",
    taux_adoption_amendements: 0.65, // 65% de leurs amendements sont adoptés
    blocage_frequent: ["Régularisation des travailleurs sans-papiers", "Abrogation réforme retraites"]
  }
}

// Exemple d'intégration pour le profil PS_ECO
export const COMPLEMENT_SENAT_PS_ECO = {
  comportement_senat: {
    strategie: "Contre-pouvoir par les rapports d'information et commissions d'enquête.",
    taux_adoption_amendements: 0.15,
    focus: ["Collectivités territoriales", "Services publics ruraux"]
  }
}
