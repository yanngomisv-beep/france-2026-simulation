/**
 * France 2026 — Moteur VNU (Versement Nucléaire Universel)
 * Remplace l'ARENH depuis le 1er janvier 2026.
 *
 * Mécaniques simulées :
 * - Prix de marché de l'électricité (indexé sur le gaz)
 * - Seuils de reversement EDF → État
 * - Dilemme d'affectation des recettes
 * - Risque de sous-financement EDF
 * - Corrélation pétrole/gaz/électricité
 */

// ─────────────────────────────────────────────────────────────
// CONSTANTES DU SYSTÈME VNU
// ─────────────────────────────────────────────────────────────

export const VNU_CONFIG = {
  // Prix pivot : en dessous, EDF perd de l'argent
  prix_pivot_mwh: 70,

  // Seuil 1 : au-delà, EDF reverse 50% à l'État
  seuil_reversement_1: 78,
  taux_reversement_1: 0.50,

  // Seuil 2 : au-delà, EDF reverse 90% à l'État
  seuil_reversement_2: 110,
  taux_reversement_2: 0.90,

  // Production nucléaire annuelle France (TWh)
  production_nucleaire_twh: 360,

  // Coût annuel Grand Carénage + EPR2 (Md€)
  besoin_financement_edf: 18,

  // Corrélation gaz → électricité (Merit Order européen)
  // +1€/MWh gaz = +0.85€/MWh électricité
  correlation_gaz_electricite: 0.85,

  // Corrélation pétrole → gaz
  // +10$/baril = +4€/MWh gaz en moyenne
  correlation_petrole_gaz: 0.4,
}

// ─────────────────────────────────────────────────────────────
// ÉTAT ÉNERGÉTIQUE INITIAL (Mars 2026)
// ─────────────────────────────────────────────────────────────

export const ETAT_ENERGIE_INITIAL = {
  // Marché mondial
  prix_baril_dollars: 80,
  prix_gaz_mwh: 38,

  // Marché européen de l'électricité
  prix_electricite_marche_mwh: 72,

  // Situation EDF
  edf_rentable: true,
  edf_dette_milliards: 54,
  avancement_epr2_pct: 12,

  // Recettes VNU de l'État (Md€ cumulés ce mandat)
  recettes_vnu_milliards: 0,

  // Affectation des recettes VNU (choix du joueur)
  affectation_vnu: {
    bouclier_menages_pct: 0,
    subvention_industrie_pct: 0,
    remboursement_dette_pct: 0,
    financement_epr2_pct: 0,
    reserve_pct: 100,
  },

  // Fermeture Mer Rouge (événement déclenchable)
  mer_rouge_fermee: false,
  tensions_iran: false,

  // Souveraineté énergétique
  dependance_gaz_etranger_pct: 72,
  part_nucleaire_mix_pct: 68,
  part_renouvelable_mix_pct: 24,
}

// ─────────────────────────────────────────────────────────────
// 1. CALCUL DU PRIX DE L'ÉLECTRICITÉ
// ─────────────────────────────────────────────────────────────

/**
 * Calcule le prix de marché de l'électricité
 * en fonction des prix du pétrole et du gaz.
 *
 * @param {Object} etatEnergie
 * @returns {number} Prix en €/MWh
 */
export function calculerPrixElectricite(etatEnergie) {
  const { prix_baril_dollars, prix_gaz_mwh, mer_rouge_fermee, tensions_iran } = etatEnergie

  // Impact pétrole sur le gaz
  const delta_baril = prix_baril_dollars - 80  // Référence mars 2026
  const impact_petrole_gaz = delta_baril * VNU_CONFIG.correlation_petrole_gaz

  // Impact Mer Rouge : +15€/MWh sur le gaz (fret maritime)
  const impact_mer_rouge = mer_rouge_fermee ? 15 : 0

  // Impact tensions Iran : +8€/MWh (prime de risque)
  const impact_iran = tensions_iran ? 8 : 0

  const prix_gaz_reel = prix_gaz_mwh + impact_petrole_gaz + impact_mer_rouge + impact_iran

  // Merit Order : prix électricité indexé sur le gaz
  const prix_electricite = 72 + (prix_gaz_reel - 38) * VNU_CONFIG.correlation_gaz_electricite

  return Math.round(prix_electricite * 10) / 10
}

// ─────────────────────────────────────────────────────────────
// 2. CALCUL DES RECETTES VNU
// ─────────────────────────────────────────────────────────────

/**
 * Calcule les recettes que l'État encaisse via le VNU
 * sur une période donnée (en mois).
 *
 * @param {number} prix_mwh      - Prix de marché actuel
 * @param {number} duree_mois    - Durée de la période
 * @returns {Object} { recettes_milliards, taux_applique, zone }
 */
export function calculerRecettesVNU(prix_mwh, duree_mois = 1) {
  const production_mensuelle_twh = VNU_CONFIG.production_nucleaire_twh / 12

  let recettes = 0
  let taux_applique = 0
  let zone = "sous_pivot"

  if (prix_mwh <= VNU_CONFIG.prix_pivot_mwh) {
    // EDF perd de l'argent, l'État ne touche rien
    zone = "sous_pivot"
    taux_applique = 0
    recettes = 0
  } else if (prix_mwh <= VNU_CONFIG.seuil_reversement_1) {
    // Zone entre pivot et seuil 1 : EDF garde tout
    zone = "zone_normale"
    taux_applique = 0
    recettes = 0
  } else if (prix_mwh <= VNU_CONFIG.seuil_reversement_2) {
    // Zone 1 : reversement à 50%
    zone = "zone_reversement_1"
    taux_applique = VNU_CONFIG.taux_reversement_1
    const excedent_mwh = prix_mwh - VNU_CONFIG.seuil_reversement_1
    recettes = excedent_mwh * production_mensuelle_twh * 1000 * taux_applique / 1e9
  } else {
    // Zone 2 : reversement à 90%
    zone = "zone_reversement_2"
    taux_applique = VNU_CONFIG.taux_reversement_2

    // Tranche 1 (78 → 110€) à 50%
    const excedent_tranche1 = VNU_CONFIG.seuil_reversement_2 - VNU_CONFIG.seuil_reversement_1
    const recettes_t1 = excedent_tranche1 * production_mensuelle_twh * 1000 * VNU_CONFIG.taux_reversement_1 / 1e9

    // Tranche 2 (> 110€) à 90%
    const excedent_tranche2 = prix_mwh - VNU_CONFIG.seuil_reversement_2
    const recettes_t2 = excedent_tranche2 * production_mensuelle_twh * 1000 * taux_applique / 1e9

    recettes = recettes_t1 + recettes_t2
  }

  return {
    recettes_milliards: Math.round(recettes * duree_mois * 10) / 10,
    taux_applique,
    zone,
    prix_mwh,
    edf_rentable: prix_mwh >= VNU_CONFIG.prix_pivot_mwh,
  }
}

// ─────────────────────────────────────────────────────────────
// 3. DILEMME D'AFFECTATION DES RECETTES VNU
// ─────────────────────────────────────────────────────────────

/**
 * Options d'affectation des recettes VNU pour le joueur.
 * Chaque option a des impacts différents sur les indicateurs.
 */
export const OPTIONS_AFFECTATION_VNU = [
  {
    id: "bouclier_menages",
    label: "Bouclier Tarifaire Ménages",
    emoji: "🏠",
    description: "Redistribue directement aux ménages via baisse de facture. Populaire mais ne règle pas la dette.",
    impacts_par_milliard: {
      popularite_joueur: +0.8,
      tension_sociale: -1.2,
      deficit_milliards: -1,
      consentement_impot: +0.5,
    },
    reaction_partis: {
      LFI: "SOUTIEN",
      PS_ECO: "SOUTIEN",
      RN: "SOUTIEN_PARTIEL",
      BERCY: "OPPOSITION",
    },
  },
  {
    id: "subvention_industrie",
    label: "Subvention Industries Électro-intensives",
    emoji: "🏭",
    description: "Réduit les coûts énergétiques des usines. Préserve l'emploi mais peu visible pour le citoyen.",
    impacts_par_milliard: {
      pib_croissance_pct: +0.05,
      popularite_joueur: +0.2,
      indice_confiance_marches: +0.8,
      tension_sociale: -0.3,
    },
    reaction_partis: {
      EPR: "SOUTIEN",
      LR: "SOUTIEN",
      LFI: "OPPOSITION",
      BRUXELLES: "SURVEILLANCE",
    },
  },
  {
    id: "remboursement_dette",
    label: "Remboursement de la Dette",
    emoji: "📉",
    description: "Réduit le déficit. Plaît à Bruxelles et aux marchés mais impopulaire électoralement.",
    impacts_par_milliard: {
      deficit_milliards: -1.2,
      indice_confiance_marches: +1.0,
      relation_ue: +0.5,
      popularite_joueur: -0.2,
    },
    reaction_partis: {
      BERCY: "SOUTIEN",
      BRUXELLES: "APPROBATION",
      LFI: "OPPOSITION",
      RN: "OPPOSITION",
    },
  },
  {
    id: "financement_epr2",
    label: "Financement EPR2",
    emoji: "☢️",
    description: "Injecte les recettes dans la construction des nouveaux réacteurs. Vision long terme, 0 effet immédiat.",
    impacts_par_milliard: {
      souverainete_energetique: +0.8,
      avancement_epr2_pct: +0.3,
      popularite_joueur: +0.1,
      edf_dette_milliards: -0.5,
    },
    reaction_partis: {
      EPR: "SOUTIEN",
      LR: "SOUTIEN",
      PS_ECO: "OPPOSITION",
      ANIMALISTE: "OPPOSITION",
    },
  },
  {
    id: "reserve_crise",
    label: "Réserve de Crise",
    emoji: "🏦",
    description: "Met les recettes en réserve pour une prochaine crise. Prudent mais sans effet immédiat.",
    impacts_par_milliard: {
      reserve_budgetaire_milliards: +1,
      indice_confiance_marches: +0.3,
    },
    reaction_partis: {
      BERCY: "SOUTIEN",
      LFI: "OPPOSITION",
      RN: "OPPOSITION",
    },
  },
]

/**
 * Applique l'affectation choisie par le joueur.
 *
 * @param {Object} affectation - { bouclier_menages_pct: 40, remboursement_dette_pct: 60, ... }
 * @param {number} recettes_totales - Md€ disponibles
 * @param {Object} etatJeu
 * @returns {Object} Nouvel état du jeu + résumé
 */
export function appliquerAffectationVNU(affectation, recettes_totales, etatJeu) {
  const nouvelEtat = { ...etatJeu }
  const resume = []

  for (const option of OPTIONS_AFFECTATION_VNU) {
    const pct = affectation[option.id] ?? 0
    if (pct === 0) continue

    const montant = recettes_totales * (pct / 100)
    resume.push({
      option: option.label,
      montant_milliards: Math.round(montant * 10) / 10,
      emoji: option.emoji,
    })

    // Appliquer les impacts
    for (const [indicateur, valeur_par_md] of Object.entries(option.impacts_par_milliard)) {
      if (indicateur in nouvelEtat) {
        nouvelEtat[indicateur] = Math.round(
          (nouvelEtat[indicateur] + valeur_par_md * montant) * 10
        ) / 10
      }
    }
  }

  return { nouvelEtat, resume }
}

// ─────────────────────────────────────────────────────────────
// 4. RISQUE DE SOUS-FINANCEMENT EDF
// ─────────────────────────────────────────────────────────────

/**
 * Évalue la santé financière d'EDF selon le prix de marché.
 * Si prix < pivot, EDF accumule des pertes.
 *
 * @param {number} prix_mwh
 * @param {Object} etatEnergie
 * @returns {Object} { statut, alerte, impact_avancement_epr2 }
 */
export function evaluerSanteEDF(prix_mwh, etatEnergie) {
  const deficit_par_mwh = Math.max(0, VNU_CONFIG.prix_pivot_mwh - prix_mwh)
  const perte_mensuelle = deficit_par_mwh *
    (VNU_CONFIG.production_nucleaire_twh / 12) * 1000 / 1e9

  if (prix_mwh >= VNU_CONFIG.prix_pivot_mwh) {
    return {
      statut: "saine",
      alerte: null,
      perte_mensuelle: 0,
      impact_avancement_epr2: 0,
    }
  }

  if (perte_mensuelle < 0.5) {
    return {
      statut: "fragile",
      alerte: {
        niveau: "warning",
        message: `EDF opère sous le prix pivot (${prix_mwh}€ < ${VNU_CONFIG.prix_pivot_mwh}€). Surveillance recommandée.`,
        emoji: "⚠️",
      },
      perte_mensuelle,
      impact_avancement_epr2: -0.2,
    }
  }

  return {
    statut: "critique",
    alerte: {
      niveau: "danger",
      message: `EDF perd ${perte_mensuelle.toFixed(1)} Md€/mois. Le Grand Carénage et les EPR2 sont en danger.`,
      emoji: "🚨",
    },
    perte_mensuelle,
    impact_avancement_epr2: -1.0,
    evenement: "CRISE_EDF",
  }
}

// ─────────────────────────────────────────────────────────────
// 5. ÉVÉNEMENTS GÉOPOLITIQUES ÉNERGÉTIQUES
// ─────────────────────────────────────────────────────────────

export const EVENEMENTS_GEOPOLITIQUES = {
  TENSIONS_IRAN: {
    id: "tensions_iran",
    titre: "Frappes militaires en Iran",
    emoji: "💥",
    description: "Des frappes militaires font bondir le baril de +20$ en 48h.",
    impact_energie: {
      prix_baril_dollars: +20,
      tensions_iran: true,
    },
    impact_jeu: {
      popularite_joueur: -5,
      tension_sociale: +8,
      indice_confiance_marches: -10,
    },
    probabilite_declenchement: 0.15,
    condition: (etat) => !etat.tensions_iran,
  },

  FERMETURE_MER_ROUGE: {
    id: "fermeture_mer_rouge",
    titre: "Fermeture partielle de la Mer Rouge",
    emoji: "🚢",
    description: "Le fret maritime est dévié. Coût du transport +60%. Inflation importée en France.",
    impact_energie: {
      mer_rouge_fermee: true,
    },
    impact_jeu: {
      inflation_pct: +0.8,
      popularite_joueur: -6,
      tension_sociale: +12,
      pib_croissance_pct: -0.3,
      deficit_milliards: +4,
    },
    probabilite_declenchement: 0.20,
    condition: (etat) => etat.tensions_iran && !etat.mer_rouge_fermee,
  },

  BARIL_100: {
    id: "baril_100",
    titre: "Le baril franchit les 100$",
    emoji: "🛢️",
    description: "Seuil psychologique atteint. Les pompes affichent 2€/L de diesel.",
    impact_energie: {
      prix_baril_dollars: 100,
    },
    impact_jeu: {
      popularite_joueur: -8,
      tension_sociale: +15,
      inflation_pct: +0.5,
    },
    probabilite_declenchement: 0,
    condition: (etat) => etat.prix_baril_dollars >= 100,
    est_seuil: true,
  },

  BARIL_160: {
    id: "baril_160",
    titre: "Tempête Parfaite — Baril à 160$",
    emoji: "🌪️",
    description: "Pétrole à 160$, Mer Rouge fermée, inflation à 4,5%. Pénuries en rayon avant les municipales.",
    impact_energie: {
      prix_baril_dollars: 160,
    },
    impact_jeu: {
      popularite_joueur: -18,
      tension_sociale: +28,
      inflation_pct: +1.7,
      deficit_milliards: +8,
      indice_confiance_marches: -20,
    },
    probabilite_declenchement: 0,
    condition: (etat) => etat.mer_rouge_fermee && etat.tensions_iran && etat.prix_baril_dollars >= 130,
    est_seuil: true,
    evenements_secondaires: ["GREVE_RAFFINERIES", "PENURIES_STATIONS", "CHOC_PETROLIER"],
  },

  PRIX_ELECTRICITE_400: {
    id: "prix_electricite_400",
    titre: "Électricité à 400€/MWh en Europe",
    emoji: "⚡",
    description: "L'Allemagne sans nucléaire paie 400€/MWh. Le VNU encaisse des dizaines de milliards.",
    impact_energie: {},
    impact_jeu: {
      recettes_vnu_milliards: +45,
      relation_ue: -10,
      indice_confiance_marches: +5,
    },
    probabilite_declenchement: 0,
    condition: (etat) => calculerPrixElectricite(etat) >= 200,
    est_seuil: true,
  },
}

// ─────────────────────────────────────────────────────────────
// 6. TOUR DU MOTEUR VNU
// ─────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal — appelé à chaque tour de jeu.
 * Calcule l'état énergétique complet et les recettes VNU.
 *
 * @param {Object} etatEnergie
 * @param {Object} etatJeu
 * @param {Object} affectation_vnu - Choix d'affectation du joueur
 * @returns {Object} Résultat complet du tour énergétique
 */
export function tourMoteurVNU(etatEnergie, etatJeu, affectation_vnu) {
  // 1. Calcul du prix de l'électricité
  const prix_electricite = calculerPrixElectricite(etatEnergie)

  // 2. Calcul des recettes VNU du mois
  const vnu = calculerRecettesVNU(prix_electricite, 1)

  // 3. Santé EDF
  const sante_edf = evaluerSanteEDF(prix_electricite, etatEnergie)

  // 4. Événements géopolitiques déclenchables
  const evenements_declenches = []
  for (const evt of Object.values(EVENEMENTS_GEOPOLITIQUES)) {
    if (evt.est_seuil && evt.condition(etatEnergie)) {
      evenements_declenches.push(evt)
      continue
    }
    if (!evt.est_seuil && evt.condition(etatEnergie) && Math.random() < evt.probabilite_declenchement) {
      evenements_declenches.push(evt)
    }
  }

  // 5. Affectation des recettes VNU
  let resultat_affectation = null
  if (vnu.recettes_milliards > 0 && affectation_vnu) {
    resultat_affectation = appliquerAffectationVNU(
      affectation_vnu,
      vnu.recettes_milliards,
      etatJeu
    )
  }

  // 6. Mise à jour état énergie
  const nouvelEtatEnergie = {
    ...etatEnergie,
    prix_electricite_marche_mwh: prix_electricite,
    recettes_vnu_milliards: (etatEnergie.recettes_vnu_milliards ?? 0) + vnu.recettes_milliards,
    edf_rentable: sante_edf.statut !== "critique",
    avancement_epr2_pct: Math.max(0, (etatEnergie.avancement_epr2_pct ?? 0) + sante_edf.impact_avancement_epr2),
  }

  // Appliquer impacts des événements sur l'énergie
  for (const evt of evenements_declenches) {
    Object.assign(nouvelEtatEnergie, evt.impact_energie)
  }

  return {
    prix_electricite,
    vnu,
    sante_edf,
    evenements_declenches,
    resultat_affectation,
    nouvelEtatEnergie,
    resume: genererResumeVNU(prix_electricite, vnu, sante_edf, evenements_declenches),
  }
}

// ─────────────────────────────────────────────────────────────
// RÉSUMÉ LISIBLE
// ─────────────────────────────────────────────────────────────

function genererResumeVNU(prix, vnu, sante, evenements) {
  const lignes = []

  lignes.push(`⚡ Électricité : ${prix}€/MWh`)

  if (vnu.zone === "sous_pivot") {
    lignes.push(`🔴 EDF sous le prix pivot — Risque pour le financement nucléaire`)
  } else if (vnu.zone === "zone_normale") {
    lignes.push(`🟡 EDF rentable — Pas de reversement VNU activé`)
  } else if (vnu.zone === "zone_reversement_1") {
    lignes.push(`🟠 VNU activé à 50% — Recettes État : +${vnu.recettes_milliards} Md€`)
  } else {
    lignes.push(`🟢 VNU activé à 90% — Recettes État : +${vnu.recettes_milliards} Md€`)
  }

  if (sante.alerte) {
    lignes.push(`${sante.alerte.emoji} ${sante.alerte.message}`)
  }

  for (const evt of evenements) {
    lignes.push(`${evt.emoji} ÉVÉNEMENT : ${evt.titre}`)
  }

  return lignes.join('\n')
}
