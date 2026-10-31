// Renders every route to static HTML in dist/, plus sitemap.xml and robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const SITE = 'https://winvestcapital.nl'
const { render, routes } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--app-head-->') || !template.includes('<!--app-html-->')) throw new Error('Template placeholders missing')

const write = (rel, html) => {
  const file = path.join(dist, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

for (const r of routes) {
  const { html, head } = render(r)
  const page = template
    .replace('<html lang="en">', `<html lang="${r.lang}">`)
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html)
  write(path.join(r.path, 'index.html'), page)
  if (r.path === '/welcome/') write('welcome.html', page) // old link
  console.log('prerendered', r.path)
}

// 404 page: GitHub Pages serves dist/404.html for unknown paths
const notFound = routes.find((r) => r.path === '/')
write('404.html', template.replace('<!--app-head-->', '<title>Page not found | Winvest Capital</title><meta name="robots" content="noindex" />').replace('<!--app-html-->', `<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#0a0a0b;color:#fff;font-family:sans-serif;text-align:center;padding:24px"><h1>404</h1><p>Page not found / Pagina niet gevonden</p><p><a href="/" style="color:#ff4d4d">Home</a> · <a href="/nl/" style="color:#ff4d4d">Nederlands</a></p></main>`).replace(/<script type="module"[^>]*><\/script>/, ''))
void notFound

const today = new Date().toISOString().slice(0, 10)
const urls = routes
  .filter((r) => !r.noindex)
  .map((r) => {
    const alts = r.alternate
      ? [
          `<xhtml:link rel="alternate" hreflang="${r.lang}" href="${SITE}${r.path}"/>`,
          `<xhtml:link rel="alternate" hreflang="${r.lang === 'en' ? 'nl' : 'en'}" href="${SITE}${r.alternate}"/>`,
        ].join('')
      : ''
    return `<url><loc>${SITE}${r.path}</loc><lastmod>${today}</lastmod>${alts}</url>`
  })
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`)
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`done: ${routes.length} pages`)
