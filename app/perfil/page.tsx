'use client'
import { useState, useEffect } from 'react'
import { getSubmissions, levelTitle, xpProgressPct, xpForNextLevel } from '@/lib/storage'
import { practices } from '@/data/curriculum'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { AI_PROVIDERS, getDefaultModel, normalizeProvider, type AIProvider } from '@/lib/aiProviders'

const BADGES = [
  { id: 'explorer',    emoji: '🔭', name: 'El Explorador',  desc: 'Completó la Unidad 1', unitId: 1 },
  { id: 'architect',   emoji: '🏗️', name: 'El Arquitecto',  desc: 'Completó la Unidad 2', unitId: 2 },
  { id: 'treasurer',   emoji: '💾', name: 'El Tesorero',    desc: 'Completó la Unidad 3', unitId: 3 },
  { id: 'mechanic',    emoji: '⚡', name: 'El Mecánico',    desc: 'Completó la Unidad 4', unitId: 4 },
  { id: 'guardian',    emoji: '🔐', name: 'El Guardián',    desc: 'Completó la Unidad 5', unitId: 5 },
  { id: 'oracle',      emoji: '👁️', name: 'El Oráculo',     desc: 'Completó la Unidad 6', unitId: 6 },
  { id: 'grandmaster', emoji: '🏆', name: 'Grand DBA',      desc: 'Completó todas las prácticas', unitId: 0 },
]

export default function PerfilPage() {
  const { profile, updateProfile, isFirebase } = useAuth()

  const [name,         setName]         = useState('')
  const [control,      setControl]      = useState('')
  const [aiProvider,   setAiProvider]   = useState<AIProvider>('anthropic')
  const [aiApiKey,     setAiApiKey]     = useState('')
  const [aiModel,      setAiModel]      = useState(getDefaultModel('anthropic'))
  const [aiBaseUrl,    setAiBaseUrl]    = useState(AI_PROVIDERS.compatible.baseUrl ?? '')
  const [showApiKey,   setShowApiKey]   = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [submissions,  setSubmissions]  = useState<ReturnType<typeof getSubmissions>>([])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setControl(profile.controlNumber)
      const provider = normalizeProvider(profile.aiProvider || (profile.claudeApiKey ? 'anthropic' : undefined))
      setAiProvider(provider)
      setAiApiKey(profile.aiApiKey || profile.claudeApiKey || '')
      setAiModel(profile.aiModel || getDefaultModel(provider))
      setAiBaseUrl(profile.aiBaseUrl || AI_PROVIDERS.compatible.baseUrl || '')
    }
    setSubmissions(getSubmissions())
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !control) return

    const trimmedKey = aiApiKey.trim()
    await updateProfile({
      name: name.trim(),
      controlNumber: control.trim(),
      aiProvider,
      aiModel: aiModel.trim() || getDefaultModel(aiProvider),
      aiBaseUrl: aiProvider === 'compatible' ? aiBaseUrl.trim() : '',
      aiApiKey: trimmedKey,
      claudeApiKey: aiProvider === 'anthropic' ? trimmedKey : '',
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const submittedIds    = new Set(submissions.map(s => s.practiceId))
  const submittedByUnit = (unitId: number) =>
    practices.filter(p => p.unitId === unitId && submittedIds.has(p.id)).length
  const totalByUnit     = (unitId: number) =>
    practices.filter(p => p.unitId === unitId).length

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono text-xs text-blue-400 mb-2">CONFIGURACIÓN</div>
        <h1 className="text-3xl font-black text-white">Tu perfil DBA</h1>
        <p className="text-slate-400 mt-1">
          Tu nombre y número de control se incluyen automáticamente en los reportes Markdown.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-6">

        {/* ── Form ── */}
        <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-6 space-y-5">
          <form onSubmit={handleSave} className="space-y-4">

            {/* Email — read only from Firebase */}
            {isFirebase && profile?.email && (
              <div>
                <label className="block font-mono text-xs text-slate-500 mb-1.5">
                  Correo (cuenta Firebase)
                </label>
                <div className="input-dba opacity-60 cursor-not-allowed select-all text-slate-400">
                  {profile.email}
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                className="input-dba text-base"
                placeholder="Tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5">
                Número de control <span className="text-red-500">*</span>
              </label>
              <input
                className="input-dba"
                placeholder="ej. 21100123"
                value={control}
                onChange={e => setControl(e.target.value)}
                required
              />
              <p className="font-mono text-[11px] text-slate-600 mt-1">
                Se incluirá automáticamente en todos tus reportes Markdown.
              </p>
            </div>

            {/* AI API Key */}
            <div className="rounded-xl border border-[#21262d] bg-[#0a0e16] p-4">
              <button
                type="button"
                onClick={() => setShowApiKey(v => !v)}
                className="flex items-center gap-2 w-full text-left"
              >
                <span className="text-base">🤖</span>
                <span className="font-mono text-xs text-slate-400 flex-1">
                  API del Profesor DBA
                </span>
                <span className="text-[10px] font-mono text-slate-600">
                  {showApiKey ? '▲' : '▼'}
                </span>
              </button>

              {showApiKey && (
                <div className="mt-3 space-y-2">
                  <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
                    Habilita el tutor con Claude, OpenAI, Groq o una API compatible. Crea una key en{' '}
                    <a
                      href={AI_PROVIDERS[aiProvider].keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {AI_PROVIDERS[aiProvider].label}
                    </a>.
                    Se sincroniza automáticamente en este dispositivo.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(AI_PROVIDERS) as AIProvider[]).map(provider => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => {
                          setAiProvider(provider)
                          setAiModel(getDefaultModel(provider))
                          setAiBaseUrl(AI_PROVIDERS[provider].baseUrl ?? '')
                        }}
                        className={`font-mono text-[11px] rounded-lg border py-2 transition-colors ${
                          aiProvider === provider
                            ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                            : 'border-[#21262d] bg-[#161b22] text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {AI_PROVIDERS[provider].label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="password"
                    placeholder={AI_PROVIDERS[aiProvider].keyPlaceholder}
                    value={aiApiKey}
                    onChange={e => setAiApiKey(e.target.value)}
                    className="input-dba font-mono text-xs"
                  />
                  <input
                    placeholder={AI_PROVIDERS[aiProvider].defaultModel}
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value)}
                    className="input-dba font-mono text-xs"
                  />
                  {aiProvider === 'compatible' && (
                    <input
                      placeholder="https://api.openai.com/v1"
                      value={aiBaseUrl}
                      onChange={e => setAiBaseUrl(e.target.value)}
                      className="input-dba font-mono text-xs"
                    />
                  )}
                  {aiApiKey && (
                    <div className="font-mono text-[11px] text-green-500">
                      Configurado para {AI_PROVIDERS[aiProvider].label}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-1">
              <button type="submit" className="btn-primary w-full">
                {profile ? '💾 Guardar cambios' : '🚀 Crear perfil'}
              </button>
            </div>

            {saved && (
              <div className="font-mono text-xs text-green-400 bg-green-950/30 border border-green-800/40 rounded-lg px-3 py-2 text-center">
                ✅ Perfil guardado correctamente
              </div>
            )}
          </form>

          {/* Estadísticas */}
          {profile && (
            <div className="pt-5 border-t border-[#21262d]">
              <div className="font-mono text-xs text-slate-500 mb-3">ESTADÍSTICAS DEL SEMESTRE</div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Prácticas entregadas" value={`${submittedIds.size}`}
                  sub={`de ${practices.length}`} color="text-blue-400" />
                <StatBox label="XP acumulados" value={profile.xp.toLocaleString()}
                  sub="pts" color="text-yellow-400" />
                <StatBox label="Nivel actual" value={`${profile.level}`}
                  sub={levelTitle(profile.level)} color="text-violet-400" />
                <StatBox label="Completado"
                  value={`${Math.round((submittedIds.size / practices.length) * 100)}%`}
                  sub="del curso" color="text-green-400" />
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: XP + badges ── */}
        <div className="space-y-4">
          {profile && (
            <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-5">
              <div className="text-center mb-4">
                <div className="text-5xl font-black font-mono text-blue-400">{profile.level}</div>
                <div className="text-sm text-white font-bold mt-1">{levelTitle(profile.level)}</div>
                <div className="font-mono text-xs text-slate-500 mt-0.5">{profile.xp.toLocaleString()} XP total</div>
              </div>
              <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-1">
                <div className="xp-bar h-full" style={{ width: `${xpProgressPct(profile.xp)}%` }} />
              </div>
              <div className="flex justify-between font-mono text-xs text-slate-600">
                <span>Lv {profile.level}</span>
                <span>{xpForNextLevel(profile.level)} XP → Lv {profile.level + 1}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
            <div className="font-mono text-xs text-slate-500 mb-3">INSIGNIAS</div>
            <div className="space-y-2">
              {BADGES.map(badge => {
                const earned = badge.unitId === 0
                  ? submittedIds.size === practices.length
                  : submittedByUnit(badge.unitId) === totalByUnit(badge.unitId) && totalByUnit(badge.unitId) > 0
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                      earned
                        ? 'bg-yellow-950/30 border border-yellow-800/40'
                        : 'bg-[#0a0e16] border border-[#21262d] opacity-40'
                    }`}
                  >
                    <span className="text-xl">{badge.emoji}</span>
                    <div>
                      <div className="font-bold text-xs text-white leading-tight">{badge.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{badge.desc}</div>
                    </div>
                    {earned && <span className="ml-auto text-yellow-400 text-xs">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, sub, color }: {
  label: string; value: string; sub: string; color: string
}) {
  return (
    <div className="rounded-lg bg-[#0a0e16] border border-[#21262d] px-3 py-2.5">
      <div className={`text-xl font-black font-mono ${color}`}>{value}</div>
      <div className="font-mono text-[10px] text-slate-500 leading-tight mt-0.5">{label}</div>
      <div className="font-mono text-[10px] text-slate-600">{sub}</div>
    </div>
  )
}
