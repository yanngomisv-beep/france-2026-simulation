import { useState, useEffect } from 'react'
import { AXES } from '../engines/moteur-curseurs.js'

const ICONES_AXES = {
  europe: '🇪🇺', immigration: '🌍', energie: '⚡',
  securite: '🛡️', social: '👥', economie: '💰',
}

export default function NotifReformes({ reformes, crises, onResoudreCrise }) {
  const [visible, setVisible]   = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (reformes?.length > 0 || crises?.length > 0) {
      setVisible(true)
    }
  }, [reformes, crises])

  if (!visible) return null
  const total = (reformes?.length ?? 0) + (crises?.length ?? 0)
  if (total === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2" style={{ maxWidth: 380 }}>

      {/* Crises — priorité haute */}
      {crises?.map(crise => (
        <div key={crise.id}
          className="bg-red-900 border border-red-500 rounded-xl p-3 shadow-xl flex flex-col gap-2 animate-pulse">
          <div className="flex items-start gap-2">
            <span className="text-xl flex-shrink-0">🚨</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-red-200">{crise.titre}</p>
              <p className="text-xs text-red-300 mt-0.5">{crise.description}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {Object.entries(crise.impacts).map(([k, v]) => (
                  <span key={k} className={`text-xs font-semibold ${v > 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {k.replace(/_/g,' ')} {v > 0 ? '+' : ''}{v}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onResoudreCrise?.(crise)}
            className="w-full py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
          >
            ⚡ Gérer la crise
          </button>
        </div>
      ))}

      {/* Micro-réformes automatiques */}
      {reformes?.length > 0 && (
        <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden">
          {/* Header cliquable */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm">⚙️</span>
            <p className="text-xs font-semibold text-slate-300 flex-1 text-left">
              {reformes.length} réforme{reformes.length > 1 ? 's' : ''} automatisée{reformes.length > 1 ? 's' : ''}
            </p>
            <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
            <button
              onClick={e => { e.stopPropagation(); setVisible(false) }}
              className="text-slate-600 hover:text-slate-400 text-xs ml-1"
            >✕</button>
          </button>

          {/* Liste dépliable */}
          {expanded && (
            <div className="border-t border-slate-700 flex flex-col divide-y divide-slate-700">
              {reformes.map((r, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">
                    {ICONES_AXES[r.axe] ?? '📋'}
                  </span>
                  <p className="text-xs text-slate-400">{r.texte}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
