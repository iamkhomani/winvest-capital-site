// Edit these values; everything on the site reads from here.
export const SITE_URL = 'https://winvestcapital.nl'
export const DISCORD_URL = 'https://discord.gg/2ApK2MSnxZ'
// Cloudflare Worker for the DeFi scanner (Bitcoin and XDC lookups). Empty = Bitcoin via mempool.space directly, XDC wallet lookups off.
export const DEFI_PROXY_URL: string = ''
// Social profiles (shown in the footer, in this order).
// Footer buttons: shieldcn.dev badges (MIT, https://github.com/jal-co/shieldcn), self-hosted in public/social/
// so the site does not depend on their service. badge = file name without -dark/-light, w = width at 32px height.
export const SOCIALS: { name: string; badge: string; w: number; handle: string; url: string }[] = [
  { name: 'Discord', badge: 'discord', w: 209, handle: 'Winvest Capital', url: 'https://discord.gg/2ApK2MSnxZ' },
  { name: 'Instagram', badge: 'instagram', w: 236, handle: '@winvest_capital', url: 'https://www.instagram.com/winvest_capital/' },
  { name: 'X', badge: 'x', w: 179, handle: '@winvest_capital', url: 'https://x.com/winvest_capital' },
  { name: 'TikTok', badge: 'tiktok', w: 209, handle: '@winvestcapital', url: 'https://www.tiktok.com/@winvestcapital' },
  { name: 'TradingView', badge: 'tradingview', w: 235, handle: 'winvestcapital', url: 'https://www.tradingview.com/u/winvestcapital/' },
]
// PayBot checkout (Stripe). Gives the @One Percent Club role in Discord automatically.
export const STRIPE_PAYMENT_LINK = 'https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'
// Must match the price on the checkout exactly.
export const PRICE = '€150'
// Winvest Terminal. Leave the checkout empty to show "Coming soon" instead of the subscribe button.
export const TERMINAL_LOGIN_URL = 'https://terminal.winvestcapital.nl'
// Live Stripe link for later: https://buy.stripe.com/bJe5kDauu75raXAeyRak001
export const TERMINAL_CHECKOUT_URL: string = ''
// Shown next to the subscribe button, for example '€49'. Must match the Stripe price exactly.
export const TERMINAL_PRICE: string = '€49'
// Stripe customer portal login link. Empty = no "Manage subscription" link.
export const TERMINAL_PORTAL_URL: string = 'https://billing.stripe.com/p/login/28EdR93221L75Dg62lak000'
// Trustpilot profile.
export const TRUSTPILOT_URL = 'https://nl.trustpilot.com/review/winvestcapital.nl'

// Newsletter: self-hosted Listmonk (public subscription form endpoint).
// Leave NEWSLETTER_FORM_ACTION empty to show the section as "coming soon".
export const NEWSLETTER_FORM_ACTION: string = 'https://news.winvestcapital.nl/subscription/form'
export const NEWSLETTER_EMAIL_FIELD = 'email'
// UUID of the public list "Winvest Capital – Newsletter" in Listmonk.
export const NEWSLETTER_LIST_UUID = '0b6267b8-86e8-4e7b-a3ef-d7305330acca'

// Legal details shown on the legal pages. Empty values are hidden.
export const LEGAL = {
  name: 'Winvest Capital',
  owner: '', // e.g. 'Khalil ...' (eenmanszaak owner)
  kvk: '78732921', // Chamber of Commerce (KvK) number
  address: '',
  email: 'info@winvestcapital.nl',
}
