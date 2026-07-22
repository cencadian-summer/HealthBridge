import Image from 'next/image'
import Link from 'next/link'
import { VideoEmbed } from '@/components/VideoEmbed'
import {
  Ambulance,
  BookOpen,
  Brain,
  Check,
  ClipboardList,
  HeartPulse,
  Hospital,
  PhoneCall,
  Shield,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from 'lucide-react'
import { getTopicAccent } from './_utils/topicVisuals'
import { TopicSidebarButtons } from './TopicSidebarButtons'
import { TopicReadingProgress } from './TopicReadingProgress'
import { defaultLocale, type Locale } from '@/i18n/config'
import { localizePath } from '@/i18n/routing'

const PlayBadgeIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className="h-3.5 w-3.5 fill-current"
    focusable="false"
  >
    <path d="M4.75 3.75v8.5a.75.75 0 0 0 1.14.64l6.5-4.25a.75.75 0 0 0 0-1.28l-6.5-4.25a.75.75 0 0 0-1.14.64Z" />
  </svg>
)

type TopicSection = {
  id?: string
  title: string
  description: string
  imageUrl?: string
  imageAlt?: string
  detailPageSlug: string
  keyPoints: string[]
}

type TopicDetailTemplateProps = {
  topicSlug: string
  title: string
  iconName?: string
  subtitle: string
  detailImageUrl?: string
  detailImageAlt?: string
  sidebarTitle: string
  activeSidebarLabel: string
  sidebarItems: string[]
  sections: TopicSection[]
  locale?: Locale
  videoDuration?: string
  videoUrl?: string
  guideUrl?: string
  guideLabel?: string
  supportPhone?: string
}

const TOPIC_ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope,
  Hospital,
  Ambulance,
  ClipboardList,
  Brain,
  HeartPulse,
  Syringe,
  Shield,
  BookOpen,
  PhoneCall,
}

const illustrationIcons: LucideIcon[] = [
  Stethoscope,
  Hospital,
  Ambulance,
  ClipboardList,
  Brain,
  HeartPulse,
  Syringe,
  Shield,
]

function pickSectionIcon(sectionTitle: string, index: number): LucideIcon {
  const title = sectionTitle.toLowerCase()

  if (title.includes('doctor') || title.includes('clinic') || title.includes('care'))
    return Stethoscope
  if (title.includes('emergency') || title.includes('911')) return Ambulance
  if (title.includes('mental') || title.includes('stress')) return Brain
  if (title.includes('register') || title.includes('step') || title.includes('checklist')) {
    return ClipboardList
  }
  if (title.includes('vaccine') || title.includes('immun')) return Syringe
  if (title.includes('safety') || title.includes('rights')) return Shield
  return illustrationIcons[index % illustrationIcons.length]
}

export function TopicDetailTemplate({
  topicSlug,
  title,
  iconName = 'Stethoscope',
  subtitle,
  detailImageUrl,
  detailImageAlt,
  sidebarTitle,
  activeSidebarLabel,
  sidebarItems,
  sections,
  locale = defaultLocale,
  videoDuration = '3 min',
  videoUrl,
  guideUrl,
  guideLabel,
  supportPhone = '1-888-315-9257',
}: TopicDetailTemplateProps) {
  const topicAccent = getTopicAccent(topicSlug)
  const TopicIcon = TOPIC_ICON_MAP[iconName] ?? Stethoscope
  const sectionAnchors = sections.map((section, index) => ({
    id: `topic-section-${index}`,
    title: section.title,
  }))

  return (
    <div className="grid gap-5 lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/60">
          <h2
            className={`text-xl font-semibold tracking-tight ${topicAccent.arrow} dark:text-white`}
          >
            {sidebarTitle}
          </h2>
          <Link
            href={localizePath('/topic', locale)}
            className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${topicAccent.arrow}`}
          >
            &lt; Back to Topics
          </Link>
          <TopicSidebarButtons
            items={sidebarItems}
            initialActive={activeSidebarLabel}
            sectionAnchors={sectionAnchors}
          />
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600 to-cyan-600 p-3.5 text-white shadow-sm shadow-blue-200/50 dark:border-blue-400/30 dark:from-blue-700 dark:to-cyan-700 dark:shadow-none">
          <h3 className="text-lg font-semibold tracking-tight">Need Help?</h3>
          <p className="mt-1 text-sm leading-6 text-blue-50">
            Ask a question or chat with our support team.
          </p>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 dark:border-white/20 dark:bg-white dark:text-blue-700 dark:hover:bg-blue-50"
          >
            <PhoneCall className="h-4 w-4" />
            Ask a Question
          </button>
        </div>

        {guideUrl ? (
          <a
            href={guideUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-2xl border p-3.5 transition-opacity hover:opacity-90 ${topicAccent.panel} border-transparent`}
          >
            <h3
              className={`flex items-center gap-1.5 text-sm font-semibold ${topicAccent.arrow} dark:text-white`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 fill-current shrink-0"
                focusable="false"
              >
                <path d="M7.25 1a.75.75 0 0 1 1.5 0v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V1ZM2.5 13.25a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z" />
              </svg>
              {guideLabel || 'Download Guide'}
              <span className="ml-auto rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
                PDF
              </span>
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Step-by-step guide to using healthcare in Canada.
            </p>
          </a>
        ) : (
          <div className={`rounded-2xl border p-3.5 ${topicAccent.panel} border-transparent`}>
            <h3
              className={`flex items-center gap-1.5 text-sm font-semibold ${topicAccent.arrow} dark:text-white`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 fill-current shrink-0"
                focusable="false"
              >
                <path d="M7.25 1a.75.75 0 0 1 1.5 0v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V1ZM2.5 13.25a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z" />
              </svg>
              Download Guide
              <span className="ml-auto rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
                PDF
              </span>
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Step-by-step guide to using healthcare in Canada.
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Coming soon</p>
          </div>
        )}
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
            <div>
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${topicAccent.frame}`}
                >
                  <TopicIcon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <div>
                  <h1
                    className={`max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl ${topicAccent.arrow} dark:text-white`}
                  >
                    {title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base dark:text-slate-300">
                    {subtitle}
                  </p>
                </div>
              </div>

              {!videoUrl ? (
                <div
                  className={`mt-4 inline-flex rounded-2xl border px-4 py-3 text-sm font-semibold ${topicAccent.panel} border-transparent`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <PlayBadgeIcon />
                      Watch Overview Video
                    </div>
                    <div className={`pl-6 text-sm font-bold ${topicAccent.arrow} dark:text-white`}>
                      {videoDuration}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {detailImageUrl ? (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <Image
                  src={detailImageUrl}
                  alt={detailImageAlt || title}
                  width={960}
                  height={720}
                  className="h-full min-h-[210px] w-full object-cover"
                />
                <span
                  className={`absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${topicAccent.frame}`}
                >
                  <TopicIcon className="h-6 w-6" strokeWidth={1.8} />
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {videoUrl ? (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Watch Overview Video
              </h2>
              <span className={`text-sm font-semibold ${topicAccent.arrow} dark:text-white`}>
                {videoDuration}
              </span>
            </div>
            <VideoEmbed url={videoUrl} title={`${title} overview video`} />
          </div>
        ) : null}

        <div className="space-y-2.5">
          <TopicReadingProgress
            topicSlug={topicSlug}
            sections={sections.map((section, index) => ({
              id: section.id || topicSlug + '-' + index,
              title: section.title,
            }))}
          />
          {sections.map((section, index) => {
            const Icon = pickSectionIcon(section.title, index)
            const sectionID = section.id || topicSlug + '-' + index

            return (
              <article
                key={section.title}
                id={sectionAnchors[index]?.id}
                data-reading-section={sectionID}
                className={`grid gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-colors md:grid-cols-[184px_minmax(0,1fr)_204px] dark:bg-slate-800 ${topicAccent.card}`}
              >
                <div
                  className={`relative flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${topicAccent.panel}`}
                >
                  {section.imageUrl ? (
                    <>
                      <Image
                        src={section.imageUrl}
                        alt={section.imageAlt || section.title}
                        fill
                        sizes="(min-width: 1024px) 184px, 100vw"
                        className="object-cover"
                      />
                      <span
                        className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <div className="absolute -left-7 -top-7 h-16 w-16 rounded-full bg-white/30 dark:bg-white/10" />
                      <div className="absolute -bottom-6 -right-7 h-16 w-16 rounded-full bg-white/40 dark:bg-white/10" />
                      <div
                        className={`z-10 rounded-full border p-3 shadow-sm ${topicAccent.frame}`}
                      >
                        <Icon className="h-8 w-8" strokeWidth={1.75} />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                    {section.description}
                  </p>
                  {section.detailPageSlug ? (
                    <Link
                      href={localizePath(`/${encodeURIComponent(section.detailPageSlug)}`, locale)}
                      className={`mt-2 inline-flex text-sm font-bold ${topicAccent.arrow}`}
                    >
                      Learn More <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="mt-2 inline-flex text-sm font-bold text-slate-400 dark:text-slate-500">
                      Learn More <span aria-hidden="true">→</span>
                    </span>
                  )}
                </div>

                <div className={`rounded-xl border p-3 ${topicAccent.panel} border-transparent`}>
                  <h3 className={`text-xs font-bold ${topicAccent.arrow} dark:text-white`}>
                    Key Points:
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs font-medium leading-5 text-slate-700 dark:text-slate-200">
                    {section.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-1.5">
                        <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${topicAccent.arrow}`} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>

        <div
          className={`mt-4 rounded-2xl border px-4 py-3 ${topicAccent.panel} border-transparent`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p
                className={`text-xl font-bold leading-tight tracking-tight ${topicAccent.arrow} dark:text-white`}
              >
                Need help navigating the healthcare system?
              </p>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Call Health Links - Info Sante 24/7 for free and confidential health advice.
              </p>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${topicAccent.arrow}`}>
              {supportPhone}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
