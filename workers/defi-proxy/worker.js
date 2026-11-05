// Winvest Capital DeFi scanner proxy (Cloudflare Worker).
// Only forwards to a fixed list of public blockchain APIs that cannot be called from the
// browser directly (no CORS). No API keys needed. Responses are cached briefly.
//
// Routes:
//   POST /rpc/xdc                 -> public XDC nodes (JSON-RPC, read-only methods)
//   GET  /stock/chart/<symbol>    -> Yahoo Finance daily chart (?range=5d|1mo|1y|2y), for the portfolio tracker
//   GET  /stock/search?q=<text>   -> Yahoo Finance symbol search

const ALLOWED_ORIGINS = ['https://winvestcapital.nl', 'https://www.winvestcapital.nl', 'http://localhost:5173']
// Several public XDC nodes: the first one that answers is used.
const RPC = { xdc: ['https://rpc.xinfin.network', 'https://earpc.xinfin.network', 'https://rpc.ankr.com/xdc', 'https://xdc.public-rpc.com', 'https://erpc.xdcrpc.com'] }
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

    // Stocks, ETFs, indices and FX (Yahoo Finance), read-only and cached
    if (request.method === 'GET' && url.pathname.startsWith('/stock/')) {
      let upstreamPath, ttl
      const chart = url.pathname.match(/^\/stock\/chart\/([A-Za-z0-9.^=\-]{1,20})$/)
      if (chart) {
        const range = ['5d', '1mo', '1y', '2y'].includes(url.searchParams.get('range')) ? url.searchParams.get('range') : '5d'
        upstreamPath = `/v8/finance/chart/${encodeURIComponent(chart[1])}?range=${range}&interval=1d`
        ttl = range === '5d' ? 120 : 3600
      } else if (url.pathname === '/stock/search') {
        const q = (url.searchParams.get('q') || '').slice(0, 40)
        if (!q) return json({ error: 'missing q' }, 400, origin)
        upstreamPath = `/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0&listsCount=0`
        ttl = 86400
      } else {
        return json({ error: 'not found' }, 404, origin)
      }
      const cache = caches.default
      const key = new Request('https://cache.winvest' + upstreamPath)
      const hit = await cache.match(key)
      if (hit) return new Response(hit.body, { status: 200, headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT', ...cors(origin) } })
      let last = 'no upstream'
      for (const host of ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']) {
        try {
          const up = await fetch(host + upstreamPath, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', Accept: 'application/json' } })
          const text = await up.text()
          if (up.ok && text.trim().startsWith('{')) {
            const res = new Response(text, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` } })
            if (ctx) ctx.waitUntil(cache.put(key, res.clone()))
            return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', ...cors(origin) } })
          }
          last = `${new URL(host).host}: ${up.status}`
        } catch (e) {
          last = `${new URL(host).host}: ${e.message}`
        }
      }
      return json({ error: 'upstream failed', last }, 502, origin)
    }

    // EVM JSON-RPC (XDC): only read-only methods
    const m = url.pathname.match(/^\/rpc\/([a-z]+)$/)
    if (m && RPC[m[1]] && request.method === 'POST') {
      let body
      try { body = await request.json() } catch { return json({ error: 'bad json' }, 400, origin) }
      const calls = Array.isArray(body) ? body : [body]
      if (calls.length > 10 || calls.some((c) => !RPC_METHODS.has(c && c.method))) return json({ error: 'method not allowed' }, 400, origin)
      const payload = JSON.stringify(body)
      let last = 'no upstream'
      for (const upstream of RPC[m[1]]) {
        try {
          const up = await fetch(upstream, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'winvest-defi-proxy' }, body: payload })
          const text = await up.text()
          if (up.ok && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
            return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', 'X-Upstream': new URL(upstream).host, ...cors(origin) } })
          }
          last = `${new URL(upstream).host}: ${up.status}`
        } catch (e) {
          last = `${new URL(upstream).host}: ${e.message}`
        }
      }
      return json({ error: 'all upstreams failed', last }, 502, origin)
    }

    return json({ error: 'not found' }, 404, origin)
  },
}
