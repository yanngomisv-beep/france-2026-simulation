import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import anime from 'animejs'

const ICONES_AXES = {
  europe: '🇪🇺', immigration: '🌍', energie: '⚡',
  securite: '🛡️', social: '👥', economie: '💰',
}

// ── Carte de crise animée ───────────────────────────────────
function CarteCrise({ crise, onResoudre }) {
  const ref = useRef(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    anime({
      targets: ref.current,
      translateX: [-320, 0],
      opacity: [0, 1],
      duration: 480,
      easing: 'spring(1, 80, 12, 0)',
    })
  }, [])

  // Pulse rouge sur la bordure
  useEffect(() => {
    if (!ref.current) return
    anime({
      targets: ref.current,
      boxShadow: [
        '0 0 0px 0px rgba(239,68,68,0)',
        '0 0 18px 4px rgba(239,68,68,0.55)',
        '0 0 0px 0px rgba(239,68,68,0)',
      ],
      duration: 1800,
      loop: true,
      easing: 'easeInOutSine',
    })
  }, [])

  return (
    <Dialog.Root open={confirming} onOpenChange={setConfirming}>
      <div
        ref={ref}
        className="bg-red-950 border border-red-600/70 rounded-xl p-3 shadow-2xl flex flex-col gap-2"
        style={{ opacity: 0 }}
      >
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0">🚨</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-red-200 leading-tight">{crise.titre}</p>
            <p className="text-xs text-red-400 mt-0.5 leading-relaxed">{crise.description}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {Object.entries(crise.impacts ?? {}).map(([k, v]) => (
                <span key={k} className={`text-xs font-semibold ${v > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {k.replace(/_/g, ' ')} {v > 0 ? '+' : ''}{v}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Dialog.Trigger asChild>
          <button className="w-full py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
            ⚡ Gérer la crise
          </button>
        </Dialog.Trigger>
      </div>

      {/* Dialogue de confirmation */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-slate-900 border border-red-700/50 rounded-2xl p-6 shadow-2xl">
          <Dialog.Title className="text-lg font-black text-white mb-1">
            🚨 {crise.titre}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-400 mb-4">
            {crise.description}
          </Dialog.Description>

          <div className="bg-slate-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Conséquences de la résolution</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(crise.impacts ?? {}).map(([k, v]) => (
                <div key={k} className="bg-slate-900 rounded px-2 py-1 flex gap-1 items-center">
                  <span className="text-xs text-slate-500">{k.replace(/_/g, ' ')}</span>
                  <span className={`text-xs font-bold ${v > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {v > 0 ? '+' : ''}{v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Dialog.Close asChild>
              <button className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
                Annuler
              </button>
            </Dialog.Close>
            <button
              onClick={() => { onResoudre(crise); setConfirming(false) }}
              className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors"
            >
              ✅ Confirmer la gestion
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Panneau réformes animé ──────────────────────────────────
function PanneauReformes({ reformes }) {
  const [expanded, setExpanded] = useState(false)
  const ref    = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    anime({
      targets: ref.current,
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutExpo',
    })
  }, [])

  useEffect(() => {
    if (!listRef.current) return
    if (expanded) {
      anime({
        targets: listRef.current.querySelectorAll('.reforme-item'),
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 300,
        easing: 'easeOutQuart',
      })
    }
  }, [expanded])

  return (
    <div
      ref={ref}
      className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden"
      style={{ opacity: 0 }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 transition-colors"
      >
        <span className="text-sm">⚙️</span>
        <p className="text-xs font-semibold text-slate-300 flex-1 text-left">
          {reformes.length} réforme{reformes.length > 1 ? 's' : ''} ce tour
        </p>
        <span className="text-slate-500 text-xs transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div ref={listRef} className="border-t border-slate-700/50 flex flex-col divide-y divide-slate-800">
          {reformes.map((r, i) => (
            <div key={i} className="reforme-item flex items-start gap-2 px-3 py-2" style={{ opacity: 0 }}>
              <span className="text-sm flex-shrink-0 mt-0.5">{ICONES_AXES[r.axe] ?? '📋'}</span>
              <p className="text-xs text-slate-400 leading-relaxed">{r.texte}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Composant principal ────────────────────────────────────
export default function NotifReformes({ reformes, crises, onResoudreCrise }) {
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    if ((reformes?.length ?? 0) + (crises?.length ?? 0) > 0) {
      setVisible(true)
    }
  }, [reformes, crises])

  const crisesVisibles = (crises ?? []).filter(c => !dismissed.includes(c.id))
  const total = (reformes?.length ?? 0) + crisesVisibles.length
  if (!visible || total === 0) return null

  function handleResoudre(crise) {
    onResoudreCrise?.(crise)
    setDismissed(d => [...d, crise.id])
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2" style={{ maxWidth: 360 }}>

        {/* Crises */}
        {crisesVisibles.map(crise => (
          <CarteCrise key={crise.id} crise={crise} onResoudre={handleResoudre} />
        ))}

        {/* Réformes */}
        {reformes?.length > 0 && (
          <div className="relative">
            <PanneauReformes reformes={reformes} />
            <button
              onClick={() => setVisible(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white rounded-full text-xs flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
}
