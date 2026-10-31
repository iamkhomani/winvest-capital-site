// Edit these values; everything on the site reads from here.
export const SITE_URL = 'https://winvestcapital.nl'
export const DISCORD_URL = 'https://discord.gg/2ApK2MSnxZ'
// PayBot checkout (Stripe). Gives the @One Percent Club role in Discord automatically.
export const STRIPE_PAYMENT_LINK = 'https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'
// Must match the price on the checkout exactly.
export const PRICE = '€150'
// Public Whop page with the original reviews.
export const WHOP_REVIEWS_URL = 'https://whop.com/winvestcapital/'

// Newsletter: paste the form action URL from your provider (e.g. MailerLite, Buttondown).
// Leave empty to show the section as "coming soon".
export const NEWSLETTER_FORM_ACTION = ''
// Name of the email field your provider expects (MailerLite: 'fields[email]', Buttondown: 'email').
export const NEWSLETTER_EMAIL_FIELD = 'email'

// Legal details shown on the legal pages. Empty values are hidden.
export const LEGAL = {
  name: 'Winvest Capital',
  owner: '', // e.g. 'Khalil ...' (eenmanszaak owner)
  kvk: '', // Chamber of Commerce (KvK) number
  address: '',
  email: '',
}
