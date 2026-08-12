import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { logGlobalAfterChange } from '@/hooks/adminActivity'
import { revalidateResources } from './hooks/revalidateResources'

export const Resources: GlobalConfig = {
  slug: 'resources',
  label: 'Resources Page',
  admin: {
    description: 'Manage Resources page content shown on the client app.',
    group: 'Site Content',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'heroBadge',
          type: 'text',
          localized: true,
          defaultValue: 'Trusted Help',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          defaultValue: 'Resources',
        },
        {
          name: 'intro',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Find trusted health information, practical support, and quick links for newcomers navigating care, settlement, and everyday wellness in Canada.',
        },
        {
          name: 'heroPrimaryLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Explore Health Topics',
        },
        {
          name: 'heroPrimaryHref',
          type: 'text',
          defaultValue: '/topic',
        },
        {
          name: 'heroSecondaryLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Start Learning',
        },
        {
          name: 'heroSecondaryHref',
          type: 'text',
          defaultValue: '/learning',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Browse Section',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'browseTitle',
          type: 'text',
          localized: true,
          defaultValue: 'Browse Resources',
        },
        {
          name: 'browseDescription',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Find reliable healthcare guidance, educational content, community services, emergency contacts, and multilingual support tailored to newcomers and diverse communities.',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Printable Resources Section',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'printableTitle',
          type: 'text',
          localized: true,
          defaultValue: 'Printable Resources',
        },
        {
          name: 'printableDescription',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Download practical health guides, checklists, and information sheets to keep or share.',
        },
        {
          name: 'printableResources',
          type: 'array',
          labels: {
            singular: 'Printable resource',
            plural: 'Printable resources',
          },
          admin: {
            description:
              'Add downloadable PDF or PNG guides. Drag rows to control their display order.',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: {
                mimeType: {
                  in: ['application/pdf', 'image/png'],
                },
              },
              admin: {
                description: 'Select or upload a PDF or PNG file from the Media library.',
              },
            },
            {
              name: 'downloadLabel',
              type: 'text',
              localized: true,
              defaultValue: 'Download guide',
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Featured Links',
      admin: { initCollapsed: true, hidden: true },
      fields: [
        {
          name: 'featuredLinks',
          type: 'array',
          localized: true,
          minRows: 1,
          maxRows: 6,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'href', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
          defaultValue: [
            {
              title: 'Explore Health Topics',
              description:
                'Browse topic guides for healthcare, mental health, nutrition, youth health, and more.',
              href: '/topic',
              label: 'Browse Topics',
            },
            {
              title: 'Search Articles',
              description: 'Look up answers across posts, guides, and support content.',
              href: '/search',
              label: 'Search Resources',
            },
            {
              title: 'Read Articles',
              description:
                'Read practical tips and explainers on common health and newcomer questions.',
              href: '/posts',
              label: 'View Articles',
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Support Cards',
      admin: { initCollapsed: true, hidden: true },
      fields: [
        {
          name: 'supportCards',
          type: 'array',
          localized: true,
          minRows: 1,
          maxRows: 6,
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'bullets',
              type: 'array',
              minRows: 1,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
          defaultValue: [
            {
              title: 'Before You Go to a Clinic',
              bullets: [
                { text: 'Bring your health card and ID if available.' },
                { text: 'Write down symptoms, questions, and medications.' },
                { text: 'Ask for an interpreter if you need one.' },
              ],
            },
            {
              title: 'When You Need Urgent Help',
              bullets: [
                {
                  text: 'Call local emergency services right away for life-threatening situations.',
                },
                {
                  text: 'Go to the nearest emergency department if symptoms are severe.',
                },
                { text: 'Use community health lines for non-emergency guidance.' },
              ],
            },
            {
              title: 'Finding Reliable Information',
              bullets: [
                { text: 'Use trusted public health and hospital sources first.' },
                { text: 'Check publication dates and source names.' },
                { text: 'Avoid social posts that do not cite medical evidence.' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Emergency Band',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'emergencyTitle',
          type: 'text',
          localized: true,
          defaultValue: 'Need Immediate Help?',
        },
        {
          name: 'emergencyDescription',
          type: 'textarea',
          localized: true,
          defaultValue:
            'If this is a medical emergency or someone is in danger, call emergency services immediately. For non-emergency health advice in Manitoba, contact Health Links - Info Sante.',
        },
        {
          name: 'emergencyPrimaryLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Call 911',
        },
        {
          name: 'emergencyPrimaryHref',
          type: 'text',
          defaultValue: 'tel:911',
        },
        {
          name: 'emergencySecondaryLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Health Links',
        },
        {
          name: 'emergencySecondaryHref',
          type: 'text',
          defaultValue: 'tel:18883159257',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Call To Action',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'ctaTitle',
          type: 'text',
          localized: true,
          defaultValue: 'Accessible Healthcare Education for Everyone',
        },
        {
          name: 'ctaDescription',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Learn about healthcare services, wellness, safety, mental health, and community support in a simple, multilingual, and culturally inclusive way.',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Explore Topics',
        },
        {
          name: 'ctaHref',
          type: 'text',
          defaultValue: '/topic',
        },
        {
          name: 'ctaSecondaryLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Multilingual Support',
        },
        {
          name: 'ctaSecondaryHref',
          type: 'text',
          defaultValue: '/resources/language-support',
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
  },
  hooks: {
    afterChange: [revalidateResources, logGlobalAfterChange('resources')],
  },
}
