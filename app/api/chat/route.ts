import { NextRequest } from 'next/server'
import { getDefaultModel, normalizeProvider, type AIProvider } from '@/lib/aiProviders'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages, system, provider: rawProvider, apiKey: rawApiKey, model: rawModel, baseUrl } = await req.json()

  if (!messages || !system) {
    return new Response('Bad request', { status: 400 })
  }

  const provider = normalizeProvider(rawProvider)
  const apiKey = rawApiKey || envKey(provider)
  const model = rawModel || getDefaultModel(provider)

  if (!apiKey) {
    return new Response('API key missing', { status: 401 })
  }

  const upstream = await fetch(endpointFor(provider, baseUrl), {
    method: 'POST',
    headers: headersFor(provider, apiKey),
    body: JSON.stringify(bodyFor(provider, model, system, messages)),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return new Response(err, { status: upstream.status })
  }

  return new Response(normalizeStream(upstream.body, provider), {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}

function envKey(provider: AIProvider): string {
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY ?? ''
  if (provider === 'groq') return process.env.GROQ_API_KEY ?? ''
  return process.env.OPENAI_API_KEY ?? ''
}

function endpointFor(provider: AIProvider, baseUrl?: string): string {
  if (provider === 'anthropic') return 'https://api.anthropic.com/v1/messages'
  if (provider === 'groq') return 'https://api.groq.com/openai/v1/chat/completions'
  const cleanBaseUrl = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')
  return `${cleanBaseUrl}/chat/completions`
}

function headersFor(provider: AIProvider, apiKey: string): HeadersInit {
  if (provider === 'anthropic') {
    return {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    }
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
}

function bodyFor(
  provider: AIProvider,
  model: string,
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
) {
  if (provider === 'anthropic') {
    return {
      model,
      max_tokens: 600,
      stream: true,
      system,
      messages,
    }
  }

  return {
    model,
    max_tokens: 600,
    stream: true,
    messages: [
      { role: 'system', content: system },
      ...messages,
    ],
  }
}

function normalizeStream(body: ReadableStream<Uint8Array> | null, provider: AIProvider) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ''

  return body?.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (!data || data === '[DONE]') continue

        try {
          const payload = JSON.parse(data)
          const text = provider === 'anthropic'
            ? payload.type === 'content_block_delta' ? payload.delta?.text : ''
            : payload.choices?.[0]?.delta?.content

          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        } catch {}
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
    },
  })) ?? null
}
