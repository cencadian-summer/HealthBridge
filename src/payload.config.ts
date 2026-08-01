import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { HealthTopics } from './collections/HealthTopics'
import { ResourceItems } from './collections/ResourceItems'
import { Media } from './collections/Media'
import { AdminActivities } from './collections/AdminActivities'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { DashboardProfiles } from './collections/DashboardProfiles'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Homepage } from './globals/Homepage'
import { About } from './globals/About'
import { Resources } from './globals/Resources'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { defaultLocale, locales } from './i18n/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const localDatabaseURL = process.env.LOCAL_DATABASE_URL || 'mongodb://127.0.0.1:27017/health-bridge'

const databaseURL =
  process.env.DATABASE_URL ||
  process.env.REMOTE_DATABASE_URL ||
  (process.env.NODE_ENV === 'production' ? undefined : localDatabaseURL)

if (!databaseURL) {
  throw new Error('Missing MongoDB connection string. Set DATABASE_URL (or REMOTE_DATABASE_URL).')
}

export default buildConfig({
  serverURL: getServerSideURL(),
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: databaseURL,
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    HealthTopics,
    ResourceItems,
    DashboardProfiles,
    AdminActivities,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, Homepage, About, Resources],
  localization: {
    locales: [...locales],
    defaultLocale,
    fallback: true,
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
