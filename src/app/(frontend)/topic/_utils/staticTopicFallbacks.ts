import { toKebabCase } from '@/utilities/toKebabCase'
import type { TopicFromPayload } from './fetchTopicBySlug'

const normalizeSlug = (value: string): string =>
  toKebabCase(value)
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

export const STATIC_TOPIC_FALLBACKS: TopicFromPayload[] = [
  {
    id: 'fallback-healthcare-system',
    title: 'Understanding Canadian Healthcare',
    slug: 'healthcare-system',
    description: 'Learn how the Canadian healthcare system works and where to get care.',
    icon: 'Stethoscope',
    lessonsCount: 12,
    subtitle: 'A practical guide for newcomers to get care quickly and confidently.',
    sidebarTitle: 'Topics Overview',
    sidebarItems: [
      { item: 'Find Family Doctors' },
      { item: 'Walk-in Clinics' },
      { item: 'Emergency Services' },
    ],
    videoDuration: '3 min',
    videoUrl: '',
    guideUrl: '',
    guideLabel: '',
    supportPhone: '1-888-315-9257',
    sections: [
      {
        title: 'Find Family Doctors',
        description: 'How to register with a family doctor and what documents you may need.',
        keyPoints: [
          { point: 'Use provincial doctor-finder tools.' },
          { point: 'Carry your health card and identification.' },
          { point: 'Ask clinics about wait times for new patients.' },
        ],
      },
      {
        title: 'Walk-in Clinics',
        description: 'When to use walk-in clinics and what to expect during your visit.',
        keyPoints: [
          { point: 'Bring your health card and medication list.' },
          { point: 'Call ahead for same-day availability.' },
          { point: 'Use virtual walk-in options when available.' },
        ],
      },
      {
        title: 'Emergency Services',
        description: 'Know when to call 911 or go to the emergency department.',
        keyPoints: [
          { point: 'Call 911 for life-threatening symptoms.' },
          { point: 'Bring medical information if possible.' },
          { point: 'Use urgent care for serious but non-life-threatening issues.' },
        ],
      },
    ],
  },
  {
    id: 'fallback-mental-health',
    title: 'Mental Health and Emotional Well-Being',
    slug: 'mental-health',
    description: 'Find support options and coping tools for emotional well-being.',
    icon: 'Brain',
    lessonsCount: 10,
    subtitle: 'Simple steps to get support for stress, anxiety, and emotional health.',
    sidebarTitle: 'Topics Overview',
    sidebarItems: [{ item: 'Recognize Signs' }, { item: 'Get Help' }, { item: 'Build Habits' }],
    videoDuration: '3 min',
    videoUrl: '',
    guideUrl: '',
    guideLabel: '',
    supportPhone: '1-888-315-9257',
    sections: [
      {
        title: 'Recognize Signs',
        description: 'Learn common signs that you may need extra support.',
        keyPoints: [
          { point: 'Notice sleep, appetite, and mood changes.' },
          { point: 'Track symptoms over time.' },
          { point: 'Talk to someone you trust early.' },
        ],
      },
      {
        title: 'Get Help',
        description: 'Connect with counselors, community clinics, and crisis lines.',
        keyPoints: [
          { point: 'Start with your family doctor or walk-in clinic.' },
          { point: 'Use free community and newcomer support programs.' },
          { point: 'Call crisis lines immediately if safety is at risk.' },
        ],
      },
    ],
  },
  {
    id: 'fallback-nutrition',
    title: 'Nutrition and Healthy Living',
    slug: 'nutrition',
    description: 'Discover healthy food choices and routines for daily life.',
    icon: 'HeartPulse',
    lessonsCount: 11,
    subtitle: 'Affordable food and activity habits for individuals and families.',
    sidebarTitle: 'Topics Overview',
    sidebarItems: [{ item: 'Meal Planning' }, { item: 'Healthy Habits' }],
    videoDuration: '3 min',
    videoUrl: '',
    guideUrl: '',
    guideLabel: '',
    supportPhone: '1-888-315-9257',
    sections: [
      {
        title: 'Meal Planning',
        description: 'Build balanced meals on a budget.',
        keyPoints: [
          { point: 'Include vegetables, protein, and whole grains.' },
          { point: 'Plan meals weekly to reduce cost.' },
          { point: 'Compare prices and buy seasonal produce.' },
        ],
      },
    ],
  },
  {
    id: 'fallback-youth-health',
    title: 'Youth Education and Safety',
    slug: 'youth-health',
    description: 'Important health and safety information for youth and teens.',
    icon: 'Users',
    lessonsCount: 9,
    subtitle: 'Resources for youth health, school support, and personal safety.',
    sidebarTitle: 'Topics Overview',
    sidebarItems: [{ item: 'School Health' }, { item: 'Safety Basics' }],
    videoDuration: '3 min',
    videoUrl: '',
    guideUrl: '',
    guideLabel: '',
    supportPhone: '1-888-315-9257',
    sections: [
      {
        title: 'School Health',
        description: 'Understand school-based health supports for youth.',
        keyPoints: [
          { point: 'Ask schools about counseling and support programs.' },
          { point: 'Know your rights to safe and inclusive care.' },
        ],
      },
    ],
  },
  {
    id: 'fallback-public-health',
    title: 'Public Health and Safety Information',
    slug: 'public-health',
    description: 'Learn trusted public health guidance for everyday safety and prevention.',
    icon: 'ShieldPlus',
    lessonsCount: 13,
    subtitle: 'Protect yourself and your family with practical public health steps.',
    sidebarTitle: 'Topics Overview',
    sidebarItems: [
      { item: 'Prevention Basics' },
      { item: 'Vaccination and Screening' },
      { item: 'Community Safety' },
    ],
    videoDuration: '3 min',
    videoUrl: '',
    guideUrl: '',
    guideLabel: '',
    supportPhone: '1-888-315-9257',
    sections: [
      {
        title: 'Prevention Basics',
        description: 'Daily habits that lower health risks in homes, schools, and workplaces.',
        keyPoints: [
          { point: 'Wash hands regularly and stay home when sick.' },
          { point: 'Use masks and distancing guidance when required.' },
          { point: 'Follow trusted local public health updates.' },
        ],
      },
      {
        title: 'Vaccination and Screening',
        description: 'Know when to get vaccines and preventive screening checks.',
        keyPoints: [
          { point: 'Keep routine vaccines up to date.' },
          { point: 'Use reminder tools for checkups and screening.' },
          { point: 'Ask your clinic about free public programs.' },
        ],
      },
    ],
  },
  {
    id: 'fallback-safety-info',
    title: 'Health Insurance and Settlement Support',
    slug: 'safety-info',
    description: 'Understand insurance coverage and where to find newcomer support services.',
    icon: 'ClipboardCheck',
    lessonsCount: 7,
    subtitle: 'Navigate forms, coverage, and support services with confidence.',
    sidebarTitle: 'Topics Overview',
    sidebarItems: [{ item: 'Insurance Basics' }, { item: 'Settlement Services' }],
    videoDuration: '3 min',
    videoUrl: '',
    guideUrl: '',
    guideLabel: '',
    supportPhone: '1-888-315-9257',
    sections: [
      {
        title: 'Insurance Basics',
        description: 'What public coverage includes and what may require private plans.',
        keyPoints: [
          { point: 'Check waiting periods in your province.' },
          { point: 'Carry policy and identification details.' },
          { point: 'Confirm which services are covered before visits.' },
        ],
      },
      {
        title: 'Settlement Services',
        description: 'Find organizations that help with forms, translation, and system navigation.',
        keyPoints: [
          { point: 'Use newcomer agencies for guided support.' },
          { point: 'Ask for interpretation at clinics when available.' },
          { point: 'Keep copies of completed forms and submissions.' },
        ],
      },
    ],
  },
]

const TOPIC_SLUG_ALIASES: Record<string, string> = {
  'understanding-canadian-healthcare': 'healthcare-system',
  'interpreting-lab-test-results': 'healthcare-system',
  healthcare: 'healthcare-system',
  'lab-tests': 'healthcare-system',
  'nutrition-healthy-living': 'nutrition',
  'mental-health-resources': 'mental-health',
  'sexual-health-youth-education': 'youth-health',
  'public-health-safety-information': 'public-health',
  'vaccination-immunization': 'public-health',
  'health-insurance-settlement-support': 'safety-info',
}

export const resolveFallbackTopicSlug = (slug: string): string => {
  const normalized = normalizeSlug(slug)
  return TOPIC_SLUG_ALIASES[normalized] || normalized
}

export const getFallbackTopicBySlug = (slug: string): TopicFromPayload => {
  const resolvedSlug = resolveFallbackTopicSlug(slug)

  return (
    STATIC_TOPIC_FALLBACKS.find((topic) => topic.slug === resolvedSlug) || STATIC_TOPIC_FALLBACKS[0]
  )
}
