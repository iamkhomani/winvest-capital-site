import { en } from './articles-en'
import { nl } from './articles-nl'

export type Section = { h: string; p?: string[]; ul?: string[] }
export type ArticleContent = {
  path: string
  title: string
  metaTitle: string
  description: string
  intro: string
  sections: Section[]
  faq: [string, string][]
}

export const ARTICLE_IDS = ['smc', 'structure', 'liquidity', 'orderblocks', 'fvg', 'premium', 'risk'] as const
export const PUBLISHED = '2026-10-31'

export const articles = ARTICLE_IDS.map((id) => ({ id, en: en[id], nl: nl[id] }))
