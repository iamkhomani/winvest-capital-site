import type { Lang } from './i18n'

export type Meta = {
  path: string
  lang: Lang
  title: string
  description: string
  alternate?: string // same page in the other language
  noindex?: boolean
  jsonLd?: object[]
  ogType?: 'website' | 'article'
}
