import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { DISCORD_URL } from './config'

const steps = [
  ['Check your email', 'Stripe has sent your receipt.'],
  ['Open the Discord', 'Your One Percent Club role is added automatically, unlocking the One Percent channels.'],
  ['Role missing?', 'Message me in the Winvest Capital Discord with the email you paid with and I will sort it out.'],
]

function Welcome() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--wc-black)] px-4 py-16 text-white antialiased">
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/20 blur-[120px]" />
      <div className="relative w-full max-w-xl text-center">
        <img src="/logo.jpeg" alt="Winvest Capital logo" className="mx-auto size-20 rounded-full object-cover ring-2 ring-[var(--wc-red)]/50" />
        <p className="mt-6 text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">Payment received</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Welcome to the One Percent Club</h1>
        <p className="mt-4 text-white/65">Thank you for joining. Here is what happens next:</p>
        <ol className="mt-8 space-y-4 text-left">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--wc-red)] font-bold">{i + 1}</span>
              <span>
                <span className="font-semibold">{t}</span>
                <span className="mt-1 block text-white/60">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <a href={DISCORD_URL} className="mt-8 inline-block rounded-full bg-[var(--wc-red)] px-8 py-3 font-semibold transition hover:brightness-110">
          Open the Winvest Capital Discord
        </a>
        <p className="mt-6 text-sm"><a href="/" className="text-white/50 hover:text-white">Back to the homepage</a></p>
        <p className="mt-10 text-xs text-white/35">Educational only. Not financial advice.</p>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Welcome />
  </StrictMode>,
)
