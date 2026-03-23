// ═══════════════════════════════════════════════════════════
// MOTEUR LÉGISLATIF — France 2026
// Compatible avec catalogue-lois.js (structure BLOC_*)
// ═══════════════════════════════════════════════════════════

import { CATALOGUE_LOIS } from '../data/lois/catalogue-lois.js'

// ─── IDs exclus du catalogue (leviers UI, pas des lois) ───
const LOIS_EXCLUES = new Set(['art_49_3', 'art_50_1'])

// ─── Aplatit les 6 blocs en tableau plat ───────────────────
export function getToutesLois() {
  try {
    return Object.values(CATALOGUE_LOIS).flat()
  } catch {
    return []
  }
}

// ─── Lois disponibles selon l'état du jeu ──────────────────
export function getLoisDisponibles(etatJeu) {
  return getToutesLois().filter(loi => {
    if (!loi?.id) return false
    if (LOIS_EXCLUES.has(loi.id)) return false

    const c = loi.conditions ?? {}

    // Conditions bloquantes
    if (c.popularite_min  != null && (etatJeu?.popularite_joueur ?? 50)              < c.popularite_min)  return false
    if (c.stabilite_min   != null && (etatJeu?.stabilite ?? 58)                      < c.stabilite_min)   return false
    if (c.stabilite_max   != null && (etatJeu?.stabilite ?? 58)                      > c.stabilite_max)   return false
    if (c.reserve_min     != null && (etatJeu?.reserve_budgetaire_milliards ?? 28)   < c.reserve_min)     return false
    if (c.prix_baril_min  != null && (etatJeu?.prix_baril ?? 80)                     < c.prix_baril_min)  return false
    if (c.relation_ue_max != null && (etatJeu?.relation_ue ?? 20)                    > c.relation_ue_max) return false
    if (c.tension_sociale_min != null && (etatJeu?.tension_sociale ?? 45)            < c.tension_sociale_min) return false
    if (c.scandale_actif  && !etatJeu?.scandale_actif) return false
    if (c.majorite_perdue && !etatJeu?.majorite_perdue) return false

    // Lois déjà votées
    if (etatJeu?.lois_votees?.includes(loi.id)) return false

    return true
  })
}

// ─── Récupère une loi par ID ────────────────────────────────
export function getLoi(id) {
  return getToutesLois().find(l => l.id === id) ?? null
}

// ─── Calcule la probabilité de vote ────────────────────────
export function calculerProbaVoteLoi(loiId, etatJeu, hemicycle, bonusVote = 0) {
  const loi = getLoi(loiId)
  if (!loi) return { proba: 0, voix_pour: 0, voix_contre: 0, voix_abstention: 0 }

  const total = Object.values(hemicycle).reduce((s, v) => s + v, 0)
  const majorite = Math.floor(total / 2) + 1

  let voix_pour       = 0
  let voix_contre     = 0
  let voix_abstention = 0

  // Mapping partis hemicycle → ID catalogue
  const MAP_PARTI = {
    LFI: 'LFI', TRAVAILLEURS: 'LFI', PS_ECO: 'PS_ECO',
    EPR: 'EPR', LR: 'LR', PATRIOTES: 'PATRIOTES',
    UPR: 'UPR', RN: 'RN', ANIMALISTE: 'PS_ECO', DIVERS: null,
  }

  Object.entries(hemicycle).forEach(([groupe, sieges]) => {
    const partiId = MAP_PARTI[groupe]
    const favorable = partiId && loi.partis_favorables?.includes(partiId)
    const hostile   = partiId && loi.partis_hostiles?.includes(partiId)

    if (favorable)       voix_pour       += sieges
    else if (hostile)    voix_contre     += sieges
    else                 voix_abstention += sieges
  })

  voix_pour += bonusVote

  const proba = voix_pour >= majorite ? 1 :
    Math.max(0, Math.min(1, voix_pour / majorite))

  return { proba, voix_pour, voix_contre, voix_abstention, majorite }
}

// ─── Soumet une loi au vote et applique les effets ─────────
export function soumettreLoiAuVote(loiId, etatJeu, hemicycle, bonusVote = 0) {
  const loi = getLoi(loiId)
  if (!loi) return null

  const { proba, voix_pour, voix_contre, majorite } = calculerProbaVoteLoi(
    loiId, etatJeu, hemicycle, bonusVote
  )

  const adoptee = voix_pour >= majorite
  let nouvelEtat = { ...etatJeu }

  if (adoptee) {
    // Appliquer les impacts
    Object.entries(loi.impacts ?? {}).forEach(([cle, valeur]) => {
      if (typeof valeur === 'number' && typeof nouvelEtat[cle] === 'number') {
        nouvelEtat[cle] = Math.round((nouvelEtat[cle] + valeur) * 10) / 10
      }
    })
    // Clamp popularité et tension
    nouvelEtat.popularite_joueur = Math.max(0, Math.min(100, nouvelEtat.popularite_joueur ?? 42))
    nouvelEtat.tension_sociale   = Math.max(0, Math.min(100, nouvelEtat.tension_sociale ?? 45))
  }

  const lois_votees = adoptee
    ? [...(etatJeu.lois_votees ?? []), loiId]
    : (etatJeu.lois_votees ?? [])

  return {
    adoptee,
    voix_pour,
    voix_contre,
    majorite,
    loi,
    etat: nouvelEtat,
    lois_votees,
  }
}
