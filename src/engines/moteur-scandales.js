/**
 * France 2026 — Moteur Scandales
 * Gère les affaires, fuites, caisses noires,
 * actions secrètes et leurs conséquences politiques.
 *
 * Mécaniques simulées :
 * - Jauge de Dissimulation (accumulation de secrets)
 * - Jauge de Pression Médiatique (risque de fuite)
 * - Actions secrètes du joueur (avec risques)
 * - Événements scandales déclenchables
 * - Gestion de crise (transparence vs étouffement)
 * - Conséquences constitutionnelles (Art. 68)
 */

// ─────────────────────────────────────────────────────────────
// ÉTAT SCANDALES INITIAL
// ─────────────────────────────────────────────────────────────

export const ETAT_SCANDALES_INITIAL = {
  // Jauges principales
  dissimulation: 20,          // 0-100 : accumulation de secrets d'État
  pression_mediatique: 15,    // 0-100 : risque de fuite imminente
  consentement_impot: 75,     // 0-100 : légitimité fiscale aux yeux des citoyens
  stabilite_institutionnelle: 80, // 0-100 : solidité des institutions

  // Scandales actifs
  scandales_actifs: [],

  // Actions secrètes en cours
  actions_secretes_actives: [],

  // Caisses noires
  caisses_noires: {
    fonds_speciaux_matignon: 0.8,    // Md€
    hors_bilan_garanties: 45,         // Md€ (dette cachée)
    sem_caisse_depots: 12,            // Md€ investis en shadow budget
    passifs_sociaux: 380,             // Md€ (non provisionnés)
  },

  // Historique des fuites
  fuites_passees: [],

  // Nouveau Président de l'Assemblée
  nouveau_president_assemblee: false,
  president_assemblee_parti: "EPR",

  // Procédures en cours
  commissions_enquete_actives: 0,
  mises_en_examen: 0,
  procedure_art68_active: false,
}

// ─────────────────────────────────────────────────────────────
// CATALOGUE DES SCANDALES
// ─────────────────────────────────────────────────────────────

export const CATALOGUE_SCANDALES = [

  {
    id: "scandale_etat_profond",
    titre: "L'Affaire de l'État Profond",
    emoji: "🕵️",
    gravite: 9,
    description: "Fuite massive révélant des liens entre hauts fonctionnaires de Bercy et des réseaux d'influence opaques financés par l'argent du contribuable.",
    conditions_declenchement: {
      dissimulation_min: 45,
      nouveau_president_assemblee: true,
      pression_mediatique_min: 55,
    },
    probabilite_base: 0.25,
    impacts_immediats: {
      popularite_joueur: -22,
      stabilite: -18,
      tension_sociale: +20,
      consentement_impot: -25,
      pression_mediatique: +30,
      stabilite_institutionnelle: -20,
    },
    impacts_par_tour: {
      popularite_joueur: -3,
      consentement_impot: -2,
    },
    duree_max_tours: 8,
    evenements_secondaires: [
      "COMMISSION_ENQUETE_PARLEMENTAIRE",
      "MOTION_CENSURE",
      "FUITE_PRESSE_ETRANGERE",
    ],
    actions_gestion: [
      "transparence_totale",
      "secret_defense",
      "sacrifice_ministre",
      "contre_feu_geopolitique",
      "isoler_temoins",
    ],
    peut_declencher: ["affaire_epstein_fr", "procedure_art68"],
  },

  {
    id: "affaire_epstein_fr",
    titre: "Ramifications Françaises — Affaire Epstein",
    emoji: "📁",
    gravite: 10,
    description: "Documents prouvant que des fonds publics (TICPE, CSG) ont financé des voyages compromettants liés au réseau Epstein. Des personnalités politiques françaises sont citées.",
    conditions_declenchement: {
      scandale_etat_profond_actif: true,
      pression_mediatique_min: 70,
      commissions_enquete_min: 1,
    },
    probabilite_base: 0.35,
    impacts_immediats: {
      popularite_joueur: -35,
      stabilite: -30,
      tension_sociale: +35,
      consentement_impot: -35,
      stabilite_institutionnelle: -30,
      pression_mediatique: +40,
    },
    impacts_par_tour: {
      popularite_joueur: -5,
      stabilite: -3,
      consentement_impot: -3,
    },
    duree_max_tours: 12,
    evenements_secondaires: [
      "PROCEDURE_ART68",
      "CRISE_CONSTITUTIONNELLE",
      "FUITE_CAPITAUX",
      "MANIFESTATIONS_MASSIVES",
    ],
    actions_gestion: [
      "lancer_poursuites_soi_meme",
      "nier_en_bloc",
      "isoler_temoins",
      "demission_volontaire",
    ],
    peut_declencher: ["procedure_art68", "cohabitation"],
  },

  {
    id: "scandale_energie_grise",
    titre: "Scandale Énergie Grise",
    emoji: "⚡",
    gravite: 6,
    description: "On découvre que les subventions pour le BioGPL ont été captées par un grand groupe pétrolier proche du pouvoir via une SEM de la Caisse des Dépôts.",
    conditions_declenchement: {
      loi_biogpl_votee: true,
      dissimulation_min: 35,
    },
    probabilite_base: 0.20,
    impacts_immediats: {
      popularite_joueur: -15,
      stabilite: -10,
      tension_sociale: +12,
      consentement_impot: -15,
      pression_mediatique: +20,
    },
    impacts_par_tour: {
      popularite_joueur: -2,
    },
    duree_max_tours: 5,
    evenements_secondaires: ["COMMISSION_ENQUETE_PARLEMENTAIRE"],
    actions_gestion: [
      "transparence_totale",
      "sacrifice_ministre",
      "contre_feu_geopolitique",
    ],
  },

  {
    id: "leak_defense",
    titre: "Leak — Financement Milice Africaine",
    emoji: "🪖",
    gravite: 7,
    description: "Des documents prouvent que la France a utilisé ses fonds spéciaux pour financer une milice privée afin de sécuriser des mines d'uranium au Sahel.",
    conditions_declenchement: {
      operation_exterieure_active: true,
      cyber_protection_max: 45,
      dissimulation_min: 40,
    },
    probabilite_base: 0.18,
    impacts_immediats: {
      popularite_joueur: -18,
      stabilite: -12,
      relation_ue: -10,
      tension_afrique_sahel: +15,
      pression_mediatique: +25,
    },
    impacts_par_tour: {
      popularite_joueur: -2,
      relation_ue: -1,
    },
    duree_max_tours: 6,
    evenements_secondaires: ["INTERPELLATION_ONU", "MANIFESTATION_DROITS_HOMME"],
    actions_gestion: [
      "secret_defense",
      "sacrifice_ministre",
      "transparence_totale",
    ],
  },

  {
    id: "dossier_retraites_secret",
    titre: "Le Dossier Secret des Retraites",
    emoji: "👴",
    gravite: 7,
    description: "Une fuite révèle qu'une réforme drastique des retraites est préparée en secret pour l'après-présidentielle 2027. Le document interne circule sur les réseaux.",
    conditions_declenchement: {
      dissimulation_min: 38,
      pression_mediatique_min: 45,
    },
    probabilite_base: 0.22,
    impacts_immediats: {
      popularite_joueur: -20,
      tension_sociale: +22,
      pression_mediatique: +18,
      consentement_impot: -12,
    },
    impacts_par_tour: {
      tension_sociale: +3,
      popularite_joueur: -2,
    },
    duree_max_tours: 6,
    evenements_secondaires: ["GREVE_GENERALE", "MANIFESTATION_SYNDICALE"],
    actions_gestion: [
      "nier_en_bloc",
      "transparence_totale",
      "contre_feu_geopolitique",
    ],
  },

  {
    id: "caisse_noire_matignon",
    titre: "Les Fonds Spéciaux de Matignon",
    emoji: "💰",
    gravite: 5,
    description: "Un journaliste révèle l'utilisation des fonds secrets de Matignon pour influencer un syndicat avant les municipales de mars 2026.",
    conditions_declenchement: {
      dissimulation_min: 30,
      action_secrete_influence_syndicat: true,
    },
    probabilite_base: 0.30,
    impacts_immediats: {
      popularite_joueur: -12,
      stabilite: -8,
      tension_sociale: +10,
      pression_mediatique: +15,
    },
    impacts_par_tour: {
      popularite_joueur: -1,
    },
    duree_max_tours: 4,
    evenements_secondaires: [],
    actions_gestion: [
      "sacrifice_ministre",
      "nier_en_bloc",
      "transparence_totale",
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// ACTIONS SECRÈTES DU JOUEUR
// ─────────────────────────────────────────────────────────────

export const ACTIONS_SECRETES = [
  {
    id: "financer_syndicat",
    label: "Influencer un syndicat (Fonds spéciaux)",
    emoji: "🤝",
    description: "Utilise les fonds de Matignon pour calmer un syndicat avant une grève ou des élections.",
    cout_budget: 0.3,
    cout_dissimulation: +12,
    effets: {
      tension_sociale: -15,
      popularite_joueur: +3,
    },
    risque_decouverte: 0.25,
    scandale_si_decouvert: "caisse_noire_matignon",
  },
  {
    id: "black_out_mediatique",
    label: "Black-out médiatique (voie juridique)",
    emoji: "🔇",
    description: "Procédure baillons (SLAPP) pour bloquer la publication de certains noms.",
    cout_budget: 0.5,
    cout_dissimulation: +15,
    effets: {
      pression_mediatique: -20,
      stabilite_institutionnelle: -5,
    },
    risque_decouverte: 0.30,
    scandale_si_decouvert: "scandale_etat_profond",
    reaction_partis: {
      LFI: "EXPLOITATION_MEDIATIQUE",
      PS_ECO: "OPPOSITION",
      PATRIOTES: "EXPLOITATION_MEDIATIQUE",
    },
  },
  {
    id: "isoler_temoin",
    label: "Isoler un lanceur d'alerte",
    emoji: "🔒",
    description: "Les services de renseignement discréditent ou mettent en examen un témoin gênant.",
    cout_budget: 0.2,
    cout_dissimulation: +20,
    effets: {
      pression_mediatique: -15,
      dissimulation: +8,
    },
    risque_decouverte: 0.40,
    scandale_si_decouvert: "scandale_etat_profond",
    reaction_partis: {
      LFI: "MOTION_CENSURE",
      RN: "EXPLOITATION_MEDIATIQUE",
    },
  },
  {
    id: "shadow_budget_epr2",
    label: "Shadow Budget EPR2 (via Caisse des Dépôts)",
    emoji: "🏦",
    description: "Finance les EPR2 via une filiale de la Caisse des Dépôts pour contourner les règles de Bruxelles.",
    cout_budget: 0,
    cout_dissimulation: +18,
    effets: {
      avancement_epr2_pct: +5,
      relation_ue: -8,
      deficit_milliards: 0,
    },
    risque_decouverte: 0.20,
    scandale_si_decouvert: "scandale_energie_grise",
    reaction_partis: {
      BRUXELLES: "PROCEDURE_INFRACTION",
    },
  },
  {
    id: "operation_influence_presse",
    label: "Opération d'influence médiatique",
    emoji: "📺",
    description: "Placement discret de narratifs favorables dans des médias proches du pouvoir.",
    cout_budget: 0.4,
    cout_dissimulation: +10,
    effets: {
      popularite_joueur: +5,
      pression_mediatique: -10,
    },
    risque_decouverte: 0.20,
    scandale_si_decouvert: "caisse_noire_matignon",
  },
  {
    id: "garantie_etat_hors_bilan",
    label: "Garantie d'État hors bilan",
    emoji: "📋",
    description: "L'État garantit un prêt massif sans l'inscrire au déficit. Contourne les 5% de Bruxelles.",
    cout_budget: 0,
    cout_dissimulation: +22,
    effets: {
      reserve_budgetaire_milliards: +15,
      relation_ue: -5,
    },
    risque_decouverte: 0.15,
    scandale_si_decouvert: "scandale_etat_profond",
    reaction_partis: {
      BERCY: "AVERTISSEMENT_BUDGETAIRE",
      BRUXELLES: "SURVEILLANCE",
    },
  },
]

// ─────────────────────────────────────────────────────────────
// STRATÉGIES DE GESTION DE CRISE
// ─────────────────────────────────────────────────────────────

export const STRATEGIES_GESTION_CRISE = {

  transparence_totale: {
    id: "transparence_totale",
    label: "Transparence Totale",
    emoji: "🔍",
    description: "Publier tous les documents. Regagner la confiance morale mais sacrifier des alliés.",
    effets_immediats: {
      popularite_joueur: -8,
      stabilite_institutionnelle: +15,
      consentement_impot: +10,
      pression_mediatique: -30,
      dissimulation: -25,
    },
    effets_long_terme: {
      popularite_joueur: +12,
      stabilite: +10,
    },
    risque: "Démission immédiate de 1-2 ministres clés.",
    condition: () => true,
  },

  secret_defense: {
    id: "secret_defense",
    label: "Invoquer le Secret Défense",
    emoji: "🔒",
    description: "Classiquer les documents compromettants au nom de la sûreté de l'État.",
    effets_immediats: {
      pression_mediatique: -20,
      dissimulation: +10,
      stabilite_institutionnelle: -8,
      popularite_joueur: -5,
    },
    effets_long_terme: {
      pression_mediatique: +15,
    },
    risque: "Si découvert, l'effet est x2 sur la jauge Dissimulation.",
    condition: (etat) => etat.stabilite_institutionnelle > 40,
  },

  sacrifice_ministre: {
    id: "sacrifice_ministre",
    label: "Sacrifier un Ministre",
    emoji: "🗡️",
    description: "Limoger publiquement le ministre impliqué. Calme la presse pendant 3 tours.",
    effets_immediats: {
      popularite_joueur: -4,
      pression_mediatique: -18,
      stabilite: +5,
      dissimulation: -10,
    },
    effets_long_terme: {
      stabilite: -5,
    },
    risque: "Fragilise votre bloc politique. Les alliés commencent à vous trahir.",
    condition: () => true,
    duree_effet_tours: 3,
  },

  contre_feu_geopolitique: {
    id: "contre_feu_geopolitique",
    label: "Contre-feu Géopolitique",
    emoji: "🎯",
    description: "Annoncer une opération militaire ou une initiative diplomatique pour détourner l'attention.",
    effets_immediats: {
      pression_mediatique: -22,
      popularite_joueur: +3,
      deficit_milliards: +2,
      tension_sociale: -5,
    },
    effets_long_terme: {
      pression_mediatique: +10,
    },
    risque: "Effet temporaire. La presse revient sur le scandale après 2 tours.",
    condition: (etat) => etat.pression_mediatique > 40,
    duree_effet_tours: 2,
  },

  isoler_temoins: {
    id: "isoler_temoins",
    label: "Isoler les Témoins",
    emoji: "👁️",
    description: "Les services discréditent personnellement les lanceurs d'alerte.",
    effets_immediats: {
      pression_mediatique: -15,
      dissimulation: +15,
      stabilite_institutionnelle: -10,
    },
    effets_long_terme: {
      popularite_joueur: -8,
      consentement_impot: -5,
    },
    risque: "Si l'opération échoue, la chute de popularité est doublée. Active la jauge Tyrannie.",
    condition: (etat) => etat.dissimulation < 80,
    probabilite_succes: 0.60,
  },

  lancer_poursuites_soi_meme: {
    id: "lancer_poursuites_soi_meme",
    label: "Lancer les Poursuites soi-même",
    emoji: "⚖️",
    description: "Le Président lui-même saisit la Justice contre les personnes impliquées.",
    effets_immediats: {
      popularite_joueur: +5,
      stabilite_institutionnelle: +10,
      dissimulation: -30,
      pression_mediatique: -20,
    },
    effets_long_terme: {
      popularite_joueur: +8,
      stabilite: -10,
    },
    risque: "Détruit l'administration. Risque de chaos institutionnel avant 2027.",
    condition: (etat) => etat.stabilite_institutionnelle > 30,
  },

  nier_en_bloc: {
    id: "nier_en_bloc",
    label: "Nier en Bloc",
    emoji: "🙅",
    description: "Déni total et frontal. Court terme efficace, mais explosif si les preuves s'accumulent.",
    effets_immediats: {
      pression_mediatique: -10,
      dissimulation: +20,
    },
    effets_long_terme: {
      popularite_joueur: -20,
      pression_mediatique: +25,
      consentement_impot: -10,
    },
    risque: "Si un second document fuite après le déni, la popularité s'effondre de -30 en un tour.",
    condition: () => true,
    multiplicateur_si_echec: 2.0,
  },

  demission_volontaire: {
    id: "demission_volontaire",
    label: "Démission Volontaire",
    emoji: "🚪",
    description: "Le Président démissionne. Game Over honorable. Nouvelles élections anticipées.",
    effets_immediats: {
      popularite_joueur: +10,
      stabilite: -40,
      stabilite_institutionnelle: -20,
    },
    risque: "Fin de partie. Déclenche une présidentielle anticipée.",
    condition: (etat) => etat.popularite_joueur < 20,
    game_over: true,
    game_over_message: "Vous avez choisi de remettre votre mandat au peuple français. Une présidentielle anticipée est convoquée.",
  },
}

// ─────────────────────────────────────────────────────────────
// MOTEUR PRINCIPAL
// ─────────────────────────────────────────────────────────────

/**
 * Calcule les scandales qui se déclenchent ce tour.
 */
export function calculerDeclenchementScandales(etatScandales, etatJeu) {
  const nouveaux_scandales = []

  for (const scandale of CATALOGUE_SCANDALES) {
    // Déjà actif ?
    if (etatScandales.scandales_actifs.find(s => s.id === scandale.id)) continue

    // Vérifier conditions
    const c = scandale.conditions_declenchement
    let conditions_remplies = true

    if (c.dissimulation_min && etatScandales.dissimulation < c.dissimulation_min)
      conditions_remplies = false
    if (c.pression_mediatique_min && etatScandales.pression_mediatique < c.pression_mediatique_min)
      conditions_remplies = false
    if (c.nouveau_president_assemblee && !etatScandales.nouveau_president_assemblee)
      conditions_remplies = false
    if (c.scandale_etat_profond_actif && !etatScandales.scandales_actifs.find(s => s.id === "scandale_etat_profond"))
      conditions_remplies = false
    if (c.commissions_enquete_min && etatScandales.commissions_enquete_actives < c.commissions_enquete_min)
      conditions_remplies = false
    if (c.loi_biogpl_votee && !etatJeu.lois_votees?.includes("relance_gpl"))
      conditions_remplies = false
    if (c.cyber_protection_max && etatJeu.cyber_protection > c.cyber_protection_max)
      conditions_remplies = false
    if (c.action_secrete_influence_syndicat && !etatScandales.actions_secretes_actives.find(a => a.id === "financer_syndicat"))
      conditions_remplies = false

    if (!conditions_remplies) continue

    // Probabilité de déclenchement
    const proba = scandale.probabilite_base *
      (1 + (etatScandales.dissimulation - 30) / 100) *
      (1 + (etatScandales.pression_mediatique - 20) / 100)

    if (Math.random() > proba) continue

    nouveaux_scandales.push({
      ...scandale,
      tour_declenchement: etatJeu.tour_actuel ?? 0,
      tours_restants: scandale.duree_max_tours,
      strategie_gestion: null,
    })
  }

  return nouveaux_scandales
}

/**
 * Exécute une action secrète du joueur.
 */
export function executerActionSecrete(actionId, etatScandales, etatJeu) {
  const action = ACTIONS_SECRETES.find(a => a.id === actionId)
  if (!action) throw new Error(`Action secrète "${actionId}" introuvable.`)

  const nouvelEtat = { ...etatScandales }
  const nouvelEtatJeu = { ...etatJeu }

  // Coût budgétaire
  nouvelEtatJeu.reserve_budgetaire_milliards -= action.cout_budget

  // Accumulation de dissimulation
  nouvelEtat.dissimulation = Math.min(100,
    nouvelEtat.dissimulation + action.cout_dissimulation
  )

  // Effets de l'action
  for (const [indicateur, valeur] of Object.entries(action.effets)) {
    if (indicateur in nouvelEtatJeu) nouvelEtatJeu[indicateur] += valeur
    if (indicateur in nouvelEtat) nouvelEtat[indicateur] += valeur
  }

  // Risque de découverte immédiate
  let decouvert = false
  let scandale_declenche = null

  if (Math.random() < action.risque_decouverte) {
    decouvert = true
    if (action.scandale_si_decouvert) {
      const scandale = CATALOGUE_SCANDALES.find(s => s.id === action.scandale_si_decouvert)
      if (scandale) {
        scandale_declenche = {
          ...scandale,
          tours_restants: scandale.duree_max_tours,
          strategie_gestion: null,
          declenche_par_action: actionId,
        }
        nouvelEtat.scandales_actifs.push(scandale_declenche)

        // Appliquer impacts immédiats du scandale
        for (const [ind, val] of Object.entries(scandale.impacts_immediats)) {
          if (ind in nouvelEtatJeu) nouvelEtatJeu[ind] += val
          if (ind in nouvelEtat) nouvelEtat[ind] += val
        }
      }
    }
  } else {
    // Action réussie — enregistrer
    nouvelEtat.actions_secretes_actives.push({
      id: actionId,
      tour: etatJeu.tour_actuel ?? 0,
    })
  }

  return {
    nouvelEtat,
    nouvelEtatJeu,
    decouvert,
    scandale_declenche,
    message: decouvert
      ? `⚠️ L'action "${action.label}" a été découverte ! Scandale déclenché.`
      : `✅ "${action.label}" exécutée discrètement.`,
  }
}

/**
 * Applique une stratégie de gestion de crise.
 */
export function appliquerStrategieGestion(strategieId, scandaleId, etatScandales, etatJeu) {
  const strategie = STRATEGIES_GESTION_CRISE[strategieId]
  if (!strategie) throw new Error(`Stratégie "${strategieId}" introuvable.`)
  if (!strategie.condition(etatScandales)) throw new Error(`Conditions non remplies.`)

  const nouvelEtat = { ...etatScandales }
  const nouvelEtatJeu = { ...etatJeu }

  // Appliquer effets immédiats
  for (const [ind, val] of Object.entries(strategie.effets_immediats)) {
    if (ind in nouvelEtatJeu) nouvelEtatJeu[ind] = Math.max(0, Math.min(100, nouvelEtatJeu[ind] + val))
    if (ind in nouvelEtat) nouvelEtat[ind] = Math.max(0, Math.min(100, nouvelEtat[ind] + val))
  }

  // Gestion de l'échec pour "isoler_temoins"
  let echec = false
  if (strategieId === "isoler_temoins") {
    if (Math.random() > strategie.probabilite_succes) {
      echec = true
      nouvelEtatJeu.popularite_joueur -= 16
      nouvelEtat.pression_mediatique += 20
      nouvelEtat.dissimulation += 10
    }
  }

  // Game over si démission
  if (strategie.game_over) {
    return {
      nouvelEtat,
      nouvelEtatJeu,
      game_over: true,
      game_over_message: strategie.game_over_message,
    }
  }

  // Marquer le scandale comme géré
  const idx = nouvelEtat.scandales_actifs.findIndex(s => s.id === scandaleId)
  if (idx !== -1) {
    nouvelEtat.scandales_actifs[idx].strategie_gestion = strategieId
    nouvelEtat.scandales_actifs[idx].tours_restants = Math.min(
      nouvelEtat.scandales_actifs[idx].tours_restants,
      strategie.duree_effet_tours ?? 99
    )
  }

  return {
    nouvelEtat,
    nouvelEtatJeu,
    echec,
    game_over: false,
    message: echec
      ? `❌ L'opération a échoué. La pression médiatique explose.`
      : `✅ Stratégie "${strategie.label}" appliquée. ${strategie.risque}`,
  }
}

/**
 * Avance d'un tour tous les scandales actifs.
 * Applique les impacts par tour et résout les scandales expirés.
 */
export function tourMoteurScandales(etatScandales, etatJeu) {
  const nouvelEtat = { ...etatScandales }
  const nouvelEtatJeu = { ...etatJeu }
  const scandales_resolus = []

  // Évolution naturelle des jauges
  nouvelEtat.pression_mediatique = Math.max(0,
    nouvelEtat.pression_mediatique - 2  // Décroissance naturelle
  )
  nouvelEtat.dissimulation = Math.max(0,
    nouvelEtat.dissimulation - 1
  )

  // Détecter nouveaux scandales
  const nouveaux = calculerDeclenchementScandales(nouvelEtat, nouvelEtatJeu)
  for (const s of nouveaux) {
    nouvelEtat.scandales_actifs.push(s)
    for (const [ind, val] of Object.entries(s.impacts_immediats)) {
      if (ind in nouvelEtatJeu) nouvelEtatJeu[ind] += val
      if (ind in nouvelEtat) nouvelEtat[ind] += val
    }
  }

  // Appliquer impacts par tour des scandales actifs
  nouvelEtat.scandales_actifs = nouvelEtat.scandales_actifs
    .map(scandale => {
      if (!scandale.impacts_par_tour) return scandale

      for (const [ind, val] of Object.entries(scandale.impacts_par_tour)) {
        if (ind in nouvelEtatJeu) nouvelEtatJeu[ind] += val
      }

      return { ...scandale, tours_restants: scandale.tours_restants - 1 }
    })
    .filter(scandale => {
      if (scandale.tours_restants <= 0) {
        scandales_resolus.push(scandale)
        return false
      }
      return true
    })

  // Vérifier déclenchement nouveau Président de l'Assemblée
  if (!nouvelEtat.nouveau_president_assemblee &&
      nouvelEtatJeu.stabilite < 35 &&
      nouvelEtatJeu.popularite_joueur < 30) {
    nouvelEtat.nouveau_president_assemblee = true
    nouvelEtat.president_assemblee_parti = "OPPOSITION"
    nouvelEtat.commissions_enquete_actives += 1
    nouvelEtatJeu.stabilite -= 12
    nouvelEtatJeu.popularite_joueur -= 8
    nouveaux.push({
      id: "nouveau_president_assemblee",
      titre: "🔨 Nouveau Président de l'Assemblée (Opposition)",
      impacts_immediats: {},
    })
  }

  return {
    nouvelEtat,
    nouvelEtatJeu,
    nouveaux_scandales: nouveaux,
    scandales_resolus,
    resume: genererResumeScandales(nouvelEtat, nouveaux, scandales_resolus),
  }
}

// ─────────────────────────────────────────────────────────────
// RÉSUMÉ
// ─────────────────────────────────────────────────────────────

function genererResumeScandales(etat, nouveaux, resolus) {
  const lignes = []

  if (nouveaux.length > 0) {
    lignes.push(`🚨 ${nouveaux.length} nouveau(x) scandale(s) déclenché(s) !`)
    nouveaux.forEach(s => lignes.push(`  ${s.emoji ?? "📁"} ${s.titre}`))
  }

  if (etat.scandales_actifs.length > 0) {
    lignes.push(`⚠️ ${etat.scandales_actifs.length} scandale(s) actif(s)`)
  }

  if (resolus.length > 0) {
    lignes.push(`✅ ${resolus.length} scandale(s) résolu(s) ce tour`)
  }

  lignes.push(`🕵️ Dissimulation : ${etat.dissimulation}/100`)
  lignes.push(`📰 Pression médiatique : ${etat.pression_mediatique}/100`)
  lignes.push(`💸 Consentement à l'impôt : ${etat.consentement_impot}/100`)

  return lignes.join('\n')
}
