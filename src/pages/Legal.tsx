import { DISCORD_URL, LEGAL } from '../config'
import { legal } from '../content/legal'
import type { Lang } from '../i18n'
import Prose from './Prose'

export default function Legal({ doc, lang }: { doc: keyof typeof legal; lang: Lang }) {
  const d = legal[doc][lang]
  const L = lang === 'nl'
  const rows: [string, string][] = [
    [L ? 'Naam' : 'Name', LEGAL.name],
    [L ? 'Eigenaar' : 'Owner', LEGAL.owner],
    [L ? 'KvK-nummer' : 'Chamber of Commerce (KvK)', LEGAL.kvk],
    [L ? 'Adres' : 'Address', LEGAL.address],
    ['E-mail', LEGAL.email],
  ]
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.title}</h1>
      <p className="mt-3 text-sm text-white/45">{L ? 'Laatst bijgewerkt' : 'Last updated'}: {d.updated}</p>
      <Prose sections={d.sections} />
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-bold">{L ? 'Contact' : 'Contact'}</h2>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-white/75">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-white/45">{k}</dt>
              <dd>{k === 'E-mail' ? <a href={`mailto:${v}`} className="hover:underline">{v}</a> : v}</dd>
            </div>
          ))}
          <dt className="text-white/45">Discord</dt>
          <dd><a href={DISCORD_URL} className="hover:underline">{DISCORD_URL.replace('https://', '')}</a></dd>
        </dl>
      </section>
    </main>
  )
}
