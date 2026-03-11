import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json()

  if (!messages || !system) {
    return new Response('Bad request', { status: 400 })
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key':         process.env.ANTHROPIC_API_KEY ?? '',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 600,
      stream:     true,
      system,
      messages,
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return new Response(err, { status: upstream.status })
  }

  // Pass the stream straight through to the browser
  return new Response(upstream.body, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
