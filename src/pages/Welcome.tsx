import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'

const copy = {
  en: {
    kicker: 'Payment received',
    h1: 'Welcome to the One Percent Club',
    p: 'Thank you for joining. Here is what happens next:',
    steps: [
      ['Check your email', 'Stripe has sent your receipt.'],
      ['Open the Discord', 'Your One Percent Club role is added automatically, unlocking the One Percent channels.'],
      ['Role missing?', 'Message me in the Winvest Capital Discord with the email you paid with and I will sort it out.'],
    ],
    btn: 'Open the Winvest Capital Discord',
    back: 'Back to the homepage',
  },
  nl: {
    kicker: 'Betaling ontvangen',
    h1: 'Welkom in de One Percent Club',
    p: 'Bedankt voor je aankoop. Dit gebeurt er nu:',
    steps: [
      ['Check je e-mail', 'Stripe heeft je betaalbewijs gestuurd.'],
      ['Open de Discord', 'Je One Percent Club-rol wordt automatisch toegevoegd en ontgrendelt de One Percent-kanalen.'],
      ['Rol ontbreekt?', 'Stuur me een bericht in de Winvest Capital Discord met het e-mailadres waarmee je hebt betaald, dan regel ik het.'],
    ],
    btn: 'Open de Winvest Capital Discord',
    back: 'Terug naar de homepage',
  },
}

export default function Welcome({ lang }: { lang: Lang }) {
  const c = copy[lang]
  return (
    <main className="relative flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-xl text-center">
        <img src="/logo.jpeg" alt="Winvest Capital logo" width={80} height={80} className="mx-auto size-20 rounded-full object-cover ring-2 ring-[var(--wc-red)]/50" />
        <p className="mt-6 text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">{c.kicker}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{c.h1}</h1>
        <p className="mt-4 text-white/65">{c.p}</p>
        <ol className="mt-8 space-y-4 text-left">
          {c.steps.map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--wc-red)] font-bold">{i + 1}</span>
              <span>
                <span className="font-semibold">{t}</span>
                <span className="mt-1 block text-white/60">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <a href={DISCORD_URL} className="mt-8 inline-block rounded-full bg-[var(--wc-red)] px-8 py-3 font-semibold transition hover:brightness-110">{c.btn}</a>
        <p className="mt-6 text-sm"><a href={lang === 'nl' ? '/nl/' : '/'} className="text-white/50 hover:text-white">{c.back}</a></p>
      </div>
    </main>
  )
}
