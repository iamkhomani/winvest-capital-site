// Convert between UTC ISO strings and "wall clock" values in a chosen IANA time zone.

function offsetMin(utcMs: number, tz: string): number {
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(utcMs))
    const g = (t: string) => Number(p.find((x) => x.type === t)?.value)
    const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'), g('second'))
    return Math.round((asUtc - utcMs) / 60000)
  } catch {
    return 0
  }
}

/** "2026-11-05T14:30" (wall clock in tz) -> UTC ISO */
export function wallToIso(v: string, tz: string): string | null {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!m) return null
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  let utc = guess - offsetMin(guess, tz) * 60000
  utc = guess - offsetMin(utc, tz) * 60000
  return new Date(utc).toISOString()
}

/** UTC ISO -> "2026-11-05T14:30" (wall clock in tz), for <input type="datetime-local"> */
export function isoToWall(iso: string, tz: string): string {
  const t = Date.parse(iso)
  if (!isFinite(t)) return ''
  return new Date(t + offsetMin(t, tz) * 60000).toISOString().slice(0, 16)
}

export const nowWall = (tz: string) => isoToWall(new Date().toISOString(), tz)

export function fmtDateTime(iso: string | undefined, tz: string, locale: string, withTime = true) {
  if (!iso) return '–'
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: tz, day: '2-digit', month: 'short', year: '2-digit', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(new Date(iso))
  } catch {
    return iso.slice(0, 16).replace('T', ' ')
  }
}

export const TIMEZONES = [
  'Europe/Amsterdam', 'Europe/London', 'Europe/Berlin', 'Europe/Istanbul', 'Europe/Moscow', 'Africa/Johannesburg', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Asia/Hong_Kong', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'America/Toronto', 'UTC',
]
