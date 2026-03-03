import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

const HEMICYCLE_DEFAULT = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112,
  EPR: 98, LR: 62, PATRIOTES: 18,
  UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

function calculerVote(loi, hemicycle) {
  const total = Object.values(hemicycle).reduce((a, b) => a + b, 0)
  let pour = 0
  for (const [parti, sieges] of Object.entries(hemicycle)) {
    if (loi.partis_favorables.includes(parti)) pour += sieges * 0.90
    else if (loi.partis_hostiles.includes(parti)) pour += sieges * 0.05
    else pour += sieges * 0.35
  }
  return Math.round((pour / total) * 100)
}

function verifierConditions(loi, etatJeu) {
  const errs = []
  const c = loi.conditions ?? {}
  if (c.popularite_min && etatJeu.popularite_joueur < c.popularite_min)
    errs.push(`Popularité insuffisante (${etatJeu.popularite_joueur}% < ${c.popularite_min}%)`)
  if (c.reserve_min && etatJeu.reserve_budgetaire_milliards < c.reserve_min)
    errs.push(`Réserve insuffisante (${etatJeu.reserve_budgetaire_milliards} Md€ < ${c.reserve_min} Md€)`)
  if (c.stabilite_min && etatJeu.stabilite < c.stabilite_min)
    errs.push(`Stabilité insuffisante`)
  if (c.prix_baril_min && (etatJeu.prix_baril ?? 80) < c.prix_baril_min)
    errs.push(`Prix du baril insuffisant`)
  return errs
}

function appliquerImpacts(etat, impacts) {
  const nouvelEtat = { ...etat }
  for (const [indicateur, valeur] of Object.entries(impacts)) {
    if (indicateur === 'popularite') {
      nouvelEtat.popularite_joueur = Math.max(0, Math.min(100, (nouvelEtat.popularite_joueur ?? 0) + valeur))
    } else if (indicateur in nouvelEtat) {
      nouvelEtat[indicateur] = Math.round((nouvelEtat[indicateur] + valeur) * 10) / 10
    }
  }
  // Recalcul stabilité
  const greves = nouvelEtat.tension_sociale / 10
  const contraintesUE = Math.max(0, -nouvelEtat.relation_ue) / 20
  nouvelEtat.stabilite = Math.round(Math.max(0, Math.min(100,
    nouvelEtat.popularite_joueur - greves - contraintesUE
  )))
  return nouvelEtat
}

export function soumettreLoiAuVote(loiId, etatJeu, hemicycle = HEMICYCLE_DEFAULT) {
  // Chercher la loi dans toutes les sections du catalogue
  const toutes = Object.values(CATALOGUE_LOIS).flat()
  const loi = toutes.find(l => l.id === loiId)
  if (!loi) throw new Error(`Loi "${loiId}" introuvable.`)

  const erreurs = verifierConditions(loi, etatJeu)
  if (erreurs.length > 0) {
    return {
      loi_id: loiId,
      adoptee: false,
      alertes: erreurs.map(m => ({ message: m })),
      impacts_appliques: {},
    }
  }

  const pct_vote = calculerVote(loi, hemicycle)
  const adoptee = pct_vote > 50

  if (!adoptee) {
    return {
      loi_id: loiId,
      adoptee: false,
      probabilite_vote: pct_vote / 100,
      alertes: [{ message: `Rejetée à ${pct_vote}% des voix` }],
      impacts_appliques: {},
    }
  }

  const nouvel_etat = appliquerImpacts(etatJeu, loi.impacts ?? {})

  return {
    loi_id: loiId,
    adoptee: true,
    probabilite_vote: pct_vote / 100,
    impacts_appliques: loi.impacts ?? {},
    nouvel_etat,
    alertes: [],
    resume: `✅ "${loi.titre}" adoptée à ${pct_vote}% des voix.`,
    evenements: loi.evenements_secondaires ?? [],
  }
}

export function getLoisDisponibles(etatJeu) {
  const toutes = Object.values(CATALOGUE_LOIS).flat()
  return toutes.filter(loi => {
    const c = loi.conditions ?? {}
    if (c.popularite_min && etatJeu.popularite_joueur < c.popularite_min) return false
    if (c.reserve_min && etatJeu.reserve_budgetaire_milliards < c.reserve_min) return false
    if (c.prix_baril_min && (etatJeu.prix_baril ?? 80) < c.prix_baril_min) return false
    if (c.scandale_actif && !etatJeu.scandale_actif) return false
    return true
  })
}
