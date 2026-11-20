// Winvest Capital DeFi scanner proxy (Cloudflare Worker).
// Only forwards to a fixed list of public blockchain APIs that cannot be called from the
// browser directly (no CORS). No API keys needed. Responses are cached briefly.
//
// Routes:
//   POST /rpc/xdc                 -> public XDC nodes (JSON-RPC, read-only methods)
//   GET  /stock/chart/<symbol>    -> Yahoo Finance daily chart (?range=5d|1mo|1y|2y), for the portfolio tracker
//   GET  /stock/search?q=<text>   -> Yahoo Finance symbol search
//   GET  /stock/dividends/<symbol> -> Yahoo Finance dividend history (10 years), for the portfolio tracker
//   GET  /news                    -> latest headlines from publisher RSS feeds (crypto, forex and macro, stocks),
//                                    the same feeds Market Whisper posts in Discord. Headline, source, time and link only.

const ALLOWED_ORIGINS = ['https://winvestcapital.nl', 'https://www.winvestcapital.nl', 'http://localhost:5173', 'http://localhost:3000']
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

// ---- News: publisher RSS feeds, same list as Market Whisper (news_channels.py) ----
const NEWS_FEEDS = {
  crypto: [['Cointelegraph', 'https://cointelegraph.com/rss'], ['CoinDesk', 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml'], ['Decrypt', 'https://decrypt.co/feed'], ['The Block', 'https://www.theblock.co/rss.xml']],
  forex: [['FXStreet', 'https://www.fxstreet.com/rss/news'], ['investingLive', 'https://investinglive.com/feed/'], ['Investing.com', 'https://www.investing.com/rss/news_1.rss']],
  stocks: [['CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html'], ['CNBC Investing', 'https://www.cnbc.com/id/15839069/device/rss/rss.html'], ['MarketWatch', 'https://feeds.content.dowjones.io/public/rss/mw_topstories']],
}
const NEWS_TTL = 600 // seconds
const NEWS_MAX_AGE = 48 * 3600 * 1000
const NEWS_PER_CATEGORY = 30

const decode = (t) =>
  t
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;|&#8221;/g, '"').replace(/&#8211;/g, '-').replace(/&#8212;/g, '-').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? decode(m[1]) : ''
}
async function hashId(text) {
  const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80)))
  return [...new Uint8Array(d)].slice(0, 10).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function fetchFeed(category, source, feedUrl) {
  try {
    const r = await fetch(feedUrl, { headers: { 'User-Agent': 'winvestcapital.nl news (+https://winvestcapital.nl)', Accept: 'application/rss+xml, application/xml, text/xml' }, cf: { cacheTtl: NEWS_TTL } })
    if (!r.ok) return []
    const xml = await r.text()
    const out = []
    for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
      const it = m[0]
      const title = tag(it, 'title').slice(0, 220)
      const link = tag(it, 'link') || (it.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || ''
      const t = Date.parse(tag(it, 'pubDate') || tag(it, 'dc:date'))
      if (!title || !/^https:\/\//.test(link) || !Number.isFinite(t)) continue
      out.push({ id: await hashId(title), category, title, url: link, source, published: t })
    }
    return out
  } catch {
    return []
  }
}

async function news(ctx, origin) {
  const cache = caches.default
  const key = new Request('https://cache.winvest/news-v1')
  const hit = await cache.match(key)
  if (hit) return new Response(hit.body, { status: 200, headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT', ...cors(origin) } })
  const jobs = Object.entries(NEWS_FEEDS).flatMap(([cat, feeds]) => feeds.map(([src, u]) => fetchFeed(cat, src, u)))
  const all = (await Promise.all(jobs)).flat()
  const now = Date.now()
  const seen = new Set()
  const items = all
    .filter((x) => x.published > now - NEWS_MAX_AGE && x.published < now + 600000)
    .sort((a, b) => b.published - a.published)
    .filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)))
  const per = {}
  const kept = items.filter((x) => (per[x.category] = (per[x.category] || 0) + 1) <= NEWS_PER_CATEGORY)
  const body = JSON.stringify({ updated: now, items: kept })
  if (kept.length) {
    const res = new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${NEWS_TTL}` } })
    if (ctx) ctx.waitUntil(cache.put(key, res))
  }
  return new Response(body, { status: kept.length ? 200 : 502, headers: { 'Content-Type': 'application/json', ...cors(origin) } })
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''
    // Browsers on other websites may not use this proxy (requests without an Origin header, e.g. from scripts, are still possible).
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return new Response('forbidden', { status: 403 })
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })
    const url = new URL(request.url)

    // Stocks, ETFs, indices and FX (Yahoo Finance), read-only and cached
    if (request.method === 'GET' && url.pathname.startsWith('/stock/')) {
      let upstreamPath, ttl, chart2
      // Symbols like EURUSD=X arrive URL-encoded (%3D); match on the decoded path.
      let path = url.pathname
      try { path = decodeURIComponent(url.pathname) } catch { /* keep raw */ }
      const chart = path.match(/^\/stock\/chart\/([A-Za-z0-9.^=\-]{1,20})$/)
      if (chart) {
        const range = ['5d', '1mo', '1y', '2y'].includes(url.searchParams.get('range')) ? url.searchParams.get('range') : '5d'
        upstreamPath = `/v8/finance/chart/${encodeURIComponent(chart[1])}?range=${range}&interval=1d`
        ttl = range === '5d' ? 120 : 3600
      } else if ((chart2 = path.match(/^\/stock\/dividends\/([A-Za-z0-9.^=\-]{1,20})$/))) {
        // Dividend history (ex-dates and amounts) for the portfolio tracker
        upstreamPath = `/v8/finance/chart/${encodeURIComponent(chart2[1])}?range=10y&interval=1mo&events=div`
        ttl = 86400
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
          const up = await fetch(host + upstreamPath, { headers: { 'User-Agent': 'winvestcapital.nl portfolio (+https://winvestcapital.nl)', Accept: 'application/json' } })
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

    if (request.method === 'GET' && url.pathname === '/news') return news(ctx, origin)

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
