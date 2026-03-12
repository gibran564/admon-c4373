'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const { signIn, signUp, user, loading, isFirebase } = useAuth()
  const router = useRouter()

  const [tab,           setTab]           = useState<Tab>('login')
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [name,          setName]          = useState('')
  const [controlNumber, setControlNumber] = useState('')
  const [claudeApiKey,  setClaudeApiKey]  = useState('')
  const [showApiKey,    setShowApiKey]    = useState(false)
  const [error,         setError]         = useState('')
  const [busy,          setBusy]          = useState(false)

  // If already authenticated → go home
  useEffect(() => {
    if (!loading && user) router.replace('/')
  }, [user, loading, router])

  // If Firebase is not configured → skip login, go home
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
    if (claudeApiKey && !claudeApiKey.startsWith('sk-ant-')) {
      setError('La API key de Claude debe comenzar con sk-ant-')
      return
    }
    setBusy(true)
    try {
      await signUp(
        email.trim(),
        password,
        name.trim(),
        controlNumber.trim(),
        claudeApiKey.trim() || undefined,
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
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">

        {/* Logo */}
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

        {/* Card */}
        <div className="rounded-2xl border border-[#21262d] bg-[#0d1117] overflow-hidden shadow-2xl">

          {/* Tabs */}
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

            {/* ── LOGIN ────────────────────────────────────────────────── */}
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

            {/* ── REGISTER ─────────────────────────────────────────────── */}
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

                {/* Claude API Key — opcional */}
                <div className="rounded-xl border border-[#21262d] bg-[#0a0e16] p-4">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(v => !v)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <span className="text-base">🤖</span>
                    <span className="font-mono text-xs text-slate-400 flex-1">
                      API Key de Claude (opcional)
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {showApiKey ? '▲ ocultar' : '▼ mostrar'}
                    </span>
                  </button>

                  {showApiKey && (
                    <div className="mt-3 space-y-2">
                      <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
                        Habilita el Profesor DBA (IA). Regístrate gratis en{' '}
                        <a
                          href="https://console.anthropic.com/settings/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          console.anthropic.com
                        </a>{' '}
                        y obtén $5 USD de crédito gratuito. También puedes agregarla después en Ajustes.
                      </p>
                      <input
                        type="password"
                        placeholder="sk-ant-api03-..."
                        value={claudeApiKey}
                        onChange={e => setClaudeApiKey(e.target.value)}
                        className="input-dba font-mono text-xs"
                      />
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

        <p className="text-center font-mono text-[11px] text-slate-700 mt-4">
          Tus datos se guardan de forma segura en Firebase Firestore
        </p>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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
