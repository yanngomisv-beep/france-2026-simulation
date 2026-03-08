import { useState, useCallback } from 'react'
import { soumettreLoiAuVote, getLoisDisponibles } from '../engines/moteur-legislatif.js'
import { tourIA }                from '../engines/moteur-ia-partis.js'
import { tourMoteurVNU }         from '../engines/moteur-vnu.js'
import { tourMoteurScandales }   from '../engines/moteur-scandales.js'
import {
  getCurseursInitiaux,
  genererReformesTour,
  calculerCrisePotentielle,
  deplacerCurseur,
  AXES,
  getCouleurCurseur,
} from '../engines/moteur-curseurs.js'
import { getEtatInitialParti } from '../data/programmes-politiques.js'
import NotifReformes from './NotifReformes.jsx'

const HEMICYCLE_INITIAL = {
  LFI: 87, TRAVAILLEURS: 12, PS_ECO: 112, EPR: 98,
  LR: 62, PATRIOTES: 18, UPR: 8, RN: 178, ANIMALISTE: 4, DIVERS: 6,
}

const MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
]

const ETAT_SCANDALES_INITIAL = {
  dissimulation: 20,
  pression_mediatique: 15,
  consentement_impot: 75,
  stabilite_institutionnelle: 80,
  scandales_actifs: [],
  actions_secretes_actives: [],
  fuites_passees: [],
  nouveau_president_assemblee: false,
  president_assemblee_parti: 'EPR',
  commissions_enquete_actives: 0,
  mises_en_examen: 0,
  procedure_art68_active: false,
}

function getEtatBase(partiId) {
  const etatParti = getEtatInitialParti(partiId)
  return {
    // Politique
    popularite_joueur: 42,
    tension_sociale: 45,
    deficit_milliards: 173,
    stabilite: 58,
    reserve_budgetaire_milliards: 28,
    relation_ue: 20,
    inflation_pct: 2.8,
    pib_croissance_pct: 0.8,
    indice_confiance_marches: 50,
    consentement_impot: 55,
    date: '1er Mars 2026',
    tour: 1,
    hemicycle: { ...HEMICYCLE_INITIAL },
    lois_votees: [],
    parti_joueur: partiId,
    // Énergie
    prix_baril_dollars: 80,
    prix_baril: 80,
    prix_gaz_mwh: 38,
    prix_gaz: 38,
    prix_electricite: 72,
    prix_electricite_marche_mwh: 72,
    edf_rentable: true,
    edf_dette_milliards: 54,
    avancement_epr2_pct: 12,
    recettes_vnu_milliards: 0,
    mer_rouge_fermee: false,
    tensions_iran: false,
    dependance_gaz_etranger_pct: 72,
    part_nucleaire_mix_pct: 68,
    part_renouvelable_mix_pct: 24,
    affectation_vnu: {
      bouclier_menages_pct: 0,
      subvention_industrie_pct: 0,
      remboursement_dette_pct: 0,
      financement_epr2_pct: 0,
      reserve_pct: 100,
    },
    // Scandales (fusionnés dans l'état global)
    ...ETAT_SCANDALES_INITIAL,
    // Override avec données du parti choisi
    ...(etatParti ?? {}),
  }
}

export default function GameEngine({ partiJoueur, children }) {
  const [etatJeu, setEtatJeu]           = useState(() => getEtatBase(partiJoueur ?? 'HORIZONS'))
  const [curseurs, setCurseurs]         = useState(() => getCurseursInitiaux(partiJoueur ?? 'HORIZONS'))
  const [evenements, setEvenements]     = useState([])
  const [reformesTour, setReformesTour] = useState([])
  const [crisesActives, setCrisesActives]   = useState([])
  const [crisesResolues, setCrisesResolues] = useState([])
  const [loading, setLoading]           = useState(false)

  // ── Passer un tour ───────────────────────────────────────
  const passerTour = useCallback(() => {
    setLoading(true)
    const evs = []

    setEtatJeu(prev => {
      let etat = { ...prev }

      // ── Moteur IA partis ──
      try {
        const r = tourIA(etat)
        if (r?.etat) etat = { ...etat, ...r.etat }
        if (r?.evenements?.length) evs.push(...r.evenements)
      } catch (e) { console.warn('tourIA:', e.message) }

      // ── Moteur VNU énergétique ──
      try {
        const etatEnergie = {
          prix_baril_dollars: etat.prix_baril_dollars ?? 80,
          prix_gaz_mwh: etat.prix_gaz_mwh ?? 38,
          prix_electricite_marche_mwh: etat.prix_electricite_marche_mwh ?? 72,
          mer_rouge_fermee: etat.mer_rouge_fermee ?? false,
          tensions_iran: etat.tensions_iran ?? false,
          recettes_vnu_milliards: etat.recettes_vnu_milliards ?? 0,
          avancement_epr2_pct: etat.avancement_epr2_pct ?? 12,
          edf_rentable: etat.edf_rentable ?? true,
        }
        const r = tourMoteurVNU(etatEnergie, etat, etat.affectation_vnu)
        if (r?.nouvelEtatEnergie) etat = { ...etat, ...r.nouvelEtatEnergie }
        if (r?.resultat_affectation?.nouvelEtat) etat = { ...etat, ...r.resultat_affectation.nouvelEtat }
        if (r?.prix_electricite) {
          etat.prix_electricite = r.prix_electricite
          etat.prix_electricite_marche_mwh = r.prix_electricite
        }
        if (r?.evenements_declenches?.length) {
          evs.push(...r.evenements_declenches.map(e => ({
            titre: e.titre,
            emoji: e.emoji ?? '⚡',
          })))
        }
      } catch (e) { console.warn('tourMoteurVNU:', e.message) }

      // ── Moteur géopolitique ──
      try {
        const tourGeo = require('../engines/moteur-geopolitique.js')
        const fnGeo = tourGeo.tourGeopolitique ?? tourGeo.tourMoteurGeopolitique ?? tourGeo.default
        if (typeof fnGeo === 'function') {
          const r = fnGeo(etat)
          if (r?.etat) etat = { ...etat, ...r.etat }
          if (r?.evenements?.length) evs.push(...r.evenements)
        }
      } catch (e) { console.warn('tourGeopolitique:', e.message) }

      // ── Moteur scandales ──
      try {
        const etatScandales = {
          dissimulation: etat.dissimulation ?? 20,
          pression_mediatique: etat.pression_mediatique ?? 15,
          consentement_impot: etat.consentement_impot ?? 75,
          stabilite_institutionnelle: etat.stabilite_institutionnelle ?? 80,
          scandales_actifs: etat.scandales_actifs ?? [],
          actions_secretes_actives: etat.actions_secretes_actives ?? [],
          nouveau_president_assemblee: etat.nouveau_president_assemblee ?? false,
          commissions_enquete_actives: etat.commissions_enquete_actives ?? 0,
        }
        const r = tourMoteurScandales(etatScandales, etat)
        if (r?.nouvelEtat) etat = { ...etat, ...r.nouvelEtat }
        if (r?.nouvelEtatJeu) etat = { ...etat, ...r.nouvelEtatJeu }
        if (r?.nouveaux_scandales?.length) {
          evs.push(...r.nouveaux_scandales.map(s => ({
            titre: s.titre,
            emoji: s.emoji ?? '🚨',
