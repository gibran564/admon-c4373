'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getProfile } from '@/lib/storage'
import { getMissionsCompleted } from '@/lib/missionStorage'
import { getSubmissions } from '@/lib/storage'
import { practices, units } from '@/data/curriculum'
import type { ChatMessage } from '@/types'
import { AI_PROVIDERS, AI_STORAGE_KEYS, getDefaultModel, normalizeProvider, type AIProvider } from '@/lib/aiProviders'

function buildSystemPrompt(pageContext?: string): string {
  // Auto-detect page context from localStorage if not passed as prop
  if (!pageContext && typeof window !== 'undefined') {
    pageContext = localStorage.getItem('tutor_page_context') ?? undefined
  }
  const profile   = typeof window !== 'undefined' ? getProfile() : null
  const completed = typeof window !== 'undefined' ? getMissionsCompleted() : []
  const subs      = typeof window !== 'undefined' ? getSubmissions() : []

  const submittedPractices = subs.map(s => {
    const p = practices.find(p => p.id === s.practiceId)
    return p ? `P${p.id} ${p.title}` : `P${s.practiceId}`
  })
  const pendingPractices = practices
    .filter(p => !subs.some(s => s.practiceId === p.id))
    .map(p => `P${p.id} ${p.title} (U${p.unitId})`)
    .slice(0, 8)
  const unitStatuses = units.map(u => {
    const uSubs = subs.filter(s => practices.find(p => p.id === s.practiceId)?.unitId === u.id)
    return `U${u.id}:${uSubs.length}/${u.practiceIds.length}`
  }).join(' ')

  return `Eres el Profesor DBA del curso Administración de Base de Datos (SCB-1001) del Tecnológico Nacional de México, carrera ISC.

IDENTIDAD: Docente experto en MySQL 8.x y Linux. Mezclas rigor técnico con humor seco de docente de sistemas. Breve: máximo 4-5 oraciones salvo que pidan explicación larga. Cuando detectas un error conceptual lo corriges directamente pero sin ser condescendiente.

PROGRAMA OFICIAL:
U1: DBA(1.1), Análisis manejadores(1.2), Criterios SGBD(1.3), Nuevas tecnologías(1.4)
U2: Memoria/procesos(2.1), Estructura física(2.2), Requerimientos(2.3), Instalación(2.4-2.6), Configuración(2.7), Alta/baja(2.8)
U3: Espacio(3.1-3.2), Cuotas usuarios(3.3), Espacios objetos(3.4), Roles(3.4)
U4: Logs(4.1), Modos operación alta/baja/recovery(4.2), Índices(4.3)
U5: Espejeo(5.1), Réplica(5.2), Respaldo(5.3), Recuperación(5.4), Migración(5.5)
U6: Monitoreo(6.1), Auditoría(6.2)
SGBD: MySQL 8.x en Ubuntu Server 22.04. App: Java 17 + Spring Boot 3.x + JDBC puro.

ALUMNO:
${profile ? `Nombre: ${profile.name} | No.Control: ${profile.controlNumber} | Nivel: ${profile.level} | XP: ${profile.xp}` : 'Sin perfil configurado'}
Progreso: ${unitStatuses}
Prácticas entregadas(${submittedPractices.length}): ${submittedPractices.slice(0,6).join(', ') || 'ninguna'}
Pendientes: ${pendingPractices.slice(0,5).join(', ')}
Misiones SQL: ${completed.length} de 23 completadas
${pageContext ? `PÁGINA ACTUAL: ${pageContext}` : ''}

REGLAS:
1. Personaliza siempre usando el nombre si lo tienes.
2. Usa siempre ejemplos del esquema del curso: tablas alumnos, materias, inscripciones, profesores, bitacora_accesos.
3. Si pregunta algo fuera del programa SCB-1001 dile amablemente que eso no lo cubres.
4. Responde siempre en español mexicano.
5. Código: completo y funcional.`
}

const HISTORY_KEY = 'ai_tutor_history'
const MAX_HISTORY = 20

function loadHistory(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') } catch { return [] }
}
function saveHistory(msgs: ChatMessage[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY))) } catch {}
}

async function streamChat(
  messages: {role:'user'|'assistant';content:string}[],
  system: string,
  settings: { provider: AIProvider; apiKey: string; model: string; baseUrl: string },
  onChunk: (t:string) => void,
  onDone: () => void,
  onError: (e:string) => void
) {
  try {
    if (!settings.apiKey) { onError('Configura tu API key primero (botón de llave)'); return }
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: settings.provider === 'compatible' ? settings.baseUrl : undefined,
        system,
        messages,
      }),
    })
    if (!res.ok) { onError(`Error ${res.status}`); return }
    const reader = res.body!.getReader()
    const dec = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream:true })
      const lines = buf.split('\n'); buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const d = line.slice(6).trim()
        if (d === '[DONE]') { onDone(); return }
        try {
          const p = JSON.parse(d)
          if (p.text) onChunk(p.text)
        } catch {}
      }
    }
    onDone()
  } catch (e: any) { onError(e.message ?? 'Error de red') }
}

const QUICK = [
  { label:'🎯 ¿Qué sigue?',    msg:'¿Cuál es la siguiente práctica que debo completar?' },
  { label:'📖 Explícame esto', msg:'¿Puedes explicarme el tema de lo que estoy viendo ahora?' },
  { label:'🐛 Tengo un error', msg:'Tengo un error en mi SQL o configuración, ¿puedes ayudarme?' },
  { label:'⚡ Tip rápido',     msg:'Dame el tip más importante sobre el tema actual del curso.' },
]

interface Props { pageContext?: string }

export function AITutor({ pageContext }: Props) {
  const [open,       setOpen]       = useState(false)
  const [apiKey,     setApiKey]     = useState('')
  const [keyInput,   setKeyInput]   = useState('')
  const [provider,   setProvider]   = useState<AIProvider>('anthropic')
  const [model,      setModel]      = useState(getDefaultModel('anthropic'))
  const [baseUrl,    setBaseUrl]    = useState(AI_PROVIDERS.compatible.baseUrl ?? '')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [input,      setInput]      = useState('')
  const [streaming,  setStreaming]   = useState(false)
  const [streamText, setStreamText] = useState('')
  const [firstName,  setFirstName]  = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef(false)

  useEffect(() => {
    if (!open) return
    const savedProvider = normalizeProvider(localStorage.getItem(AI_STORAGE_KEYS.provider) ?? undefined)
    const savedKey = localStorage.getItem(AI_STORAGE_KEYS.apiKey)
      ?? localStorage.getItem(AI_STORAGE_KEYS.legacyClaudeApiKey)
      ?? ''
    const savedModel = localStorage.getItem(AI_STORAGE_KEYS.model) || getDefaultModel(savedProvider)
    const savedBaseUrl = localStorage.getItem(AI_STORAGE_KEYS.baseUrl) || AI_PROVIDERS.compatible.baseUrl || ''
    setProvider(savedProvider)
    setModel(savedModel)
    setBaseUrl(savedBaseUrl)
    setApiKey(savedKey)
    setKeyInput(savedKey)
    if (!savedKey) setShowKeyModal(true)
    setMessages(loadHistory())
    const p = getProfile()
    if (p?.name) setFirstName(p.name.split(' ')[0])
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, streamText])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return
    const userMsg: ChatMessage = { role:'user', content:text.trim(), ts:Date.now() }
    const history = [...messages, userMsg]
    setMessages(history); setInput(''); setStreaming(true); setStreamText(''); abortRef.current = false
    const apiMsgs = history.map(m => ({ role:m.role, content:m.content }))
    let full = ''
    streamChat(
      apiMsgs,
      buildSystemPrompt(pageContext),
      { provider, apiKey, model, baseUrl },
      (chunk) => { if (!abortRef.current) { full += chunk; setStreamText(full) } },
      () => {
        if (!abortRef.current) {
          const final = [...history, { role:'assistant' as const, content:full, ts:Date.now() }]
          setMessages(final); saveHistory(final); setStreamText(''); setStreaming(false)
        }
      },
      (err) => {
        setMessages(prev => [...prev, { role:'assistant', content:`⚠️ ${err}`, ts:Date.now() }])
        setStreaming(false); setStreamText('')
      }
    )
  }, [messages, streaming, pageContext, provider, apiKey, model, baseUrl])

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <>
      {/* Key config modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#30363d] bg-[#0d1117] p-6 shadow-2xl">
            <div className="text-center mb-5">
              <span className="text-4xl">🔑</span>
              <h2 className="font-bold text-white text-lg mt-2">Configura tu API Key</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Elige el proveedor del Profesor DBA: Claude, OpenAI, Groq o cualquier API compatible con OpenAI.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(Object.keys(AI_PROVIDERS) as AIProvider[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProvider(p)
                    setModel(getDefaultModel(p))
                    setBaseUrl(AI_PROVIDERS[p].baseUrl ?? '')
                  }}
                  className={`font-mono text-xs rounded-lg border py-2 transition-colors ${
                    provider === p
                      ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                      : 'border-[#21262d] bg-[#161b22] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {AI_PROVIDERS[p].label}
                </button>
              ))}
            </div>
            <a href={AI_PROVIDERS[provider].keyUrl} target="_blank" rel="noopener"
              className="block w-full text-center font-mono text-xs py-2 mb-4 rounded-lg border border-blue-800/40 bg-blue-950/30 text-blue-300 hover:border-blue-600/60 transition-colors">
              Obtener key de {AI_PROVIDERS[provider].label}
            </a>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && keyInput.trim()) {
                  saveAISettings(provider, keyInput, model, baseUrl)
                  setApiKey(keyInput.trim()); setShowKeyModal(false)
                }
              }}
              placeholder={AI_PROVIDERS[provider].keyPlaceholder}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-700/50 font-mono mb-3"
            />
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder={AI_PROVIDERS[provider].defaultModel}
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-700/50 font-mono mb-3"
            />
            {provider === 'compatible' && (
              <input
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-700/50 font-mono mb-3"
              />
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowKeyModal(false)}
                className="flex-1 font-mono text-xs py-2 rounded-lg border border-[#21262d] text-slate-500 hover:text-slate-300 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!keyInput.trim()) return
                  saveAISettings(provider, keyInput, model, baseUrl)
                  setApiKey(keyInput.trim()); setShowKeyModal(false)
                }}
                disabled={!keyInput.trim() || !model.trim() || (provider === 'compatible' && !baseUrl.trim())}
                className="flex-1 font-mono text-xs py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors">
                Guardar key
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-700 mt-3 text-center">
              Tu key se guarda en este dispositivo y se usa solo para llamar al proveedor seleccionado
            </p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 ${
          open ? 'bg-[#0d1117] border-2 border-slate-700 text-slate-400' : 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white hover:scale-110'
        }`}>
        <span className="text-2xl select-none">{open ? '✕' : '🤖'}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden"
          style={{ width:'360px', maxWidth:'calc(100vw - 24px)', height:'520px', maxHeight:'calc(100vh - 120px)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#21262d] bg-[#161b22] flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#161b22]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-white leading-tight">Profesor DBA</div>
              <div className="font-mono text-[10px] text-slate-500 truncate">
                {firstName ? `Hola de nuevo, ${firstName}` : 'SCB-1001 · IA Personalizada'}
                <span className="text-slate-600 ml-1">· {AI_PROVIDERS[provider].label}</span>
                {pageContext && <span className="text-blue-700 ml-1">· {pageContext.slice(0,25)}</span>}
              </div>
            </div>
            <button onClick={() => { setShowKeyModal(true); setKeyInput('') }}
              title="Cambiar API key"
              className={`text-sm px-1 py-1 rounded transition-colors ${apiKey ? 'text-green-700 hover:text-green-400' : 'text-yellow-700 hover:text-yellow-400 animate-pulse'}`}>
              {apiKey ? '🔑' : '⚠️'}
            </button>
            <button onClick={() => { setMessages([]); localStorage.removeItem(HISTORY_KEY) }}
              title="Limpiar chat" className="text-slate-700 hover:text-slate-400 text-sm px-1 py-1 rounded transition-colors">
              🗑️
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && !streaming && (
              <div className="flex flex-col items-center pt-4 pb-2 gap-3">
                <span className="text-3xl">🎓</span>
                <p className="text-sm text-slate-400 text-center leading-relaxed max-w-[240px]">
                  {firstName ? `¿En qué te ayudo hoy, ${firstName}?` : '¿Tienes alguna duda del curso?'}
                </p>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  {QUICK.map(q => (
                    <button key={q.label} onClick={() => send(q.msg)}
                      className="text-left font-mono text-xs px-3 py-2 rounded-xl border border-[#21262d] bg-[#161b22] text-slate-400 hover:border-blue-700/50 hover:text-blue-300 transition-colors">
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px]">🤖</span>
                  </div>
                )}
                <div className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role==='user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-[#161b22] border border-[#21262d] text-slate-300 rounded-bl-none'
                }`}>
                  <MsgContent content={m.content} />
                </div>
              </div>
            ))}

            {streaming && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px]">🤖</span>
                </div>
                <div className="max-w-[86%] rounded-2xl rounded-bl-none px-3 py-2 text-sm bg-[#161b22] border border-[#21262d] text-slate-300 leading-relaxed">
                  {streamText
                    ? <MsgContent content={streamText} />
                    : <span className="flex gap-1 py-1">{[0,1,2].map(i=>(
                        <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                          style={{animationDelay:`${i*150}ms`}} />
                      ))}</span>
                  }
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-3 py-2.5 border-t border-[#21262d] bg-[#161b22]">
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={onKey} placeholder="Pregunta al Profesor DBA..." rows={1} disabled={streaming}
                className="flex-1 bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none outline-none focus:border-blue-700/50 transition-colors disabled:opacity-50 font-mono"
                style={{ minHeight:'36px', maxHeight:'90px' }} />
              <button onClick={() => send(input)} disabled={!input.trim() || streaming}
                className="w-9 h-9 flex-shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-700 mt-1 text-center">Enter = enviar · Shift+Enter = nueva línea</p>
          </div>
        </div>
      )}
    </>
  )
}

function saveAISettings(provider: AIProvider, apiKey: string, model: string, baseUrl: string) {
  localStorage.setItem(AI_STORAGE_KEYS.provider, provider)
  localStorage.setItem(AI_STORAGE_KEYS.apiKey, apiKey.trim())
  localStorage.setItem(AI_STORAGE_KEYS.model, model.trim() || getDefaultModel(provider))
  localStorage.setItem(AI_STORAGE_KEYS.baseUrl, baseUrl.trim())
  if (provider === 'anthropic') localStorage.setItem(AI_STORAGE_KEYS.legacyClaudeApiKey, apiKey.trim())
}

function MsgContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim()
          return <pre key={i} className="mt-1 mb-1 p-2 rounded-lg bg-[#0d1117] border border-[#21262d] text-xs text-green-300 overflow-x-auto whitespace-pre font-mono">{code}</pre>
        }
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="font-mono text-[11px] bg-[#0d1117] border border-[#21262d] px-1 py-0.5 rounded text-cyan-400">{part.slice(1,-1)}</code>
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-white">{part.slice(2,-2)}</strong>
        return <span key={i}>{part.split('\n').map((line, j, arr) => <span key={j}>{line}{j < arr.length-1 && <br/>}</span>)}</span>
      })}
    </span>
  )
}
