/**
 * France 2026 — Lois propres à chaque parti
 * 6-8 lois par parti, cohérentes avec leur programme.
 * Importé dans Parlement.jsx pour afficher les lois de programme.
 */

export const LOIS_PAR_PARTI = {

  // ═══════════════════════════════════════════════════════
  // RN — Rassemblement National
  // ═══════════════════════════════════════════════════════
  RN: [
    {
      id: 'rn_preference_nationale', parti: 'RN',
      titre: 'Préférence nationale élargie', emoji: '🇫🇷',
      description: 'Réserve les aides sociales, logements HLM et emplois publics aux seuls citoyens français.',
      impacts: { popularite_joueur: +8, tension_sociale: +14, relation_ue: -22, pib_croissance_pct: -0.2 },
      partis_favorables: ['RN', 'PATRIOTES'], partis_hostiles: ['LFI', 'PS_ECO', 'EPR'],
      conditions: { popularite_min: 28 },
    },
    {
      id: 'rn_sortie_schengen', parti: 'RN',
      titre: 'Suspension de Schengen — contrôles aux frontières', emoji: '🛂',
      description: 'Rétablit les contrôles permanents aux frontières terrestres et maritimes.',
      impacts: { popularite_joueur: +10, tension_sociale: +8, relation_ue: -35, pib_croissance_pct: -0.4 },
      partis_favorables: ['RN', 'PATRIOTES', 'UPR'], partis_hostiles: ['EPR', 'PS_ECO'],
      conditions: { popularite_min: 35 },
    },
    {
      id: 'rn_tva_alimentaire_zero', parti: 'RN',
      titre: 'TVA à 0% sur les produits alimentaires', emoji: '🛒',
      description: 'Suppression totale de la TVA sur les produits de première nécessité.',
      impacts: { popularite_joueur: +14, deficit_milliards: +18, tension_sociale: -12, relation_ue: -10 },
      partis_favorables: ['RN', 'LFI', 'PATRIOTES'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 20 },
    },
    {
      id: 'rn_referendum_immigration', parti: 'RN',
      titre: 'Référendum sur l\'immigration', emoji: '🗳️',
      description: 'Soumet au vote populaire un quota annuel d\'immigration légale.',
      impacts: { popularite_joueur: +12, tension_sociale: +20, relation_ue: -18, stabilite: -10 },
      partis_favorables: ['RN', 'PATRIOTES'], partis_hostiles: ['LFI', 'PS_ECO', 'EPR'],
      conditions: { popularite_min: 40 },
    },
    {
      id: 'rn_remigration', parti: 'RN',
      titre: 'Plan de remigration volontaire', emoji: '✈️',
      description: 'Aide financière au retour dans le pays d\'origine pour les étrangers en situation régulière.',
      impacts: { popularite_joueur: +6, tension_sociale: +18, relation_ue: -25, pib_croissance_pct: -0.3 },
      partis_favorables: ['RN'], partis_hostiles: ['LFI', 'PS_ECO', 'EPR', 'ANIMALISTE'],
      conditions: { popularite_min: 38 },
    },
    {
      id: 'rn_sortie_euro', parti: 'RN',
      titre: 'Commission d\'étude sur la sortie de l\'euro', emoji: '💶',
      description: 'Crée une commission parlementaire sur le retour au franc. Sans effet immédiat mais très symbolique.',
      impacts: { popularite_joueur: +5, indice_confiance_marches: -20, relation_ue: -30, stabilite: -12 },
      partis_favorables: ['RN', 'UPR'], partis_hostiles: ['EPR', 'LR', 'PS_ECO'],
      conditions: { popularite_min: 45 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // LFI — La France Insoumise
  // ═══════════════════════════════════════════════════════
  LFI: [
    {
      id: 'lfi_smic_1700', parti: 'LFI',
      titre: 'SMIC à 1 700€ nets', emoji: '💰',
      description: 'Hausse immédiate du SMIC à 1 700€ nets. Mesure phare du programme insoumis.',
      impacts: { popularite_joueur: +12, pib_croissance_pct: -0.4, tension_sociale: -18, indice_confiance_marches: -8 },
      partis_favorables: ['LFI', 'TRAVAILLEURS', 'PS_ECO'], partis_hostiles: ['LR', 'EPR', 'RN'],
      conditions: { popularite_min: 25 },
    },
    {
      id: 'lfi_bouclier_eau', parti: 'LFI',
      titre: 'Eau et électricité — première tranche gratuite', emoji: '💧',
      description: 'Les 100 premiers kWh et les 5 premiers m³ d\'eau mensuels sont gratuits pour tous les foyers.',
      impacts: { popularite_joueur: +10, deficit_milliards: +12, tension_sociale: -10 },
      partis_favorables: ['LFI', 'PS_ECO', 'TRAVAILLEURS'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'lfi_retraite_55', parti: 'LFI',
      titre: 'Retraite à 55 ans pour les métiers pénibles', emoji: '👷',
      description: 'Abaissement de l\'âge de retraite à 55 ans pour les travailleurs des métiers reconnus pénibles.',
      impacts: { popularite_joueur: +9, deficit_milliards: +10, tension_sociale: -14, relation_ue: -8 },
      partis_favorables: ['LFI', 'TRAVAILLEURS'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 30 },
    },
    {
      id: 'lfi_taxe_superprofit', parti: 'LFI',
      titre: 'Taxe exceptionnelle sur les superprofits (90%)', emoji: '🏦',
      description: 'Taxation à 90% des bénéfices au-dessus de 100M€ pour les grandes entreprises du CAC 40.',
      impacts: { popularite_joueur: +11, deficit_milliards: -20, pib_croissance_pct: -0.5, indice_confiance_marches: -18 },
      partis_favorables: ['LFI', 'TRAVAILLEURS', 'PS_ECO'], partis_hostiles: ['LR', 'EPR'],
      conditions: { popularite_min: 28 },
    },
    {
      id: 'lfi_planification_ecologique', parti: 'LFI',
      titre: 'Loi de planification écologique', emoji: '🌍',
      description: 'Planification obligatoire de la transition énergétique dans chaque secteur industriel.',
      impacts: { popularite_joueur: +6, pib_croissance_pct: -0.3, relation_ue: +12, tension_sociale: +5 },
      partis_favorables: ['LFI', 'PS_ECO', 'ANIMALISTE'], partis_hostiles: ['LR', 'RN'],
      conditions: {},
    },
    {
      id: 'lfi_audit_dette', parti: 'LFI',
      titre: 'Audit citoyen de la dette publique', emoji: '🔍',
      description: 'Commission d\'audit indépendante sur la légitimité de la dette. Risque de défaut partiel.',
      impacts: { popularite_joueur: +4, indice_confiance_marches: -22, relation_ue: -15, stabilite: -8 },
      partis_favorables: ['LFI', 'PATRIOTES', 'UPR'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 40 },
    },
    {
      id: 'lfi_revenu_universel', parti: 'LFI',
      titre: 'Revenu universel d\'existence (800€/mois)', emoji: '💳',
      description: 'Versement mensuel de 800€ à tout citoyen de 18 à 25 ans sans activité.',
      impacts: { popularite_joueur: +13, deficit_milliards: +35, tension_sociale: -15, pib_croissance_pct: +0.2 },
      partis_favorables: ['LFI', 'TRAVAILLEURS', 'ANIMALISTE'], partis_hostiles: ['LR', 'EPR', 'RN'],
      conditions: { popularite_min: 30, reserve_min: 20 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // PS_ECO — Parti Socialiste / Europe Écologie
  // ═══════════════════════════════════════════════════════
  PS_ECO: [
    {
      id: 'pseco_transition_just', parti: 'PS_ECO',
      titre: 'Loi de transition juste', emoji: '🌿',
      description: 'Reconversion professionnelle financée pour tous les travailleurs des secteurs fossiles.',
      impacts: { popularite_joueur: +7, deficit_milliards: +8, pib_croissance_pct: +0.1, tension_sociale: -6 },
      partis_favorables: ['PS_ECO', 'LFI', 'ANIMALISTE'], partis_hostiles: ['RN', 'LR'],
      conditions: {},
    },
    {
      id: 'pseco_service_public_numerique', parti: 'PS_ECO',
      titre: 'Service public du numérique', emoji: '💻',
      description: 'Création d\'une infrastructure numérique publique en concurrence avec les GAFAM.',
      impacts: { popularite_joueur: +5, deficit_milliards: +14, pib_croissance_pct: +0.2, relation_ue: +5 },
      partis_favorables: ['PS_ECO', 'LFI'], partis_hostiles: ['LR', 'EPR'],
      conditions: { reserve_min: 10 },
    },
    {
      id: 'pseco_egalite_salariale', parti: 'PS_ECO',
      titre: 'Loi d\'égalité salariale obligatoire', emoji: '⚖️',
      description: 'Obligation légale d\'égalité de rémunération F/H sous peine de sanction pénale.',
      impacts: { popularite_joueur: +8, tension_sociale: -5, pib_croissance_pct: +0.1, indice_confiance_marches: -3 },
      partis_favorables: ['PS_ECO', 'LFI', 'EPR', 'ANIMALISTE'], partis_hostiles: ['RN', 'LR'],
      conditions: {},
    },
    {
      id: 'pseco_100pct_renouvelable', parti: 'PS_ECO',
      titre: 'Plan 100% renouvelable 2040', emoji: '☀️',
      description: 'Trajectoire légale vers 100% d\'énergies renouvelables d\'ici 2040 avec financement public.',
      impacts: { popularite_joueur: +6, deficit_milliards: +30, pib_croissance_pct: +0.3, relation_ue: +15 },
      partis_favorables: ['PS_ECO', 'ANIMALISTE'], partis_hostiles: ['RN', 'LR', 'EPR', 'PATRIOTES'],
      conditions: { popularite_min: 35, reserve_min: 20 },
    },
    {
      id: 'pseco_banque_publique_investissement', parti: 'PS_ECO',
      titre: 'Banque publique d\'investissement verte', emoji: '🏦',
      description: 'Création d\'une BPI orientée exclusivement vers les projets à impact environnemental positif.',
      impacts: { popularite_joueur: +5, deficit_milliards: +6, pib_croissance_pct: +0.2 },
      partis_favorables: ['PS_ECO', 'LFI', 'EPR'], partis_hostiles: ['LR'],
      conditions: {},
    },
    {
      id: 'pseco_taxe_carbone_frontiere', parti: 'PS_ECO',
      titre: 'Taxe carbone aux frontières (MACF)', emoji: '🌐',
      description: 'Application stricte du mécanisme d\'ajustement carbone aux frontières de l\'UE.',
      impacts: { popularite_joueur: +4, relation_ue: +18, pib_croissance_pct: +0.1, indice_confiance_marches: +5 },
      partis_favorables: ['PS_ECO', 'EPR', 'ANIMALISTE'], partis_hostiles: ['RN', 'PATRIOTES'],
      conditions: { relation_ue_min: 0 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // EPR — Renaissance / Ensemble
  // ═══════════════════════════════════════════════════════
  EPR: [
    {
      id: 'epr_reforme_etat', parti: 'EPR',
      titre: 'Réforme de l\'État — 10 000 postes supprimés', emoji: '✂️',
      description: 'Plan de rationalisation de la fonction publique avec non-remplacement de départs.',
      impacts: { popularite_joueur: -4, deficit_milliards: -8, indice_confiance_marches: +10, tension_sociale: +8 },
      partis_favorables: ['EPR', 'LR'], partis_hostiles: ['LFI', 'TRAVAILLEURS', 'PS_ECO'],
      conditions: {},
    },
    {
      id: 'epr_investissements_avenir', parti: 'EPR',
      titre: 'France 2030 — 2e tranche', emoji: '🚀',
      description: 'Déblocage de 20 Md€ supplémentaires pour les filières d\'avenir : IA, biotech, hydrogène.',
      impacts: { popularite_joueur: +6, deficit_milliards: +20, pib_croissance_pct: +0.4, indice_confiance_marches: +8 },
      partis_favorables: ['EPR', 'LR', 'PS_ECO'], partis_hostiles: ['LFI', 'RN'],
      conditions: { reserve_min: 15 },
    },
    {
      id: 'epr_retraite_64_maintien', parti: 'EPR',
      titre: 'Maintien ferme de la retraite à 64 ans', emoji: '📋',
      description: 'Loi confirmant le seuil de 64 ans et bloquant tout retour en arrière pour 10 ans.',
      impacts: { popularite_joueur: -6, deficit_milliards: -6, tension_sociale: +15, indice_confiance_marches: +8 },
      partis_favorables: ['EPR', 'LR'], partis_hostiles: ['LFI', 'TRAVAILLEURS', 'PS_ECO', 'RN'],
      conditions: {},
    },
    {
      id: 'epr_union_marches_capitaux', parti: 'EPR',
      titre: 'Union des marchés de capitaux européens', emoji: '🇪🇺',
      description: 'Poussée française pour créer un marché financier unifié en Europe.',
      impacts: { popularite_joueur: +2, relation_ue: +20, indice_confiance_marches: +12, pib_croissance_pct: +0.3 },
      partis_favorables: ['EPR', 'LR'], partis_hostiles: ['LFI', 'RN', 'PATRIOTES', 'UPR'],
      conditions: { relation_ue_min: 10 },
    },
    {
      id: 'epr_pacte_immigration', parti: 'EPR',
      titre: 'Pacte européen sur la migration', emoji: '📄',
      description: 'Application du pacte migration-asile européen avec quotas et centres communs.',
      impacts: { popularite_joueur: +3, relation_ue: +15, tension_sociale: +10 },
      partis_favorables: ['EPR', 'PS_ECO'], partis_hostiles: ['RN', 'PATRIOTES', 'LFI'],
      conditions: { relation_ue_min: 5 },
    },
    {
      id: 'epr_simplification_administrative', parti: 'EPR',
      titre: 'Loi de simplification administrative', emoji: '📁',
      description: 'Suppression de 300 formulaires et dématérialisation totale de 80 procédures.',
      impacts: { popularite_joueur: +5, pib_croissance_pct: +0.2, indice_confiance_marches: +5 },
      partis_favorables: ['EPR', 'LR', 'PS_ECO'], partis_hostiles: [],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // LR — Les Républicains
  // ═══════════════════════════════════════════════════════
  LR: [
    {
      id: 'lr_baisse_is', parti: 'LR',
      titre: 'Baisse de l\'IS à 20% pour les PME', emoji: '🏭',
      description: 'Réduction du taux d\'imposition sur les sociétés à 20% pour toutes les PME de moins de 250 salariés.',
      impacts: { popularite_joueur: +5, deficit_milliards: -8, pib_croissance_pct: +0.3, indice_confiance_marches: +8 },
      partis_favorables: ['LR', 'EPR'], partis_hostiles: ['LFI', 'PS_ECO'],
      conditions: {},
    },
    {
      id: 'lr_loi_ordre', parti: 'LR',
      titre: 'Loi Ordre & Sécurité du quotidien', emoji: '👮',
      description: 'Doublement des peines pour les récidivistes, création de 5 000 postes de policiers.',
      impacts: { popularite_joueur: +7, deficit_milliards: +5, tension_sociale: +8 },
      partis_favorables: ['LR', 'EPR', 'RN'], partis_hostiles: ['LFI', 'PS_ECO'],
      conditions: { popularite_min: 25 },
    },
    {
      id: 'lr_decentralisation', parti: 'LR',
      titre: 'Acte III de la décentralisation', emoji: '🗺️',
      description: 'Transfert de compétences majeures aux régions : formation, transports, logement social.',
      impacts: { popularite_joueur: +6, tension_sociale: -5, stabilite: +5, deficit_milliards: -4 },
      partis_favorables: ['LR', 'EPR', 'PS_ECO'], partis_hostiles: ['LFI', 'RN'],
      conditions: { popularite_min: 28 },
    },
    {
      id: 'lr_reforme_allocations', parti: 'LR',
      titre: 'Conditionnement des allocations à l\'activité', emoji: '📋',
      description: 'Le RSA est conditionné à 15h d\'activité hebdomadaire (emploi, formation ou bénévolat).',
      impacts: { popularite_joueur: +4, deficit_milliards: -5, tension_sociale: +12, pib_croissance_pct: +0.1 },
      partis_favorables: ['LR', 'EPR'], partis_hostiles: ['LFI', 'TRAVAILLEURS', 'PS_ECO'],
      conditions: {},
    },
    {
      id: 'lr_soutien_agriculture', parti: 'LR',
      titre: 'Plan de soutien à l\'agriculture française', emoji: '🌾',
      description: 'Subventions directes et allègements de charges pour les exploitants en difficulté.',
      impacts: { popularite_joueur: +7, deficit_milliards: +6, tension_sociale: -8 },
      partis_favorables: ['LR', 'EPR', 'RN'], partis_hostiles: ['ANIMALISTE'],
      conditions: {},
    },
    {
      id: 'lr_numerique_souverain', parti: 'LR',
      titre: 'Cloud souverain — Sortie des GAFAM', emoji: '☁️',
      description: 'Migration obligatoire des données publiques vers des serveurs souverains français.',
      impacts: { popularite_joueur: +5, deficit_milliards: +8, relation_ue: +5, pib_croissance_pct: +0.1 },
      partis_favorables: ['LR', 'EPR', 'PATRIOTES', 'UPR'], partis_hostiles: [],
      conditions: { reserve_min: 5 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // HORIZONS
  // ═══════════════════════════════════════════════════════
  HORIZONS: [
    {
      id: 'hor_plein_emploi', parti: 'HORIZONS',
      titre: 'Plan Plein Emploi 2027', emoji: '💼',
      description: 'Objectif chômage à 5% via formation accélérée, apprentissage et contrats de transition.',
      impacts: { popularite_joueur: +7, deficit_milliards: +10, pib_croissance_pct: +0.3, tension_sociale: -8 },
      partis_favorables: ['HORIZONS', 'EPR', 'LR'], partis_hostiles: ['LFI'],
      conditions: {},
    },
    {
      id: 'hor_entreprises_mission', parti: 'HORIZONS',
      titre: 'Statut entreprise à mission obligatoire pour le CAC 40', emoji: '🤝',
      description: 'Toutes les entreprises du CAC 40 doivent adopter le statut d\'entreprise à mission sous 2 ans.',
      impacts: { popularite_joueur: +6, pib_croissance_pct: +0.1, indice_confiance_marches: +4 },
      partis_favorables: ['HORIZONS', 'EPR', 'PS_ECO'], partis_hostiles: ['LFI'],
      conditions: {},
    },
    {
      id: 'hor_reforme_lycee_pro', parti: 'HORIZONS',
      titre: 'Réforme du lycée professionnel', emoji: '🎓',
      description: 'Partenariats obligatoires avec les entreprises locales, immersion de 50% du temps en entreprise.',
      impacts: { popularite_joueur: +5, deficit_milliards: +4, pib_croissance_pct: +0.2 },
      partis_favorables: ['HORIZONS', 'EPR', 'LR'], partis_hostiles: ['LFI', 'TRAVAILLEURS'],
      conditions: {},
    },
    {
      id: 'hor_bonus_malus_carbone', parti: 'HORIZONS',
      titre: 'Bonus-malus carbone sur les importations', emoji: '♻️',
      description: 'Taxe progressive sur les produits importés selon leur empreinte carbone.',
      impacts: { popularite_joueur: +4, relation_ue: +10, inflation_pct: +0.2, pib_croissance_pct: +0.1 },
      partis_favorables: ['HORIZONS', 'EPR', 'PS_ECO'], partis_hostiles: ['RN', 'PATRIOTES'],
      conditions: {},
    },
    {
      id: 'hor_investissement_sante', parti: 'HORIZONS',
      titre: 'Plan hôpital 2030 — 15 Md€', emoji: '🏥',
      description: 'Investissement massif dans les hôpitaux publics, revalorisation des soignants.',
      impacts: { popularite_joueur: +10, deficit_milliards: +15, tension_sociale: -10 },
      partis_favorables: ['HORIZONS', 'EPR', 'PS_ECO', 'LFI'], partis_hostiles: [],
      conditions: { reserve_min: 10 },
    },
    {
      id: 'hor_smart_city', parti: 'HORIZONS',
      titre: 'Programme Smart City — 10 métropoles', emoji: '🌆',
      description: 'Déploiement de l\'IA et des capteurs intelligents dans 10 grandes villes françaises.',
      impacts: { popularite_joueur: +4, deficit_milliards: +5, pib_croissance_pct: +0.2 },
      partis_favorables: ['HORIZONS', 'EPR'], partis_hostiles: ['LFI', 'PATRIOTES'],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // PATRIOTES
  // ═══════════════════════════════════════════════════════
  PATRIOTES: [
    {
      id: 'pat_sortie_otan_cmd', parti: 'PATRIOTES',
      titre: 'Retrait du commandement intégré OTAN', emoji: '🪖',
      description: 'La France sort du commandement militaire intégré tout en restant membre de l\'Alliance.',
      impacts: { popularite_joueur: +6, relation_ue: -12, stabilite: -8, indice_confiance_marches: -10 },
      partis_favorables: ['PATRIOTES', 'UPR', 'LFI'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 40 },
    },
    {
      id: 'pat_industrie_strategique', parti: 'PATRIOTES',
      titre: 'Nationalisation partielle des industries stratégiques', emoji: '⚙️',
      description: 'L\'État prend une participation de 35% dans les entreprises d\'armement, d\'énergie et de télécoms.',
      impacts: { popularite_joueur: +7, deficit_milliards: +25, indice_confiance_marches: -12, pib_croissance_pct: +0.1 },
      partis_favorables: ['PATRIOTES', 'UPR', 'LFI'], partis_hostiles: ['EPR', 'LR'],
      conditions: { reserve_min: 20 },
    },
    {
      id: 'pat_protectionnisme_intelligent', parti: 'PATRIOTES',
      titre: 'Protectionnisme intelligent — Buy French', emoji: '🏷️',
      description: 'Préférence nationale dans les marchés publics : 30% des contrats réservés aux entreprises françaises.',
      impacts: { popularite_joueur: +8, pib_croissance_pct: +0.2, relation_ue: -15 },
      partis_favorables: ['PATRIOTES', 'RN', 'UPR'], partis_hostiles: ['EPR', 'LR'],
      conditions: {},
    },
    {
      id: 'pat_monnaie_commune', parti: 'PATRIOTES',
      titre: 'Projet de monnaie commune européenne', emoji: '🪙',
      description: 'Propose le remplacement de l\'euro par une monnaie commune (non unique) entre pays membres.',
      impacts: { popularite_joueur: +5, indice_confiance_marches: -15, relation_ue: -20 },
      partis_favorables: ['PATRIOTES', 'UPR'], partis_hostiles: ['EPR', 'LR', 'PS_ECO'],
      conditions: { popularite_min: 42 },
    },
    {
      id: 'pat_rearmement_france', parti: 'PATRIOTES',
      titre: 'Réarmement national — budget défense à 3% du PIB', emoji: '🛡️',
      description: 'Porte le budget de défense à 3% du PIB et relance le service militaire universel.',
      impacts: { popularite_joueur: +8, deficit_milliards: +15, stabilite: +8, relation_ue: +5 },
      partis_favorables: ['PATRIOTES', 'LR', 'RN'], partis_hostiles: ['LFI'],
      conditions: { popularite_min: 30 },
    },
    {
      id: 'pat_referendum_ue', parti: 'PATRIOTES',
      titre: 'Référendum sur la renégociation des traités européens', emoji: '📜',
      description: 'Consultation populaire sur la renégociation des traités de Lisbonne et de Maastricht.',
      impacts: { popularite_joueur: +7, relation_ue: -25, stabilite: -12, indice_confiance_marches: -15 },
      partis_favorables: ['PATRIOTES', 'UPR', 'RN'], partis_hostiles: ['EPR', 'PS_ECO', 'LR'],
      conditions: { popularite_min: 48 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // UPR — Union Populaire Républicaine
  // ═══════════════════════════════════════════════════════
  UPR: [
    {
      id: 'upr_frexit_referdum', parti: 'UPR',
      titre: 'Référendum sur l\'appartenance à l\'UE', emoji: '🗳️',
      description: 'Organisation d\'un référendum sur la sortie complète de l\'Union Européenne.',
      impacts: { popularite_joueur: +4, relation_ue: -80, indice_confiance_marches: -35, stabilite: -20 },
      partis_favorables: ['UPR', 'PATRIOTES'], partis_hostiles: ['EPR', 'LR', 'PS_ECO', 'LFI'],
      conditions: { popularite_min: 55 },
    },
    {
      id: 'upr_sortie_euro', parti: 'UPR',
      titre: 'Plan de sortie de l\'euro — Retour au franc', emoji: '💵',
      description: 'Lancement du processus légal de sortie de la zone euro et retour à une monnaie nationale.',
      impacts: { popularite_joueur: +3, indice_confiance_marches: -40, pib_croissance_pct: -1.2, inflation_pct: +2.0 },
      partis_favorables: ['UPR'], partis_hostiles: ['EPR', 'LR', 'PS_ECO', 'LFI', 'RN'],
      conditions: { popularite_min: 52 },
    },
    {
      id: 'upr_banque_france_souveraine', parti: 'UPR',
      titre: 'Loi de souveraineté monétaire', emoji: '🏦',
      description: 'L\'État peut créer de la monnaie directement via la Banque de France sans passer par les marchés.',
      impacts: { popularite_joueur: +5, inflation_pct: +1.5, indice_confiance_marches: -25, deficit_milliards: -30 },
      partis_favorables: ['UPR', 'LFI'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 45 },
    },
    {
      id: 'upr_denonciation_traites', parti: 'UPR',
      titre: 'Dénonciation des traités de libre-échange', emoji: '📋',
      description: 'La France sort unilatéralement de tous les accords de libre-échange.',
      impacts: { popularite_joueur: +6, pib_croissance_pct: -0.8, relation_ue: -30, tension_sociale: +8 },
      partis_favorables: ['UPR', 'PATRIOTES', 'LFI'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 42 },
    },
    {
      id: 'upr_medias_publics', parti: 'UPR',
      titre: 'Nationalisation des grands groupes médias', emoji: '📺',
      description: 'L\'État rachète TF1, BFMTV et CNews pour créer un service public de l\'information.',
      impacts: { popularite_joueur: +5, deficit_milliards: +18, pression_mediatique: -20, relation_ue: -8 },
      partis_favorables: ['UPR', 'LFI'], partis_hostiles: ['EPR', 'LR', 'RN'],
      conditions: { reserve_min: 15 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // PCF — Parti Communiste Français
  // ═══════════════════════════════════════════════════════
  PCF: [
    {
      id: 'pcf_statut_fonctionnaire', parti: 'PCF',
      titre: 'Extension du statut de fonctionnaire', emoji: '📋',
      description: 'Intégration dans la fonction publique de 200 000 agents contractuels précaires.',
      impacts: { popularite_joueur: +6, deficit_milliards: +12, tension_sociale: -10 },
      partis_favorables: ['PCF', 'LFI', 'TRAVAILLEURS'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'pcf_planification_alimentaire', parti: 'PCF',
      titre: 'Plan national pour la souveraineté alimentaire', emoji: '🥗',
      description: 'Programme public garantissant l\'accès à une alimentation saine et locale pour tous.',
      impacts: { popularite_joueur: +7, deficit_milliards: +8, tension_sociale: -6 },
      partis_favorables: ['PCF', 'LFI', 'PS_ECO'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'pcf_controle_loyers', parti: 'PCF',
      titre: 'Encadrement strict des loyers dans toute la France', emoji: '🏠',
      description: 'Extension nationale de l\'encadrement des loyers avec plafond légal.',
      impacts: { popularite_joueur: +9, pib_croissance_pct: -0.2, indice_confiance_marches: -6 },
      partis_favorables: ['PCF', 'LFI', 'PS_ECO'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'pcf_journee_travail_6h', parti: 'PCF',
      titre: 'Journée de travail à 6 heures', emoji: '⏰',
      description: 'Réduction expérimentale du temps de travail à 6h pour les secteurs volontaires.',
      impacts: { popularite_joueur: +8, pib_croissance_pct: -0.3, tension_sociale: -12, indice_confiance_marches: -8 },
      partis_favorables: ['PCF', 'LFI', 'TRAVAILLEURS'], partis_hostiles: ['LR', 'EPR', 'RN'],
      conditions: {},
    },
    {
      id: 'pcf_mutualisation_brevets', parti: 'PCF',
      titre: 'Mutualisation des brevets médicaux', emoji: '💊',
      description: 'Les brevets pharmaceutiques financés par l\'État deviennent propriété publique.',
      impacts: { popularite_joueur: +7, pib_croissance_pct: -0.1, deficit_milliards: -5, relation_ue: -5 },
      partis_favorables: ['PCF', 'LFI', 'PS_ECO'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // DLF — Debout la France
  // ═══════════════════════════════════════════════════════
  DLF: [
    {
      id: 'dlf_quotient_familial', parti: 'DLF',
      titre: 'Doublement du quotient familial', emoji: '👨‍👩‍👧‍👦',
      description: 'Doublement des parts de quotient familial pour les familles de 3 enfants et plus.',
      impacts: { popularite_joueur: +8, deficit_milliards: +7, tension_sociale: -5 },
      partis_favorables: ['DLF', 'LR', 'RN'], partis_hostiles: ['LFI'],
      conditions: {},
    },
    {
      id: 'dlf_laicite_renforcee', parti: 'DLF',
      titre: 'Loi de laïcité renforcée', emoji: '⚖️',
      description: 'Interdiction de tout signe religieux ostensible dans l\'espace public et les entreprises.',
      impacts: { popularite_joueur: +6, tension_sociale: +15, relation_ue: -10 },
      partis_favorables: ['DLF', 'LR'], partis_hostiles: ['LFI', 'PS_ECO'],
      conditions: { popularite_min: 32 },
    },
    {
      id: 'dlf_francophonie', parti: 'DLF',
      titre: 'Plan de rayonnement de la francophonie', emoji: '🌍',
      description: 'Doublement du budget de l\'Institut français et de TV5 Monde.',
      impacts: { popularite_joueur: +4, deficit_milliards: +2, relation_ue: +3 },
      partis_favorables: ['DLF', 'LR', 'PATRIOTES'], partis_hostiles: [],
      conditions: {},
    },
    {
      id: 'dlf_industrie_defense', parti: 'DLF',
      titre: 'Sanctuarisation de l\'industrie de défense', emoji: '🔧',
      description: 'Interdiction de toute cession ou ouverture du capital des groupes de défense.',
      impacts: { popularite_joueur: +5, deficit_milliards: +4, stabilite: +6 },
      partis_favorables: ['DLF', 'LR', 'PATRIOTES', 'EPR'], partis_hostiles: [],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // LO — Lutte Ouvrière
  // ═══════════════════════════════════════════════════════
  LO: [
    {
      id: 'lo_indexation_salaires', parti: 'LO',
      titre: 'Indexation automatique des salaires sur l\'inflation', emoji: '📈',
      description: 'Tous les salaires sont automatiquement revalorisés selon l\'indice des prix à la consommation.',
      impacts: { popularite_joueur: +10, inflation_pct: +0.8, pib_croissance_pct: -0.3, indice_confiance_marches: -10 },
      partis_favorables: ['LO', 'TRAVAILLEURS', 'LFI'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'lo_controle_ouvrier', parti: 'LO',
      titre: 'Droit de veto ouvrier sur les licenciements', emoji: '✊',
      description: 'Les comités d\'entreprise peuvent bloquer tout plan social par vote à la majorité.',
      impacts: { popularite_joueur: +8, pib_croissance_pct: -0.4, indice_confiance_marches: -15, tension_sociale: -12 },
      partis_favorables: ['LO', 'TRAVAILLEURS', 'PCF'], partis_hostiles: ['LR', 'EPR', 'RN'],
      conditions: { popularite_min: 30 },
    },
    {
      id: 'lo_confiscation_dividendes', parti: 'LO',
      titre: 'Taxation à 95% des dividendes', emoji: '💸',
      description: 'Les dividendes distribués au-delà de 50 000€/an sont taxés à 95%.',
      impacts: { popularite_joueur: +9, deficit_milliards: -10, indice_confiance_marches: -20, pib_croissance_pct: -0.5 },
      partis_favorables: ['LO', 'TRAVAILLEURS', 'PCF', 'LFI'], partis_hostiles: ['LR', 'EPR'],
      conditions: { popularite_min: 28 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // RESISTONS
  // ═══════════════════════════════════════════════════════
  RESISTONS: [
    {
      id: 'res_anti_corruption', parti: 'RESISTONS',
      titre: 'Loi anti-corruption renforcée', emoji: '🔍',
      description: 'Création d\'un parquet national anti-corruption indépendant avec pouvoirs d\'enquête élargis.',
      impacts: { popularite_joueur: +8, stabilite: +5, dissimulation: -15, pression_mediatique: -10 },
      partis_favorables: ['RESISTONS', 'PS_ECO', 'LFI'], partis_hostiles: [],
      conditions: {},
    },
    {
      id: 'res_transparence_lobbies', parti: 'RESISTONS',
      titre: 'Registre public des lobbies et conflits d\'intérêts', emoji: '📋',
      description: 'Publication obligatoire de toutes les rencontres entre élus et représentants d\'intérêts privés.',
      impacts: { popularite_joueur: +6, stabilite: +4, dissimulation: -10 },
      partis_favorables: ['RESISTONS', 'PS_ECO', 'LFI', 'ANIMALISTE'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'res_proportionnelle', parti: 'RESISTONS',
      titre: 'Réforme proportionnelle pour les législatives', emoji: '⚖️',
      description: 'Introduction de la proportionnelle intégrale pour l\'Assemblée nationale.',
      impacts: { popularite_joueur: +7, stabilite: -8, tension_sociale: -5 },
      partis_favorables: ['RESISTONS', 'LFI', 'RN', 'PATRIOTES', 'UPR'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 35 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // NOUVELLE_ENERGIE
  // ═══════════════════════════════════════════════════════
  NOUVELLE_ENERGIE: [
    {
      id: 'ne_hydrogene_vert', parti: 'NOUVELLE_ENERGIE',
      titre: 'Plan hydrogène vert — 10 GW en 2030', emoji: '⚗️',
      description: 'Programme d\'investissement massif dans la filière hydrogène vert avec 15 Md€.',
      impacts: { popularite_joueur: +5, deficit_milliards: +15, pib_croissance_pct: +0.3, relation_ue: +8 },
      partis_favorables: ['NOUVELLE_ENERGIE', 'PS_ECO', 'EPR'], partis_hostiles: ['RN'],
      conditions: { reserve_min: 12 },
    },
    {
      id: 'ne_stockage_batteries', parti: 'NOUVELLE_ENERGIE',
      titre: 'Gigafactory batteries — partenariat franco-européen', emoji: '🔋',
      description: 'Construction de 3 gigafactories de batteries en France avec fonds européens.',
      impacts: { popularite_joueur: +6, deficit_milliards: +10, pib_croissance_pct: +0.4, relation_ue: +10 },
      partis_favorables: ['NOUVELLE_ENERGIE', 'EPR', 'PS_ECO'], partis_hostiles: [],
      conditions: { relation_ue_min: 5 },
    },
    {
      id: 'ne_efficacite_energetique', parti: 'NOUVELLE_ENERGIE',
      titre: 'Obligation de rénovation thermique totale', emoji: '🏘️',
      description: 'Toutes les passoires thermiques (étiquettes F et G) doivent être rénovées avant 2028.',
      impacts: { popularite_joueur: +5, deficit_milliards: +20, pib_croissance_pct: +0.2, tension_sociale: +6 },
      partis_favorables: ['NOUVELLE_ENERGIE', 'PS_ECO', 'ANIMALISTE'], partis_hostiles: ['RN', 'LR'],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // EELV — Europe Écologie Les Verts
  // ═══════════════════════════════════════════════════════
  EELV: [
    {
      id: 'eelv_fin_pesticides', parti: 'EELV',
      titre: 'Sortie des pesticides de synthèse — Plan Écophyto', emoji: '🌱',
      description: 'Interdiction progressive des pesticides de synthèse avec compensation pour les agriculteurs.',
      impacts: { popularite_joueur: +6, deficit_milliards: +8, tension_sociale: +10, pib_croissance_pct: -0.1 },
      partis_favorables: ['EELV', 'ANIMALISTE', 'PS_ECO'], partis_hostiles: ['LR', 'RN'],
      conditions: {},
    },
    {
      id: 'eelv_interdit_vols_internes', parti: 'EELV',
      titre: 'Interdiction des vols intérieurs de moins de 4h', emoji: '✈️',
      description: 'Suppression des liaisons aériennes concurrencées par le train de moins de 4h de trajet.',
      impacts: { popularite_joueur: +3, pib_croissance_pct: -0.1, relation_ue: +8, tension_sociale: +5 },
      partis_favorables: ['EELV', 'PS_ECO', 'ANIMALISTE'], partis_hostiles: ['RN', 'LR', 'PATRIOTES'],
      conditions: {},
    },
    {
      id: 'eelv_revenu_ecologique', parti: 'EELV',
      titre: 'Revenu écologique universel', emoji: '🌿',
      description: 'Allocation de 600€/mois conditionnée à des pratiques durables (alimentation, transport).',
      impacts: { popularite_joueur: +7, deficit_milliards: +22, tension_sociale: -8, pib_croissance_pct: +0.1 },
      partis_favorables: ['EELV', 'PS_ECO', 'LFI', 'ANIMALISTE'], partis_hostiles: ['LR', 'RN', 'EPR'],
      conditions: { popularite_min: 30, reserve_min: 15 },
    },
    {
      id: 'eelv_droit_eau_constitutionnel', parti: 'EELV',
      titre: 'Droit à l\'eau propre dans la Constitution', emoji: '💧',
      description: 'Inscription constitutionnelle du droit à l\'eau potable et à l\'assainissement.',
      impacts: { popularite_joueur: +6, stabilite: +3, relation_ue: +5 },
      partis_favorables: ['EELV', 'PS_ECO', 'LFI', 'ANIMALISTE', 'EPR'], partis_hostiles: [],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // TRAVAILLEURS
  // ═══════════════════════════════════════════════════════
  TRAVAILLEURS: [
    {
      id: 'trav_35h_effectif', parti: 'TRAVAILLEURS',
      titre: 'Application stricte des 35 heures', emoji: '⏱️',
      description: 'Renforcement des contrôles de l\'Inspection du travail sur le respect des 35h.',
      impacts: { popularite_joueur: +7, pib_croissance_pct: -0.2, tension_sociale: -10, indice_confiance_marches: -5 },
      partis_favorables: ['TRAVAILLEURS', 'LFI', 'PCF'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
    {
      id: 'trav_abrogation_reforme_retraite', parti: 'TRAVAILLEURS',
      titre: 'Abrogation totale de la réforme des retraites 2023', emoji: '✊',
      description: 'Retour à la retraite à 62 ans avec annulation de toutes les dispositions de la réforme 2023.',
      impacts: { popularite_joueur: +11, deficit_milliards: +15, tension_sociale: -20, relation_ue: -8 },
      partis_favorables: ['TRAVAILLEURS', 'LFI', 'PCF', 'PS_ECO'], partis_hostiles: ['EPR', 'LR'],
      conditions: { popularite_min: 28 },
    },
    {
      id: 'trav_interdiction_licenciements_boursiers', parti: 'TRAVAILLEURS',
      titre: 'Interdiction des licenciements pour motif boursier', emoji: '📉',
      description: 'Toute entreprise bénéficiaire ne peut licencier pour raisons économiques.',
      impacts: { popularite_joueur: +8, pib_croissance_pct: -0.3, indice_confiance_marches: -12, tension_sociale: -8 },
      partis_favorables: ['TRAVAILLEURS', 'LFI', 'PCF'], partis_hostiles: ['LR', 'EPR', 'RN'],
      conditions: { popularite_min: 30 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // ANIMALISTE
  // ═══════════════════════════════════════════════════════
  ANIMALISTE: [
    {
      id: 'ani_fin_elevage_intensif', parti: 'ANIMALISTE',
      titre: 'Fin de l\'élevage intensif en cage à horizon 2030', emoji: '🐔',
      description: 'Interdiction progressive des systèmes d\'élevage en cage pour les poules pondeuses et porcs.',
      impacts: { popularite_joueur: +5, tension_sociale: +8, pib_croissance_pct: -0.1, deficit_milliards: +4 },
      partis_favorables: ['ANIMALISTE', 'EELV', 'PS_ECO'], partis_hostiles: ['LR', 'RN'],
      conditions: {},
    },
    {
      id: 'ani_veganisme_cantines', parti: 'ANIMALISTE',
      titre: 'Option végane obligatoire dans les cantines', emoji: '🥗',
      description: 'Toutes les cantines scolaires et d\'entreprise doivent proposer un menu végane quotidien.',
      impacts: { popularite_joueur: +3, tension_sociale: +5, deficit_milliards: +1 },
      partis_favorables: ['ANIMALISTE', 'EELV', 'LFI'], partis_hostiles: ['LR', 'RN', 'PATRIOTES'],
      conditions: {},
    },
    {
      id: 'ani_droits_animaux_constitutionnels', parti: 'ANIMALISTE',
      titre: 'Statut d\'être sensible dans la Constitution', emoji: '🐾',
      description: 'Inscription dans la Constitution de la protection des animaux comme êtres sensibles.',
      impacts: { popularite_joueur: +6, stabilite: +2, relation_ue: +3 },
      partis_favorables: ['ANIMALISTE', 'EELV', 'PS_ECO', 'LFI', 'EPR'], partis_hostiles: ['RN', 'LR'],
      conditions: {},
    },
    {
      id: 'ani_taxe_viande', parti: 'ANIMALISTE',
      titre: 'Taxe progressive sur la viande', emoji: '🥩',
      description: 'Application d\'une taxe environnementale progressive sur la consommation de viande.',
      impacts: { popularite_joueur: -2, deficit_milliards: -4, tension_sociale: +8, relation_ue: +4 },
      partis_favorables: ['ANIMALISTE', 'EELV'], partis_hostiles: ['LR', 'RN', 'PATRIOTES', 'LFI'],
      conditions: { popularite_min: 38 },
    },
  ],

  // ═══════════════════════════════════════════════════════
  // HUMANISTE — Parti Humaniste
  // ═══════════════════════════════════════════════════════
  HUMANISTE: [
    {
      id: 'hum_revenu_base', parti: 'HUMANISTE',
      titre: 'Revenu de base universel inconditionnel (700€)', emoji: '🤲',
      description: 'Versement mensuel de 700€ à tout citoyen adulte, sans condition ni contrepartie.',
      impacts: { popularite_joueur: +9, deficit_milliards: +40, tension_sociale: -15, pib_croissance_pct: +0.2 },
      partis_favorables: ['HUMANISTE', 'EELV', 'LFI', 'ANIMALISTE'], partis_hostiles: ['LR', 'EPR', 'RN'],
      conditions: { popularite_min: 30, reserve_min: 25 },
    },
    {
      id: 'hum_education_bienveillante', parti: 'HUMANISTE',
      titre: 'Réforme pédagogique — école bienveillante', emoji: '🎓',
      description: 'Suppression des notes avant la 6e, introduction de la pédagogie coopérative.',
      impacts: { popularite_joueur: +5, tension_sociale: -4, deficit_milliards: +3 },
      partis_favorables: ['HUMANISTE', 'PS_ECO', 'EELV'], partis_hostiles: ['LR', 'RN'],
      conditions: {},
    },
    {
      id: 'hum_votation_citoyenne', parti: 'HUMANISTE',
      titre: 'Votation citoyenne mensuelle par application', emoji: '📱',
      description: 'Plateforme numérique permettant aux citoyens de voter sur 3 sujets d\'actualité par mois.',
      impacts: { popularite_joueur: +7, stabilite: -4, tension_sociale: -6 },
      partis_favorables: ['HUMANISTE', 'EELV', 'LFI', 'RESISTONS'], partis_hostiles: ['LR', 'EPR'],
      conditions: {},
    },
  ],

  // ═══════════════════════════════════════════════════════
  // SOLUTION — La Solution
  // ═══════════════════════════════════════════════════════
  SOLUTION: [
    {
      id: 'sol_big_bang_fiscal', parti: 'SOLUTION',
      titre: 'Big Bang fiscal — Impôt unique à taux plat 25%', emoji: '💡',
      description: 'Suppression de tous les impôts sauf un taux unique de 25% sur tous les revenus.',
      impacts: { popularite_joueur: +6, deficit_milliards: +8, pib_croissance_pct: +0.5, indice_confiance_marches: +15 },
      partis_favorables: ['SOLUTION', 'LR'], partis_hostiles: ['LFI', 'PS_ECO', 'TRAVAILLEURS'],
      conditions: { popularite_min: 35 },
    },
    {
      id: 'sol_liberalisation_marches', parti: 'SOLUTION',
      titre: 'Libéralisation totale du marché du travail', emoji: '📈',
      description: 'Suppression du Code du travail, remplacé par des contrats librement négociés.',
      impacts: { popularite_joueur: -4, pib_croissance_pct: +0.6, tension_sociale: +20, indice_confiance_marches: +18 },
      partis_favorables: ['SOLUTION', 'LR'], partis_hostiles: ['LFI', 'TRAVAILLEURS', 'PS_ECO', 'PCF'],
      conditions: { popularite_min: 40 },
    },
    {
      id: 'sol_retraite_capitalisation', parti: 'SOLUTION',
      titre: 'Retraite par capitalisation obligatoire', emoji: '📊',
      description: 'Introduction d\'un pilier de retraite par capitalisation obligatoire pour les moins de 40 ans.',
      impacts: { popularite_joueur: +3, indice_confiance_marches: +12, tension_sociale: +12, deficit_milliards: -10 },
      partis_favorables: ['SOLUTION', 'LR', 'EPR'], partis_hostiles: ['LFI', 'TRAVAILLEURS', 'PS_ECO'],
      conditions: { popularite_min: 32 },
    },
  ],
}

// ═══════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════

/** Lois propres au parti joueur */
export function getLoisParti(partiId) {
  return LOIS_PAR_PARTI[partiId] ?? []
}

/** Statut d'une loi par rapport au parti joueur */
export function getStatutLoi(loi, partiJoueur, partisRepresentes = []) {
  if (loi.parti === partiJoueur) return 'propre'
  if (partisRepresentes.includes(loi.parti)) return 'allie_possible'
  return 'autre'
}

/** Toutes les lois de partis représentés à l'AN */
export function getLoisPartisRepresentes(partisRepresentes = []) {
  return partisRepresentes.flatMap(p => LOIS_PAR_PARTI[p] ?? [])
}

/** Toutes les lois de tous les partis */
export function getToutesLoisPartis() {
  return Object.values(LOIS_PAR_PARTI).flat()
}
