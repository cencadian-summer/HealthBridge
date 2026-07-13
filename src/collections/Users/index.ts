import type { CollectionConfig } from 'payload'

type UserRole = 'admin' | 'editor' | 'member'

const hasRole = (user: unknown, roles: UserRole[]) => {
  if (!user || typeof user !== 'object' || !('role' in user)) return false

  return roles.includes((user as { role?: UserRole }).role as UserRole)
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => hasRole(req.user, ['admin', 'editor']),
    create: ({ req }) => hasRole(req.user, ['admin']),
    delete: ({ req }) => hasRole(req.user, ['admin']),
    read: ({ req }) => {
      if (hasRole(req.user, ['admin'])) return true
      if (!req.user) return false
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (hasRole(req.user, ['admin'])) return true
      if (!req.user) return false
      return { id: { equals: req.user.id } }
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'professionalStatus'],
    useAsTitle: 'name',
  },
  auth: {
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 60 * 60 * 24 * 7,
    verify: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Woman', value: 'woman' },
        { label: 'Man', value: 'man' },
        { label: 'Non-binary', value: 'non-binary' },
        { label: 'Prefer not to say', value: 'prefer-not-to-say' },
        { label: 'Self describe', value: 'self-described' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'member',
      saveToJWT: true,
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Content editor', value: 'editor' },
        { label: 'Administrator', value: 'admin' },
      ],
      access: {
        create: ({ req }) => hasRole(req.user, ['admin']),
        update: ({ req }) => hasRole(req.user, ['admin']),
      },
    },
    {
      name: 'audiences',
      label: 'Information preferences',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'New immigrant', value: 'new-immigrant' },
        { label: 'International student', value: 'international-student' },
        { label: 'Parent or caregiver', value: 'parent' },
        { label: 'Youth', value: 'youth' },
        { label: 'Refugee', value: 'refugee' },
        { label: 'Healthcare provider', value: 'healthcare-provider' },
        { label: 'Settlement worker', value: 'settlement-worker' },
        { label: 'Other / not sure', value: 'other' },
      ],
    },
    {
      name: 'professionalStatus',
      label: 'Professional verification',
      type: 'select',
      defaultValue: 'not-applicable',
      options: [
        { label: 'Not applicable', value: 'not-applicable' },
        { label: 'Pending review', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: {
        create: ({ req }) => hasRole(req.user, ['admin']),
        update: ({ req }) => hasRole(req.user, ['admin']),
      },
    },
    {
      name: 'onboardingComplete',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'topicProgress',
      type: 'array',
      admin: {
        description: 'Reading progress saved automatically from health topic pages.',
        initCollapsed: true,
      },
      fields: [
        { name: 'topicSlug', type: 'text', required: true },
        {
          name: 'completedSectionIds',
          type: 'text',
          hasMany: true,
          defaultValue: [],
        },
        { name: 'lastReadAt', type: 'date' },
      ],
    },
  ],
  timestamps: true,
}
