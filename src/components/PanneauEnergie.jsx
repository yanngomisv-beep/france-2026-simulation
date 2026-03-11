import { useState, useEffect, useRef } from 'react'
import { getResumeMix, getResumeEchanges, getResumeDonneesEnergie } from '../engines/moteur-energie-reel.js'

// ─────────────────────────────────────────────────────────────
// CONFIG FILIÈRES
// ─────────────────────────────────────────────────────────────
const FILIERES_CONFIG = [
  { label: 'Nucléaire',   emoji: '⚛️',  color: '#818cf8' },
  { label: 'Hydraulique', emoji: '💧',  color: '#22d3ee' },
  { label: 'Éolien',      emoji: '💨',  color: '#4ade80' },
  { label: 'Solaire',     emoji: '☀️',  color: '#fbbf24' },
  { label: 'Bioénergies', emoji: '🌿',  color: '#86efac' },
  { label: 'Gaz',         emoji: '🔥',  color: '#fb923c' },
  { label: 'Fioul',       emoji: '⛽',  color: '#a78bfa' },
  { label: 'Charbon',     emoji: '🏭',  color: '#78716c' },
]

const PAYS_ECHANGES = [
  { key: 'angleterre',         label: 'Angleterre',      flag: '🇬🇧' },
  { key: 'allemagne_belgique', label: 'Allemagne/Belg.', flag: '🇩🇪' },
  { key: 'suisse',             label: 'Suisse',          flag: '🇨🇭' },
  { key: 'italie',             label: 'Italie',          flag: '🇮🇹' },
  { key: 'espagne',            label: 'Espagne',         flag: '🇪🇸' },
]

// ─────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────
function fmt(mw) {
  if (mw == null) return '—'
  const abs = Math.abs(mw)
  if (abs >= 1000) return `${(mw / 1000).toFixed(1)} GW`
  return `${Math.round(mw)} MW`
}

function fmtSigné(mw) {
  if (mw == null) return '—'
  const s = mw >= 0 ? '+' : ''
  const abs = Math.abs(mw)
  if (abs >= 1000) return `${s}${(mw / 1000).toFixed(1)} GW`
  return `${s}${Math.round(mw)} MW`
}

function couleurCO2(g) {
  if (!g)      return { color: '#94a3b8', label: '—' }
  if (g < 50)  return { color: '#4ade80', label: 'Très bas' }
  if (g < 100) return { color: '#86efac', label: 'Bas' }
  if (g < 200) return { color: '#fbbf24', label: 'Modéré' }
  if (g < 350) return { color: '#fb923c', label: 'Élevé' }
  return        { color: '#f87171',       label: 'Très élevé' }
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function BarreFiliere({ filiere, mw, pct, isMax }) {
  const barRef = useRef(null)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.width = '0%'
    const id = setTimeout(() => {
      el.style.transition = 'width 0.65s cubic-bezier(0.22,1,0.36,1)'
      el.style.width = `${pct}%`
    }, 60)
    return () => clearTimeout(id)
  }, [pct])

  return (
    <div className="flex items-center gap-2 group">
      {/* Emoji + nom */}
      <div className="w-32 flex items-center gap-1.5 flex-shrink-0">
        <span className="text-sm leading-none w-5 text-center">{filiere.emoji}</span>
        <span className="text-xs text-slate-300 font-medium truncate">{filiere.label}</span>
        {isMax && (
          <span className="text-[9px] px-1 rounded font-bold leading-4"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }}>
            #1
          </span>
        )}
      </div>

      {/* Barre */}
      <div className="relative flex-1 h-6 bg-slate-800 rounded-md overflow-hidden">
        <div ref={barRef} className="absolute inset-y-0 left-0 rounded-md"
          style={{ width: '0%', backgroundColor: filiere.color, opacity: 0.75 }} />
        <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-white">
          {fmt(mw)}
        </span>
      </div>

      {/* % */}
      <div className="w-9 text-right flex-shrink-0">
        <span className="text-xs font-bold tabular-nums" style={{ color: filiere.color }}>{pct}%</span>
      </div>
    </div>
  )
}

function LigneEchange({ pays, mw, maxAbs }) {
  const export_ = mw >= 0
  const ratio   = maxAbs > 0 ? Math.abs(mw) / maxAbs : 0
  const barRef  = useRef(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.width = '0%'
    const id = setTimeout(() => {
      el.style.transition = 'width 0.6s cubic-bezier(0.22,1,0.36,1)'
      el.style.width = `${ratio * 100}%`
    }, 80)
    return () => clearTimeout(id)
  }, [ratio])

  return (
    <div className="flex items-center gap-2">
      {/* Pays */}
      <div className="w-32 flex items-center gap-1.5 flex-shrink-0">
        <span className="text-base">{pays.flag}</span>
        <span className="text-xs text-slate-300">{pays.label}</span>
      </div>

      {/* Barre bicolore centrée */}
      <div className="flex-1 flex items-center h-5">
        {/* Zone import (gauche) */}
        <div className="flex-1 h-full flex justify-end items-center overflow-hidden rounded-l-md">
          {!export_ && (
            <div ref={barRef} className="h-full rounded-l-md" style={{ width: '0%', backgroundColor: '#f87171', opacity: 0.75 }} />
          )}
        </div>
        {/* Axe zéro */}
        <div className="w-0.5 h-5 bg-slate-600 flex-shrink-0 z-10" />
        {/* Zone export (droite) */}
        <div className="flex-1 h-full flex justify-start items-center overflow-hidden rounded-r-md">
          {export_ && (
            <div ref={barRef} className="h-full rounded-r-md" style={{ width: '0%', backgroundColor: '#4ade80', opacity: 0.75 }} />
          )}
        </div>
      </div>

      {/* Valeur */}
      <div className="w-20 text-right flex-shrink-0">
        <span className={`text-xs font-bold tabular-nums ${export_ ? 'text-green-400' : 'text-red-400'}`}>
          {export_ ? '▲' : '▼'} {fmtSigné(mw)}
        </span>
      </div>
    </div>
  )
}

function JaugeCO2({ valeur }) {
  const { color, label } = couleurCO2(valeur)
  const pct = Math.min(100, ((valeur ?? 0) / 600) * 100)
  const barRef = useRef(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.width = '0%'
    const id = setTimeout(() => {
      el.style.transition = 'width 0.7s cubic-bezier(0.22,1,0.36,1)'
      el.style.width = `${pct}%`
    }, 100)
    return () => clearTimeout(id)
  }, [pct])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">🌿 Intensité carbone</span>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded font-semibold"
            style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>{label}</span>
          <span className="text-sm font-bold" style={{ color }}>
            {valeur ?? '—'}<span className="text-xs font-normal text-slate-500 ml-1">gCO₂/kWh</span>
          </span>
        </div>
      </div>
      {/* Gradient de couleur sur toute la barre */}
      <div className="relative h-3.5 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(to right, #4ade80 0%, #fbbf24 40%, #fb923c 70%, #f87171 100%)' }}>
        {/* Masque qui se rétracte de droite à gauche */}
        <div className="absolute inset-y-0 right-0 bg-slate-800 transition-none rounded-r-full"
          style={{ width: `${100 - pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600 px-0.5">
        <span>0</span><span>150</span><span>300</span><span>450</span><span>600+</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function PanneauEnergie({ etatJeu }) {
  const [onglet, setOnglet] = useState('mix')

  if (!etatJeu) return <p className="text-slate-500 text-xs">Données non disponibles</p>

  const mix      = getResumeMix(etatJeu)
  const echanges = getResumeEchanges(etatJeu)
  const meta     = getResumeDonneesEnergie(etatJeu)

  const maxMw  = mix ? Math.max(...mix.map(f => f.mw ?? 0)) : 1
  const maxAbs = etatJeu.echanges_mw
    ? Math.max(1, ...PAYS_ECHANGES.map(p => Math.abs(etatJeu.echanges_mw[p.key] ?? 0)))
    : 1

  const prod  = etatJeu.production_mw?.total_mw ?? null
  const conso = etatJeu.consommation_mw ?? null
  const balance = prod != null && conso != null ? prod - conso : null

  // Enrichir mix avec émojis depuis config
  const mixEnriched = mix?.map(f => {
    const conf = FILIERES_CONFIG.find(c => f.label === c.label)
    return { ...f, emoji: conf?.emoji ?? '⚡' }
  }) ?? []

  // Calcul bas-carbone vs fossile
  const BAS_CARBONE = ['Nucléaire', 'Hydraulique', 'Éolien', 'Solaire', 'Bioénergies']
  const mwBC  = mixEnriched.filter(f => BAS_CARBONE.includes(f.label)).reduce((s, f) => s + (f.mw ?? 0), 0)
  const mwFos = mixEnriched.filter(f => !BAS_CARBONE.includes(f.label)).reduce((s, f) => s + (f.mw ?? 0), 0)
  const pctBC  = prod ? Math.round((mwBC  / prod) * 100) : null
  const pctFos = prod ? Math.round((mwFos / prod) * 100) : null

  const ONGLETS = [
    { id: 'mix',      label: '⚡ Mix' },
    { id: 'echanges', label: '🔄 Échanges' },
    { id: 'conso',    label: '📊 Conso.' },
  ]

  return (
    <div className="flex flex-col gap-3 h-full text-sm">

      {/* ── En-tête avec badge live ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">⚡ Système électrique</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">éCO2mix · RTE France</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold flex-shrink-0 ${
          etatJeu.donnees_live
            ? 'bg-green-950/60 border-green-800/60 text-green-300'
            : 'bg-yellow-950/60 border-yellow-800/60 text-yellow-300'
        }`}>
          <span className={etatJeu.donnees_live ? 'animate-pulse' : ''}>{etatJeu.donnees_live ? '🟢' : '🟡'}</span>
          <span>{etatJeu.donnees_live ? 'Live' : 'Estimé'}</span>
          {etatJeu.timestamp_donnees && (
            <span className="text-slate-600 font-normal">{etatJeu.timestamp_donnees.slice(11, 16)}</span>
          )}
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-0.5 bg-slate-800/70 rounded-lg p-0.5 border border-slate-700/40">
        {ONGLETS.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              onglet === o.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* ── ONGLET MIX ── */}
      {onglet === 'mix' && (
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-0.5">

          {/* CO₂ */}
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3">
            <JaugeCO2 valeur={etatJeu.taux_co2_g_kwh} />
          </div>

          {/* Résumé bas-carbone / fossile */}
          {pctBC != null && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-950/40 border border-green-800/40 rounded-lg p-2.5 flex flex-col gap-0.5">
                <p className="text-[10px] text-slate-400">🌿 Bas carbone</p>
                <p className="text-lg font-bold text-green-400">{pctBC}%</p>
                <p className="text-[10px] text-slate-500">{fmt(mwBC)}</p>
              </div>
              <div className="bg-orange-950/30 border border-orange-800/40 rounded-lg p-2.5 flex flex-col gap-0.5">
                <p className="text-[10px] text-slate-400">🏭 Fossile</p>
                <p className="text-lg font-bold text-orange-400">{pctFos}%</p>
                <p className="text-[10px] text-slate-500">{fmt(mwFos)}</p>
              </div>
            </div>
          )}

          {/* Barres filières */}
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Production par filière</p>
              <p className="text-[10px] text-slate-500">Total : <span className="text-slate-200 font-semibold">{fmt(prod)}</span></p>
            </div>
            {mixEnriched.length > 0
              ? mixEnriched.map(f => (
                  <BarreFiliere key={f.label} filiere={f} mw={f.mw} pct={f.pct} isMax={f.mw === maxMw} />
                ))
              : <p className="text-xs text-slate-600 text-center py-3">Données indisponibles</p>
            }
          </div>
        </div>
      )}

      {/* ── ONGLET ÉCHANGES ── */}
      {onglet === 'echanges' && (
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-0.5">

          {/* Solde global */}
          <div className={`rounded-xl border p-3 flex items-center justify-between ${
            (echanges?.exportateur ?? true)
              ? 'bg-green-950/40 border-green-800/40'
              : 'bg-red-950/40 border-red-800/40'
          }`}>
            <div>
              <p className="text-[10px] text-slate-400 mb-1">Solde commercial total</p>
              <p className={`text-2xl font-bold tabular-nums ${echanges?.exportateur ? 'text-green-300' : 'text-red-300'}`}>
                {echanges ? fmtSigné(echanges.solde_mw) : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-bold ${echanges?.exportateur ? 'text-green-400' : 'text-red-400'}`}>
                {echanges?.exportateur ? '🔋 Exportateur net' : '⬇️ Importateur net'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-32 text-right">
                {echanges?.exportateur
                  ? 'La France vend à ses voisins'
                  : 'La France achète à ses voisins'}
              </p>
            </div>
          </div>

          {/* Légende */}
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-6 h-2 rounded-sm bg-green-400/70" /><span>Export →</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-6 h-2 rounded-sm bg-red-400/70" /><span>← Import</span>
            </div>
          </div>

          {/* Barres pays */}
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3 flex flex-col gap-3">
            {PAYS_ECHANGES.map(pays => {
              const mw = etatJeu.echanges_mw?.[pays.key]
              return mw != null
                ? <LigneEchange key={pays.key} pays={pays} mw={mw} maxAbs={maxAbs} />
                : null
            })}
          </div>

          <p className="text-[10px] text-slate-600 px-1">
            ▲ positif = France exporte · ▼ négatif = France importe
          </p>
        </div>
      )}

      {/* ── ONGLET CONSOMMATION ── */}
      {onglet === 'conso' && (
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-0.5">

          {/* 4 métriques */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Consommation réalisée', val: fmt(conso),                        color: 'text-slate-100' },
              { label: 'Production totale',     val: fmt(prod),                         color: 'text-indigo-300' },
              { label: 'Prévision J',           val: fmt(etatJeu.prevision_j_mw),       color: 'text-slate-400' },
              { label: 'Prévision J-1',         val: fmt(etatJeu.prevision_j1_mw),      color: 'text-slate-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-500 mb-1">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* Balance prod/conso */}
          {balance !== null && (
            <div className={`rounded-xl border p-3 flex items-center justify-between ${
              balance >= 0
                ? 'bg-green-950/40 border-green-800/40'
                : 'bg-red-950/40 border-red-800/40'
            }`}>
              <div>
                <p className="text-[10px] text-slate-400">Balance prod. / conso.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {balance >= 0 ? 'Surplus → capacité d\'export' : 'Déficit → recours à l\'import'}
                </p>
              </div>
              <span className={`text-xl font-bold tabular-nums ${balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {fmtSigné(balance)}
              </span>
            </div>
          )}

          {/* Note pédagogique */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 <span className="text-slate-300 font-medium">Point de départ réel.</span>{' '}
              La simulation prend le relais : vos décisions législatives,
              les crises géopolitiques et les maintenances modifient la production et la balance tour par tour.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
