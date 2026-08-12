import type { Access, CollectionConfig } from 'payload'

const staffOnly: Access = ({ req }) => {
  const role = (req.user as { role?: string } | null)?.role
  return role === 'admin' || role === 'editor'
}

export const ContactInquiries: CollectionConfig = {
  slug: 'contact-inquiries',
  access: {
    create: () => false,
    delete: staffOnly,
    read: staffOnly,
    update: staffOnly,
  },
  admin: {
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    description: 'Messages submitted through the public Contact Us form.',
    group: 'Communications',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'subject',
      type: 'select',
      required: true,
      options: [
        { label: 'General question', value: 'general' },
        { label: 'Resource support', value: 'resource' },
        { label: 'Technical issue', value: 'technical' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'Feedback', value: 'feedback' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Private follow-up notes. These are never shown to the sender.',
      },
    },
  ],
  timestamps: true,
}
