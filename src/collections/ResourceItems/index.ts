import type { CollectionConfig } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { ConceptExplainer } from '@/blocks/ConceptExplainer/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import {
  revalidateResourceItems,
  revalidateResourceItemsOnDelete,
} from './hooks/revalidateResourceItems'

export const ResourceItems: CollectionConfig = {
  slug: 'resource-items',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'icon', 'order'],
    description:
      'Manage the resource cards shown in the Browse Resources grid on the Resources page.',
    group: 'Content',
  },
  fields: [
    {
      name: 'sidebarTitle',
      type: 'text',
      localized: true,
      defaultValue: 'Resources Overview',
      admin: {
        description: 'Heading shown in the left sidebar on /resources/[slug].',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Card heading shown in the resource grid.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'URL segment used in /resources/[slug]. Must be lowercase with hyphens, e.g. "healthcare-services".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      required: true,
      admin: { description: 'Short description shown on the card.' },
    },
    {
      name: 'categoryLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Community',
      admin: {
        description: 'Small category label shown above the card title on the Resources page.',
      },
    },
    {
      name: 'readTime',
      type: 'text',
      localized: true,
      defaultValue: '3 min read',
      admin: {
        description: 'Short reading-time label shown below the card title, e.g. "5 min read".',
      },
    },
    {
      type: 'collapsible',
      label: 'Detail Page Content',
      admin: {
        initCollapsed: false,
        description:
          'Content shown after users click Learn More on this resource card (/resources/[slug]).',
      },
      fields: [
        {
          name: 'detailIntro',
          type: 'textarea',
          localized: true,
          required: true,
          admin: {
            description: 'Short intro paragraph shown near the top of the detail page.',
          },
        },
        {
          name: 'videoDuration',
          type: 'text',
          localized: true,
          defaultValue: '3 min',
          admin: {
            description: 'Duration shown beside the Watch Overview Video card.',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            description: 'Optional URL opened from the Watch Overview Video card.',
          },
        },
        {
          name: 'guideUrl',
          type: 'text',
          admin: {
            description: 'Optional PDF URL used by the Download Guide card in the left sidebar.',
          },
        },
        {
          name: 'guideLabel',
          type: 'text',
          localized: true,
          admin: {
            description: 'Optional label for the download guide card.',
          },
        },
        {
          name: 'supportPhone',
          type: 'text',
          defaultValue: '1-888-315-9257',
          admin: {
            description: 'Phone number shown in the bottom support strip.',
          },
        },
        {
          name: 'sections',
          type: 'array',
          labels: {
            singular: 'Section',
            plural: 'Sections',
          },
          admin: {
            description:
              'Main cards shown on the resource detail page. Learn More opens the linked Page document.',
            initCollapsed: true,
            isSortable: false,
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
              required: true,
            },
            {
              name: 'detailPage',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
              admin: {
                description:
                  'Select a Page from the Pages collection. Clicking Learn More opens this page.',
              },
            },
            {
              name: 'keyPoints',
              type: 'array',
              admin: {
                description: 'Bullets shown in the Key Points panel.',
                isSortable: false,
              },
              fields: [
                {
                  name: 'point',
                  type: 'text',
                  localized: true,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: 'detailContent',
          type: 'richText',
          localized: true,
          required: false,
          editor: defaultLexical,
          admin: {
            description:
              'Legacy plain-text content. Keep existing entries as-is or use Resource Layout for visual sections.',
          },
        },
        {
          name: 'resourceLayout',
          type: 'blocks',
          localized: true,
          required: false,
          blocks: [CallToAction, ConceptExplainer, Content, MediaBlock, Archive, FormBlock],
          admin: {
            initCollapsed: true,
            description:
              'Visual content builder for this resource detail page. Use Concept Explainer and Media blocks to present ideas graphically.',
          },
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Optional image displayed to the right of the hero section on the detail page.',
          },
        },
        {
          name: 'helpfulLinks',
          type: 'array',
          labels: {
            singular: 'Helpful link',
            plural: 'Helpful links',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              admin: {
                description:
                  'Use a full URL like https://example.org or an internal path like /topic.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
      ],
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'Hospital',
      required: true,
      options: [
        { label: 'Hospital (Healthcare Services)', value: 'Hospital' },
        { label: 'Shield Alert (Emergency & Crisis)', value: 'ShieldAlert' },
        { label: 'Brain (Mental Health)', value: 'Brain' },
        { label: 'Book Open (Health Library)', value: 'BookOpen' },
        { label: 'Flask (Lab Results)', value: 'FlaskConical' },
        { label: 'Apple (Nutrition & Wellness)', value: 'Apple' },
        { label: 'Globe (Newcomer Support)', value: 'Globe' },
        { label: 'Heart Pulse (Youth Health)', value: 'HeartPulse' },
        { label: 'Pill (Pharmacy)', value: 'Pill' },
        { label: 'Users (Community Services)', value: 'Users' },
        { label: 'File Text (Printable Resources)', value: 'FileText' },
        { label: 'Languages (Translation Support)', value: 'Languages' },
        { label: 'Play Circle (Interactive Learning)', value: 'PlayCircle' },
      ],
      admin: { description: 'Icon displayed on the resource card.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 99,
      admin: {
        description: 'Display order in the resource grid. Lower numbers appear first.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateResourceItems],
    afterDelete: [revalidateResourceItemsOnDelete],
  },
}
