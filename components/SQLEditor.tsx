'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useSQLite, type QueryResult } from '@/lib/useSQLite'

interface SQLEditorProps {
  initialSQL?: string
  onResult?: (results: QueryResult[]) => void
  onRun?: (sql: string) => void
  height?: string
  showHistory?: boolean
  className?: string
}

const HISTORY_KEY = 'scb1001_sql_history'
const MAX_ROWS_DISPLAY = 200

function loadHistory(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(sql: string) {
  const h = loadHistory()
  const next = [sql, ...h.filter(s => s !== sql)].slice(0, 30)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
}

export function SQLEditor({ initialSQL = '', onResult, onRun, height = '160px', showHistory = true, className = '' }: SQLEditorProps) {
  const { ready, loading, initError, runQuery, resetDB } = useSQLite()
  const [sql, setSql]                     = useState(initialSQL)
  const [results, setResults]             = useState<QueryResult[]>([])
  const [error, setError]                 = useState<string | null>(null)
  const [running, setRunning]             = useState(false)
  const [historyOpen, setHistoryOpen]     = useState(false)
  const [history, setHistory]             = useState<string[]>([])
  const [execTime, setExecTime]           = useState<number | null>(null)
  const textareaRef                       = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setHistory(loadHistory()) }, [])
  useEffect(() => { setSql(initialSQL) }, [initialSQL])

  const handleRun = useCallback(() => {
    if (!ready || running) return
    const trimmed = sql.trim()
    if (!trimmed) return

    setRunning(true)
    setError(null)
    setResults([])

    // SQLite corre síncrono en el browser; este tick deja pintar el estado "Ejecutando" antes del golpe.
    setTimeout(() => {
      const t0 = performance.now()
      const { results: res, error: err } = runQuery(trimmed)
      const elapsed = Math.round(performance.now() - t0)

      if (err) {
        setError(err.message)
      } else {
        setResults(res)
        setExecTime(elapsed)
        saveHistory(trimmed)
        setHistory(loadHistory())
        onResult?.(res)
        onRun?.(trimmed)
      }
      setRunning(false)
    }, 0)
  }, [ready, running, sql, runQuery, onResult, onRun])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
    // El textarea no sabe de indentación; dos espacios mantienen las queries legibles sin meter tabs raros.
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = textareaRef.current!
      const start = el.selectionStart
      const end   = el.selectionEnd
      const newSql = sql.slice(0, start) + '  ' + sql.slice(end)
      setSql(newSql)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2 })
    }
  }

  return (
    <div className={`rounded-xl border border-[#21262d] overflow-hidden ${className}`}>

      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            loading ? 'bg-yellow-500 animate-pulse' :
            initError ? 'bg-red-500' : 'bg-green-500'
          }`} />
          <span className="font-mono text-xs text-slate-500">
            {loading ? 'Cargando SQLite…' : initError ? 'Error' : 'escolar_admin'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {showHistory && (
            <button onClick={() => setHistoryOpen(o => !o)}
              className="font-mono text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-white/5 transition-colors"
              title="Historial de consultas">
              📋 Historial
            </button>
          )}
          <button onClick={resetDB}
            className="font-mono text-xs text-slate-500 hover:text-yellow-400 px-2 py-1 rounded hover:bg-yellow-950/20 transition-colors"
            title="Resetear la base de datos al estado inicial">
            🔄 Reset DB
          </button>
          <button
            onClick={handleRun}
            disabled={!ready || running}
            className="flex items-center gap-1.5 font-mono text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded transition-colors"
          >
            {running ? '⏳ Ejecutando…' : '▶ Ejecutar'}
            <span className="text-blue-300 hidden sm:inline">Ctrl+↵</span>
          </button>
        </div>
      </div>

      {historyOpen && history.length > 0 && (
        <div className="border-b border-[#21262d] bg-[#0a0f16] max-h-40 overflow-y-auto">
          {history.map((h, i) => (
            <button key={i} onClick={() => { setSql(h); setHistoryOpen(false) }}
              className="w-full text-left px-4 py-2 font-mono text-xs text-slate-400 hover:bg-[#161b22] hover:text-slate-200 truncate border-b border-[#21262d]/50 last:border-0 transition-colors">
              {h.replace(/\n/g, ' ').slice(0, 120)}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={e => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full bg-[#0d1117] text-slate-200 font-mono text-sm px-4 py-3 resize-none focus:outline-none leading-relaxed"
          style={{ height, tabSize: 2 }}
          placeholder="-- Escribe tu consulta SQL aquí&#10;-- Ctrl+Enter para ejecutar"
          disabled={!ready}
        />
        <div className="absolute top-2 right-2 font-mono text-xs text-slate-700 pointer-events-none select-none">
          {sql.split('\n').length} líneas
        </div>
      </div>

      {(results.length > 0 || error) && (
        <div className="border-t border-[#21262d]">

          {error && (
            <div className="px-4 py-3 bg-red-950/20 border-b border-red-800/30">
              <div className="flex items-start gap-2">
                <span className="text-red-400 text-sm flex-shrink-0">⚠</span>
                <div>
                  <div className="font-mono text-xs text-red-400 font-bold mb-0.5">Error SQL</div>
                  <pre className="font-mono text-xs text-red-300 whitespace-pre-wrap">{error}</pre>
                </div>
              </div>
            </div>
          )}

          {results.map((result, ri) => (
            <ResultTable key={ri} result={result} execTime={execTime} maxRows={MAX_ROWS_DISPLAY} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResultTable({ result, execTime, maxRows }: { result: QueryResult; execTime: number | null; maxRows: number }) {
  const displayRows = result.rows.slice(0, maxRows)
  const isClipped   = result.rows.length > maxRows

  if (result.columns.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0f16] border-b border-[#21262d]">
        <span className="font-mono text-xs text-slate-500">
          {result.rows.length} fila{result.rows.length !== 1 ? 's' : ''} · {result.columns.length} columna{result.columns.length !== 1 ? 's' : ''}
          {result.rowsAffected !== undefined && ` · ${result.rowsAffected} filas afectadas`}
        </span>
        {execTime !== null && (
          <span className="font-mono text-xs text-green-600">{execTime}ms</span>
        )}
      </div>

      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-xs">
          <thead className="sticky top-0">
            <tr className="bg-[#161b22] border-b border-[#21262d]">
              {result.columns.map((col, i) => (
                <th key={i} className="text-left font-mono font-semibold text-blue-400 px-3 py-2 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, ri) => (
              <tr key={ri} className={`border-b border-[#21262d]/50 hover:bg-white/[0.02] ${ri % 2 === 0 ? '' : 'bg-[#0d1117]/30'}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className="font-mono text-slate-300 px-3 py-1.5 whitespace-nowrap max-w-[280px] truncate">
                    {cell === null || cell === undefined
                      ? <span className="text-slate-600 italic">NULL</span>
                      : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isClipped && (
        <div className="px-4 py-2 font-mono text-xs text-yellow-500 bg-yellow-950/10 border-t border-[#21262d]">
          ⚠ Mostrando {maxRows} de {result.rows.length} filas. Usa LIMIT para reducir resultados.
        </div>
      )}
    </div>
  )
}
