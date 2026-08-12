import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { logCollectionAfterChange, logCollectionAfterDelete } from '@/hooks/adminActivity'
import { revalidateHealthTopics } from './hooks/revalidateHealthTopics'
import { toKebabCase } from '@/utilities/toKebabCase'

const normalizeTopicSlug = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  return toKebabCase(value)
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const MAX_KEY_POINT_LENGTH = 140

export const HealthTopics: CollectionConfig = {
  slug: 'health-topics',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'lessonsCount', 'order'],
    description:
      'Manage topic cards shown on the Topics page and the linked Pages for each section.',
    group: 'Content',
  },
  fields: [
    // ── Card fields (shown on /topic overview) ─────────────────────
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Card title shown on the Topics overview page.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            return normalizeTopicSlug(value)
          },
        ],
      },
      admin: {
        description:
          'URL path segment — must be lowercase with hyphens, e.g. "healthcare-system" → /topic/healthcare-system.',
      },
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
      admin: { description: 'Short description shown below the card title.' },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'Stethoscope',
      options: [
        { label: 'Stethoscope (Healthcare)', value: 'Stethoscope' },
        { label: 'Flask / Lab Test', value: 'FlaskConical' },
        { label: 'Heart Pulse (Health / Nutrition)', value: 'HeartPulse' },
        { label: 'Brain (Mental Health)', value: 'Brain' },
        { label: 'Users / People', value: 'Users' },
        { label: 'Shield Plus (Public Health)', value: 'ShieldPlus' },
        { label: 'Syringe / Vaccine', value: 'Syringe' },
        { label: 'Clipboard Check (Insurance)', value: 'ClipboardCheck' },
        { label: 'Badge Plus', value: 'BadgePlus' },
        { label: 'Hospital', value: 'Hospital' },
        { label: 'Phone / Support', value: 'PhoneCall' },
      ],
      admin: {
        description:
          'Icon displayed on the topic card and detail page badge. It stays visible even when a card image is uploaded.',
      },
    },
    {
      name: 'iconImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional large image for the topic card. The selected icon above will still appear as a badge. Recommended size: at least 1200x800 px.',
      },
    },
    {
      name: 'badgeImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional image for the small circular badge on the topic card. If empty, the selected icon is used.',
      },
    },
    {
      name: 'lessonsCount',
      type: 'number',
      defaultValue: 10,
      admin: { description: 'Number of lessons to display on the card badge.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: { description: 'Sort order on the overview page. Lower numbers appear first.' },
    },

    // ── Detail page fields ──────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Detail Page Content',
      admin: {
        description:
          'These fields control what appears on /topic/[slug] — the individual topic detail page.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'subtitle',
          type: 'text',
          localized: true,
          admin: { description: 'Subtitle / description shown below the page heading.' },
        },
        {
          name: 'detailImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Optional large image shown at the top of the topic detail page. Recommended size: at least 1400x900 px.',
          },
        },
        {
          name: 'sidebarTitle',
          type: 'text',
          defaultValue: 'Topics Overview',
          localized: true,
          admin: { description: 'Heading text in the left sidebar box.' },
        },
        {
          name: 'sidebarItems',
          type: 'array',
          admin: {
            description: 'Navigation items shown in the sidebar (e.g. sub-topic names).',
            initCollapsed: true,
            isSortable: false,
          },
          fields: [
            {
              name: 'item',
              type: 'text',
              localized: true,
              required: true,
            },
          ],
        },
        {
          name: 'videoDuration',
          type: 'text',
          defaultValue: '3 min',
          localized: true,
          admin: { description: 'Duration shown next to the "Watch Overview Video" badge.' },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            description:
              'Embedded on the topic page. Supports YouTube, Vimeo, or a direct HTTPS video file URL (for example MP4 or WebM).',
          },
        },
        {
          name: 'guideUrl',
          type: 'text',
          admin: {
            description:
              'URL or uploaded-file path for the "Download Guide (PDF)" button. Paste a direct PDF link or upload a file to Media and paste its URL here.',
          },
        },
        {
          name: 'guideLabel',
          type: 'text',
          localized: true,
          admin: {
            description:
              'Optional label for the guide button (defaults to "Download Guide (PDF)").',
          },
        },
        {
          name: 'supportPhone',
          type: 'text',
          defaultValue: '1-888-315-9257',
          admin: {
            description: 'Support phone number displayed in the bottom help strip.',
          },
        },
        {
          name: 'sections',
          type: 'array',
          admin: {
            description: 'Content sections displayed as cards on the detail page.',
            initCollapsed: true,
            isSortable: false,
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true,
              admin: { description: 'Section heading (e.g. "Family Doctors").' },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              required: true,
              admin: { description: 'One-to-two sentence description of this section.' },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Optional image shown on this section card. If empty, the card uses an automatic icon.',
              },
            },
            {
              name: 'detailPage',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
              admin: {
                description:
                  'Create a page in the Pages collection using the standard page template, then link it here.',
              },
            },
            {
              name: 'keyPoints',
              type: 'array',
              admin: {
                description: 'Bullet points shown in the green "Key Points" panel.',
                isSortable: false,
              },
              fields: [
                {
                  name: 'point',
                  type: 'text',
                  localized: true,
                  required: true,
                  maxLength: MAX_KEY_POINT_LENGTH,
                  validate: (value: string | null | undefined) => {
                    if (typeof value !== 'string') {
                      return true
                    }

                    if (value.length > MAX_KEY_POINT_LENGTH) {
                      return `Key points can be at most ${MAX_KEY_POINT_LENGTH} characters.`
                    }

                    return true
                  },
                  admin: {
                    description: `Keep each key point brief (max ${MAX_KEY_POINT_LENGTH} characters).`,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHealthTopics, logCollectionAfterChange('health-topics')],
    afterDelete: [logCollectionAfterDelete('health-topics')],
  },
}
