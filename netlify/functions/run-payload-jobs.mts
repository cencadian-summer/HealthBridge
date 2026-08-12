const getRequiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const runPayloadJobs = async () => {
  const cronSecret = getRequiredEnvironmentVariable('CRON_SECRET')
  const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.URL

  if (!siteURL) {
    throw new Error('Missing site URL. Set NEXT_PUBLIC_SERVER_URL in Netlify.')
  }

  const jobsURL = new URL('/api/payload-jobs/run?limit=10', siteURL)
  const response = await fetch(jobsURL, {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  })

  if (!response.ok) {
    const responseBody = await response.text()
    throw new Error(`Payload job runner returned ${response.status}: ${responseBody.slice(0, 500)}`)
  }

  console.log('Payload scheduled jobs completed successfully.')
}

export default runPayloadJobs
