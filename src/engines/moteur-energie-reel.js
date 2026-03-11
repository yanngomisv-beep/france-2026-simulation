// src/engines/moteur-energie-reel.js
// Appelé UNE SEULE FOIS au démarrage du jeu (dans GameEngine useEffect)
// Peuple etatJeu avec les données réelles, puis la simulation prend le relais

// ─────────────────────────────────────────────────────────────
// FALLBACKS CONTEXTUELS (Mars 2026, crise iranienne active)
// Baril autour de 88-90$ — détroit d'Ormuz sous tension
// ─────────────────────────────────────────────────────────────
const FALLBACK_ENERGIE = {
  prix_baril_dollars:          88,
  prix_gaz_mwh:                42,
  prix_electricite_marche_mwh: 95,
  prix_electricite:            95,
  part_nucleaire_mix_pct:      68,
  part_renouvelable_mix_pct:   22,
  part_gaz_mix_pct:            6,
  part_charbon_mix_pct:        1,
  echanges_frontaliers_mw: {
    uk: 1200, allemagne: -400, suisse: 1800,
    italie: 900, espagne: 400, belgique: 100,
    solde_total: 4000,
  },
  source_donnees: 'fallback_contextuel',
  donnees_live: false,
}

// ─────────────────────────────────────────────────────────────
// FETCH PRINCIPAL
// ─────────────────────────────────────────────────────────────
export async function chargerDonneesEnergie() {
  try {
    const res = await fetch('/api/energie', {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Mapper la réponse API vers les champs de etatJeu
    return {
      prix_baril_dollars:          data.prix_baril_dollars          ?? FALLBACK_ENERGIE.prix_baril_dollars,
      prix_gaz_mwh:                data.prix_gaz_mwh                ?? FALLBACK_ENERGIE.prix_gaz_mwh,
      prix_electricite_marche_mwh: data.prix_electricite_marche_mwh ?? FALLBACK_ENERGIE.prix_electricite_marche_mwh,
      prix_electricite:            data.prix_electricite_marche_mwh ?? FALLBACK_ENERGIE.prix_electricite,
      part_nucleaire_mix_pct:      data.mix_energetique?.nucleaire_pct    ?? FALLBACK_ENERGIE.part_nucleaire_mix_pct,
      part_renouvelable_mix_pct:   data.mix_energetique?.renouvelable_pct ?? FALLBACK_ENERGIE.part_renouvelable_mix_pct,
      part_gaz_mix_pct:            data.mix_energetique?.gaz_pct          ?? FALLBACK_ENERGIE.part_gaz_mix_pct,
      part_charbon_mix_pct:        data.mix_energetique?.charbon_pct      ?? FALLBACK_ENERGIE.part_charbon_mix_pct,
      echanges_frontaliers_mw:     data.echanges_frontaliers_mw           ?? FALLBACK_ENERGIE.echanges_frontaliers_mw,
      source_donnees:              Object.values(data.source ?? {}).includes('RTE_LIVE') ? 'RTE_LIVE' : 'fallback_contextuel',
      donnees_live:                Object.values(data.source ?? {}).some(s => s === 'RTE_LIVE' || s === 'oilpriceapi'),
      timestamp_donnees:           data.timestamp ?? new Date().toISOString(),
    }
  } catch (e) {
    console.warn('chargerDonneesEnergie — fallback:', e.message)
    return { ...FALLBACK_ENERGIE, timestamp_donnees: new Date().toISOString() }
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITAIRES D'AFFICHAGE
// ─────────────────────────────────────────────────────────────

// Résumé lisible pour la barre de stats ou un tooltip
export function getResumeDonneesEnergie(etatJeu) {
  const live = etatJeu.donnees_live
  const src  = etatJeu.source_donnees ?? 'fallback'
  return {
    badge:   live ? '🟢 Données live' : '🟡 Données estimées',
    source:  live ? 'RTE + OilPriceAPI' : 'Valeurs contextuelles Mars 2026',
    tooltip: live
      ? `Mix énergétique et prix mis à jour en temps réel. Dernière MAJ : ${etatJeu.timestamp_donnees?.slice(0,16).replace('T',' ')}`
      : 'Pas de connexion aux APIs RTE/OilPrice. Les valeurs de départ reflètent la situation géopolitique de Mars 2026 (crise iranienne).',
  }
}

// Formater le solde des échanges frontaliers pour l'UI
export function getResumEchangesFrontaliers(etatJeu) {
  const e = etatJeu.echanges_frontaliers_mw
  if (!e) return null
  const solde = e.solde_total ?? 0
  return {
    solde_mw:    solde,
    exportateur: solde > 0,
    label:       solde > 0
      ? `🔋 Export net : +${solde.toLocaleString('fr-FR')} MW`
      : `⚡ Import net : ${solde.toLocaleString('fr-FR')} MW`,
    detail: [
      e.uk         != null ? `🇬🇧 UK : ${e.uk > 0 ? '+' : ''}${e.uk} MW`       : null,
      e.allemagne  != null ? `🇩🇪 DE : ${e.allemagne > 0 ? '+' : ''}${e.allemagne} MW` : null,
      e.suisse     != null ? `🇨🇭 CH : ${e.suisse > 0 ? '+' : ''}${e.suisse} MW`    : null,
      e.italie     != null ? `🇮🇹 IT : ${e.italie > 0 ? '+' : ''}${e.italie} MW`    : null,
      e.espagne    != null ? `🇪🇸 ES : ${e.espagne > 0 ? '+' : ''}${e.espagne} MW`   : null,
      e.belgique   != null ? `🇧🇪 BE : ${e.belgique > 0 ? '+' : ''}${e.belgique} MW` : null,
    ].filter(Boolean),
  }
}
