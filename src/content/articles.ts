import { basicsEn } from './basics-en'
import { basicsNl } from './basics-nl'
import { en as smcEn } from './articles-en'
import { nl as smcNl } from './articles-nl'

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

const en: Record<string, ArticleContent> = { ...basicsEn, ...smcEn }
const nl: Record<string, ArticleContent> = { ...basicsNl, ...smcNl }

/** Curriculum: each lesson builds on the previous one. */
export const MODULES = [
  {
    id: 'basics',
    title: { en: 'Module 1: Trading foundations', nl: 'Module 1: De basis van trading' },
    text: {
      en: 'How to read a chart, place orders and size a position. Start here, even if you want to learn SMC.',
      nl: 'Een grafiek lezen, orders plaatsen en je positie bepalen. Begin hier, ook als je SMC wilt leren.',
    },
    ids: ['candles', 'orders', 'lots', 'leverage', 'margin', 'risk'],
  },
  {
    id: 'smc',
    title: { en: 'Module 2: Smart Money Concepts', nl: 'Module 2: Smart Money Concepts' },
    text: {
      en: 'The framework we use in the community: from trend structure to precise entries.',
      nl: 'Het framework dat we in de community gebruiken: van trendstructuur tot precieze instappen.',
    },
    ids: ['smc', 'structure', 'liquidity', 'fvg', 'orderblocks', 'premium'],
  },
] as const

export const ARTICLE_IDS = MODULES.flatMap((m) => m.ids)
export const PUBLISHED = '2026-10-31'
export const UPDATED = '2026-11-05'
export const NEW_IDS: readonly string[] = ['candles', 'orders', 'lots', 'leverage', 'margin']

export const articles = ARTICLE_IDS.map((id) => ({ id, en: en[id], nl: nl[id], module: MODULES.findIndex((m) => (m.ids as readonly string[]).includes(id)) }))
