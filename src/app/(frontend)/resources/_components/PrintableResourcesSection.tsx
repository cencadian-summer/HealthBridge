import { Download, FileText } from 'lucide-react'
import Image from 'next/image'

import type { PrintableResource } from '../../_utils/fetchResources'

type PrintableResourcesSectionProps = {
  title: string
  description: string
  resources: PrintableResource[]
}

function formatFileDetails(resource: PrintableResource) {
  const type = resource.file.mimeType === 'application/pdf' ? 'PDF' : 'PNG'
  const size = resource.file.filesize

  if (!size) return type

  const value = size >= 1024 * 1024 ? size / (1024 * 1024) : size / 1024
  const unit = size >= 1024 * 1024 ? 'MB' : 'KB'
  return `${type} · ${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`
}

export function PrintableResourcesSection({
  title,
  description,
  resources,
}: PrintableResourcesSectionProps) {
  return (
    <section className="resources-section bg-slate-50 dark:bg-slate-900/60">
      <div className="resources-container resources-container--section">
        <div className="resources-section-header">
          <h2 className="resources-section-heading">{title}</h2>
          <p className="resources-section-description">{description}</p>
        </div>

        {resources.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => {
              const isPNG = resource.file.mimeType === 'image/png'

              return (
                <article
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  key={resource.id}
                >
                  <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950 dark:to-slate-900">
                    {isPNG ? (
                      <Image
                        alt={resource.file.alt || resource.title}
                        className="object-contain p-3"
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 94vw"
                        src={resource.file.url}
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-rose-600 shadow-sm dark:bg-slate-800 dark:text-rose-300">
                        <FileText aria-hidden="true" size={38} />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold tracking-wider text-teal-700 uppercase dark:text-teal-300">
                      {formatFileDetails(resource)}
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">
                      {resource.title}
                    </h3>
                    {resource.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {resource.description}
                      </p>
                    ) : null}
                    <a
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      download={resource.file.filename || true}
                      href={resource.file.url}
                    >
                      <Download aria-hidden="true" size={17} />
                      {resource.downloadLabel}
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Printable guides will appear here when they are published in Payload.
          </div>
        )}
      </div>
    </section>
  )
}
