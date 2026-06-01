'use client'
import { useState } from 'react'
import type { VideoResource } from '@/types'

interface Props {
  videos  : VideoResource[]
  unitId  : number
}

export function VideoSection({ videos, unitId }: Props) {
  const [active, setActive] = useState<string | null>(null)

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#21262d] p-5 text-center">
        <div className="text-2xl mb-2">🎬</div>
        <p className="text-sm text-slate-500">
          Videos de apoyo próximamente
        </p>
        <p className="font-mono text-xs text-slate-700 mt-1">
          El profesor agregará videos para esta unidad en <code>data/videos.ts</code>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {videos.map(v => (
        <div key={v.youtubeId} className="rounded-xl border border-[#21262d] bg-[#0d1117] overflow-hidden">
          {active === v.youtubeId ? (
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              onClick={() => setActive(v.youtubeId)}
              className="w-full relative group"
            >
              <div className="relative overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                  alt={v.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 font-mono text-xs bg-black/80 text-white px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
                <span className="absolute top-2 left-2 font-mono text-[10px] bg-black/60 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">
                  {v.lang === 'es' ? '🇲🇽 ES' : '🇺🇸 EN'}
                </span>
              </div>
            </button>
          )}

          <div className="px-4 py-3">
            <div className="font-mono text-[10px] text-slate-600 mb-0.5">{v.subtema}</div>
            <div className="text-sm font-semibold text-slate-200 leading-tight">{v.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
