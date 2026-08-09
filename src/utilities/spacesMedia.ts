const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '')

const encodePathSegment = (segment: string): string => {
  try {
    return encodeURIComponent(decodeURIComponent(segment))
  } catch {
    return encodeURIComponent(segment)
  }
}

export const encodeMediaPath = (value: string): string =>
  trimSlashes(value).split('/').filter(Boolean).map(encodePathSegment).join('/')

export const getSpacesCDNURL = (): string =>
  (process.env.NEXT_PUBLIC_DO_SPACES_CDN_URL || process.env.DO_SPACES_CDN_URL || '').replace(
    /\/+$/,
    '',
  )

export const buildSpacesMediaURL = (filename: string, prefix = 'media'): string => {
  const cdnURL = getSpacesCDNURL()
  const objectPath = encodeMediaPath([prefix, filename].filter(Boolean).join('/'))

  return cdnURL ? `${cdnURL}/${objectPath}` : `/${objectPath}`
}

export const getStaticMediaURL = (filename: string, localPrefix = ''): string => {
  const cdnURL = getSpacesCDNURL()

  if (cdnURL) {
    return buildSpacesMediaURL(filename)
  }

  const localPath = [localPrefix, filename].filter(Boolean).join('/')
  return `/${encodeMediaPath(localPath)}`
}
