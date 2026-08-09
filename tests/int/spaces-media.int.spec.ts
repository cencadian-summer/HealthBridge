import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { buildSpacesMediaURL, getStaticMediaURL } from '@/utilities/spacesMedia'

const originalPublicCDNURL = process.env.NEXT_PUBLIC_DO_SPACES_CDN_URL
const originalCDNURL = process.env.DO_SPACES_CDN_URL

describe('Spaces media URLs', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DO_SPACES_CDN_URL = 'https://assets.example.com/'
    process.env.DO_SPACES_CDN_URL = 'https://assets.example.com/'
  })

  afterEach(() => {
    if (originalPublicCDNURL === undefined) delete process.env.NEXT_PUBLIC_DO_SPACES_CDN_URL
    else process.env.NEXT_PUBLIC_DO_SPACES_CDN_URL = originalPublicCDNURL

    if (originalCDNURL === undefined) delete process.env.DO_SPACES_CDN_URL
    else process.env.DO_SPACES_CDN_URL = originalCDNURL
  })

  it('encodes each filename segment exactly once', () => {
    expect(buildSpacesMediaURL('ChatGPT Image [1].png')).toBe(
      'https://assets.example.com/media/ChatGPT%20Image%20%5B1%5D.png',
    )
    expect(buildSpacesMediaURL('ChatGPT%20Image%20%5B1%5D.png')).toBe(
      'https://assets.example.com/media/ChatGPT%20Image%20%5B1%5D.png',
    )
  })

  it('converts legacy Payload paths to CDN URLs and preserves cache queries', () => {
    expect(getMediaUrl('/api/media/file/brain.png', 'updated')).toBe(
      'https://assets.example.com/media/brain.png?updated',
    )
    expect(getMediaUrl('/media/brain.png?lang=en', 'updated')).toBe(
      'https://assets.example.com/media/brain.png?lang=en&updated',
    )
    expect(getMediaUrl('http://localhost:3000/api/media/file/brain.png')).toBe(
      'https://assets.example.com/media/brain.png',
    )
    expect(getMediaUrl('https://app.example.com/media/brain.png?lang=en')).toBe(
      'https://assets.example.com/media/brain.png?lang=en',
    )
  })

  it('builds static frontend asset URLs under the media prefix', () => {
    expect(getStaticMediaURL('hero-community-care.svg')).toBe(
      'https://assets.example.com/media/hero-community-care.svg',
    )
  })
})
