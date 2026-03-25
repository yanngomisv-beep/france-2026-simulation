/**
 * France 2026 — Moteur Scandales
 * Gère les affaires, fuites, caisses noires,
 * actions secrètes et leurs conséquences politiques.
 */

// ═══════════════════════════════════════════════════════════
// ÉTAT SCANDALES INITIAL
// ═══════════════════════════════════════════════════════════

export const ETAT_SCANDALES_INITIAL = {
  dissimulation:               20,
  pression_mediatique:         15,
  consentement_impot:          75,
  stabilite_institutionnelle:  80,
  scandales_actifs:            [],
  actions_secretes_actives:    [],
  caisses_noires: {
    fonds_speciaux_matignon: 0.8,
    hors_bilan_garanties:    45,
    sem_caisse_depots:       12,
    passifs_sociaux:        380,
  },
  fuites_passees:              [],
  nouveau_president_assemblee: false,
  president_assemblee_parti:   'EPR',
  commissions_enquete_actives:  0,
  mises_en_examen:              0,
  procedure_art68_active:      false,
}

// ═══════════════════════════════════════════════════════════
// CATALOGUE DES SCANDALES
// ═══════════════════════════════════════════════════════════

export const CATALOGUE_SCANDALES = [
  {
    id: 'scandale_etat_profond',
    titre: "L'Affaire de l'État Profond",
    emoji: '🕵️',
    gravite: 9,
    description: "Fuite massive révélant des liens entre hauts fonctionnaires de Bercy et des réseaux d'influence opaques financés par l'argent du contribuable.",
    conditions_declenchement: {
      dissimulation_min: 45,
      nouveau_president_assemblee: true,
      pression_mediatique_min: 55,
    },
    probabilite_base: 0.25,
    impacts_immediats: {
      popularite_joueur:          -22,
      stabilite:                  -18,
      tension_sociale:            +20,
      consentement_impot:         -25,
      pression_mediatique:        +30,
      stabilite_institutionnelle: -20,
    },
    impacts_par_tour: {
      popularite_joueur: -3,
      consentement_impot: -2,
    },
    duree_max_tours: 8,
    evenements_secondaires: ['COMMISSION_ENQUETE_PARLEMENTAIRE', 'MOTION_CENSURE', 'FUITE_PRESSE_ETRANGERE'],
    actions_gestion: ['transparence_totale', 'secret_defense', 'sacrifice_ministre', 'contre_feu_geopolitique', 'isoler_temoins'],
    peut_declencher: ['affaire_epstein_fr', 'procedure_art68'],
  },

  {
    id: 'affaire_epstein_fr',
    titre: 'Ramifications Françaises — Affaire Epstein',
    emoji: '📁',
    gravite: 10,
    description: "Documents prouvant que des fonds publics ont financé des voyages compromettants liés au réseau Epstein.",
    conditions_declenchement: {
      scandale_etat_profond_actif: true,
      pression_mediatique_min: 70,
      commissions_enquete_min: 1,
    },
    probabilite_base: 0.35,
    impacts_immediats: {
      popularite_joueur:          -35,
      stabilite:                  -30,
      tension_sociale:            +35,
      consentement_impot:         -35,
      stabilite_institutionnelle: -30,
      pression_mediatique:        +40,
    },
    impacts_par_tour: {
      popularite_joueur:  -5,
      stabilite:          -3,
      consentement_impot: -3,
    },
    duree_max_tours: 12,
    evenements_secondaires: ['PROCEDURE_ART68', 'CRISE_CONSTITUTIONNELLE', 'FUITE_CAPITAUX', 'MANIFESTATIONS_MASSIVES'],
    actions_gestion: ['lancer_poursuites_soi_meme', 'nier_en_bloc', 'isoler_temoins', 'demission_volontaire'],
    peut_declencher: ['procedure_art68', 'cohabitation'],
  },

  {
    id: 'scandale_energie_grise',
    titre: 'Scandale Énergie Grise',
    emoji: '⚡',
    gravite: 6,
    description: "On découvre que les subventions BioGPL ont été captées par un grand groupe pétrolier proche du pouvoir.",
    conditions_declenchement: {
      loi_biogpl_votee: true,
      dissimulation_min: 35,
    },
    probabilite_base: 0.20,
    impacts_immediats: {
      popularite_joueur:  -15,
      stabilite:          -10,
      tension_sociale:    +12,
      consentement_impot: -15,
      pression_mediatique: +20,
    },
    impacts_par_tour: { popularite_joueur: -2 },
    duree_max_tours: 5,
    evenements_secondaires: ['COMMISSION_ENQUETE_PARLEMENTAIRE'],
    actions_gestion: ['transparence_totale', 'sacrifice_ministre', 'contre_feu_geopolitique'],
  },

  {
    id: 'leak_defense',
    titre: 'Leak — Financement Milice Africaine',
    emoji: '🪖',
    gravite: 7,
    description: "Des documents prouvent que la France a utilisé ses fonds spéciaux pour financer une milice privée au Sahel.",
    conditions_declenchement: {
      operation_exterieure_active: true,
      cyber_protection_max: 45,
      dissimulation_min: 40,
    },
    probabilite_base: 0.18,
    impacts_immediats: {
      popularite_joueur:  -18,
      stabilite:          -12,
      relation_ue:        -10,
      pression_mediatique: +25,
    },
    impacts_par_tour: { popularite_joueur: -2, relation_ue: -1 },
    duree_max_tours: 6,
    evenements_secondaires: ['INTERPELLATION_ONU', 'MANIFESTATION_DROITS_HOMME'],
    actions_gestion: ['secret_defense', 'sacrifice_ministre', 'transparence_totale'],
  },

  {
    id: 'dossier_retraites_secret',
    titre: 'Le Dossier Secret des Retraites',
    emoji: '👴',
    gravite: 7,
    description: "Une fuite révèle qu'une réforme drastique des retraites est préparée en secret pour l'après-présidentielle 2027.",
    conditions_declenchement: {
      dissimulation_min: 38,
      pression_mediatique_min: 45,
    },
    probabilite_base: 0.22,
    impacts_immediats: {
      popularite_joueur:  -20,
      tension_sociale:    +22,
      pression_mediatique: +18,
      consentement_impot: -12,
    },
    impacts_par_tour: { tension_sociale: +3, popularite_joueur: -2 },
    duree_max_tours: 6,
    evenements_secondaires: ['GREVE_GENERALE', 'MANIFESTATION_SYNDICALE'],
    actions_gestion: ['nier_en_bloc', 'transparence_totale', 'contre_feu_geopolitique'],
  },

  {
    id: 'caisse_noire_matignon',
    titre: 'Les Fonds Spéciaux de Matignon',
    emoji: '💰',
    gravite: 5,
    description: "Un journaliste révèle l'utilisation des fonds secrets de Matignon pour influencer un syndicat avant les municipales.",
    conditions_declenchement: {
      dissimulation_min: 30,
      action_secrete_influence_syndicat: true,
    },
    probabilite_base: 0.30,
    impacts_immediats: {
      popularite_joueur:  -12,
      stabilite:          -8,
      tension_sociale:    +10,
      pression_mediatique: +15,
    },
    impacts_par_tour: { popularite_joueur: -1 },
    duree_max_tours: 4,
    evenements_secondaires: [],
    actions_gestion: ['sacrifice_ministre', 'nier_en_bloc', 'transparence_totale'],
  },
]

// ═══════════════════════════════════════════════════════════
// ACTIONS SECRÈTES
// ═══════════════════════════════════════════════════════════

export const ACTIONS_SECRETES = [
  {
    id: 'financer_syndicat',
    label: 'Influencer un syndicat (Fonds spéciaux)',
    emoji: '🤝',
    cout_budget: 0.3,
    cout_dissimulation: +12,
    effets: { tension_sociale: -15, popularite_joueur: +3 },
    risque_decouverte: 0.25,
    scandale_si_decouvert: 'caisse_noire_matignon',
  },
  {
    id: 'black_out_mediatique',
    label: 'Black-out médiatique (voie juridique)',
    emoji: '🔇',
    cout_budget: 0.5,
    cout_dissimulation: +15,
    effets: { pression_mediatique: -20, stabilite_institutionnelle: -5 },
    risque_decouverte: 0.30,
    scandale_si_decouvert: 'scandale_etat_profond',
  },
  {
    id: 'isoler_temoin',
    label: "Isoler un lanceur d'alerte",
    emoji: '🔒',
    cout_budget: 0.2,
    cout_dissimulation: +20,
    effets: { pression_mediatique: -15, dissimulation: +8 },
    risque_decouverte: 0.40,
    scandale_si_decouvert: 'scandale_etat_profond',
  },
  {
    id: 'shadow_budget_epr2',
    label: 'Shadow Budget EPR2 (via Caisse des Dépôts)',
    emoji: '🏦',
    cout_budget: 0,
    cout_dissimulation: +18,
    effets: { avancement_epr2_pct: +5, relation_ue: -8 },
    risque_decouverte: 0.20,
    scandale_si_decouvert: 'scandale_energie_grise',
  },
  {
    id: 'operation_influence_presse',
    label: "Opération d'influence médiatique",
    emoji: '📺',
    cout_budget: 0.4,
    cout_dissimulation: +10,
    effets: { popularite_joueur: +5, pression_mediatique: -10 },
    risque_decouverte: 0.20,
    scandale_si_decouvert: 'caisse_noire_matignon',
  },
  {
    id: 'garantie_etat_hors_bilan',
    label: "Garantie d'État hors bilan",
    emoji: '📋',
    cout_budget: 0,
    cout_dissimulation: +22,
    effets: { reserve_budgetaire_milliards: +15, relation_ue: -5 },
    risque_decouverte: 0.15,
    scandale_si_decouvert: 'scandale_etat_profond',
  },
]

// ═══════════════════════════════════════════════════════════
// STRATÉGIES DE GESTION DE CRISE
// ═══════════════════════════════════════════════════════════

export const STRATEGIES_GESTION_CRISE = {
  transparence_totale: {
    id: 'transparence_totale',
    label: 'Transparence Totale',
    emoji: '🔍',
    effets_immediats: {
      popularite_joueur:          -8,
      stabilite_institutionnelle: +15,
      consentement_impot:         +10,
      pression_mediatique:        -30,
      dissimulation:              -25,
    },
    effets_long_terme: { popularite_joueur: +12, stabilite: +10 },
    condition: () => true,
  },

  secret_defense: {
    id: 'secret_defense',
    label: 'Invoquer le Secret Défense',
    emoji: '🔒',
    effets_immediats: {
      pression_mediatique:        -20,
      dissimulation:              +10,
      stabilite_institutionnelle: -8,
      popularite_joueur:          -5,
    },
    effets_long_terme: { pression_mediatique: +15 },
    condition: (etat) => (etat.stabilite_institutionnelle ?? 80) > 40,
  },

  sacrifice_ministre: {
    id: 'sacrifice_ministre',
    label: 'Sacrifier un Ministre',
    emoji: '🗡️',
    effets_immediats: {
      popularite_joueur:  -4,
      pression_mediatique: -18,
      stabilite:          +5,
      dissimulation:      -10,
    },
    effets_long_terme: { stabilite: -5 },
    condition: () => true,
    duree_effet_tours: 3,
  },

  contre_feu_geopolitique: {
    id: 'contre_feu_geopolitique',
    label: 'Contre-feu Géopolitique',
    emoji: '🎯',
    effets_immediats: {
      pression_mediatique: -22,
      popularite_joueur:   +3,
      deficit_milliards:   +2,
      tension_sociale:     -5,
    },
    effets_long_terme: { pression_mediatique: +10 },
    condition: (etat) => (etat.pression_mediatique ?? 15) > 40,
    duree_effet_tours: 2,
  },

  isoler_temoins: {
    id: 'isoler_temoins',
    label: 'Isoler les Témoins',
    emoji: '👁️',
    effets_immediats: {
      pression_mediatique:        -15,
      dissimulation:              +15,
      stabilite_institutionnelle: -10,
    },
    effets_long_terme: { popularite_joueur: -8, consentement_impot: -5 },
    condition: (etat) => (etat.dissimulation ?? 20) < 80,
    probabilite_succes: 0.60,
  },

  lancer_poursuites_soi_meme: {
    id: 'lancer_poursuites_soi_meme',
    label: 'Lancer les Poursuites soi-même',
    emoji: '⚖️',
    effets_immediats: {
      popularite_joueur:          +5,
      stabilite_institutionnelle: +10,
      dissimulation:              -30,
      pression_mediatique:        -20,
    },
    effets_long_terme: { popularite_joueur: +8, stabilite: -10 },
    condition: (etat) => (etat.stabilite_institutionnelle ?? 80) > 30,
  },

  nier_en_bloc: {
    id: 'nier_en_bloc',
    label: 'Nier en Bloc',
    emoji: '🙅',
    effets_immediats: {
      pression_mediatique: -10,
      dissimulation:       +20,
    },
    effets_long_terme: {
      popularite_joueur:  -20,
      pression_mediatique: +25,
      consentement_impot: -10,
    },
    condition: () => true,
    multiplicateur_si_echec: 2.0,
  },

  demission_volontaire: {
    id: 'demission_volontaire',
    label: 'Démission Volontaire',
    emoji: '🚪',
    effets_immediats: {
      popularite_joueur:          +10,
      stabilite:                  -40,
      stabilite_institutionnelle: -20,
    },
    condition: (etat) => (etat.popularite_joueur ?? 42) < 20,
    game_over: true,
    game_over_message: "Vous avez choisi de remettre votre mandat au peuple français. Une présidentielle anticipée est convoquée.",
  },
}

// ═══════════════════════════════════════════════════════════
// FONCTIONS PRINCIPALES
// ═══════════════════════════════════════════════════════════

export function calculerDeclenchementScandales(etatScandales, etatJeu) {
  const nouveaux_scandales = []

  for (const scandale of CATALOGUE_SCANDALES) {
    if (etatScandales.scandales_actifs.find(s => s.id === scandale.id)) continue

    const c = scandale.conditions_declenchement
    let ok = true

    if (c.dissimulation_min && (etatScandales.dissimulation ?? 20) < c.dissimulation_min) ok = false
    if (c.pression_mediatique_min && (etatScandales.pression_mediatique ?? 15) < c.pression_mediatique_min) ok = false
    if (c.nouveau_president_assemblee && !etatScandales.nouveau_president_assemblee) ok = false
    if (c.scandale_etat_profond_actif && !etatScandales.scandales_actifs.find(s => s.id === 'scandale_etat_profond')) ok = false
    if (c.commissions_enquete_min && (etatScandales.commissions_enquete_actives ?? 0) < c.commissions_enquete_min) ok = false
    if (c.loi_biogpl_votee && !etatJeu.lois_votees?.includes('relance_gpl')) ok = false
    if (c.action_secrete_influence_syndicat && !etatScandales.actions_secretes_actives?.find(a => a.id === 'financer_syndicat')) ok = false

    if (!ok) continue

    const proba = scandale.probabilite_base *
      (1 + ((etatScandales.dissimulation ?? 20) - 30) / 100) *
      (1 + ((etatScandales.pression_mediatique ?? 15) - 20) / 100)

    if (Math.random() > proba) continue

    nouveaux_scandales.push({
      ...scandale,
      tours_restants: scandale.duree_max_tours,
      strategie_gestion: null,
    })
  }

  return nouveaux_scandales
}

export function executerActionSecrete(actionId, etatScandales, etatJeu) {
  const action = ACTIONS_SECRETES.find(a => a.id === actionId)
  if (!action) return { nouvelEtat: etatScandales, nouvelEtatJeu: etatJeu, decouvert: false, message: 'Action inconnue' }

  const nouvelEtat    = { ...etatScandales }
  const nouvelEtatJeu = { ...etatJeu }

  nouvelEtatJeu.reserve_budgetaire_milliards = (nouvelEtatJeu.reserve_budgetaire_milliards ?? 28) - action.cout_budget
  nouvelEtat.dissimulation = Math.min(100, (nouvelEtat.dissimulation ?? 20) + action.cout_dissimulation)

  for (const [k, v] of Object.entries(action.effets)) {
    if (k in nouvelEtatJeu) nouvelEtatJeu[k] = (nouvelEtatJeu[k] ?? 0) + v
    if (k in nouvelEtat)    nouvelEtat[k]    = (nouvelEtat[k]    ?? 0) + v
  }

  let decouvert = false
  if (Math.random() < action.risque_decouverte) {
    decouvert = true
    const scandale = CATALOGUE_SCANDALES.find(s => s.id === action.scandale_si_decouvert)
    if (scandale && !nouvelEtat.scandales_actifs.find(s => s.id === scandale.id)) {
      const s = { ...scandale, tours_restants: scandale.duree_max_tours, strategie_gestion: null }
      nouvelEtat.scandales_actifs.push(s)
      for (const [k, v] of Object.entries(scandale.impacts_immediats)) {
        if (k in nouvelEtatJeu) nouvelEtatJeu[k] = (nouvelEtatJeu[k] ?? 0) + v
        if (k in nouvelEtat)    nouvelEtat[k]    = (nouvelEtat[k]    ?? 0) + v
      }
    }
  } else {
    if (!nouvelEtat.actions_secretes_actives) nouvelEtat.actions_secretes_actives = []
    nouvelEtat.actions_secretes_actives.push({ id: actionId, tour: etatJeu.tour ?? 0 })
  }

  return {
    nouvelEtat,
    nouvelEtatJeu,
    decouvert,
    message: decouvert ? `⚠️ Action "${action.label}" découverte !` : `✅ "${action.label}" exécutée discrètement.`,
  }
}

export function appliquerStrategieGestion(strategieId, scandaleId, etatScandales, etatJeu) {
  const strategie = STRATEGIES_GESTION_CRISE[strategieId]
  if (!strategie) return { nouvelEtat: etatScandales, nouvelEtatJeu: etatJeu, game_over: false }

  if (strategie.condition && !strategie.condition(etatScandales)) {
    return { nouvelEtat: etatScandales, nouvelEtatJeu: etatJeu, game_over: false, message: 'Conditions non remplies.' }
  }

  const nouvelEtat    = { ...etatScandales }
  const nouvelEtatJeu = { ...etatJeu }

  for (const [k, v] of Object.entries(strategie.effets_immediats)) {
    if (k in nouvelEtatJeu) nouvelEtatJeu[k] = Math.max(0, Math.min(100, (nouvelEtatJeu[k] ?? 0) + v))
    if (k in nouvelEtat)    nouvelEtat[k]    = Math.max(0, Math.min(100, (nouvelEtat[k]    ?? 0) + v))
  }

  let echec = false
  if (strategieId === 'isoler_temoins' && Math.random() > (strategie.probabilite_succes ?? 0.6)) {
    echec = true
    nouvelEtatJeu.popularite_joueur = (nouvelEtatJeu.popularite_joueur ?? 42) - 16
    nouvelEtat.pression_mediatique  = (nouvelEtat.pression_mediatique  ?? 15) + 20
    nouvelEtat.dissimulation        = (nouvelEtat.dissimulation        ?? 20) + 10
  }

  if (strategie.game_over) {
    return { nouvelEtat, nouvelEtatJeu, game_over: true, game_over_message: strategie.game_over_message }
  }

  const idx = nouvelEtat.scandales_actifs?.findIndex(s => s.id === scandaleId) ?? -1
  if (idx !== -1) {
    nouvelEtat.scandales_actifs[idx] = {
      ...nouvelEtat.scandales_actifs[idx],
      strategie_gestion: strategieId,
      tours_restants: Math.min(
        nouvelEtat.scandales_actifs[idx].tours_restants,
        strategie.duree_effet_tours ?? 99
      ),
    }
  }

  return {
    nouvelEtat,
    nouvelEtatJeu,
    echec,
    game_over: false,
    message: echec ? '❌ Opération échouée. La pression médiatique explose.' : `✅ Stratégie "${strategie.label}" appliquée.`,
  }
}

export function tourMoteurScandales(etatScandales, etatJeu) {
  const nouvelEtat    = { ...etatScandales }
  const nouvelEtatJeu = { ...etatJeu }
  const scandales_resolus = []

  // Décroissance naturelle des jauges
  nouvelEtat.pression_mediatique = Math.max(0, (nouvelEtat.pression_mediatique ?? 15) - 2)
  nouvelEtat.dissimulation       = Math.max(0, (nouvelEtat.dissimulation       ?? 20) - 1)

  // Détecter nouveaux scandales
  const nouveaux = calculerDeclenchementScandales(nouvelEtat, nouvelEtatJeu)
  for (const s of nouveaux) {
    if (!nouvelEtat.scandales_actifs) nouvelEtat.scandales_actifs = []
    nouvelEtat.scandales_actifs.push(s)
    for (const [k, v] of Object.entries(s.impacts_immediats ?? {})) {
      if (k in nouvelEtatJeu) nouvelEtatJeu[k] = (nouvelEtatJeu[k] ?? 0) + v
      if (k in nouvelEtat)    nouvelEtat[k]    = (nouvelEtat[k]    ?? 0) + v
    }
  }

  // Appliquer impacts par tour + décompter durée
  if (!nouvelEtat.scandales_actifs) nouvelEtat.scandales_actifs = []
  nouvelEtat.scandales_actifs = nouvelEtat.scandales_actifs
    .map(scandale => {
      for (const [k, v] of Object.entries(scandale.impacts_par_tour ?? {})) {
        if (k in nouvelEtatJeu) nouvelEtatJeu[k] = (nouvelEtatJeu[k] ?? 0) + v
      }
      return { ...scandale, tours_restants: (scandale.tours_restants ?? 1) - 1 }
    })
    .filter(scandale => {
      if ((scandale.tours_restants ?? 0) <= 0) {
        scandales_resolus.push(scandale)
        return false
      }
      return true
    })

  // Vérifier déclenchement nouveau Président de l'Assemblée
  if (!nouvelEtat.nouveau_president_assemblee &&
      (nouvelEtatJeu.stabilite ?? 58) < 35 &&
      (nouvelEtatJeu.popularite_joueur ?? 42) < 30) {
    nouvelEtat.nouveau_president_assemblee = true
    nouvelEtat.president_assemblee_parti   = 'OPPOSITION'
    nouvelEtat.commissions_enquete_actives = (nouvelEtat.commissions_enquete_actives ?? 0) + 1
    nouvelEtatJeu.stabilite          = (nouvelEtatJeu.stabilite          ?? 58) - 12
    nouvelEtatJeu.popularite_joueur  = (nouvelEtatJeu.popularite_joueur  ?? 42) - 8
    nouveaux.push({
      id:    'nouveau_president_assemblee',
      titre: "🔨 Nouveau Président de l'Assemblée (Opposition)",
      emoji: '🔨',
      impacts_immediats: {},
    })
  }

  return {
    nouvelEtat,
    nouvelEtatJeu,
    nouveaux_scandales: nouveaux,
    scandales_resolus,
    evenements: nouveaux.map(s => ({ titre: s.titre, emoji: s.emoji ?? '🚨' })),
  }
}
