/**
 * France 2026 — Moteur IA des Partis Adverses
 * Intègre les profils idéologiques détaillés de RN et LR
 */

import {
  PROFIL_RN, PROFIL_LR,
  choisirAmendement, choisirAttaqueMediatique,
  verifierLigneRouge, genererDiscours,
} from '../data/profils-partis.js'

// ─────────────────────────────────────────────────────────────
// PROFILS DES PARTIS (Agents IA)
// ─────────────────────────────────────────────────────────────

export const PROFILS_PARTIS = {

  LFI: {
    nom: 'La France Insoumise',
    couleur: '#cc0000',
    chef: 'Jean-Luc Mélenchon',
    positionnement: { gauche_droite: -4, souverainisme: 0.3, europeisme: -0.2 },
    agressivite: 0.9,
    discipline: 0.85,
    agenda_prioritaire: ['retraite_60','nationalisation_energie','isf_retour','smic_1600','regularisation_migrants'],
    seuils_coalition: { PS_ECO: 0.6, TRAVAILLEURS: 0.9, ANIMALISTE: 0.4, EPR: 0.1, RN: -1, LR: -1 },
    reactions: {
      retraite_64_maintien:    { type: 'MOTION_CENSURE',         intensite: 0.9 },
      baisse_impots_riches:    { type: 'MANIFESTATION',          intensite: 0.95 },
      reforme_code_travail:    { type: 'GREVE_GENERALE',         intensite: 0.8 },
      nationalisation_energie: { type: 'SOUTIEN',                intensite: 1.0 },
      vnu_activation:          { type: 'SOUTIEN_PARTIEL',        intensite: 0.6 },
    },
    initiatives: { tension_sociale_seuil: 60, popularite_joueur_seuil: 35, inflation_seuil: 3.5 },
  },

  PS_ECO: {
    nom: 'Parti Socialiste — Écologistes',
    couleur: '#ff8c00',
    chef: 'Olivier Faure',
    positionnement: { gauche_droite: -2, souverainisme: 0.1, europeisme: 0.5 },
    agressivite: 0.55,
    discipline: 0.70,
    agenda_prioritaire: ['isf_retour','transition_energetique','loi_zan','retraite_62','aide_logement'],
    seuils_coalition: { LFI: 0.55, TRAVAILLEURS: 0.5, ANIMALISTE: 0.7, EPR: 0.3, LR: 0.1, RN: -1 },
    reactions: {
      loi_zan_abrogation:    { type: 'MANIFESTATION',   intensite: 0.85 },
      baisse_aides_sociales: { type: 'MOTION_CENSURE',  intensite: 0.7  },
      vnu_activation:        { type: 'SOUTIEN',         intensite: 0.8  },
      reforme_immigration:   { type: 'OPPOSITION',      intensite: 0.75 },
    },
    initiatives: { tension_sociale_seuil: 55, popularite_joueur_seuil: 30, inflation_seuil: 4.0 },
  },

  EPR: {
    nom: 'Renaissance (EPR)',
    couleur: '#ffcc00',
    chef: 'Gabriel Attal',
    positionnement: { gauche_droite: 0, souverainisme: -0.1, europeisme: 0.9 },
    agressivite: 0.3,
    discipline: 0.75,
    agenda_prioritaire: ['plan_relance_industriel','reforme_marche_travail','investissement_epr2','accord_libre_echange'],
    seuils_coalition: { LR: 0.55, PS_ECO: 0.35, ANIMALISTE: 0.3, LFI: 0.05, RN: 0.1 },
    reactions: {
      frexit:          { type: 'CRISE_INSTITUTIONNELLE', intensite: 1.0  },
      nationalisation: { type: 'OPPOSITION',             intensite: 0.85 },
      vnu_activation:  { type: 'SOUTIEN',                intensite: 0.9  },
    },
    initiatives: { tension_sociale_seuil: 75, popularite_joueur_seuil: 20, deficit_seuil: 6.0 },
  },

  // LR — profil enrichi via PROFIL_LR
  LR: {
    nom: PROFIL_LR.nom,
    couleur: PROFIL_LR.couleur,
    chef: PROFIL_LR.chefs[0],
    positionnement: { gauche_droite: 2, souverainisme: 0.4, europeisme: 0.3 },
    agressivite: 0.6,
    discipline: 0.65,
    agenda_prioritaire: ['immigration_controle','securite_renforcee','baisse_charges_entreprises','reforme_retraites_maintien'],
    seuils_coalition: { EPR: 0.6, RN: 0.4, PATRIOTES: 0.5, PS_ECO: 0.15, LFI: -1 },
    reactions: {
      retraite_60:       { type: 'MOTION_CENSURE', intensite: 0.9  },
      isf_retour:        { type: 'OPPOSITION',     intensite: 0.85 },
      nationalisation:   { type: 'OPPOSITION',     intensite: 0.8  },
      securite_renforcee:{ type: 'SOUTIEN',        intensite: 0.9  },
    },
    initiatives: { tension_sociale_seuil: 65, popularite_joueur_seuil: 28, inflation_seuil: 3.0 },
    // Lignes rouges : vote automatiquement contre si la loi est dans cette liste
    lignes_rouges: PROFIL_LR.lignes_rouges,
  },

  // RN — profil enrichi via PROFIL_RN
  RN: {
    nom: PROFIL_RN.nom,
    couleur: PROFIL_RN.couleur,
    chef: PROFIL_RN.chefs[0],
    positionnement: { gauche_droite: 3, souverainisme: 0.75, europeisme: -0.1 },
    agressivite: 0.85,
    discipline: 0.90,
    agenda_prioritaire: ['immigration_controle','priorite_nationale','baisse_tva_carburant','desindexation_electricite_gaz','referendum_ue'],
    seuils_coalition: { PATRIOTES: 0.85, LR: 0.35, EPR: 0.05, LFI: -1, PS_ECO: -1 },
    reactions: {
      hausse_prix_carburant:      { type: 'MANIFESTATION',          intensite: 0.95 },
      reforme_immigration_douce:  { type: 'OPPOSITION',             intensite: 0.9  },
      vnu_surprofit:              { type: 'SOUTIEN_PARTIEL',        intensite: 0.5  },
      scandale_etat_profond:      { type: 'EXPLOITATION_MEDIATIQUE',intensite: 1.0  },
    },
    initiatives: {
      tension_sociale_seuil: 50,
      popularite_joueur_seuil: 40,
      inflation_seuil: 2.5,
      baril_seuil: 100,
    },
    lignes_rouges: PROFIL_RN.lignes_rouges,
  },

  PATRIOTES: {
    nom: 'Les Patriotes',
    couleur: '#003399',
    chef: 'Florian Philippot',
    positionnement: { gauche_droite: 2.5, souverainisme: 1.0, europeisme: -1.0 },
    agressivite: 0.75,
    discipline: 0.80,
    agenda_prioritaire: ['referendum_ue','sortie_otan','nationalisation_energie','desindexation_electricite_gaz'],
    seuils_coalition: { RN: 0.8, LR: 0.3, LFI: 0.25, EPR: -1, PS_ECO: -1 },
    reactions: {
      accord_ue:             { type: 'MOTION_CENSURE',          intensite: 0.9 },
      vnu_activation:        { type: 'SOUTIEN',                 intensite: 0.7 },
      scandale_etat_profond: { type: 'EXPLOITATION_MEDIATIQUE', intensite: 1.0 },
      frexit:                { type: 'SOUTIEN',                 intensite: 1.0 },
    },
    initiatives: { tension_sociale_seuil: 55, popularite_joueur_seuil: 45, baril_seuil: 120 },
  },

  UPR: {
    nom: 'Union Populaire Républicaine',
    couleur: '#1a3a6b',
    chef: 'François Asselineau',
    positionnement: { gauche_droite: 0, souverainisme: 1.0, europeisme: -1.0 },
    agressivite: 0.60,
    discipline: 0.95,
    agenda_prioritaire: ['frexit_article_50','sortie_otan','sortie_euro','souverainete_monetaire'],
    seuils_coalition: { PATRIOTES: 0.0, RN: 0.15, LFI: 0.20, EPR: -1, LR: -1, PS_ECO: -1 },
    reactions: {
      accord_ue:             { type: 'EXPLOITATION_MEDIATIQUE',  intensite: 1.0 },
      frexit:                { type: 'SOUTIEN',                  intensite: 1.0 },
      traite_europeen:       { type: 'CRISE_INSTITUTIONNELLE',   intensite: 0.9 },
    },
    initiatives: { tension_sociale_seuil: 65, popularite_joueur_seuil: 48, baril_seuil: 130 },
  },

  TRAVAILLEURS: {
    nom: 'Parti des Travailleurs',
    couleur: '#8b0000',
    chef: 'Nathalie Arthaud',
    positionnement: { gauche_droite: -5, souverainisme: 0.2, europeisme: -0.3 },
    agressivite: 0.70,
    discipline: 0.95,
    agenda_prioritaire: ['greve_generale','nationalisation_energie','smic_1800','retraite_55'],
    seuils_coalition: { LFI: 0.8, PS_ECO: 0.4, RN: -1, EPR: -1, LR: -1 },
    reactions: {
      reforme_code_travail: { type: 'GREVE_GENERALE', intensite: 1.0 },
      baisse_allocations:   { type: 'GREVE_GENERALE', intensite: 0.9 },
      nationalisation:      { type: 'SOUTIEN',        intensite: 1.0 },
    },
    initiatives: { tension_sociale_seuil: 45, popularite_joueur_seuil: 50, inflation_seuil: 2.0 },
  },

  BERCY: {
    nom: 'IA Bercy (Agent Institutionnel)',
    couleur: '#334155',
    chef: 'Directeur du Budget',
    positionnement: { gauche_droite: 0, souverainisme: 0, europeisme: 0.6 },
    agressivite: 0.4,
    discipline: 1.0,
    agenda_prioritaire: [],
    reactions: {
      deficit_depasse_5pct: { type: 'AVERTISSEMENT_BUDGETAIRE', intensite: 1.0 },
      deficit_depasse_6pct: { type: 'PLAN_AUSTERITE_FORCE',     intensite: 1.0 },
      loi_cout_20md:        { type: 'OPPOSITION_TECHNIQUE',     intensite: 0.8 },
    },
    initiatives: { deficit_seuil: 5.0 },
  },

  BRUXELLES: {
    nom: 'IA Commission Européenne',
    couleur: '#003399',
    chef: 'Ursula von der Leyen',
    positionnement: { gauche_droite: 0, souverainisme: -1.0, europeisme: 1.0 },
    agressivite: 0.5,
    discipline: 1.0,
    agenda_prioritaire: [],
    reactions: {
      frexit:               { type: 'CRISE_INSTITUTIONNELLE', intensite: 1.0  },
      nationalisation:      { type: 'PROCEDURE_INFRACTION',   intensite: 0.9  },
      aide_etat_illegale:   { type: 'AMENDE_RECORD',          intensite: 0.85 },
      deficit_depasse_5pct: { type: 'MISE_EN_DEMEURE',        intensite: 0.8  },
      vnu_conforme:         { type: 'APPROBATION',            intensite: 0.9  },
    },
    initiatives: { deficit_seuil: 5.0, relation_ue_seuil: -50 },
  },
}

// ─────────────────────────────────────────────────────────────
// TYPES D'ACTIONS IA
// ─────────────────────────────────────────────────────────────

export const TYPES_ACTIONS = {
  MOTION_CENSURE:          { label: 'Motion de censure',          emoji: '⚖️', impact: { stabilite: -15, popularite_joueur: -8, tension_sociale: +10 } },
  MANIFESTATION:           { label: 'Appel à manifester',         emoji: '📣', impact: { tension_sociale: +12, popularite_joueur: -5, stabilite: -8 } },
  GREVE_GENERALE:          { label: 'Grève générale',             emoji: '✊', impact: { tension_sociale: +20, pib_croissance_pct: -0.3, popularite_joueur: -10 } },
  EXPLOITATION_MEDIATIQUE: { label: 'Exploitation médiatique',    emoji: '📺', impact: { popularite_joueur: -12, tension_sociale: +8 } },
  PROCEDURE_INFRACTION:    { label: "Procédure d'infraction UE",  emoji: '🇪🇺', impact: { relation_ue: -20, deficit_milliards: +8, indice_confiance_marches: -10 } },
  CRISE_INSTITUTIONNELLE:  { label: 'Crise institutionnelle',     emoji: '🚨', impact: { stabilite: -25, popularite_joueur: -15, indice_confiance_marches: -20 } },
  AVERTISSEMENT_BUDGETAIRE:{ label: 'Avertissement de Bercy',     emoji: '💸', impact: { indice_confiance_marches: -5 }, message: 'Le déficit dépasse le seuil européen. Des mesures correctrices s\'imposent.' },
  PLAN_AUSTERITE_FORCE:    { label: "Plan d'austérité forcé",     emoji: '📉', impact: { popularite_joueur: -20, tension_sociale: +15, deficit_milliards: -30 } },
  SOUTIEN:                 { label: 'Soutien public',             emoji: '👍', impact: { stabilite: +5, popularite_joueur: +3 } },
  SOUTIEN_PARTIEL:         { label: 'Soutien partiel',            emoji: '🤝', impact: { stabilite: +2 } },
  OPPOSITION:              { label: 'Opposition formelle',        emoji: '👎', impact: { stabilite: -5, popularite_joueur: -3 } },
  AMENDE_RECORD:           { label: 'Amende européenne',          emoji: '💰', impact: { deficit_milliards: +15, relation_ue: -30, indice_confiance_marches: -15 } },
  ATTAQUE_MEDIATIQUE:      { label: 'Attaque médiatique ciblée',  emoji: '🗞️', impact: { popularite_joueur: -7, tension_sociale: +4 } },
}

// ─────────────────────────────────────────────────────────────
// MESSAGES PAR DÉFAUT
// ─────────────────────────────────────────────────────────────

const MESSAGES = {
  LFI: {
    MOTION_CENSURE:          "Cette politique est une trahison du peuple. Nous déposons une motion de censure.",
    MANIFESTATION:           "Le peuple descend dans la rue. Le gouvernement doit entendre la colère sociale.",
    GREVE_GENERALE:          "Les travailleurs s'arrêtent. Rien ne bougera tant que leurs droits ne seront pas respectés.",
    EXPLOITATION_MEDIATIQUE: "Ce scandale prouve ce que nous disions : le système est corrompu jusqu'à l'os.",
  },
  // RN et LR utilisent leurs discours de profils-partis.js
  PATRIOTES: {
    MOTION_CENSURE:          "La souveraineté française est bradée. Il est temps de reprendre le contrôle.",
    EXPLOITATION_MEDIATIQUE: "Voilà ce que cache l'oligarchie mondialiste. La France doit se réveiller.",
  },
  BERCY: {
    AVERTISSEMENT_BUDGETAIRE: "Attention : le déficit dépasse le seuil de 5% fixé par Bruxelles. Des mesures correctrices sont indispensables.",
    PLAN_AUSTERITE_FORCE:     "La situation budgétaire est critique. Un plan d'économies structurel doit être activé immédiatement.",
  },
  BRUXELLES: {
    PROCEDURE_INFRACTION:    "La Commission européenne ouvre une procédure d'infraction contre la France pour non-conformité aux règles du marché intérieur.",
    CRISE_INSTITUTIONNELLE:  "L'Union européenne ne peut accepter une remise en cause de ses traités fondateurs.",
    AMENDE_RECORD:           "Une amende est infligée à la France pour aide d'État illégale.",
  },
}

function genererMessageParti(partiId, typeAction, contexte) {
  // RN et LR : utiliser les discours des profils enrichis
  if (partiId === 'RN') {
    const d = genererDiscours('RN', typeAction === 'MOTION_CENSURE' ? 'censure' : 'contre')
    return d ?? PROFIL_RN.chefs[0] + ' réagit.'
  }
  if (partiId === 'LR') {
    const d = genererDiscours('LR', typeAction === 'MOTION_CENSURE' ? 'censure' : 'contre')
    return d ?? PROFIL_LR.chefs[0] + ' réagit.'
  }
  return MESSAGES[partiId]?.[typeAction]
    ?? `${PROFILS_PARTIS[partiId]?.chef ?? partiId} réagit à la décision du gouvernement concernant ${contexte}.`
}

// ─────────────────────────────────────────────────────────────
// MOTEUR DE DÉCISION IA
// ─────────────────────────────────────────────────────────────

export function calculerReactionsIA(actionJoueur, etatJeu, hemicycle) {
  const actions = []
  for (const [partiId, profil] of Object.entries(PROFILS_PARTIS)) {
    // Vérifier ligne rouge RN/LR
    if ((partiId === 'RN' || partiId === 'LR') && verifierLigneRouge(partiId, actionJoueur)) {
      actions.push({
        parti: partiId,
        nom_parti: profil.nom,
        chef: profil.chef,
        type: 'MOTION_CENSURE',
        label: TYPES_ACTIONS.MOTION_CENSURE.label,
        emoji: TYPES_ACTIONS.MOTION_CENSURE.emoji,
        impact: TYPES_ACTIONS.MOTION_CENSURE.impact,
        message: genererMessageParti(partiId, 'MOTION_CENSURE', actionJoueur),
        ligne_rouge: true,
      })
      continue
    }

    const reaction = profil.reactions[actionJoueur]
    if (!reaction) continue
    const probabilite = profil.agressivite * reaction.intensite
    if (Math.random() > probabilite) continue
    const typeAction = TYPES_ACTIONS[reaction.type]
    if (!typeAction) continue

    actions.push({
      parti: partiId,
      nom_parti: profil.nom,
      chef: profil.chef,
      type: reaction.type,
      label: typeAction.label,
      emoji: typeAction.emoji,
      impact: typeAction.impact,
      message: genererMessageParti(partiId, reaction.type, actionJoueur),
    })
  }
  return actions
}

export function calculerInitiativesIA(etatJeu, hemicycle) {
  const initiatives = []
  for (const [partiId, profil] of Object.entries(PROFILS_PARTIS)) {
    const { initiatives: seuils } = profil
    if (!seuils) continue

    let declenche = false
    let type = null

    if (seuils.tension_sociale_seuil && etatJeu.tension_sociale >= seuils.tension_sociale_seuil) {
      declenche = true
      type = partiId === 'BERCY' ? 'AVERTISSEMENT_BUDGETAIRE' : 'MANIFESTATION'
    }
    if (seuils.popularite_joueur_seuil && etatJeu.popularite_joueur <= seuils.popularite_joueur_seuil) {
      declenche = true
      type = 'MOTION_CENSURE'
    }
    if (seuils.inflation_seuil && etatJeu.inflation_pct >= seuils.inflation_seuil) {
      declenche = true
      type = (partiId === 'RN' || partiId === 'PATRIOTES') ? 'EXPLOITATION_MEDIATIQUE' : 'MANIFESTATION'
    }
    if (seuils.deficit_seuil && etatJeu.deficit_pib_pct >= seuils.deficit_seuil) {
      declenche = true
      type = partiId === 'BERCY' ? 'PLAN_AUSTERITE_FORCE' : 'AVERTISSEMENT_BUDGETAIRE'
    }
    if (seuils.baril_seuil && etatJeu.prix_baril >= seuils.baril_seuil) {
      declenche = true
      type = 'EXPLOITATION_MEDIATIQUE'
    }

    if (!declenche || !type) continue
    if (Math.random() > profil.agressivite * 0.4) continue

    // RN et LR : attaque médiatique contextuelle si disponible
    if ((partiId === 'RN' || partiId === 'LR') && type === 'EXPLOITATION_MEDIATIQUE') {
      const attaque = choisirAttaqueMediatique(partiId, etatJeu)
      if (attaque) {
        initiatives.push({
          parti: partiId,
          nom_parti: profil.nom,
          chef: profil.chef,
          type: 'ATTAQUE_MEDIATIQUE',
          label: attaque.titre,
          emoji: '🗞️',
          impact: attaque.impact,
          message: attaque.texte,
          spontane: true,
        })
        continue
      }
    }

    const typeAction = TYPES_ACTIONS[type]
    if (!typeAction) continue
    initiatives.push({
      parti: partiId,
      nom_parti: profil.nom,
      chef: profil.chef,
      type,
      label: typeAction.label,
      emoji: typeAction.emoji,
      impact: typeAction.impact,
      message: genererMessageParti(partiId, type, 'INITIATIVE'),
      spontane: true,
    })
  }
  return initiatives
}

export function calculerCoalitions(objectif, hemicycle) {
  const coalitions = []
  const partisVus = new Set()
  for (const [partiA, profilA] of Object.entries(PROFILS_PARTIS)) {
    if (partisVus.has(partiA)) continue
    const coalition = [partiA]
    let siegesTotaux = hemicycle?.[partiA] ?? 0
    for (const [partiB, seuil] of Object.entries(profilA.seuils_coalition ?? {})) {
      if (seuil >= 0.4 && !partisVus.has(partiB)) {
        coalition.push(partiB)
        siegesTotaux += hemicycle?.[partiB] ?? 0
      }
    }
    if (coalition.length > 1 && siegesTotaux >= 150) {
      coalition.forEach(p => partisVus.add(p))
      coalitions.push({ partis: coalition, sieges: siegesTotaux, majorite_absolue: siegesTotaux >= 289, objectif })
    }
  }
  return coalitions
}

// ─────────────────────────────────────────────────────────────
// AMENDEMENTS COHÉRENTS POUR RN ET LR
// ─────────────────────────────────────────────────────────────

/**
 * Génère les amendements cohérents avec l'idéologie du parti
 * pour une loi donnée — remplace les templates génériques
 */
export function genererAmendementsCohérents(loi, hemicycle) {
  const amendements = []
  const partisHostiles = loi.partis_hostiles ?? []

  for (const partiId of ['RN', 'LR']) {
    if (!partisHostiles.includes(partiId)) continue

    const amendement = choisirAmendement(partiId, loi)
    if (!amendement) continue

    amendements.push({
      ...amendement,
      position_actuelle: 'contre',
      statut: 'en_attente',
      type: 'hostile',
      // Discours de justification issu des profils
      justification_complete: amendement.justification,
    })
  }

  return amendements
}

// ─────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export function tourIA(actionJoueur, etatJeu, hemicycle) {
  const reactions   = actionJoueur ? calculerReactionsIA(actionJoueur, etatJeu, hemicycle) : []
  const initiatives = calculerInitiativesIA(etatJeu, hemicycle ?? etatJeu?.hemicycle)
  const coalitions  = calculerCoalitions(actionJoueur, hemicycle ?? etatJeu?.hemicycle)

  return {
    reactions,
    initiatives,
    coalitions,
    total_evenements: reactions.length + initiatives.length,
  }
}
