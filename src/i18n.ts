export type Lang = 'en' | 'nl'
export const t = <T,>(lang: Lang, v: { en: T; nl: T }): T => v[lang]
