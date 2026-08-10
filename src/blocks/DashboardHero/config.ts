import type { Block } from 'payload'

export const DashboardHero: Block = {
  slug: 'dashboardHero',
  interfaceName: 'DashboardHeroBlock',
  labels: {
    singular: 'Dashboard Hero',
    plural: 'Dashboard Heroes',
  },
  fields: [
    {
      name: 'dashboardLabel',
      label: 'Dashboard Label',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'heading',
      label: 'Heading',
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
      label: 'Introduction',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'roleLabel',
      label: 'Role Label',
      type: 'text',
      localized: true,
    },
  ],
}
