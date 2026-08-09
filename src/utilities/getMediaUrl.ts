import { buildSpacesMediaURL } from './spacesMedia'

export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  let normalizedUrl = url

  const normalizePayloadPath = (pathname: string, search = ''): string | null => {
    if (!pathname.startsWith('/api/media/file/') && !pathname.startsWith('/media/')) {
      return null
    }

    const filename = pathname.replace(/^\/api\/media\/file\//, '').replace(/^\/media\//, '')
    const cdnURL = buildSpacesMediaURL(filename)
    return search ? `${cdnURL}${search.startsWith('?') ? search : `?${search}`}` : cdnURL
  }

  try {
    const parsed = new URL(url)
    normalizedUrl = normalizePayloadPath(parsed.pathname, parsed.search) || url
  } catch {
    const [pathname, search = ''] = url.split('?', 2)
    normalizedUrl = normalizePayloadPath(pathname, search) || url
  }

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  if (!cacheTag) return normalizedUrl

  return `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}${cacheTag}`
}
