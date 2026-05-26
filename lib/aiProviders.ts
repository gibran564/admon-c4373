export type AIProvider = 'anthropic' | 'openai' | 'groq' | 'compatible'

export interface AISettings {
  provider: AIProvider
  apiKey: string
  model: string
  baseUrl?: string
}

export const AI_STORAGE_KEYS = {
  provider: 'ai_provider',
  apiKey: 'ai_api_key',
  model: 'ai_model',
  baseUrl: 'ai_base_url',
  legacyClaudeApiKey: 'anthropic_api_key',
} as const

export const AI_PROVIDERS: Record<AIProvider, {
  label: string
  defaultModel: string
  keyPlaceholder: string
  keyUrl: string
  baseUrl?: string
}> = {
  anthropic: {
    label: 'Claude',
    defaultModel: 'claude-sonnet-4-20250514',
    keyPlaceholder: 'sk-ant-api03-...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4.1-mini',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  groq: {
    label: 'Groq',
    defaultModel: 'llama-3.3-70b-versatile',
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
  },
  compatible: {
    label: 'Compatible',
    defaultModel: 'gpt-4o-mini',
    keyPlaceholder: 'API key',
    keyUrl: 'https://platform.openai.com/api-keys',
    baseUrl: 'https://api.openai.com/v1',
  },
}

export function normalizeProvider(provider?: string): AIProvider {
  if (provider === 'openai' || provider === 'groq' || provider === 'compatible') return provider
  return 'anthropic'
}

export function getDefaultModel(provider: AIProvider): string {
  return AI_PROVIDERS[provider].defaultModel
}
