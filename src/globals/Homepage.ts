import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { logGlobalAfterChange } from '@/hooks/adminActivity'
import { revalidateHomepage } from './hooks/revalidateHomepage'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    description: 'Control the hero section and call-to-action content on the home page.',
    group: 'Site Content',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero Badge',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'badgeText',
          type: 'text',
          defaultValue: 'Culturally Responsive Health Literacy',
          localized: true,
          admin: { description: 'Text inside the small pill badge above the main heading.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Hero Heading',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'headingStart',
          type: 'text',
          defaultValue: 'Helping newcomers',
          localized: true,
          admin: { description: 'Text BEFORE the highlighted (blue) portion of the heading.' },
        },
        {
          name: 'headingHighlight',
          type: 'text',
          defaultValue: 'navigate healthcare',
          localized: true,
          admin: {
            description: 'The highlighted (blue) portion of the heading.',
          },
        },
        {
          name: 'headingEnd',
          type: 'text',
          defaultValue: 'and safety in Canada.',
          localized: true,
          admin: { description: 'Text AFTER the highlighted portion.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Hero Body',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'subheading',
          type: 'textarea',
          defaultValue:
            'Access health services, understand lab results, improve wellness, and find trusted support - in your language.',
          localized: true,
          admin: { description: 'Paragraph text below the main heading.' },
        },
        {
          name: 'footerNote',
          type: 'text',
          defaultValue: 'Free · Multilingual · Trusted by immigrants, students & newcomers',
          localized: true,
          admin: { description: 'Small note below the CTA buttons.' },
        },
        {
          name: 'canadianBadgeText',
          type: 'text',
          defaultValue: '🍁 Canada-focused health guidance',
          localized: true,
          admin: { description: 'Text in the small badge at the bottom-right of the hero.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Call-to-Action Buttons',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'primaryCTALabel',
          type: 'text',
          defaultValue: 'Explore Health Topics',
          localized: true,
          admin: { description: 'Label for the primary (blue filled) button.' },
        },
        {
          name: 'primaryCTAUrl',
          type: 'text',
          defaultValue: '/topic',
          admin: { description: 'URL the primary button links to.' },
        },
        {
          name: 'secondaryCTALabel',
          type: 'text',
          defaultValue: 'Browse Resources',
          localized: true,
          admin: { description: 'Label for the secondary (outline) button.' },
        },
        {
          name: 'secondaryCTAUrl',
          type: 'text',
          defaultValue: '/resources',
          admin: { description: 'URL the secondary button links to.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Holistic Approach Section',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'holisticHeading',
          type: 'text',
          localized: true,
          defaultValue: 'A holistic approach to healthcare',
        },
        {
          name: 'holisticDescription',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Get information, support and tools to improve health outcomes as a newcomer in Canada.',
        },
        {
          name: 'holisticLinkLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Learn about our resources',
        },
        {
          name: 'holisticLinkUrl',
          type: 'text',
          defaultValue: '/resources',
          admin: {
            description: 'Internal or external URL used by the section link.',
          },
        },
        {
          name: 'holisticCards',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          labels: {
            singular: 'Holistic card',
            plural: 'Holistic cards',
          },
          admin: {
            description: 'Exactly three cards displayed across the holistic approach section.',
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
              required: true,
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Upload or select the circular image shown above this card.',
              },
            },
            {
              name: 'imageAlt',
              type: 'text',
              localized: true,
              admin: {
                description: 'Describe the image for people using screen readers.',
              },
            },
          ],
          defaultValue: [
            {
              title: 'Take control of your health',
              description:
                'Explore major health topics and practical resources designed for newcomers and families in Canada.',
              imageAlt: 'Healthcare services',
            },
            {
              title: 'Access health topics and resources in your native language',
              description:
                'Find culturally responsive guidance in familiar language so healthcare navigation in Canada feels clear, safe and practical.',
              imageAlt: 'People accessing health information',
            },
            {
              title: 'Get online support 24/7',
              description:
                'Access health learning, safety resources, and essential service navigation whenever you need it.',
              imageAlt: 'Healthcare support by phone',
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Popular Resources Section',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'popularResourcesHeading',
          type: 'text',
          localized: true,
          defaultValue: 'Popular Resources',
          admin: { description: 'Heading for the popular resources section.' },
        },
        {
          name: 'popularResourcesDescription',
          type: 'text',
          localized: true,
          defaultValue: 'Quick links to trusted health resources and support tools.',
          admin: { description: 'Description text shown below the section heading.' },
        },
        {
          name: 'popularResourcesViewAllLabel',
          type: 'text',
          localized: true,
          defaultValue: 'View all resources',
          admin: { description: 'Label for the top-right section link.' },
        },
        {
          name: 'popularResourcesViewAllUrl',
          type: 'text',
          defaultValue: '/resources',
          admin: { description: 'URL for the top-right section link.' },
        },
        {
          name: 'popularResources',
          type: 'array',
          localized: true,
          minRows: 1,
          maxRows: 12,
          admin: {
            initCollapsed: true,
            description: 'Cards shown in Popular Resources on Home and Resources pages.',
          },
          fields: [
            {
              name: 'id',
              type: 'text',
              required: true,
              admin: { description: 'Unique id for this card (e.g., lab-tests).' },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              admin: { description: 'Target URL (e.g., /resources/lab-results).' },
            },
            {
              name: 'icon',
              type: 'select',
              required: true,
              defaultValue: 'FileText',
              options: [
                { label: 'Lab Flask', value: 'FlaskConical' },
                { label: 'Nutrition', value: 'Salad' },
                { label: 'Community Support', value: 'HelpingHand' },
                { label: 'Document', value: 'FileText' },
                { label: 'Safety', value: 'ShieldCheck' },
                { label: 'Question', value: 'MessageCircleQuestion' },
              ],
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description:
                  'Optional card image. When provided, it appears as the full top media section of the card.',
              },
            },
          ],
          defaultValue: [
            {
              id: 'lab-tests',
              title: 'Lab Test Explained',
              description: 'Understand your lab results with simple breakdowns.',
              href: '/resources/lab-results',
              icon: 'FlaskConical',
            },
            {
              id: 'nutrition-guides',
              title: 'Nutrition Tips',
              description: 'Healthy food choices for individuals and families.',
              href: '/resources/nutrition',
              icon: 'Salad',
            },
            {
              id: 'community-support',
              title: 'Community Support',
              description: 'Find local services and settlement support resources.',
              href: '/resources/community-services',
              icon: 'HelpingHand',
            },
            {
              id: 'forms-and-documents',
              title: 'Forms and Documents',
              description: 'Access key forms and healthcare documents quickly.',
              href: '/resources/printable-resources',
              icon: 'FileText',
            },
            {
              id: 'safety-info',
              title: 'Safety Information',
              description: 'Learn what to do in urgent and non-urgent situations.',
              href: '/resources/emergency-help',
              icon: 'ShieldCheck',
            },
            {
              id: 'ask-questions',
              title: 'Ask a Question',
              description: 'Browse answers to common health and newcomer questions.',
              href: '/resources/health-library',
              icon: 'MessageCircleQuestion',
            },
          ],
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
    afterChange: [revalidateHomepage, logGlobalAfterChange('homepage')],
  },
}
