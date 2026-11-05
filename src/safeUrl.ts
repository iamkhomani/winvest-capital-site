/** Only allow http(s) links from third-party data (token websites, socials, API urls). Anything else (javascript:, data:, etc.) is dropped. */
export function safeUrl(u: unknown): string | undefined {
  if (typeof u !== 'string') return undefined
  try {
    const x = new URL(u)
    return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : undefined
  } catch {
    return undefined
  }
}
