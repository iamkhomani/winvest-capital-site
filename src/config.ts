// Edit these values; everything on the site reads from here.
export const SITE_URL = 'https://winvestcapital.nl'
export const DISCORD_URL = 'https://discord.gg/2ApK2MSnxZ'
// Social profiles (shown in the footer, in this order).
export const SOCIALS: { name: string; icon?: string; handle: string; url: string }[] = [
  { name: 'Discord', handle: 'Winvest Capital', url: 'https://discord.gg/2ApK2MSnxZ' },
  { name: 'Instagram', icon: '/social/instagram.png', handle: '@winvest_capital', url: 'https://www.instagram.com/winvest_capital/' },
  { name: 'X', icon: '/social/x.png', handle: '@winvest_capital', url: 'https://x.com/winvest_capital' },
  { name: 'TikTok', icon: '/social/tiktok.png', handle: '@winvestcapital', url: 'https://www.tiktok.com/@winvestcapital' },
  { name: 'TradingView', icon: '/social/tradingview.png', handle: 'winvestcapital', url: 'https://www.tradingview.com/u/winvestcapital/' },
]
// PayBot checkout (Stripe). Gives the @One Percent Club role in Discord automatically.
export const STRIPE_PAYMENT_LINK = 'https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'
// Must match the price on the checkout exactly.
export const PRICE = '€150'
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
  kvk: '', // Chamber of Commerce (KvK) number
  address: '',
  email: 'info@winvestcapital.nl',
}
