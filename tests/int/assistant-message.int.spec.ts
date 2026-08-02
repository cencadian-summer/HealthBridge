import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AssistantMessage } from '@/app/(frontend)/chat/AssistantMessage'

describe('AssistantMessage', () => {
  it('renders common assistant Markdown and HealthBridge citations', () => {
    const markdown = `Use **urgent care** for:

- Minor fractures
- Deep cuts

    [HealthBridge Content, pp. 2–4]`
    const { container, getAllByRole, getByRole, getByText } = render(
      AssistantMessage({ children: markdown }),
    )

    expect(getByText('urgent care').tagName).toBe('STRONG')
    expect(getByRole('list')).toBeTruthy()
    expect(getAllByRole('listitem')).toHaveLength(2)
    expect(container.querySelector('cite')?.textContent).toBe('[HealthBridge Content, pp. 2–4]')
  })

  it('opens external links safely and does not render raw HTML', () => {
    const markdown = `Read [the guide](https://example.com). <script>alert('unsafe')</script>`
    const { container, getByRole } = render(AssistantMessage({ children: markdown }))

    const link = getByRole('link', { name: 'the guide' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noreferrer noopener')
    expect(container.querySelector('script')).toBeNull()
  })
})
