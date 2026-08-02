import type { CollectionConfig } from 'payload'

const denyAccess = () => false

export const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  access: {
    create: denyAccess,
    delete: denyAccess,
    read: denyAccess,
    update: denyAccess,
  },
  admin: {
    hidden: true,
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'ownerId',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'messageCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      index: true,
    },
    {
      name: 'lastMessagePreview',
      type: 'textarea',
      maxLength: 240,
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'chat-messages',
          where: { conversation: { equals: id } },
          req,
        })
      },
    ],
  },
  timestamps: true,
}
