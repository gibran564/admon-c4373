'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { missions, missionUnitColors } from '@/data/missions'
import { getMissionsCompleted, getMissionsTotalXP } from '@/lib/missionStorage'
import { units } from '@/data/curriculum'

const diffLabel = ['','⭐','⭐⭐','⭐⭐⭐','⭐⭐⭐⭐','⭐⭐⭐⭐⭐']
const tagColors: Record<string,string> = {
  'SELECT':'blue','FROM':'blue','WHERE':'violet','JOIN':'orange',
  'GROUP BY':'amber','HAVING':'amber','ORDER BY':'slate',
  'CREATE TABLE':'green','INSERT INTO':'emerald','UPDATE':'yellow','DELETE':'red',
  'CREATE INDEX':'cyan','EXPLAIN':'purple','CTE':'indigo','WITH':'indigo',
  'window function':'pink','ROW_NUMBER':'pink',
  'CREATE VIEW':'teal','BEGIN':'orange','ROLLBACK':'red','COMMIT':'green',
}
function tagClass(tag: string) {
  const c = tagColors[tag] ?? 'slate'
  return `bg-${c}-950/30 border-${c}-800/30 text-${c}-400`
}

export default function MisionesPage() {
  const [completed, setCompleted] = useState<number[]>([])
  const [totalXP, setTotalXP]     = useState(0)
  const [filter, setFilter]       = useState<number|null>(null)  // null muestra todas las unidades.

  useEffect(() => {
    setCompleted(getMissionsCompleted())
    setTotalXP(getMissionsTotalXP())
  }, [])

  const maxXP         = missions.reduce((s, m) => s + m.xpReward, 0)
  const displayList   = filter ? missions.filter(m => m.unitId === filter) : missions
  const groupedByUnit = [1,2,3,4,5,6].map(uid => ({
    unit: units.find(u => u.id === uid)!,
    items: displayList.filter(m => m.unitId === uid),
  })).filter(g => g.items.length > 0)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/playground" className="font-mono text-xs text-slate-500 hover:text-blue-400 transition-colors">
            ← Consola SQL
          </Link>
        </div>
        <h1 className="text-4xl font-black text-white mb-2">⚔️ Misiones SQL</h1>
        <p className="text-slate-400 max-w-xl">
          Desafíos gamificados en el playground SQLite. Cada misión tiene un objetivo, pistas opcionales y un validador automático.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label:'completadas', value:`${completed.length}/${missions.length}`, color:'blue' },
          { label:'XP ganados',  value:`${totalXP}`, color:'yellow' },
          { label:'XP posibles', value:`${maxXP}`, color:'slate' },
          { label:'progreso',    value:`${Math.round((completed.length/missions.length)*100)}%`, color:'green' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 text-center">
            <div className={`font-mono font-black text-2xl text-${s.color}-400`}>{s.value}</div>
            <div className="font-mono text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter(null)}
          className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            filter === null
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-[#0d1117] border-[#21262d] text-slate-400 hover:border-slate-500'
          }`}>
          Todas ({missions.length})
        </button>
        {units.map(u => {
          const uMissions = missions.filter(m => m.unitId === u.id)
          const uDone = uMissions.filter(m => completed.includes(m.id)).length
          return (
            <button key={u.id} onClick={() => setFilter(filter === u.id ? null : u.id)}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === u.id
                  ? 'text-white border-slate-500'
                  : 'bg-[#0d1117] border-[#21262d] text-slate-400 hover:border-slate-500'
              }`}
              style={filter === u.id ? {backgroundColor: missionUnitColors[u.id]+'25', borderColor: missionUnitColors[u.id]+'60'} : {}}>
              {u.icon} U{u.id} ({uDone}/{uMissions.length})
            </button>
          )
        })}
      </div>

      {groupedByUnit.map(({ unit, items }) => {
        const color = missionUnitColors[unit.id]
        const groupDone = items.filter(m => completed.includes(m.id)).length
        return (
          <div key={unit.id} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xl">{unit.icon}</div>
              <div>
                <span className="font-bold text-white text-sm">U{unit.id}: {unit.title}</span>
                <span className="font-mono text-xs text-slate-500 ml-2">{groupDone}/{items.length}</span>
              </div>
              <div className="flex-1 h-px bg-[#21262d]" />
              <div className="font-mono text-xs text-slate-600">{unit.character}</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map(m => {
                const done = completed.includes(m.id)
                return (
                  <Link key={m.id} href={`/misiones/${m.id}`}
                    className={`group rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                      done
                        ? 'bg-green-950/10 border-green-800/30 hover:border-green-700/50'
                        : 'bg-[#0d1117] border-[#21262d] hover:border-blue-700/40'
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{done ? '🏆' : '⚔️'}</span>
                        <div>
                          <div className={`font-bold text-sm leading-tight ${done ? 'text-green-300' : 'text-white'}`}>
                            {m.title}
                          </div>
                          <div className="font-mono text-xs text-slate-500">{m.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-mono text-xs font-bold ${done ? 'text-green-500' : 'text-yellow-500'}`}>
                          {done ? '✓ done' : `+${m.xpReward} XP`}
                        </div>
                        <div className="font-mono text-xs text-slate-600">{m.estimatedTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-xs text-slate-500">{diffLabel[m.difficulty]}</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {m.tags.slice(0,3).map(tag => (
                          <span key={tag}
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded border bg-[#161b22] border-[#21262d] text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
