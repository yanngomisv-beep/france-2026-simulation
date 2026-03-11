// src/engines/moteur-echanges-energie.js
// Calcule les échanges frontaliers tour par tour en fonction de :
//   • La balance production/consommation française
//   • Les prix de marché européen
//   • Les décisions du joueur (nucléaire, ENR, maintenance, crises)
//   • Les événements géopolitiques

// ─────────────────────────────────────────────────────────────
// CAPACITÉS D'INTERCONNEXION (MW — limites physiques réelles)
// ─────────────────────────────────────────────────────────────
export const CAPACITES_INTERCONNEXION = {
  angleterre:         2000,  // IFA1 + IFA2 + ElecLink
  allemagne_belgique: 3500,  // NTC agrégé FR-DE + FR-BE
  suisse:             3500,  // Forte interconnexion alpine
  italie:             3900,  // Ligne alpine
  espagne:            2800,  // Limité (Pyrénées = goulet d'étranglement)
}

// Prix de marché typiques par pays (€/MWh) — base de négociation
const PRIX_MARCHE_BASE = {
  angleterre:         110,
  allemagne_belgique: 85,
  suisse:             90,
  italie:             100,
  espagne:            95,
  france:             95,
}

// ─────────────────────────────────────────────────────────────
// CALCUL PRINCIPAL — appelé dans passerTour()
// ─────────────────────────────────────────────────────────────

/**
 * Recalcule les échanges frontaliers pour ce tour.
 *
 * @param {object} etatJeu - État courant du jeu
 * @returns {{ echanges_mw, solde_total, evenements }}
 */
export function calculerEchangesEnergie(etatJeu) {
  const prod       = etatJeu.production_mw?.total_mw ?? 65000
  const conso      = etatJeu.consommation_mw ?? 60000
  const balance    = prod - conso              // positif = surplus → tendance export
  const prix_fr    = etatJeu.prix_electricite_marche_mwh ?? 95

  const evenements = []

  // ── Calcul base par pays ────────────────────────────────────
  // Principe : on exporte si surplus FR + prix FR < prix voisin
  //            on importe si déficit FR OU prix FR > prix voisin
  const echanges = {}

  Object.entries(CAPACITES_INTERCONNEXION).forEach(([pays, capacite_max]) => {
    const prix_voisin = _getPrixVoisin(pays, etatJeu)
    const diff_prix   = prix_voisin - prix_fr   // positif → avantage à exporter vers ce pays

    // Volume de base proportionnel au surplus/déficit et à l'écart de prix
    let volume = 0

    if (balance > 0) {
      // Surplus → export naturel, amplifié si prix voisin > prix FR
      const fraction = Math.min(1, balance / 20000)  // normaliser sur 20 GW max
      volume = fraction * capacite_max * 0.4          // utilisation max 40% de la capacité en base
      if (diff_prix > 0) volume += Math.min(capacite_max * 0.4, diff_prix * 8)
    } else {
      // Déficit → import naturel
      const fraction = Math.min(1, Math.abs(balance) / 15000)
      volume = -(fraction * capacite_max * 0.3)
      if (diff_prix < 0) volume -= Math.min(capacite_max * 0.3, Math.abs(diff_prix) * 6)
    }

    // Contrainte espagne — goulet d'étranglement pyrénéen historique
    if (pays === 'espagne') volume = Math.max(-800, Math.min(800, volume))

    // Clamp capacité physique
    volume = Math.max(-capacite_max, Math.min(capacite_max, volume))

    // Arrondir
    echanges[pays] = Math.round(volume)
  })

  // ── Modificateurs selon les décisions du joueur ─────────────

  // Arrêt nucléaire → moins de surplus → moins d'export / plus d'import
  const nucleaire_pct = etatJeu.part_nucleaire_mix_pct ?? 68
  if (nucleaire_pct < 50) {
    Object.keys(echanges).forEach(pays => {
      echanges[pays] = Math.round(echanges[pays] * 0.6)
    })
    evenements.push({ emoji: '⚛️', titre: 'Réduction nucléaire : capacité d\'export en baisse' })
  }

  // EPR2 terminé → boost production → surplus accru
  if (etatJeu.avancement_epr2_pct >= 100) {
    echanges.allemagne_belgique = Math.min(CAPACITES_INTERCONNEXION.allemagne_belgique, (echanges.allemagne_belgique ?? 0) + 800)
    echanges.italie             = Math.min(CAPACITES_INTERCONNEXION.italie,             (echanges.italie ?? 0) + 600)
    evenements.push({ emoji: '⚛️', titre: 'EPR2 opérationnel : surplus d\'export +1,4 GW' })
  }

  // Crise iranienne → prix baril élevé → gaz cher → prix élec FR monte → moins compétitif à l'export
  if ((etatJeu.prix_baril_dollars ?? 80) > 120) {
    echanges.angleterre         = Math.round((echanges.angleterre ?? 0) * 0.75)
    echanges.allemagne_belgique = Math.round((echanges.allemagne_belgique ?? 0) * 0.80)
    evenements.push({ emoji: '🛢️', titre: 'Pétrole >120$ : coût de l\'énergie FR en hausse, export réduit' })
  }

  // Maintenance centrale → réduction proportionnelle à la capacité perdue
  const maintenance = etatJeu.infrastructures_en_maintenance ?? []
  if (maintenance.length > 0) {
    const mw_perdu = maintenance.reduce((s, infra) => s + (infra.puissance_mw ?? 0), 0)
    if (mw_perdu > 2000) {
      const ratio = Math.max(0.3, 1 - mw_perdu / 60000)
      Object.keys(echanges).forEach(pays => {
        if (echanges[pays] > 0) echanges[pays] = Math.round(echanges[pays] * ratio)
      })
      evenements.push({ emoji: '🔧', titre: `Maintenance : −${Math.round(mw_perdu / 1000)} GW, export réduit` })
    }
  }

  // Fermeture détroit d'Ormuz → pétrole +++ → gaz +++ → mix fossile renchéri
  if (etatJeu.mer_rouge_fermee) {
    echanges.italie   = Math.max(-CAPACITES_INTERCONNEXION.italie, (echanges.italie ?? 0) - 400)
    echanges.espagne  = Math.max(-CAPACITES_INTERCONNEXION.espagne, (echanges.espagne ?? 0) - 300)
  }

  // VNU activé → électricité moins chère pour industrie → conso FR monte → moins d'export
  const vnu = etatJeu.affectation_vnu
  if (vnu && (vnu.subvention_industrie_pct ?? 0) > 30) {
    Object.keys(echanges).forEach(pays => {
      if (echanges[pays] > 0) echanges[pays] = Math.round(echanges[pays] * 0.85)
    })
  }

  // ── Solde total ─────────────────────────────────────────────
  const solde_total = Object.values(echanges).reduce((s, v) => s + v, 0)

  return {
    echanges_mw: { ...echanges, solde_total: Math.round(solde_total) },
    solde_total:  Math.round(solde_total),
    evenements,
  }
}

// ─────────────────────────────────────────────────────────────
// PRIX DE MARCHÉ DES VOISINS — sensible aux événements
// ─────────────────────────────────────────────────────────────
function _getPrixVoisin(pays, etatJeu) {
  let prix = PRIX_MARCHE_BASE[pays] ?? 90

  // Crise iranienne → gaz cher → prix monte en Europe (sauf FR, forte nucléaire)
  const baril = etatJeu.prix_baril_dollars ?? 80
  if (baril > 100) {
    const coeff = pays === 'allemagne_belgique' ? 1.4 : 1.2  // DE très dépendant gaz
    prix += (baril - 100) * coeff
  }

  // Hiver → pic de conso → prix monte
  const mois = new Date().getMonth() // 0=jan, 11=dec
  if (mois <= 1 || mois >= 11) prix += 15

  return Math.round(prix)
}

// ─────────────────────────────────────────────────────────────
// IMPACT DES ÉCHANGES SUR L'ÉTAT DU JEU
// ─────────────────────────────────────────────────────────────

/**
 * Calcule les revenus/coûts des échanges en milliards €/an
 * (simplifié pour le gameplay)
 */
export function calculerRevenusEchanges(echanges_mw, prix_fr) {
  const prix = prix_fr ?? 95
  let revenu_annuel_milliards = 0

  Object.entries(echanges_mw).forEach(([pays, mw]) => {
    if (pays === 'solde_total') return
    const prix_voisin = PRIX_MARCHE_BASE[pays] ?? 90
    const heures_an   = 8760

    if (mw > 0) {
      // Export : vente au prix du marché voisin
      revenu_annuel_milliards += (mw / 1000) * prix_voisin * heures_an / 1e9
    } else {
      // Import : achat au prix voisin + coût de transport
      revenu_annuel_milliards += (mw / 1000) * prix_voisin * heures_an / 1e9
    }
  })

  return Math.round(revenu_annuel_milliards * 10) / 10
}

// ─────────────────────────────────────────────────────────────
// RÉSUMÉ TEXTUEL POUR L'UI
// ─────────────────────────────────────────────────────────────
export function getAnalyseEchanges(etatJeu) {
  const e      = etatJeu.echanges_mw ?? {}
  const solde  = e.solde_total ?? 0
  const prod   = etatJeu.production_mw?.total_mw ?? 0
  const conso  = etatJeu.consommation_mw ?? 0
  const nucl   = etatJeu.part_nucleaire_mix_pct ?? 68

  const lignes = []

  if (solde > 3000) {
    lignes.push('🔋 La France est un exportateur net majeur. Le nucléaire assure la compétitivité.')
  } else if (solde > 0) {
    lignes.push('📤 Léger excédent d\'export. La France équilibre bien production et consommation.')
  } else if (solde > -2000) {
    lignes.push('📥 Légère dépendance aux imports. Surveiller la capacité de production.')
  } else {
    lignes.push('⚠️ Forte dépendance aux imports. Risque de tension sur l\'approvisionnement.')
  }

  if (nucl < 40) {
    lignes.push('⚛️ La part nucléaire faible réduit structurellement la capacité d\'export.')
  }

  if ((e.espagne ?? 0) < -500) {
    lignes.push('🇪🇸 Import massif depuis l\'Espagne. Interconnexion pyrénéenne saturée ?')
  }

  if ((e.suisse ?? 0) > 2000) {
    lignes.push('🇨🇭 Export important vers la Suisse — bonne compétitivité du mix français.')
  }

  return lignes
}
