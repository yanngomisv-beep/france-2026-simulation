// src/engines/moteur-energie-reel.js
//
// Appelle ODRÉ directement depuis le navigateur — l'API est CORS-ouverte,
// pas besoin de proxy. Fonctionne en local ET sur Vercel.
//
// URL correcte : odre.opendatasoft.com (pas opendata.reseaux-energies.fr)
// Documentation : https://odre.opendatasoft.com/api/explore/v2.1/

const ODRE_URL = 'https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/eco2mix-national-tr/records'

const FIELDS = [
  'date_heure',
  'consommation',
  'prevision_j',
  'prevision_j1',
  'nucleaire',
  'eolien',
  'eolien_terrestre',
  'eolien_offshore',
  'solaire',
  'hydraulique',
  'fioul',
  'charbon',
  'gaz',
  'bioenergies',
  'taux_co2',
  'ech_comm_angleterre',
  'ech_comm_espagne',
  'ech_comm_italie',
  'ech_comm_suisse',
  'ech_comm_allemagne_belgique',
].join(',')

// ─────────────────────────────────────────────────────────────
// FALLBACKS (Mars 2026 — crise iranienne, Ormuz sous tension)
// ─────────────────────────────────────────────────────────────
const FALLBACK = {
  prix_baril_dollars:          88,
  prix_gaz_mwh:                42,
  prix_electricite_marche_mwh: 95,
  prix_electricite:            95,
  part_nucleaire_mix_pct:      68,
  part_renouvelable_mix_pct:   22,
  part_gaz_mix_pct:             6,
  part_charbon_mix_pct:         1,
  production_mw: {
    nucleaire_mw: 42000, eolien_mw: 8000, solaire_mw: 1000,
    hydraulique_mw: 9000, gaz_mw: 4000, charbon_mw: 200,
    fioul_mw: 100, bioenergies_mw: 1500, total_mw: 65800,
  },
  consommation_mw:   62000,
  prevision_j_mw:    64000,
  prevision_j1_mw:   63000,
  taux_co2_g_kwh:    52,
  echanges_mw: {
    angleterre: 1200, espagne: 400, italie: 900,
    suisse: 1800, allemagne_belgique: -400, solde_total: 3900,
  },
  source_donnees: 'fallback_contextuel',
  donnees_live:   false,
}

// ─────────────────────────────────────────────────────────────
// FETCH ODRÉ (côté navigateur, CORS OK)
// ─────────────────────────────────────────────────────────────
export async function chargerDonneesEnergie() {
  try {
    const params = new URLSearchParams({
      limit:    '1',
      order_by: 'date_heure DESC',
      select:   FIELDS,
      timezone: 'Europe/Paris',
    })

    const res = await fetch(`${ODRE_URL}?${params}`, {
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`ODRÉ HTTP ${res.status}`)

    const data = await res.json()
    // L'API v2.1 retourne { total_count, results: [...] }
    const r = data?.results?.[0]
    if (!r) throw new Error('ODRÉ: résultats vides')

    // Production par filière (MW)
    const nuc  = r.nucleaire    ?? 0
    // éolien_terrestre + offshore si dispo, sinon champ éolien agrégé
    const eol  = (r.eolien_terrestre != null || r.eolien_offshore != null)
      ? (r.eolien_terrestre ?? 0) + (r.eolien_offshore ?? 0)
      : (r.eolien ?? 0)
    const sol  = r.solaire      ?? 0
    const hyd  = r.hydraulique  ?? 0
    const gaz  = r.gaz          ?? 0
    const cha  = r.charbon      ?? 0
    const fio  = r.fioul        ?? 0
    const bio  = r.bioenergies  ?? 0
    const total = nuc + eol + sol + hyd + gaz + cha + fio + bio

    const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0

    // Échanges — convention ODRÉ : négatif = export France, positif = import
    // On inverse pour le jeu : positif = export France
    const eng = -(r.ech_comm_angleterre         ?? 0)
    const esp = -(r.ech_comm_espagne             ?? 0)
    const ita = -(r.ech_comm_italie              ?? 0)
    const sui = -(r.ech_comm_suisse              ?? 0)
    const deb = -(r.ech_comm_allemagne_belgique  ?? 0)

    return {
      // Prix (ODRÉ ne fournit pas le baril — reste au fallback)
      prix_baril_dollars:          FALLBACK.prix_baril_dollars,
      prix_gaz_mwh:                FALLBACK.prix_gaz_mwh,
      prix_electricite_marche_mwh: FALLBACK.prix_electricite_marche_mwh,
      prix_electricite:            FALLBACK.prix_electricite,

      // Mix %
      part_nucleaire_mix_pct:    pct(nuc),
      part_renouvelable_mix_pct: pct(eol + sol + hyd + bio),
      part_gaz_mix_pct:          pct(gaz),
      part_charbon_mix_pct:      pct(cha),

      // Production MW
      production_mw: {
        nucleaire_mw:   nuc,
        eolien_mw:      eol,
        solaire_mw:     sol,
        hydraulique_mw: hyd,
        gaz_mw:         gaz,
        charbon_mw:     cha,
        fioul_mw:       fio,
        bioenergies_mw: bio,
        total_mw:       total,
      },

      // Consommation
      consommation_mw:  r.consommation ?? FALLBACK.consommation_mw,
      prevision_j_mw:   r.prevision_j  ?? FALLBACK.prevision_j_mw,
      prevision_j1_mw:  r.prevision_j1 ?? FALLBACK.prevision_j1_mw,

      // CO₂
      taux_co2_g_kwh: r.taux_co2 ?? FALLBACK.taux_co2_g_kwh,

      // Échanges frontaliers
      echanges_mw: {
        angleterre:         Math.round(eng),
        espagne:            Math.round(esp),
        italie:             Math.round(ita),
        suisse:             Math.round(sui),
        allemagne_belgique: Math.round(deb),
        solde_total:        Math.round(eng + esp + ita + sui + deb),
      },

      // Méta
      source_donnees:    'ODRE_LIVE',
      donnees_live:      true,
      timestamp_donnees: r.date_heure ?? new Date().toISOString(),
    }

  } catch (e) {
    console.warn('[énergie] ODRÉ indisponible, fallback contextuel:', e.message)
    return { ...FALLBACK, timestamp_donnees: new Date().toISOString() }
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES D'AFFICHAGE (utilisés par PanneauEnergie)
// ─────────────────────────────────────────────────────────────

export function getResumeDonneesEnergie(etatJeu) {
  const live = etatJeu?.donnees_live
  const ts   = etatJeu?.timestamp_donnees?.slice(0, 16).replace('T', ' ') ?? ''
  return {
    badge:   live ? '🟢 Live' : '🟡 Estimé',
    source:  live ? 'ODRÉ éCO2mix — RTE' : 'Valeurs contextuelles Mars 2026',
    tooltip: live
      ? `Données RTE temps réel — MAJ : ${ts}`
      : 'ODRÉ indisponible. Valeurs estimées pour Mars 2026.',
  }
}

export function getResumeEchanges(etatJeu) {
  const e = etatJeu?.echanges_mw
  if (!e) return null
  const solde = e.solde_total ?? 0
  const fmt = v => `${v >= 0 ? '+' : ''}${Math.abs(v) >= 1000 ? `${(v/1000).toFixed(1)} GW` : `${Math.round(v)} MW`}`
  return {
    solde_mw:    solde,
    exportateur: solde >= 0,
    label: solde >= 0 ? `🔋 Export net : ${fmt(solde)}` : `⬇️ Import net : ${fmt(solde)}`,
    detail: [
      { pays: '🇬🇧 Angleterre',         val: e.angleterre },
      { pays: '🇩🇪🇧🇪 Allemagne/Belg.', val: e.allemagne_belgique },
      { pays: '🇨🇭 Suisse',             val: e.suisse },
      { pays: '🇮🇹 Italie',             val: e.italie },
      { pays: '🇪🇸 Espagne',            val: e.espagne },
    ].filter(d => d.val != null).map(d => ({ ...d, label: fmt(d.val) })),
  }
}

export function getResumeMix(etatJeu) {
  const p = etatJeu?.production_mw
  if (!p || p.total_mw == null || p.total_mw === 0) return null
  const total = p.total_mw
  const pct = v => total > 0 ? Math.round((v / total) * 100) : 0
  return [
    { label: 'Nucléaire',   mw: p.nucleaire_mw,   pct: pct(p.nucleaire_mw),   color: '#818cf8' },
    { label: 'Hydraulique', mw: p.hydraulique_mw,  pct: pct(p.hydraulique_mw), color: '#22d3ee' },
    { label: 'Éolien',      mw: p.eolien_mw,       pct: pct(p.eolien_mw),      color: '#4ade80' },
    { label: 'Solaire',     mw: p.solaire_mw,      pct: pct(p.solaire_mw),     color: '#fbbf24' },
    { label: 'Gaz',         mw: p.gaz_mw,          pct: pct(p.gaz_mw),         color: '#fb923c' },
    { label: 'Bioénergies', mw: p.bioenergies_mw,  pct: pct(p.bioenergies_mw), color: '#86efac' },
    { label: 'Fioul',       mw: p.fioul_mw,        pct: pct(p.fioul_mw),       color: '#a78bfa' },
    { label: 'Charbon',     mw: p.charbon_mw,      pct: pct(p.charbon_mw),     color: '#78716c' },
  ].filter(f => (f.mw ?? 0) > 0)
}
