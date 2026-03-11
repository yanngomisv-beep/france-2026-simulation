// src/engines/moteur-energie-reel.js
// Appelé UNE SEULE FOIS au démarrage du jeu (GameEngine useEffect)
// Peuple etatJeu avec les données réelles ODRÉ éCO2mix, puis la simulation prend le relais

// ─────────────────────────────────────────────────────────────
// FALLBACKS CONTEXTUELS (Mars 2026, crise iranienne active)
// ─────────────────────────────────────────────────────────────
const FALLBACK = {
  // Prix
  prix_baril_dollars:          88,
  prix_gaz_mwh:                42,
  prix_electricite_marche_mwh: 95,
  prix_electricite:            95,

  // Mix
  part_nucleaire_mix_pct:    68,
  part_renouvelable_mix_pct: 22,
  part_gaz_mix_pct:           6,
  part_charbon_mix_pct:       1,

  // Production MW
  production_mw: {
    nucleaire_mw:   42000, eolien_mw:      8000,
    solaire_mw:      1000, hydraulique_mw: 9000,
    gaz_mw:          4000, charbon_mw:      200,
    fioul_mw:         100, bioenergies_mw: 1500,
    total_mw:       65800,
  },

  // Consommation
  consommation_mw:    62000,
  prevision_j_mw:     64000,
  prevision_j1_mw:    63000,

  // CO₂
  taux_co2_g_kwh: 52,

  // Échanges (positif = export France)
  echanges_mw: {
    angleterre: 1200, espagne: 400, italie: 900,
    suisse: 1800, allemagne_belgique: -400, solde_total: 3900,
  },

  source_donnees: 'fallback_contextuel',
  donnees_live:   false,
}

// ─────────────────────────────────────────────────────────────
// FETCH PRINCIPAL
// ─────────────────────────────────────────────────────────────
export async function chargerDonneesEnergie() {
  try {
    const res = await fetch('/api/energie', {
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const live = Object.values(data.source ?? {}).some(s => s === 'ODRE_LIVE' || s === 'oilpriceapi')
    const eco2mix_live = data.source?.eco2mix === 'ODRE_LIVE'

    return {
      // ── Prix ───────────────────────────────────────────────
      prix_baril_dollars:          data.prix_baril_dollars          ?? FALLBACK.prix_baril_dollars,
      prix_gaz_mwh:                FALLBACK.prix_gaz_mwh,            // pas dans éCO2mix, hardcodé
      prix_electricite_marche_mwh: FALLBACK.prix_electricite_marche_mwh,
      prix_electricite:            FALLBACK.prix_electricite,

      // ── Mix % ──────────────────────────────────────────────
      part_nucleaire_mix_pct:      data.mix_pct?.nucleaire    ?? FALLBACK.part_nucleaire_mix_pct,
      part_renouvelable_mix_pct:   data.mix_pct?.renouvelable ?? FALLBACK.part_renouvelable_mix_pct,
      part_gaz_mix_pct:            data.mix_pct?.gaz          ?? FALLBACK.part_gaz_mix_pct,
      part_charbon_mix_pct:        data.mix_pct?.charbon      ?? FALLBACK.part_charbon_mix_pct,

      // ── Production MW (nouveau — pas dans etatJeu avant) ───
      production_mw:               eco2mix_live ? data.production : FALLBACK.production_mw,

      // ── Consommation ───────────────────────────────────────
      consommation_mw:             data.consommation?.realisee_mw  ?? FALLBACK.consommation_mw,
      prevision_j_mw:              data.consommation?.prevision_j  ?? FALLBACK.prevision_j_mw,
      prevision_j1_mw:             data.consommation?.prevision_j1 ?? FALLBACK.prevision_j1_mw,

      // ── CO₂ ────────────────────────────────────────────────
      taux_co2_g_kwh:              data.taux_co2_g_kwh ?? FALLBACK.taux_co2_g_kwh,

      // ── Échanges frontaliers ────────────────────────────────
      echanges_mw:                 eco2mix_live ? data.echanges_mw : FALLBACK.echanges_mw,

      // ── Méta ───────────────────────────────────────────────
      source_donnees:              live ? 'ODRE_LIVE' : 'fallback_contextuel',
      donnees_live:                live,
      timestamp_donnees:           data.timestamp_eco2mix ?? data.timestamp ?? new Date().toISOString(),
    }
  } catch (e) {
    console.warn('chargerDonneesEnergie — fallback:', e.message)
    return { ...FALLBACK, timestamp_donnees: new Date().toISOString() }
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES D'AFFICHAGE
// ─────────────────────────────────────────────────────────────

// Résumé pour tooltip barre de stats
export function getResumeDonneesEnergie(etatJeu) {
  const live = etatJeu.donnees_live
  const ts   = etatJeu.timestamp_donnees?.slice(0, 16).replace('T', ' ') ?? ''
  return {
    badge:   live ? '🟢 Live' : '🟡 Estimé',
    source:  live ? 'ODRÉ éCO2mix (RTE)' : 'Valeurs contextuelles Mars 2026',
    tooltip: live
      ? `Données réelles RTE — MAJ : ${ts}`
      : 'ODRÉ non disponible. Valeurs estimées pour Mars 2026 (crise iranienne, Ormuz sous tension).',
  }
}

// Résumé échanges frontaliers pour l'UI
export function getResumeEchanges(etatJeu) {
  const e = etatJeu.echanges_mw
  if (!e) return null
  const solde = e.solde_total ?? 0
  const fmt = v => `${v > 0 ? '+' : ''}${(v ?? 0).toLocaleString('fr-FR')} MW`
  return {
    solde_mw:    solde,
    exportateur: solde > 0,
    label:       solde > 0
      ? `🔋 Export net : ${fmt(solde)}`
      : `⬇️ Import net : ${fmt(solde)}`,
    detail: [
      { pays: '🇬🇧 Angleterre',         val: e.angleterre },
      { pays: '🇩🇪🇧🇪 Allemagne/Belg.', val: e.allemagne_belgique },
      { pays: '🇨🇭 Suisse',             val: e.suisse },
      { pays: '🇮🇹 Italie',             val: e.italie },
      { pays: '🇪🇸 Espagne',            val: e.espagne },
    ].filter(d => d.val != null).map(d => ({ ...d, label: fmt(d.val) })),
  }
}

// Résumé mix pour un panneau dédié
export function getResumeMix(etatJeu) {
  const p = etatJeu.production_mw
  if (!p || p.total_mw == null) return null
  const total = p.total_mw
  const pct = v => total > 0 ? Math.round((v / total) * 100) : 0
  return [
    { label: '⚛️ Nucléaire',    mw: p.nucleaire_mw,    pct: pct(p.nucleaire_mw),    color: '#6366f1' },
    { label: '💧 Hydraulique',  mw: p.hydraulique_mw,  pct: pct(p.hydraulique_mw),  color: '#06b6d4' },
    { label: '💨 Éolien',       mw: p.eolien_mw,       pct: pct(p.eolien_mw),       color: '#22c55e' },
    { label: '☀️ Solaire',      mw: p.solaire_mw,      pct: pct(p.solaire_mw),      color: '#eab308' },
    { label: '🔥 Gaz',          mw: p.gaz_mw,          pct: pct(p.gaz_mw),          color: '#f97316' },
    { label: '🌿 Bioénergies',  mw: p.bioenergies_mw,  pct: pct(p.bioenergies_mw),  color: '#84cc16' },
    { label: '⛽ Fioul',        mw: p.fioul_mw,        pct: pct(p.fioul_mw),        color: '#78716c' },
    { label: '🏭 Charbon',      mw: p.charbon_mw,      pct: pct(p.charbon_mw),      color: '#44403c' },
  ].filter(f => (f.mw ?? 0) > 0)
}
