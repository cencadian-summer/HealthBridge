import { unstable_cache } from 'next/cache'

import { defaultLocale, isCmsLocale } from '@/i18n/config'

const TRANSLATE_API_URL = process.env.TRANSLATE_API_URL
const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY

const SKIPPED_KEYS = new Set([
  'id',
  'slug',
  'url',
  '_status',
  'createdAt',
  'updatedAt',
  'filename',
  'mimeType',
  'sizes',
  'icon',
])

function shouldSkipKey(key: string): boolean {
  if (SKIPPED_KEYS.has(key)) return true
  return /(^_|url|slug|filename|mime|href|path|src$)/i.test(key)
}

async function translateText(text: string, targetLanguage: string): Promise<string> {
  const trimmed = text.trim()

  if (trimmed === '' || targetLanguage === defaultLocale || isCmsLocale(targetLanguage)) {
    return text
  }

  if (!TRANSLATE_API_URL) {
    return text
  }

  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TRANSLATE_API_KEY ? { Authorization: `Bearer ${TRANSLATE_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        q: text,
        source: defaultLocale,
        target: targetLanguage,
        format: 'text',
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return text
    }

    const payload = (await response.json()) as
      | { translatedText?: string }
      | { data?: { translations?: Array<{ translatedText?: string }> } }

    if ('translatedText' in payload && payload.translatedText) {
      return payload.translatedText
    }

    const nestedTranslation =
      'data' in payload ? payload.data?.translations?.[0]?.translatedText : undefined
    return nestedTranslation ?? text
  } catch {
    return text
  }
}

function translateTextCached(text: string, targetLanguage: string): Promise<string> {
  return unstable_cache(
    () => translateText(text, targetLanguage),
    ['machine-translate', targetLanguage, text],
    {
      tags: [`machine-translate-${targetLanguage}`],
      revalidate: 60 * 60 * 24,
    },
  )()
}

export async function translateContentDeep<T>(value: T, targetLanguage: string): Promise<T> {
  if (targetLanguage === defaultLocale || isCmsLocale(targetLanguage)) {
    return value
  }

  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return (await translateTextCached(value, targetLanguage)) as T
  }

  if (Array.isArray(value)) {
    const translatedItems = await Promise.all(
      value.map(async (item) => translateContentDeep(item, targetLanguage)),
    )
    return translatedItems as T
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const entries = await Promise.all(
      Object.entries(obj).map(async ([key, itemValue]) => {
        if (shouldSkipKey(key)) {
          return [key, itemValue] as const
        }

        const translatedValue = await translateContentDeep(itemValue, targetLanguage)
        return [key, translatedValue] as const
      }),
    )

    return Object.fromEntries(entries) as T
  }

  return value
}
