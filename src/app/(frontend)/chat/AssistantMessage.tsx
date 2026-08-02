import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const citationPattern = /(\[HealthBridge Content, pp?\. \d+(?:[–-]\d+)?\])/g
const exactCitationPattern = /^\[HealthBridge Content, pp?\. \d+(?:[–-]\d+)?\]$/

function withStyledCitations(children: ReactNode): ReactNode {
  if (Array.isArray(children)) {
    return children.map((child) => withStyledCitations(child))
  }

  if (typeof children !== 'string') return children

  return children.split(citationPattern).map((part, index) =>
    exactCitationPattern.test(part) ? (
      <cite
        key={`${part}-${index}`}
        className="not-prose mx-0.5 inline-flex rounded-md border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-xs font-semibold not-italic text-teal-800"
      >
        {part}
      </cite>
    ) : (
      part
    ),
  )
}

type Props = {
  children: string
}

export function AssistantMessage({ children }: Props) {
  return (
    <div className="prose prose-sm prose-slate max-w-none break-words prose-headings:mb-2 prose-headings:mt-4 prose-headings:font-bold prose-p:my-3 prose-a:font-semibold prose-a:text-teal-700 prose-a:underline prose-strong:font-bold prose-strong:text-slate-950 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:marker:text-teal-600 prose-code:break-words prose-code:rounded prose-code:bg-slate-200 prose-code:px-1 prose-code:py-0.5 prose-code:text-slate-900 prose-pre:overflow-x-auto first:prose-p:mt-0 last:prose-p:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children: linkChildren, href }) => {
            const external = href?.startsWith('http://') || href?.startsWith('https://')

            return (
              <a
                href={href}
                rel={external ? 'noreferrer noopener' : undefined}
                target={external ? '_blank' : undefined}
              >
                {linkChildren}
              </a>
            )
          },
          li: ({ children: listChildren }) => <li>{withStyledCitations(listChildren)}</li>,
          p: ({ children: paragraphChildren }) => <p>{withStyledCitations(paragraphChildren)}</p>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
