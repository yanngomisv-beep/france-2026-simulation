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
          popular
