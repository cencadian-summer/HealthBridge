import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'videoBlock',
  interfaceName: 'VideoBlock',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Heading displayed above the video.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube, Vimeo, or direct HTTPS video file URL (for example MP4 or WebM).',
      },
    },
    {
      name: 'duration',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional duration displayed beside the title, for example 3 min.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional preview image. When omitted, YouTube and Vimeo display their own player preview.',
      },
    },
    {
      name: 'thumbnailAlt',
      type: 'text',
      localized: true,
      admin: {
        description: 'Accessible description for the custom thumbnail.',
        condition: (_data, siblingData) => Boolean(siblingData?.thumbnail),
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional supporting text displayed below the player.',
      },
    },
  ],
}
