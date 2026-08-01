import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'mediaPosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Image left, write-up right', value: 'left' },
        { label: 'Write-up left, image right', value: 'right' },
      ],
      admin: {
        description: 'Choose whether the image appears on the left or right side of the block.',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'imageFit',
      label: 'Image fit',
      type: 'select',
      defaultValue: 'natural',
      options: [
        { label: 'Natural dimensions (show full image)', value: 'natural' },
        { label: 'Contain (show full image in a frame)', value: 'contain' },
        { label: 'Cover (fill frame and crop)', value: 'cover' },
      ],
      admin: {
        description:
          'Choose how the image fills the block. Natural dimensions preserves the uploaded aspect ratio.',
      },
    },
    {
      name: 'writeUp',
      type: 'richText',
      localized: true,
      label: 'Write-up',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
  ],
}
