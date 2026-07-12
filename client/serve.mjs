import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 5173)
const distDirectory = resolve(fileURLToPath(new URL('./dist/', import.meta.url)))
const indexFile = resolve(distDirectory, 'index.html')
const shouldOpen = process.argv.includes('--open')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

if (!existsSync(indexFile)) {
  console.error('CampusFind has not been built. Run "npm run build" first.')
  process.exit(1)
}

function openBrowser(url) {
  const command = process.platform === 'win32'
    ? ['cmd.exe', ['/d', '/s', '/c', `start "" "${url}"`]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]]

  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
}

function findFile(pathname) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    return null
  }

  const requestedFile = resolve(distDirectory, `.${decodedPath}`)
  const isInsideDist = requestedFile === distDirectory
    || requestedFile.startsWith(`${distDirectory}${sep}`)

  if (!isInsideDist) return null

  if (existsSync(requestedFile) && statSync(requestedFile).isFile()) {
    return requestedFile
  }

  // Client-side routes such as /dashboard must load the React entry point.
  if (!extname(decodedPath)) return indexFile

  return null
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' })
    response.end('Method Not Allowed')
    return
  }

  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || host}`)
  const file = findFile(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname)

  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not Found')
    return
  }

  const extension = extname(file).toLowerCase()
  const headers = {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  }

  if (file.includes(`${sep}assets${sep}`)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  } else {
    headers['Cache-Control'] = 'no-cache'
  }

  response.writeHead(200, headers)
  if (request.method === 'HEAD') {
    response.end()
    return
  }

  createReadStream(file).pipe(response)
})

server.listen(port, host, () => {
  const url = `http://${host}:${port}`
  console.log(`CampusFind is running on ${url}`)
  console.log('Press Ctrl+C to stop it.')
  if (shouldOpen) openBrowser(url)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Close the other CampusFind window and try again.`)
  } else {
    console.error(error)
  }
  process.exit(1)
})
