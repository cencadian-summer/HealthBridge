import type { CollectionConfig, Field } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { DashboardHero } from '@/blocks/DashboardHero/config'

const iconOptions = [
  'BookOpen',
  'BriefcaseMedical',
  'Building2',
  'CreditCard',
  'GraduationCap',
  'HeartHandshake',
  'Hospital',
  'Languages',
  'MapPin',
  'ShieldCheck',
  'Stethoscope',
  'UserRound',
  'UsersRound',
].map((value) => ({ label: value.replace(/([a-z])([A-Z])/g, '$1 $2'), value }))

const linkFields = ({
  detail = false,
  icon = false,
}: { detail?: boolean; icon?: boolean } = {}): Field[] => [
  {
    name: 'label',
    type: 'text',
    localized: true,
    required: true,
  },
  ...(detail
    ? ([
        {
          name: 'detail',
          type: 'text',
          localized: true,
        },
      ] satisfies Field[])
    : []),
  ...(icon
    ? ([
        {
          name: 'icon',
          type: 'select',
          options: iconOptions,
        },
      ] satisfies Field[])
    : []),
  {
    name: 'destination',
    type: 'relationship',
    relationTo: ['pages', 'health-topics', 'resource-items'],
    admin: {
      description: 'Select CMS content to generate the link automatically.',
    },
  },
  {
    name: 'customUrl',
    type: 'text',
    admin: {
      description: 'Optional fallback or external URL. A selected destination takes priority.',
    },
  },
]

export const DashboardProfiles: CollectionConfig<'dashboard-profiles'> = {
  slug: 'dashboard-profiles',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'profile', '_status', 'updatedAt'],
    group: 'Dashboards',
    description:
      'Manage personalized dashboard copy, quick actions, learning content, recommendations, and services.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal title shown in Payload.' },
    },
    {
      name: 'profile',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: [
        { label: 'New immigrant', value: 'new-immigrant' },
        { label: 'International student', value: 'international-student' },
        { label: 'Parent or caregiver', value: 'parent' },
        { label: 'Youth', value: 'youth' },
        { label: 'Refugee', value: 'refugee' },
        { label: 'Healthcare provider', value: 'healthcare-provider' },
        { label: 'Settlement worker', value: 'settlement-worker' },
        { label: 'Other / general', value: 'other' },
      ],
    },
    {
      name: 'layoutVariant',
      label: 'Dashboard Layout',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        {
          label: 'General / Community',
          value: 'general',
        },
        {
          label: 'International Student',
          value: 'student',
        },
        {
          label: 'Parent / Youth',
          value: 'family',
        },
        {
          label: 'Healthcare Professional',
          value: 'professional',
        },
      ],
      admin: {
        description:
          'Controls the overall frontend dashboard structure. Content is managed in the fields below.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dashboard Sections',
          fields: [
            {
              name: 'layout',
              label: 'Dashboard Sections',
              type: 'blocks',
              blocks: [DashboardHero],
              validate: (value) => {
                if (!Array.isArray(value)) return true

                const heroCount = value.filter(
                  (block) => block?.blockType === 'dashboardHero',
                ).length

                return heroCount <= 1 || 'Only one Dashboard Hero block can be added.'
              },
              admin: {
                initCollapsed: true,
                description:
                  'Add dashboard sections here. Existing fields remain as fallbacks during migration.',
              },
            },
          ],
        },
        {
          label: 'Welcome',
          fields: [
            {
              name: 'dashboardLabel',
              label: 'Dashboard Label',
              type: 'text',
              localized: true,
              required: true,
            },
            {
              name: 'heroHeading',
              label: 'Hero Heading',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Welcome back, {firstName}!',
              admin: {
                description: 'Use {firstName} where the signed-in user’s first name should appear.',
              },
            },
            {
              name: 'introduction',
              label: 'Hero Introduction',
              type: 'textarea',
              localized: true,
              required: false,
            },
            {
              name: 'roleLabel',
              label: 'Role Label',
              type: 'text',
              localized: true,
              required: false,
              admin: {
                description:
                  'For example: International Student, Parent / Family, or Settlement Worker.',
              },
            },
            {
              name: 'searchPlaceholder',
              type: 'text',
              localized: true,
            },
            {
              name: 'eventTitle',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          label: 'Quick Actions',
          fields: [
            {
              name: 'quickActions',
              type: 'array',
              maxRows: 8,
              fields: linkFields({ icon: true }),
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Learning',
          fields: [
            {
              name: 'journey',
              type: 'array',
              fields: [
                ...linkFields(),
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'next',
                  options: [
                    { label: 'Completed', value: 'completed' },
                    { label: 'Next step', value: 'next' },
                  ],
                },
              ],
              admin: { initCollapsed: true },
            },
            {
              name: 'continueLearning',
              type: 'group',
              fields: [
                ...linkFields(),
                {
                  name: 'initialProgress',
                  type: 'number',
                  min: 0,
                  max: 100,
                  defaultValue: 0,
                  admin: {
                    description: 'Fallback percentage until saved user progress is available.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Recommendations',
          fields: [
            {
              name: 'recommendations',
              type: 'array',
              fields: linkFields({ detail: true }),
              admin: { initCollapsed: true },
            },
            {
              name: 'savedResources',
              type: 'array',
              fields: linkFields({ detail: true }),
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Services',
          fields: [
            {
              name: 'services',
              type: 'array',
              fields: linkFields({ detail: true, icon: true }),
              admin: { initCollapsed: true },
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
}
