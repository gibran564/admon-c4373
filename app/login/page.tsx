'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { AI_PROVIDERS, getDefaultModel, type AIProvider } from '@/lib/aiProviders'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const { signIn, signUp, user, loading, isFirebase } = useAuth()
  const router = useRouter()

  const [tab,           setTab]           = useState<Tab>('login')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [name,          setName]          = useState('')
  const [controlNumber, setControlNumber] = useState('')
  const [aiProvider,    setAiProvider]    = useState<AIProvider>('anthropic')
  const [aiApiKey,      setAiApiKey]      = useState('')
  const [aiModel,       setAiModel]       = useState(getDefaultModel('anthropic'))
  const [aiBaseUrl,     setAiBaseUrl]     = useState(AI_PROVIDERS.compatible.baseUrl ?? '')
  const [showApiKey,    setShowApiKey]    = useState(false)
  const [error,         setError]         = useState('')
  const [busy,          setBusy]          = useState(false)

  // Si Firebase ya resolvió sesión, no dejamos al usuario atrapado en login mirando la puerta abierta.
  useEffect(() => {
    if (!loading && user) router.replace('/')
  }, [user, loading, router])

  // En modo local no hay autenticación real, así que login solo estorba.
  useEffect(() => {
    if (!loading && !isFirebase) router.replace('/')
  }, [isFirebase, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email.trim(), password)
      router.replace('/')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim())          { setError('El nombre es obligatorio.'); return }
    if (!controlNumber.trim()) { setError('El número de control es obligatorio.'); return }
    if (password.length < 6)   { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setBusy(true)
    try {
      await signUp(
        email.trim(),
        password,
        name.trim(),
        controlNumber.trim(),
        aiApiKey.trim() || undefined,
        aiApiKey.trim() ? aiProvider : undefined,
        aiApiKey.trim() ? aiModel.trim() : undefined,
        aiApiKey.trim() && aiProvider === 'compatible' ? aiBaseUrl.trim() : undefined,
      )
      router.replace('/')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05080f]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center px-4 relative overflow-hidden">
      <NeuralCanvas />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-180px] right-[-120px] w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg font-mono">
              DB
            </div>
            <div className="text-left">
              <div className="font-black text-white text-xl leading-tight">SCB-1001</div>
              <div className="font-mono text-xs text-slate-500">Administración de Base de Datos</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            TecNM · Ingeniería en Sistemas Computacionales · Feb–Jul 2026
          </p>
        </div>

        <div className="rounded-2xl border border-blue-900/35 bg-[#0d1117]/90 backdrop-blur-md overflow-hidden shadow-2xl shadow-blue-950/30">

          <div className="flex border-b border-[#21262d]">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === 'login'
                  ? 'text-white border-b-2 border-blue-500 bg-blue-600/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === 'register'
                  ? 'text-white border-b-2 border-blue-500 bg-blue-600/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="p-6">

            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1.5">
                    Correo institucional
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="usuario@itd.edu.mx"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-dba"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-dba"
                  />
                </div>

                {error && <ErrorBox msg={error} />}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                >
                  {busy
                    ? <><Spinner /> Iniciando sesión…</>
                    : '🔐 Iniciar sesión'}
                </button>

                <p className="text-center font-mono text-xs text-slate-600 mt-2">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </form>
            )}

            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-slate-400 mb-1.5">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-dba"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-1.5">
                      No. de control <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="21100123"
                      value={controlNumber}
                      onChange={e => setControlNumber(e.target.value)}
                      className="input-dba"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-slate-400 mb-1.5">
                      Correo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="usuario@itd.edu.mx"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-dba"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1.5">
                    Contraseña <span className="text-red-500">*</span>
                    <span className="text-slate-600 ml-1">(mínimo 6 caracteres)</span>
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-dba"
                  />
                </div>

                <div className="rounded-xl border border-[#21262d] bg-[#0a0e16] p-4">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(v => !v)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <span className="text-base">🤖</span>
                    <span className="font-mono text-xs text-slate-400 flex-1">
                      API del Profesor DBA (opcional)
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {showApiKey ? '▲ ocultar' : '▼ mostrar'}
                    </span>
                  </button>

                  {showApiKey && (
                    <div className="mt-3 space-y-2">
                      <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
                        Habilita el Profesor DBA con Claude, OpenAI, Groq o una API compatible. Puedes crear una key en{' '}
                        <a
                          href={AI_PROVIDERS[aiProvider].keyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {AI_PROVIDERS[aiProvider].label}
                        </a>{' '}
                        o agregarla después en Ajustes.
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
                    </div>
                  )}
                </div>

                {error && <ErrorBox msg={error} />}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {busy
                    ? <><Spinner /> Creando cuenta…</>
                    : '🚀 Crear cuenta y entrar'}
                </button>

                <p className="text-center font-mono text-xs text-slate-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="rounded-lg border border-blue-900/25 bg-blue-950/20 py-2 px-2">
            <p className="font-mono text-[10px] text-blue-400">100%</p>
            <p className="font-mono text-[10px] text-slate-500">Firestore</p>
          </div>
          <div className="rounded-lg border border-cyan-900/25 bg-cyan-950/20 py-2 px-2">
            <p className="font-mono text-[10px] text-cyan-400">24 Labs</p>
            <p className="font-mono text-[10px] text-slate-500">Prácticas</p>
          </div>
          <div className="rounded-lg border border-violet-900/25 bg-violet-950/20 py-2 px-2">
            <p className="font-mono text-[10px] text-violet-400">DBA XP</p>
            <p className="font-mono text-[10px] text-slate-500">Gamificado</p>
          </div>
        </div>

        <p className="text-center font-mono text-[11px] text-slate-700 mt-4">
          Tus datos se guardan de forma segura en Firebase Firestore
        </p>
      </div>
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg bg-red-950/40 border border-red-800/40 px-3 py-2.5 font-mono text-xs text-red-400">
      ⚠️ {msg}
    </div>
  )
}

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
  )
}

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(2, window.devicePixelRatio || 1)
    const nodes = Array.from({ length: Math.min(70, Math.floor(width / 24)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() * 1.8 + 0.7,
    }))

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * DPR)
      canvas.height = Math.floor(height * DPR)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(4, 10, 18, 0.45)'
      ctx.fillRect(0, 0, width, height)

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            const alpha = 1 - dist / 140
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.22})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(96, 165, 250, 0.8)'
        ctx.shadowColor = 'rgba(56, 189, 248, 0.7)'
        ctx.shadowBlur = 12
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      raf = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none opacity-80"
    />
  )
}

function friendlyError(code?: string): string {
  switch (code) {
    case 'auth/invalid-email':           return 'El correo no tiene un formato válido.'
    case 'auth/user-not-found':          return 'No existe una cuenta con ese correo.'
    case 'auth/wrong-password':          return 'Contraseña incorrecta.'
    case 'auth/email-already-in-use':    return 'Ese correo ya tiene una cuenta registrada.'
    case 'auth/weak-password':           return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/too-many-requests':       return 'Demasiados intentos fallidos. Intenta más tarde.'
    case 'auth/invalid-credential':      return 'Correo o contraseña incorrectos.'
    case 'auth/network-request-failed':  return 'Error de red. Verifica tu conexión.'
    default:                             return 'Ocurrió un error. Inténtalo de nuevo.'
  }
}
