import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

const HEMICYCLE_DEFAULT = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112,
  EPR: 98, LR: 62, PATRIOTES: 18,
  UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

// IDs des leviers constitutionnels — exclus du catalogue jouable
const LEVIERS_CONSTITUTIONNELS = ['art_49_3', 'art_50_1']

function calculerVote(loi, hemicycle, bonusVote = 0) {
  const h = hemicycle ?? HEMICYCLE_DEFAULT
  const total = Object.values(h).reduce((a, b) => a + b, 0)
  let pour = 0
  for (const [parti, sieges] of Object.entries(h)) {
    if (loi.partis_favorables?.includes(parti)) pour += sieges * 0.90
    else if (loi.partis_hostiles?.includes(parti)) pour += sieges * 0.05
    else pour += sieges * 0.35
  }
  const pct_base = Math.round((pour / total) * 100)
  return Math.min(99, pct_base + bonusVote)
}

function verifierConditions(loi, etatJeu) {
  const errs = []
  const c = loi.conditions ?? {}
  if (c.popularite_min && etatJeu.popularite_joueur < c.popularite_min)
    errs.push(`Popularité insuffisante (${Math.round(etatJeu.popularite_joueur)}% < ${c.popularite_min}%)`)
  if (c.reserve_min && etatJeu.reserve_budgetaire_milliards < c.reserve_min)
    errs.push(`Réserve insuffisante (${etatJeu.reserve_budgetaire_milliards} Md€ < ${c.reserve_min} Md€)`)
  if (c.stabilite_min && etatJeu.stabilite < c.stabilite_min)
    errs.push(`Stabilité insuffisante`)
  if (c.prix_baril_min && (etatJeu.prix_baril ?? 80) < c.prix_baril_min)
    errs.push(`Prix du baril insuffisant (${etatJeu.prix_baril ?? 80}$ < ${c.prix_baril_min}$)`)
  if (c.scandale_actif && !etatJeu.scandale_actif)
    errs.push(`Nécessite un scandale actif`)
  return errs
}

function appliquerImpacts(etat, impacts) {
  const e = { ...etat }
  for (const [indicateur, valeur] of Object.entries(impacts)) {
    if (indicateur === 'popularite') {
      e.popularite_joueur = Math.max(0, Math.min(100, (e.popularite_joueur ?? 0) + valeur))
    } else if (indicateur in e) {
      e[indicateur] = Math.round((e[indicateur] + valeur) * 10) / 10
    }
  }
  // Recalcul stabilité
  const greves = (e.tension_sociale ?? 45) / 10
  const contraintesUE = Math.max(0, -(e.relation_ue ?? 0)) / 20
  e.stabilite = Math.round(Math.max(0, Math.min(100,
    (e.popularite_joueur ?? 42) - greves - contraintesUE
  )))
  return e
}

export function soumettreLoiAuVote(loiId, etatJeu, hemicycle = HEMICYCLE_DEFAULT, bonusVote = 0) {
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
      etat: etatJeu,
      lois_votees: etatJeu.lois_votees ?? [],
    }
  }

  const pct_vote = calculerVote(loi, hemicycle, bonusVote)
  const adoptee = pct_vote > 50

  if (!adoptee) {
    return {
      loi_id: loiId,
      adoptee: false,
      probabilite_vote: pct_vote / 100,
      alertes: [{ message: `Rejetée à ${pct_vote}% des voix` }],
      impacts_appliques: {},
      etat: etatJeu,
      lois_votees: etatJeu.lois_votees ?? [],
    }
  }

  const nouvel_etat = appliquerImpacts(etatJeu, loi.impacts ?? {})
  // ✅ On archive la loi adoptée dans lois_votees
  const lois_votees_avant = etatJeu.lois_votees ?? []
  const lois_votees = lois_votees_avant.includes(loiId)
    ? lois_votees_avant
    : [...lois_votees_avant, loiId]

  return {
    loi_id: loiId,
    adoptee: true,
    probabilite_vote: pct_vote / 100,
    impacts_appliques: loi.impacts ?? {},
    etat: { ...nouvel_etat, lois_votees },
    lois_votees,
    alertes: [],
    resume: `✅ "${loi.titre}" adoptée à ${pct_vote}% des voix.`,
    evenements: loi.evenements_secondaires ?? [],
    loi,
  }
}

export function getLoisDisponibles(etatJeu) {
  const toutes = Object.values(CATALOGUE_LOIS).flat()
  const lois_votees = etatJeu.lois_votees ?? []
  return toutes.filter(loi => {
    // Exclure les leviers constitutionnels du catalogue
    if (LEVIERS_CONSTITUTIONNELS.includes(loi.id)) return false
    // Exclure les lois déjà votées
    if (lois_votees.includes(loi.id)) return false
    // Exclure les événements non-jouables
    if (loi.parti_auteur === 'EVENEMENT') return false
    const c = loi.conditions ?? {}
    if (c.popularite_min && etatJeu.popularite_joueur < c.popularite_min) return false
    if (c.reserve_min && etatJeu.reserve_budgetaire_milliards < c.reserve_min) return false
    if (c.prix_baril_min && (etatJeu.prix_baril ?? 80) < c.prix_baril_min) return false
    if (c.scandale_actif && !etatJeu.scandale_actif) return false
    return true
  })
}

export function calculerProbaVoteLoi(loiId, etatJeu, hemicycle = HEMICYCLE_DEFAULT, bonusVote = 0) {
  const toutes = Object.values(CATALOGUE_LOIS).flat()
  const loi = toutes.find(l => l.id === loiId)
  if (!loi) return { pct_base: 0, pct_bonus: 0 }
  const total = Object.values(hemicycle).reduce((a, b) => a + b, 0)
  let pour = 0
  for (const [parti, sieges] of Object.entries(hemicycle)) {
    if (loi.partis_favorables?.includes(parti)) pour += sieges * 0.90
    else if (loi.partis_hostiles?.includes(parti)) pour += sieges * 0.05
    else pour += sieges * 0.35
  }
  const pct_base = Math.round((pour / total) * 100)
  const pct_bonus = Math.min(99, pct_base + bonusVote)
  return { pct_base, pct_bonus }
}
