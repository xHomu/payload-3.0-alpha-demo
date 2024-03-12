import express from 'express'
import next from 'next'
import { createRequestHandler } from '@remix-run/express'
import compression from 'compression'
import morgan from 'morgan'
import { loadConfig } from './loadConfig.js'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

let port = process.env.PORT || '3000'
let host = process.env.HOST || 'localhost'
let env = process.env.NODE_ENV || 'development'

let dev = env !== 'production'
let app = next({ dev })
let handle = app.getRequestHandler()

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      )

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const configPath = path.resolve(dirname, './payload.config.ts')
console.log('configPath', configPath)
console.log('loading config...')
const config = await loadConfig(configPath)
console.log('loaded config!', config)

const payload = await getPayload({ config })

console.log('COLLECTIONS', payload.collections)

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('./build/server/index.js'),
  getLoadContext(req, res) {
    return {
      payload,
      res,
    }
  },
})

function nextHandler(req, res) {
  return handle(req, res)
}

async function main() {
  await app.prepare()

  let server = express()

  // First, we need to serve all the /_next URLs, this includes the built files
  // and the images optimized by Next.js
  server.all('/_next/*', nextHandler)

  // Then, we need to server the static files on the public folder
  server.use(express.static('public', { immutable: false, maxAge: '1h' }))

  server.use(compression())

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  server.disable('x-powered-by')

  // handle asset requests
  if (viteDevServer) {
    server.use(viteDevServer.middlewares)
  } else {
    // Vite fingerprints its assets so we can cache forever.
    server.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }))
  }

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  server.use(express.static('build/client', { maxAge: '1h' }))

  server.use(morgan('tiny'))

  // Finally, we need to tell our server to pass any other request to Next
  // so it can keep working as an expected
  server.all('/admin*', nextHandler)
  server.all('/api*', nextHandler)
  server.all('/my-route', nextHandler)

  // handle SSR requests
  server.all('*', remixHandler)

  server.listen(port, host, (error) => {
    if (error) throw error
    console.log(`> Ready on http://${host}:${port}`)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
