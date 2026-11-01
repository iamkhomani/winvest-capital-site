// Winvest Capital DeFi scanner proxy (Cloudflare Worker).
// Only forwards to a fixed list of public blockchain APIs that cannot be called from the
// browser directly (no CORS). No API keys needed. Responses are cached briefly.
//
// Routes:
//   POST /rpc/xdc      -> https://rpc.xdc.org                    (XDC Network JSON-RPC, read-only methods)

const ALLOWED_ORIGINS = ['https://winvestcapital.nl', 'https://www.winvestcapital.nl', 'http://localhost:5173']
const RPC = { xdc: 'https://rpc.xinfin.network' }
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
  async fetch(request) {
    const origin = request.headers.get('Origin') || ''
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })
    const url = new URL(request.url)

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
