import { useState } from 'react'

const DEPARTEMENTS = [
  { id: '01', nom: 'Ain', region: 'ARA', chomage: 6.2, tendance: 'EPR', humeur: 'calme' },
  { id: '02', nom: 'Aisne', region: 'HDF', chomage: 11.4, tendance: 'RN', humeur: 'tendue' },
  { id: '03', nom: 'Allier', region: 'ARA', chomage: 9.1, tendance: 'RN', humeur: 'tendue' },
  { id: '04', nom: 'Alpes-de-Haute-Provence', region: 'PACA', chomage: 8.7, tendance: 'RN', humeur: 'calme' },
  { id: '05', nom: 'Hautes-Alpes', region: 'PACA', chomage: 7.2, tendance: 'EPR', humeur: 'calme' },
  { id: '06', nom: 'Alpes-Maritimes', region: 'PACA', chomage: 8.9, tendance: 'RN', humeur: 'tendue' },
  { id: '07', nom: 'Ardèche', region: 'ARA', chomage: 8.3, tendance: 'RN', humeur: 'calme' },
  { id: '08', nom: 'Ardennes', region: 'GE', chomage: 12.1, tendance: 'RN', humeur: 'critique' },
  { id: '09', nom: 'Ariège', region: 'OCC', chomage: 10.4, tendance: 'LFI', humeur: 'tendue' },
  { id: '10', nom: 'Aube', region: 'GE', chomage: 9.8, tendance: 'RN', humeur: 'tendue' },
  { id: '11', nom: 'Aude', region: 'OCC', chomage: 12.8, tendance: 'RN', humeur: 'critique' },
  { id: '12', nom: 'Aveyron', region: 'OCC', chomage: 6.1, tendance: 'LR', humeur: 'calme' },
  { id: '13', nom: 'Bouches-du-Rhône', region: 'PACA', chomage: 11.2, tendance: 'LFI', humeur: 'tendue' },
  { id: '14', nom: 'Calvados', region: 'NOR', chomage: 7.8, tendance: 'EPR', humeur: 'calme' },
  { id: '15', nom: 'Cantal', region: 'ARA', chomage: 5.9, tendance: 'LR', humeur: 'calme' },
  { id: '16', nom: 'Charente', region: 'NA', chomage: 9.3, tendance: 'RN', humeur: 'tendue' },
  { id: '17', nom: 'Charente-Maritime', region: 'NA', chomage: 8.6, tendance: 'RN', humeur: 'tendue' },
  { id: '18', nom: 'Cher', region: 'CVL', chomage: 9.7, tendance: 'RN', humeur: 'tendue' },
  { id: '19', nom: 'Corrèze', region: 'NA', chomage: 6.8, tendance: 'EPR', humeur: 'calme' },
  { id: '21', nom: 'Côte-d\'Or', region: 'BFC', chomage: 7.1, tendance: 'EPR', humeur: 'calme' },
  { id: '22', nom: 'Côtes-d\'Armor', region: 'BRE', chomage: 7.4, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '23', nom: 'Creuse', region: 'NA', chomage: 8.9, tendance: 'RN', humeur: 'tendue' },
  { id: '24', nom: 'Dordogne', region: 'NA', chomage: 8.5, tendance: 'RN', humeur: 'tendue' },
  { id: '25', nom: 'Doubs', region: 'BFC', chomage: 7.3, tendance: 'EPR', humeur: 'calme' },
  { id: '26', nom: 'Drôme', region: 'ARA', chomage: 9.2, tendance: 'RN', humeur: 'tendue' },
  { id: '27', nom: 'Eure', region: 'NOR', chomage: 9.6, tendance: 'RN', humeur: 'tendue' },
  { id: '28', nom: 'Eure-et-Loir', region: 'CVL', chomage: 7.9, tendance: 'RN', humeur: 'calme' },
  { id: '29', nom: 'Finistère', region: 'BRE', chomage: 7.1, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '2A', nom: 'Corse-du-Sud', region: 'COR', chomage: 9.4, tendance: 'DIV', humeur: 'calme' },
  { id: '2B', nom: 'Haute-Corse', region: 'COR', chomage: 10.1, tendance: 'DIV', humeur: 'tendue' },
  { id: '30', nom: 'Gard', region: 'OCC', chomage: 12.3, tendance: 'RN', humeur: 'critique' },
  { id: '31', nom: 'Haute-Garonne', region: 'OCC', chomage: 8.4, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '32', nom: 'Gers', region: 'OCC', chomage: 7.2, tendance: 'RN', humeur: 'calme' },
  { id: '33', nom: 'Gironde', region: 'NA', chomage: 8.9, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '34', nom: 'Hérault', region: 'OCC', chomage: 12.7, tendance: 'LFI', humeur: 'tendue' },
  { id: '35', nom: 'Ille-et-Vilaine', region: 'BRE', chomage: 6.8, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '36', nom: 'Indre', region: 'CVL', chomage: 9.4, tendance: 'RN', humeur: 'tendue' },
  { id: '37', nom: 'Indre-et-Loire', region: 'CVL', chomage: 7.6, tendance: 'EPR', humeur: 'calme' },
  { id: '38', nom: 'Isère', region: 'ARA', chomage: 7.8, tendance: 'EPR', humeur: 'calme' },
  { id: '39', nom: 'Jura', region: 'BFC', chomage: 6.9, tendance: 'EPR', humeur: 'calme' },
  { id: '40', nom: 'Landes', region: 'NA', chomage: 7.8, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '41', nom: 'Loir-et-Cher', region: 'CVL', chomage: 8.2, tendance: 'RN', humeur: 'tendue' },
  { id: '42', nom: 'Loire', region: 'ARA', chomage: 8.6, tendance: 'RN', humeur: 'tendue' },
  { id: '43', nom: 'Haute-Loire', region: 'ARA', chomage: 6.7, tendance: 'LR', humeur: 'calme' },
  { id: '44', nom: 'Loire-Atlantique', region: 'PDL', chomage: 7.2, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '45', nom: 'Loiret', region: 'CVL', chomage: 7.9, tendance: 'EPR', humeur: 'calme' },
  { id: '46', nom: 'Lot', region: 'OCC', chomage: 7.3, tendance: 'RN', humeur: 'calme' },
  { id: '47', nom: 'Lot-et-Garonne', region: 'NA', chomage: 10.8, tendance: 'RN', humeur: 'critique' },
  { id: '48', nom: 'Lozère', region: 'OCC', chomage: 5.8, tendance: 'LR', humeur: 'calme' },
  { id: '49', nom: 'Maine-et-Loire', region: 'PDL', chomage: 7.1, tendance: 'EPR', humeur: 'calme' },
  { id: '50', nom: 'Manche', region: 'NOR', chomage: 7.4, tendance: 'RN', humeur: 'calme' },
  { id: '51', nom: 'Marne', region: 'GE', chomage: 9.1, tendance: 'EPR', humeur: 'tendue' },
  { id: '52', nom: 'Haute-Marne', region: 'GE', chomage: 10.2, tendance: 'RN', humeur: 'tendue' },
  { id: '53', nom: 'Mayenne', region: 'PDL', chomage: 5.4, tendance: 'LR', humeur: 'calme' },
  { id: '54', nom: 'Meurthe-et-Moselle', region: 'GE', chomage: 9.8, tendance: 'PS_ECO', humeur: 'tendue' },
  { id: '55', nom: 'Meuse', region: 'GE', chomage: 10.4, tendance: 'RN', humeur: 'tendue' },
  { id: '56', nom: 'Morbihan', region: 'BRE', chomage: 7.3, tendance: 'EPR', humeur: 'calme' },
  { id: '57', nom: 'Moselle', region: 'GE', chomage: 9.6, tendance: 'RN', humeur: 'tendue' },
  { id: '58', nom: 'Nièvre', region: 'BFC', chomage: 10.1, tendance: 'RN', humeur: 'critique' },
  { id: '59', nom: 'Nord', region: 'HDF', chomage: 12.8, tendance: 'RN', humeur: 'critique' },
  { id: '60', nom: 'Oise', region: 'HDF', chomage: 9.4, tendance: 'RN', humeur: 'tendue' },
  { id: '61', nom: 'Orne', region: 'NOR', chomage: 8.8, tendance: 'RN', humeur: 'tendue' },
  { id: '62', nom: 'Pas-de-Calais', region: 'HDF', chomage: 13.2, tendance: 'RN', humeur: 'critique' },
  { id: '63', nom: 'Puy-de-Dôme', region: 'ARA', chomage: 7.9, tendance: 'EPR', humeur: 'calme' },
  { id: '64', nom: 'Pyrénées-Atlantiques', region: 'NA', chomage: 7.4, tendance: 'EPR', humeur: 'calme' },
  { id: '65', nom: 'Hautes-Pyrénées', region: 'OCC', chomage: 8.9, tendance: 'PS_ECO', humeur: 'calme' },
  { id: '66', nom: 'Pyrénées-Orientales', region: 'OCC', chomage: 14.1, tendance: 'RN', humeur: 'critique' },
  { id: '67', nom: 'Bas-Rhin', region: 'GE', chomage: 6.8, tendance: 'EPR', humeur: 'calme' },
  { id: '68', nom: 'Haut-Rhin', region: 'GE', chomage: 7.2, tendance: 'EPR', humeur: 'calme' },
  { id: '69', nom: 'Rhône', region: 'ARA', chomage: 7.6, tendance: 'EPR', humeur: 'calme' },
  { id: '70', nom: 'Haute-Saône', region: 'BFC', chomage: 9.3, tendance: 'RN', humeur: 'tendue' },
  { id: '71', nom: 'Saône-et-Loire', region: 'BFC', chomage: 9.1, tendance: 'RN', humeur: 'tendue' },
  { id: '72', nom: 'Sarthe', region: 'PDL', chomage: 8.3, tendance: 'RN', humeur: 'tendue' },
  { id: '73', nom: 'Savoie', region: 'ARA', chomage: 6.4, tendance: 'EPR', humeur: 'calme' },
  { id: '74', nom: 'Haute-Savoie', region: 'ARA', chomage: 5.8, tendance: 'LR', humeur: 'calme' },
  { id: '75', nom: 'Paris', region: 'IDF', chomage: 7.8, tendance: 'PS_ECO', humeur: 'tendue' },
  { id: '76', nom: 'Seine-Maritime', region: 'NOR', chomage: 10.3, tendance: 'RN', humeur: 'critique' },
  { id: '77', nom: 'Seine-et-Marne', region: 'IDF', chomage: 8.1, tendance: 'RN', humeur: 'tendue' },
  { id: '78', nom: 'Yvelines', region: 'IDF', chomage: 6.9, tendance: 'LR', humeur: 'calme' },
  { id: '79', nom: 'Deux-Sèvres', region: 'NA', chomage: 7.2, tendance: 'EPR', humeur: 'calme' },
  { id: '80', nom: 'Somme', region: 'HDF', chomage: 11.8, tendance: 'RN', humeur: 'critique' },
  { id: '81', nom: 'Tarn', region: 'OCC', chomage: 9.4, tendance: 'RN', humeur: 'tendue' },
  { id: '82', nom: 'Tarn-et-Garonne', region: 'OCC', chomage: 10.2, tendance: 'RN', humeur: 'tendue' },
  { id: '83', nom: 'Var', region: 'PACA', chomage: 9.8, tendance: 'RN', humeur: 'tendue' },
  { id: '84', nom: 'Vaucluse', region: 'PACA', chomage: 11.6, tendance: 'RN', humeur: 'critique' },
  { id: '85', nom: 'Vendée', region: 'PDL', chomage: 5.6, tendance: 'LR', humeur: 'calme' },
  { id: '86', nom: 'Vienne', region: 'NA', chomage: 8.4, tendance: 'EPR', humeur: 'calme' },
  { id: '87', nom: 'Haute-Vienne', region: 'NA', chomage: 8.9, tendance: 'PS_ECO', humeur: 'tendue' },
  { id: '88', nom: 'Vosges', region: 'GE', chomage: 9.7, tendance: 'RN', humeur: 'tendue' },
  { id: '89', nom: 'Yonne', region: 'BFC', chomage: 9.2, tendance: 'RN', humeur: 'tendue' },
  { id: '90', nom: 'Territoire de Belfort', region: 'BFC', chomage: 10.1, tendance: 'RN', humeur: 'tendue' },
  { id: '91', nom: 'Essonne', region: 'IDF', chomage: 8.4, tendance: 'LFI', humeur: 'tendue' },
  { id: '92', nom: 'Hauts-de-Seine', region: 'IDF', chomage: 6.2, tendance: 'EPR', humeur: 'calme' },
  { id: '93', nom: 'Seine-Saint-Denis', region: 'IDF', chomage: 14.8, tendance: 'LFI', humeur: 'critique' },
  { id: '94', nom: 'Val-de-Marne', region: 'IDF', chomage: 8.9, tendance: 'LFI', humeur: 'tendue' },
  { id: '95', nom: 'Val-d\'Oise', region: 'IDF', chomage: 9.6, tendance: 'RN', humeur: 'tendue' },
]

const COULEURS_PARTI = {
  LFI:    '#cc0000',
  PS_ECO: '#ff8c00',
  EPR:    '#ffcc00',
  LR:     '#0066cc',
  RN:     '#1a1aff',
  PATRIOTES: '#003399',
  DIV:    '#888888',
}

const HUMEUR_CONFIG = {
  calme:    { label: '😊 Calme',    bg: 'bg-green-900',  text: 'text-green-300' },
  tendue:   { label: '😤 Tendue',   bg: 'bg-yellow-900', text: 'text-yellow-300' },
  critique: { label: '🔥 Critique', bg: 'bg-red-900',    text: 'text-red-300' },
}

const STATS_NATIONALES = {
  RN:     { count: 0, label: 'RN',          couleur: '#1a1aff' },
  LFI:    { count: 0, label: 'LFI',         couleur: '#cc0000' },
  PS_ECO: { count: 0, label: 'PS-Écolos',   couleur: '#ff8c00' },
  EPR:    { count: 0, label: 'Renaissance', couleur: '#ffcc00' },
  LR:     { count: 0, label: 'LR',          couleur: '#0066cc' },
  DIV:    { count: 0, label: 'Divers',      couleur: '#888888' },
}

for (const dep of DEPARTEMENTS) {
  if (STATS_NATIONALES[dep.tendance]) STATS_NATIONALES[dep.tendance].count++
}

const MODES = ['tendance', 'chomage', 'humeur']

export default function Carte() {
  const [depSelectionne, setDepSelectionne] = useState(null)
  const [mode, setMode] = useState('tendance')
  const [filtre, setFiltre] = useState('tous')

  const depsFiltres = filtre === 'tous'
    ? DEPARTEMENTS
    : DEPARTEMENTS.filter(d => d.tendance === filtre || d.humeur === filtre)

  function getCouleurDep(dep) {
    if (mode === 'tendance') return COULEURS_PARTI[dep.tendance] ?? '#888'
    if (mode === 'humeur') {
      return dep.humeur === 'calme' ? '#16a34a' : dep.humeur === 'tendue' ? '#d97706' : '#dc2626'
    }
    if (mode === 'chomage') {
      if (dep.chomage < 7) return '#16a34a'
      if (dep.chomage < 10) return '#d97706'
      return '#dc2626'
    }
    return '#888'
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">🗺️ Carte de France — {DEPARTEMENTS.length} départements</h2>
        <div className="flex gap-2">
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
              {m === 'tendance' ? '🗳️ Tendance' : m === 'chomage' ? '📊 Chômage' : '😤 Humeur'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Grille départements */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">

            {/* Légende */}
            {mode === 'tendance' && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(STATS_NATIONALES).map(([id, s]) => (
                  <button key={id}
                    onClick={() => setFiltre(f => f === id ? 'tous' : id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                      filtre === id ? 'bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'
                    }`}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.couleur }} />
                    <span className="text-slate-300">{s.label}</span>
                    <span className="text-slate-500">{s.count}</span>
                  </button>
                ))}
              </div>
            )}

            {mode === 'chomage' && (
              <div className="flex gap-3 mb-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-600"/> &lt; 7%</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-yellow-600"/> 7–10%</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-600"/> &gt; 10%</span>
              </div>
            )}

            {/* Grille hexagonale simulée */}
            <div className="grid gap-1"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>
              {depsFiltres.map(dep => {
                const couleur = getCouleurDep(dep)
                const selectionne = depSelectionne?.id === dep.id
                return (
                  <button key={dep.id}
                    onClick={() => setDepSelectionne(s => s?.id === dep.id ? null : dep)}
                    className={`rounded-lg p-1.5 flex flex-col items-center transition-all ${
                      selectionne ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: couleur + '33', borderColor: couleur, border: `1px solid ${couleur}` }}
                    title={dep.nom}>
                    <span className="text-xs font-bold text-white">{dep.id}</span>
                    <span className="text-xs text-white/60 truncate w-full text-center" style={{ fontSize: '9px' }}>
                      {dep.nom.length > 8 ? dep.nom.substring(0, 8) + '…' : dep.nom}
                    </span>
                  </button>
                )
              })}
            </div>

          </div>
        </div>

        {/* Panneau détail */}
        <div className="flex flex-col gap-4">

          {/* Fiche département */}
          {depSelectionne ? (
            <div className="bg-slate-800 rounded-xl border border-slate-600 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">{depSelectionne.nom}</h3>
                  <p className="text-xs text-slate-400">Département {depSelectionne.id} — {depSelectionne.region}</p>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: COULEURS_PARTI[depSelectionne.tendance] }}>
                  {depSelectionne.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-900 rounded p-2">
                  <p className="text-slate-400 text-xs">Tendance politique</p>
                  <p className="text-white font-semibold">{depSelectionne.tendance}</p>
                </div>
                <div className="bg-slate-900 rounded p-2">
                  <p className="text-slate-400 text-xs">Chômage</p>
                  <p className={`font-semibold ${depSelectionne.chomage > 10 ? 'text-red-400' : depSelectionne.chomage > 7 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {depSelectionne.chomage}%
                  </p>
                </div>
              </div>

              <div className={`rounded-lg px-3 py-2 text-sm font-medium ${HUMEUR_CONFIG[depSelectionne.humeur].bg} ${HUMEUR_CONFIG[depSelectionne.humeur].text}`}>
                Climat social : {HUMEUR_CONFIG[depSelectionne.humeur].label}
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                Cliquez sur un autre département pour comparer, ou recliquez pour fermer.
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center text-slate-500 text-sm">
              Cliquez sur un département pour voir ses données
            </div>
          )}

          {/* Stats nationales */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Bilan national</h3>
            {Object.entries(STATS_NATIONALES)
              .sort(([,a],[,b]) => b.count - a.count)
              .map(([id, s]) => (
                <div key={id} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.couleur }} />
                  <span className="text-sm text-slate-300 flex-1">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${(s.count / DEPARTEMENTS.length) * 100}%`,
                        backgroundColor: s.couleur
                      }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{s.count} dép.</span>
                  </div>
                </div>
              ))}

            <div className="pt-2 border-t border-slate-700 text-xs text-slate-500">
              {DEPARTEMENTS.filter(d => d.humeur === 'critique').length} départements en situation critique
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
