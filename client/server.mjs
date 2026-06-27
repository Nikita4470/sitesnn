import { randomInt } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDirectory = resolve(fileURLToPath(new URL('./dist/', import.meta.url)))
const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 4173)
const vkPeerId = process.env.VK_PEER_ID || '2000000109'
const vkApiVersion = '5.199'
const maxBodyBytes = 64 * 1024

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(payload))
}

function normalizeText(value, maxLength) {
  return String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, maxLength)
}

async function readJsonBody(request) {
  const chunks = []
  let totalBytes = 0

  for await (const chunk of request) {
    totalBytes += chunk.length
    if (totalBytes > maxBodyBytes) {
      const error = new Error('request_too_large')
      error.statusCode = 413
      throw error
    }
    chunks.push(chunk)
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('invalid_json')
    error.statusCode = 400
    throw error
  }
}

async function sendLeadToVk(request, response) {
  const token = process.env.VK_BOT_TOKEN
  if (!token) {
    console.error('VK_BOT_TOKEN is not configured')
    sendJson(response, 503, { ok: false, error: 'service_not_configured' })
    return
  }

  const payload = await readJsonBody(request)
  const name = normalizeText(payload.name, 120)
  const contact = normalizeText(payload.contact, 200)
  const comment = normalizeText(payload.comment, 2000)
  const page = normalizeText(payload.page || request.headers.referer, 500)

  if (!name || !contact) {
    sendJson(response, 422, { ok: false, error: 'name_and_contact_required' })
    return
  }

  const submittedAt = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Yekaterinburg',
  }).format(new Date())
  const message = [
    '🔔 Новая заявка с сайта SITESNN',
    '',
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    `Комментарий: ${comment || '—'}`,
    `Страница: ${page || 'не указана'}`,
    `Время: ${submittedAt}`,
  ].join('\n')

  const vkRequest = new URLSearchParams({
    access_token: token,
    v: vkApiVersion,
    peer_id: vkPeerId,
    random_id: String(randomInt(1, 2_147_483_647)),
    message,
  })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const vkResponse = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
      body: vkRequest,
      signal: controller.signal,
    })
    const vkResult = await vkResponse.json()

    if (!vkResponse.ok || vkResult.error) {
      console.error('VK API rejected the lead:', vkResult.error?.error_code, vkResult.error?.error_msg)
      sendJson(response, 502, { ok: false, error: 'vk_delivery_failed' })
      return
    }

    sendJson(response, 200, { ok: true })
  } catch (error) {
    console.error('VK delivery failed:', error instanceof Error ? error.message : 'unknown_error')
    sendJson(response, 502, { ok: false, error: 'vk_delivery_failed' })
  } finally {
    clearTimeout(timeout)
  }
}

async function serveStatic(request, response, pathname) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    response.writeHead(400)
    response.end('Bad request')
    return
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '')
  let filePath = resolve(distDirectory, relativePath)
  if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) filePath = resolve(filePath, 'index.html')
  } catch {
    if (extname(relativePath)) {
      response.writeHead(404)
      response.end('Not found')
      return
    }
    filePath = resolve(distDirectory, 'index.html')
  }

  try {
    const content = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    })
    response.end(request.method === 'HEAD' ? undefined : content)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
}

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be a valid TCP port')
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://localhost')

  try {
    if (url.pathname === '/api/lead') {
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST')
        sendJson(response, 405, { ok: false, error: 'method_not_allowed' })
        return
      }
      await sendLeadToVk(request, response)
      return
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' })
      response.end('Method not allowed')
      return
    }

    await serveStatic(request, response, url.pathname)
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500
    if (statusCode === 500) console.error('Request failed:', error)
    sendJson(response, statusCode, { ok: false, error: error?.message || 'internal_error' })
  }
})

server.listen(port, host, () => {
  console.log(`SITESNN server is running at http://${host}:${port}`)
})
