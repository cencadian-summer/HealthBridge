import type { CollectionConfig } from 'payload'

const denyAccess = () => false

export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  access: {
    create: denyAccess,
    delete: denyAccess,
    read: denyAccess,
    update: denyAccess,
  },
  admin: {
    hidden: true,
    useAsTitle: 'content',
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'chat-conversations',
      required: true,
      index: true,
    },
    {
      name: 'ownerId',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Assistant', value: 'assistant' },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'state',
      type: 'select',
      required: true,
      defaultValue: 'completed',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Interrupted', value: 'interrupted' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'providerResponseId',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'providerMetadata',
      type: 'json',
      admin: { hidden: true },
    },
  ],
  timestamps: true,
}
