/**
 * France 2026 — Moteur Géopolitique
 * Simule les chocs externes qui impactent la France :
 * - Tensions internationales (Iran, Mer Rouge, OTAN)
 * - Marchés financiers (OAT, notation, spread)
 * - Ingérences numériques étrangères
 * - Pression de Bruxelles
 * - Opinions publiques étrangères
 */

// ─────────────────────────────────────────────────────────────
// ÉTAT GÉOPOLITIQUE INITIAL (Mars 2026)
// ─────────────────────────────────────────────────────────────

export const ETAT_GEO_INITIAL = {
  // Tensions régionales
  tension_iran: 45,          // 0-100
  tension_russie: 62,
  tension_chine: 30,
  tension_usa: 15,
  tension_afrique_sahel: 58,

  // Mer Rouge
  mer_rouge_ouverte: true,
  jours_fermeture_mer_rouge: 0,

  // OTAN
  cohesion_otan: 72,         // 0-100
  contribution_france_otan_pct: 2.1,

  // Relations bilatérales clés
  relation_allemagne: 65,
  relation_usa: 55,
  relation_russie: -40,
  relation_chine: 20,
  relation_maroc: 30,
  relation_algerie: 15,

  // Marchés financiers
  taux_oat_10ans_pct: 3.2,   // Taux OAT France 10 ans
  spread_allemagne_pts: 65,  // Écart France/Allemagne en points de base
  notation_moodys: "Aa2",
  notation_sp: "AA-",
  prime_risque: 1.2,

  // Ingérences numériques
  niveau_ingérence_russe: 35,
  niveau_ingérence_chinoise: 20,
  cyber_incidents_mois: 2,

  // Pression Bruxelles
  procedures_infraction: 0,
  amendes_ue_milliards: 0,
  conformite_pacte_stabilite: true,

  // Score souveraineté globale
  indice_souverainete: 58,
}

// ─────────────────────────────────────────────────────────────
// THÉÂTRES GÉOPOLITIQUES
// ─────────────────────────────────────────────────────────────

export const THEATRES = {

  MOYEN_ORIENT: {
    id: "moyen_orient",
    nom: "Moyen-Orient",
    emoji: "🌍",
    description: "Tensions Iran-Israël, sécurité du détroit d'Ormuz et de la Mer Rouge.",
    indicateur_tension: "tension_iran",
    impacts_france: {
      prix_baril_dollars: (tension) => tension > 60 ? (tension - 60) * 0.8 : 0,
      inflation_pct: (tension) => tension > 70 ? (tension - 70) * 0.02 : 0,
      indice_confiance_marches: (tension) => tension > 50 ? -(tension - 50) * 0.15 : 0,
    },
    evenements: [
      {
        id: "frappes_iran",
        titre: "Frappes militaires en Iran",
        emoji: "💥",
        seuil_declenchement: 70,
        probabilite: 0.18,
        impacts: {
          prix_baril_dollars: +22,
          tension_iran: +15,
          indice_confiance_marches: -12,
          popularite_joueur: -4,
        },
        duree_tours: 3,
        evenements_secondaires: ["FERMETURE_MER_ROUGE"],
      },
      {
        id: "accord_diplomatique_iran",
        titre: "Accord diplomatique avec l'Iran",
        emoji: "🕊️",
        seuil_declenchement: 0,
        probabilite: 0.08,
        condition: (etat) => etat.tension_iran > 50 && etat.relation_usa > 40,
        impacts: {
          prix_baril_dollars: -15,
          tension_iran: -20,
          indice_confiance_marches: +8,
          popularite_joueur: +5,
        },
        duree_tours: 6,
      },
      {
        id: "fermeture_mer_rouge",
        titre: "Fermeture totale de la Mer Rouge",
        emoji: "🚢",
        seuil_declenchement: 80,
        probabilite: 0.25,
        condition: (etat) => !etat.mer_rouge_ouverte || etat.tension_iran > 75,
        impacts: {
          inflation_pct: +0.9,
          pib_croissance_pct: -0.4,
          tension_sociale: +12,
          popularite_joueur: -7,
          mer_rouge_ouverte: false,
        },
        duree_tours: 4,
        evenements_secondaires: ["BARIL_160", "PENURIES_RAYON"],
      },
    ],
  },

  EUROPE_EST: {
    id: "europe_est",
    nom: "Europe de l'Est",
    emoji: "🇺🇦",
    description: "Conflit russo-ukrainien, cohésion OTAN, sécurité énergétique européenne.",
    indicateur_tension: "tension_russie",
    impacts_france: {
      prix_gaz_mwh: (tension) => tension > 50 ? (tension - 50) * 0.3 : 0,
      relation_ue: (cohesion) => (cohesion - 70) * 0.2,
      deficit_milliards: (tension) => tension > 70 ? (tension - 70) * 0.1 : 0,
    },
    evenements: [
      {
        id: "escalade_ukraine",
        titre: "Escalade majeure en Ukraine",
        emoji: "🔥",
        seuil_declenchement: 75,
        probabilite: 0.12,
        impacts: {
          tension_russie: +15,
          prix_gaz_mwh: +12,
          cohesion_otan: +10,
          popularite_joueur: -3,
          deficit_milliards: +4,
        },
        duree_tours: 5,
      },
      {
        id: "cessez_le_feu_ukraine",
        titre: "Cessez-le-feu en Ukraine",
        emoji: "🤝",
        seuil_declenchement: 0,
        probabilite: 0.10,
        condition: (etat) => etat.tension_russie < 55,
        impacts: {
          tension_russie: -20,
          prix_gaz_mwh: -8,
          indice_confiance_marches: +10,
          popularite_joueur: +6,
        },
        duree_tours: 8,
      },
      {
        id: "crise_otan",
        titre: "Crise de cohésion OTAN",
        emoji: "🪖",
        seuil_declenchement: 0,
        probabilite: 0.08,
        condition: (etat) => etat.cohesion_otan < 55,
        impacts: {
          cohesion_otan: -15,
          relation_usa: -10,
          stabilite: -8,
          popularite_joueur: -5,
        },
        duree_tours: 3,
      },
    ],
  },

  AFRIQUE_SAHEL: {
    id: "afrique_sahel",
    nom: "Afrique — Sahel",
    emoji: "🌍",
    description: "Présence militaire française, accès à l'uranium nigérien, influence russe (Wagner).",
    indicateur_tension: "tension_afrique_sahel",
    impacts_france: {
      souverainete_energetique: (tension) => tension > 60 ? -(tension - 60) * 0.2 : 0,
      deficit_milliards: (tension) => tension > 50 ? (tension - 50) * 0.05 : 0,
    },
    evenements: [
      {
        id: "expulsion_france_niger",
        titre: "Expulsion des forces françaises du Niger",
        emoji: "🚫",
        seuil_declenchement: 65,
        probabilite: 0.15,
        impacts: {
          tension_afrique_sahel: +20,
          souverainete_energetique: -15,
          popularite_joueur: -8,
          indice_souverainete: -10,
        },
        duree_tours: 6,
        evenements_secondaires: ["CRISE_URANIUM"],
      },
      {
        id: "accord_uranium_niger",
        titre: "Accord stratégique uranium Niger",
        emoji: "☢️",
        seuil_declenchement: 0,
        probabilite: 0.10,
        condition: (etat) => etat.tension_afrique_sahel < 45,
        impacts: {
          souverainete_energetique: +12,
          deficit_milliards: +2,
          popularite_joueur: +3,
        },
        duree_tours: 12,
      },
      {
        id: "wagner_sahel",
        titre: "Expansion Wagner au Sahel",
        emoji: "⚔️",
        seuil_declenchement: 55,
        probabilite: 0.20,
        impacts: {
          tension_afrique_sahel: +18,
          relation_russie: -10,
          souverainete_energetique: -8,
          popularite_joueur: -4,
        },
        duree_tours: 8,
      },
    ],
  },

  MARCHES_FINANCIERS: {
    id: "marches",
    nom: "Marchés Financiers",
    emoji: "📈",
    description: "Taux OAT, notation souveraine, spread avec l'Allemagne.",
    indicateur_tension: "prime_risque",
    impacts_france: {
      deficit_milliards: (taux) => taux > 3.5 ? (taux - 3.5) * 12 : 0,
      indice_confiance_marches: (spread) => spread > 80 ? -(spread - 80) * 0.3 : 0,
    },
    evenements: [
      {
        id: "degradation_notation",
        titre: "Dégradation de la notation française",
        emoji: "📉",
        seuil_declenchement: 0,
        probabilite: 0.08,
        condition: (etat) => etat.deficit_pib_pct > 5.5 || etat.spread_allemagne_pts > 120,
        impacts: {
          taux_oat_10ans_pct: +0.4,
          spread_allemagne_pts: +25,
          indice_confiance_marches: -20,
          popularite_joueur: -10,
          deficit_milliards: +8,
        },
        duree_tours: 12,
        message: "Moody's abaisse la note de la France à Aa3. Les taux d'intérêt s'envolent.",
      },
      {
        id: "crise_obligataire",
        titre: "Crise Obligataire",
        emoji: "💥",
        seuil_declenchement: 0,
        probabilite: 0.10,
        condition: (etat) => etat.taux_oat_10ans_pct > 4.5 || etat.relation_ue < -50,
        impacts: {
          taux_oat_10ans_pct: +1.2,
          spread_allemagne_pts: +60,
          indice_confiance_marches: -35,
          popularite_joueur: -15,
          deficit_milliards: +25,
          pib_croissance_pct: -0.8,
        },
        duree_tours: 4,
        evenements_secondaires: ["PLAN_AUSTERITE_FORCE", "INTERVENTION_BCE"],
      },
      {
        id: "amelioration_notation",
        titre: "Amélioration de la notation",
        emoji: "📈",
        seuil_declenchement: 0,
        probabilite: 0.06,
        condition: (etat) => etat.deficit_pib_pct < 4.0 && etat.indice_confiance_marches > 70,
        impacts: {
          taux_oat_10ans_pct: -0.2,
          spread_allemagne_pts: -15,
          indice_confiance_marches: +10,
          popularite_joueur: +4,
        },
        duree_tours: 8,
      },
    ],
  },

  NUMERIQUE_INGERENCE: {
    id: "numerique",
    nom: "Ingérences Numériques",
    emoji: "💻",
    description: "Cyberattaques, désinformation, manipulation de l'opinion publique.",
    indicateur_tension: "niveau_ingérence_russe",
    impacts_france: {
      pression_mediatique: (ingérence) => ingérence > 40 ? (ingérence - 40) * 0.3 : 0,
      dissimulation: (cyber) => cyber < 30 ? (30 - cyber) * 0.4 : 0,
    },
    evenements: [
      {
        id: "cyberattaque_infra",
        titre: "Cyberattaque sur infrastructures critiques",
        emoji: "🔓",
        seuil_declenchement: 50,
        probabilite: 0.15,
        condition: (etat) => etat.cyber_protection < 40,
        impacts: {
          stabilite: -10,
          popularite_joueur: -8,
          cyber_incidents_mois: +3,
          indice_confiance_marches: -8,
        },
        duree_tours: 2,
        message: "Des infrastructures énergétiques françaises visées par une cyberattaque d'origine russe.",
      },
      {
        id: "campagne_desinformation",
        titre: "Campagne de Désinformation Électorale",
        emoji: "📱",
        seuil_declenchement: 45,
        probabilite: 0.20,
        condition: (etat) => etat.cyber_protection < 50,
        impacts: {
          popularite_joueur: -12,
          tension_sociale: +10,
          pression_mediatique: +20,
          consentement_impot: -8,
        },
        duree_tours: 3,
        message: "Des IA adverses génèrent des millions de faux témoignages sur les réseaux sociaux, manipulant l'opinion avant les élections.",
      },
      {
        id: "leak_documents_etat",
        titre: "Fuite de Documents d'État",
        emoji: "📁",
        seuil_declenchement: 0,
        probabilite: 0.12,
        condition: (etat) => etat.dissimulation > 60 && etat.cyber_protection < 45,
        impacts: {
          popularite_joueur: -18,
          stabilite: -12,
          pression_mediatique: +35,
          dissimulation: +25,
          scandale_actif: true,
        },
        duree_tours: 5,
        evenements_secondaires: ["SCANDALE_ETAT_PROFOND", "COMMISSION_ENQUETE"],
        message: "Des documents classifiés fuitent sur des plateformes étrangères. L'ANSSI ouvre une enquête.",
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// ACTIONS DIPLOMATIQUES DU JOUEUR
// ─────────────────────────────────────────────────────────────

export const ACTIONS_DIPLOMATIQUES = [
  {
    id: "sommet_bilateral_allemagne",
    label: "Sommet Franco-Allemand",
    emoji: "🇩🇪",
    description: "Renforcer l'axe Paris-Berlin. Clé pour peser sur les décisions européennes.",
    cout_politique: 3,
    impacts: {
      relation_allemagne: +15,
      relation_ue: +8,
      cohesion_otan: +5,
      popularite_joueur: +2,
    },
    condition: (etat) => etat.relation_allemagne < 85,
  },
  {
    id: "mediation_ukraine",
    label: "Médiation France-Ukraine-Russie",
    emoji: "🕊️",
    description: "La France joue le médiateur. Risqué mais potentiellement historique.",
    cout_politique: 8,
    impacts: {
      tension_russie: -10,
      popularite_joueur: +8,
      cohesion_otan: -5,
      relation_usa: -5,
      indice_souverainete: +8,
    },
    condition: (etat) => etat.tension_russie > 50,
  },
  {
    id: "renforcement_anssi",
    label: "Doublement Budget ANSSI",
    emoji: "🔐",
    description: "Protège les infrastructures critiques et réduit le risque de fuites documentaires.",
    cout_politique: 2,
    impacts: {
      cyber_protection: +20,
      deficit_milliards: +3,
      niveau_ingérence_russe: -10,
      niveau_ingérence_chinoise: -8,
    },
    condition: () => true,
  },
  {
    id: "accord_energie_norvege",
    label: "Accord Énergétique avec la Norvège",
    emoji: "🇳🇴",
    description: "Sécurise l'approvisionnement en gaz naturel hors Russie.",
    cout_politique: 4,
    impacts: {
      dependance_gaz_etranger_pct: -12,
      prix_gaz_mwh: -4,
      souverainete_energetique: +10,
      relation_ue: +5,
    },
    condition: (etat) => etat.tension_russie > 40,
  },
  {
    id: "initiative_defense_europeenne",
    label: "Initiative Défense Européenne",
    emoji: "🇪🇺",
    description: "Propose une armée européenne sous commandement français. Ambitieux et clivant.",
    cout_politique: 10,
    impacts: {
      relation_ue: +15,
      cohesion_otan: -8,
      relation_usa: -12,
      indice_souverainete: +15,
      popularite_joueur: +5,
    },
    condition: (etat) => etat.cohesion_otan < 70,
  },
  {
    id: "contre_feu_geopolitique",
    label: "Contre-feu Géopolitique",
    emoji: "📺",
    description: "Annonce une opération militaire ou diplomatique pour détourner l'attention d'un scandale.",
    cout_politique: 5,
    impacts: {
      pression_mediatique: -20,
      popularite_joueur: +3,
      deficit_milliards: +2,
      relation_usa: +3,
    },
    condition: (etat) => etat.pression_mediatique > 50,
  },
  {
    id: "alliance_pays_emergents",
    label: "Alliance avec pays émergents (BRICS+)",
    emoji: "🌐",
    description: "Rapprochement stratégique avec Inde, Brésil, Afrique du Sud. Diversification hors OTAN.",
    cout_politique: 7,
    impacts: {
      indice_souverainete: +12,
      relation_usa: -8,
      relation_ue: -5,
      pib_croissance_pct: +0.2,
      souverainete_energetique: +6,
    },
    condition: (etat) => etat.relation_usa < 50,
  },
]

// ─────────────────────────────────────────────────────────────
// PRESSION BRUXELLES
// ─────────────────────────────────────────────────────────────

/**
 * Calcule la pression européenne sur la France
 * selon les indicateurs économiques et politiques.
 */
export function calculerPressionBruxelles(etatJeu, etatGeo) {
  const alertes = []
  let pression_totale = 0

  // Déficit > 5%
  if (etatJeu.deficit_pib_pct > 5.0) {
    const excedent = etatJeu.deficit_pib_pct - 5.0
    pression_totale += excedent * 20
    alertes.push({
      type: "DEFICIT_EXCESSIF",
      emoji: "💸",
      message: `Déficit à ${etatJeu.deficit_pib_pct}% — Bruxelles exige un retour sous les 5%.`,
      sanction_possible: excedent > 1.5,
    })
  }

  // Procédures d'infraction actives
  if (etatGeo.procedures_infraction > 0) {
    pression_totale += etatGeo.procedures_infraction * 15
    alertes.push({
      type: "PROCEDURES_INFRACTION",
      emoji: "⚖️",
      message: `${etatGeo.procedures_infraction} procédure(s) d'infraction en cours.`,
      sanction_possible: etatGeo.procedures_infraction > 2,
    })
  }

  // Relation UE très dégradée
  if (etatJeu.relation_ue < -30) {
    pression_totale += Math.abs(etatJeu.relation_ue + 30) * 0.5
    alertes.push({
      type: "RELATIONS_DEGRADEES",
      emoji: "🇪🇺",
      message: "Les relations avec Bruxelles sont très tendues.",
      sanction_possible: etatJeu.relation_ue < -60,
    })
  }

  return {
    pression_totale: Math.min(100, Math.round(pression_totale)),
    alertes,
    risque_sanction: alertes.some(a => a.sanction_possible),
  }
}

// ─────────────────────────────────────────────────────────────
// TOUR DU MOTEUR GÉOPOLITIQUE
// ─────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal — appelé à chaque tour de jeu.
 *
 * @param {Object} etatGeo
 * @param {Object} etatJeu
 * @returns {Object} Événements déclenchés + nouvel état + alertes
 */
export function tourMoteurGeopolitique(etatGeo, etatJeu) {
  const evenements_declenches = []
  let nouvelEtatGeo = { ...etatGeo }
  let nouvelEtatJeu = { ...etatJeu }

  // Parcourir tous les théâtres
  for (const theatre of Object.values(THEATRES)) {
    for (const evt of theatre.evenements) {
      // Vérifier la condition et le seuil
      const tension = etatGeo[theatre.indicateur_tension] ?? 0
      if (tension < evt.seuil_declenchement) continue
      if (evt.condition && !evt.condition(etatGeo)) continue
      if (Math.random() > evt.probabilite) continue

      evenements_declenches.push({
        ...evt,
        theatre: theatre.nom,
        theatre_emoji: theatre.emoji,
      })

      // Appliquer les impacts sur l'état du jeu
      for (const [indicateur, valeur] of Object.entries(evt.impacts)) {
        if (indicateur in nouvelEtatJeu) {
          nouvelEtatJeu[indicateur] = Math.round(
            (nouvelEtatJeu[indicateur] + valeur) * 10
          ) / 10
        }
        if (indicateur in nouvelEtatGeo) {
          nouvelEtatGeo[indicateur] = Math.round(
            (nouvelEtatGeo[indicateur] + valeur) * 10
          ) / 10
        }
      }
    }
  }

  // Évolution naturelle des tensions (régression vers la moyenne)
  const TENSIONS = ["tension_iran", "tension_russie", "tension_chine", "tension_afrique_sahel"]
  for (const t of TENSIONS) {
    if (nouvelEtatGeo[t] > 50) {
      nouvelEtatGeo[t] = Math.max(50, nouvelEtatGeo[t] - 1)
    } else if (nouvelEtatGeo[t] < 50) {
      nouvelEtatGeo[t] = Math.min(50, nouvelEtatGeo[t] + 1)
    }
  }

  // Pression Bruxelles
  const pression_bruxelles = calculerPressionBruxelles(nouvelEtatJeu, nouvelEtatGeo)

  // Sanctions automatiques si pression > 80
  if (pression_bruxelles.pression_totale > 80 && Math.random() < 0.3) {
    const amende = Math.round((pression_bruxelles.pression_totale - 80) * 0.5 * 10) / 10
    nouvelEtatGeo.amendes_ue_milliards += amende
    nouvelEtatJeu.deficit_milliards += amende
    evenements_declenches.push({
      id: "sanction_ue",
      titre: "Sanction Financière Européenne",
      emoji: "💶",
      message: `L'UE inflige une amende de ${amende} Md€ à la France.`,
      theatre: "Union Européenne",
      theatre_emoji: "🇪🇺",
    })
  }

  return {
    evenements_declenches,
    pression_bruxelles,
    nouvelEtatGeo,
    nouvelEtatJeu,
    resume: genererResumeGeo(evenements_declenches, pression_bruxelles, nouvelEtatGeo),
  }
}

// ─────────────────────────────────────────────────────────────
// RÉSUMÉ
// ─────────────────────────────────────────────────────────────

function genererResumeGeo(evenements, pression, etatGeo) {
  const lignes = []

  lignes.push(`🌍 Situation géopolitique — ${evenements.length} événement(s) ce tour`)

  for (const evt of evenements) {
    lignes.push(`${evt.theatre_emoji} ${evt.titre} : ${evt.message ?? "Impact en cours."}`)
  }

  if (pression.pression_totale > 60) {
    lignes.push(`🇪🇺 Pression Bruxelles : ${pression.pression_totale}/100 ${pression.risque_sanction ? "⚠️ Sanction imminente" : ""}`)
  }

  lignes.push(`📊 OAT 10 ans : ${etatGeo.taux_oat_10ans_pct}% | Spread ALL : ${etatGeo.spread_allemagne_pts} pts`)

  return lignes.join('\n')
}

/**
 * Exécute une action diplomatique du joueur.
 */
export function executerActionDiplomatique(actionId, etatGeo, etatJeu) {
  const action = ACTIONS_DIPLOMATIQUES.find(a => a.id === actionId)
  if (!action) throw new Error(`Action "${actionId}" introuvable.`)
  if (!action.condition(etatGeo)) throw new Error(`Conditions non remplies pour "${action.label}".`)

  const nouvelEtatJeu = { ...etatJeu }
  const nouvelEtatGeo = { ...etatGeo }

  for (const [indicateur, valeur] of Object.entries(action.impacts)) {
    if (indicateur in nouvelEtatJeu) nouvelEtatJeu[indicateur] += valeur
    if (indicateur in nouvelEtatGeo) nouvelEtatGeo[indicateur] += valeur
  }

  return {
    nouvelEtatJeu,
    nouvelEtatGeo,
    message: `✅ ${action.label} exécuté avec succès.`,
  }
}
