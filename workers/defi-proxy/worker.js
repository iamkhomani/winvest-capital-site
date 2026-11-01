// Winvest Capital DeFi scanner proxy (Cloudflare Worker).
// Only forwards to a fixed list of public blockchain APIs that cannot be called from the
// browser directly (no CORS). No API keys needed. Responses are cached briefly.
//
// Routes:
//   GET  /btc/<path>   -> https://mempool.space/api/<path>      (Bitcoin addresses and transactions)
//   POST /rpc/xdc      -> https://rpc.xdc.org                    (XDC Network JSON-RPC, read-only methods)

const ALLOWED_ORIGINS = ['https://winvestcapital.nl', 'https://www.winvestcapital.nl', 'http://localhost:5173']
const RPC = { xdc: 'https://rpc.xdc.org' }
const RPC_METHODS = new Set([
  'eth_blockNumber', 'eth_getBalance', 'eth_getCode', 'eth_getTransactionCount', 'eth_call',
  'eth_getTransactionByHash', 'eth_getTransactionReceipt', 'eth_getBlockByNumber', 'eth_chainId',
])

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' }
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } })
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })
    const url = new URL(request.url)

    // Bitcoin: read-only GET requests to mempool.space
    if (url.pathname.startsWith('/btc/') && request.method === 'GET') {
      const path = url.pathname.slice(5)
      if (!/^(address\/[A-Za-z0-9]{20,100}(\/txs)?|tx\/[0-9a-fA-F]{64}(\/status)?|blocks\/tip\/height)$/.test(path)) return json({ error: 'not allowed' }, 400, origin)
      const cache = caches.default
      const key = new Request('https://cache.winvest/btc/' + path)
      let res = await cache.match(key)
      if (!res) {
        const up = await fetch('https://mempool.space/api/' + path, { headers: { Accept: 'application/json' } })
        res = new Response(up.body, { status: up.status, headers: { 'Content-Type': up.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'public, max-age=30' } })
        if (up.ok) ctx.waitUntil(cache.put(key, res.clone()))
      }
      return new Response(res.body, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json', ...cors(origin) } })
    }

    // EVM JSON-RPC (XDC): only read-only methods
    const m = url.pathname.match(/^\/rpc\/([a-z]+)$/)
    if (m && RPC[m[1]] && request.method === 'POST') {
      let body
      try { body = await request.json() } catch { return json({ error: 'bad json' }, 400, origin) }
      const calls = Array.isArray(body) ? body : [body]
      if (calls.length > 10 || calls.some((c) => !RPC_METHODS.has(c && c.method))) return json({ error: 'method not allowed' }, 400, origin)
      const up = await fetch(RPC[m[1]], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      return new Response(up.body, { status: up.status, headers: { 'Content-Type': 'application/json', ...cors(origin) } })
    }

    return json({ error: 'not found' }, 404, origin)
  },
}
