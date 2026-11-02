import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const spatialRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'spatial')
const spatialTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

function spatialFile(pathname) {
  let rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  try { rel = decodeURIComponent(rel) } catch { return }
  if (rel.includes('\0')) return
  const file = normalize(join(spatialRoot, rel))
  if (file !== spatialRoot && !file.startsWith(spatialRoot + sep)) return
  if (!existsSync(file)) return
  const stat = statSync(file)
  if (stat.isDirectory()) {
    const index = join(file, 'index.html')
    return existsSync(index) ? index : undefined
  }
  return stat.isFile() ? file : undefined
}

// Local review matches the published site: / is the 3D page, /2d/ is React.
export default function spatialDev() {
  return {
    name: 'spatial-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '/').split('?')[0]
        const search = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
        if (pathname === '/2d' || pathname === '/2d/' || pathname === '/2d/index.html') {
          req.url = `/index.html${search}`
          return next()
        }
        if (
          pathname.startsWith('/2d/') || pathname.startsWith('/src/') ||
          pathname.startsWith('/@') || pathname.startsWith('/__') ||
          pathname.startsWith('/node_modules/')
        ) return next()
        const file = spatialFile(pathname)
        if (!file) return next()
        res.setHeader('Content-Type', spatialTypes[extname(file)] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-cache')
        createReadStream(file).pipe(res)
      })
    },
  }
}
