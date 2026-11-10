// language-rule.md §4 — 언어별 파일(키 = 변수명 끝 6자 ID)을 읽어 현재 언어의 문자열을 돌려준다.
// locales/*.json 은 tokens/extract/to-i18n.mjs 의 생성물이다. 직접 수정하지 않는다.
import index from './locales/index.json'

type Table = Record<string, string>

const tables = import.meta.glob<Table>('./locales/*.json', { eager: true, import: 'default' })

export type Language = { id: string; name: string }

export const languages: Language[] = index.languages
export const defaultLanguage: string = index.defaultLanguage

function table(lang: string): Table {
  return tables[`./locales/${lang}.json`] ?? {}
}

/** 6자 ID 로 문자열을 찾는다. 그 언어에 없으면(미번역) 기본 언어 → ID 순으로 대체한다. */
export function t(id: string, lang: string = defaultLanguage): string {
  return table(lang)[id] ?? table(defaultLanguage)[id] ?? id
}
