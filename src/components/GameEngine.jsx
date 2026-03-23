// ═══════════════════════════════════════════════════════════
// PATCH GameEngine.jsx — 3 modifications
// ═══════════════════════════════════════════════════════════

// ── 1. Import : ajouter getLoi ────────────────────────────
// Ligne existante :
//   import { soumettreLoiAuVote, getLoisDisponibles } from '../engines/moteur-legislatif.js'
// Remplacer par :
//   import { soumettreLoiAuVote, getLoisDisponibles, getLoi } from '../engines/moteur-legislatif.js'


// ── 2. Nouveau useCallback à ajouter après voterLoi ───────
// (coller ce bloc juste après la définition de voterLoi)

  const appliquerLoiAdoptee = useCallback((loiId) => {
    setEtatJeu(prev => {
      try {
        const loi = getLoi(loiId)
        if (!loi) return prev
        if (prev.lois_votees?.includes(loiId)) return prev // déjà appliquée

        let etat = { ...prev }

        // Appliquer chaque impact numérique sur l'état
        Object.entries(loi.impacts ?? {}).forEach(([cle, valeur]) => {
          if (typeof valeur === 'number' && cle in etat) {
            etat[cle] = Math.round(((etat[cle] ?? 0) + valeur) * 10) / 10
          }
        })

        // Clamp les variables critiques pour éviter les valeurs absurdes
        etat.popularite_joueur        = Math.max(0,   Math.min(100, etat.popularite_joueur        ?? 42))
        etat.tension_sociale          = Math.max(0,   Math.min(100, etat.tension_sociale          ?? 45))
        etat.stabilite                = Math.max(0,   Math.min(100, etat.stabilite                ?? 58))
        etat.relation_ue              = Math.max(-20, Math.min(100, etat.relation_ue              ?? 20))
        etat.deficit_milliards        = Math.max(0,               etat.deficit_milliards         ?? 173)
        etat.inflation_pct            = Math.max(-5,  Math.min(20,  etat.inflation_pct            ?? 2.8))
        etat.indice_confiance_marches = Math.max(0,   Math.min(100, etat.indice_confiance_marches ?? 50))
        etat.pib_croissance_pct       = Math.max(-10, Math.min(10,  etat.pib_croissance_pct       ?? 0.8))

        // Enregistrer la loi comme promulguée
        etat.lois_votees = [...(etat.lois_votees ?? []), loiId]

        return etat
      } catch (e) {
        console.warn('[appliquerLoiAdoptee]', e.message)
        return prev
      }
    })
  }, [])


// ── 3. Ajouter dans gameProps ──────────────────────────────
// Dans l'objet gameProps, ajouter la ligne :
//   appliquerLoiAdoptee,
//
// Exemple :
//   const gameProps = {
//     etatJeu,
//     curseurs,
//     passerTour,
//     voterLoi,
//     appliquerLoiAdoptee,   // ← AJOUTER ICI
//     resoudreCrise,
//     deplacerCurseur: deplacerCurseurJoueur,
//     getLoisDisponibles: () => { ... },
//     evenements,
//     loading,
//   }
