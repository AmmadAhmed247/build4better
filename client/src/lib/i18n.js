import { URDU } from '../data/urdu.js'

// Urdu script text is looked up by its English line, with Roman Urdu as the fallback.
export function tr(lang, en, ru) {
  if (lang === 'en') return en
  if (lang === 'ru') return ru
  return URDU[en] ?? ru
}

export function addUrdu(value) {
  if (!value || typeof value !== 'object') return value
  if (typeof value.en === 'string' && typeof value.ru === 'string' && !value.ur) {
    value.ur = URDU[value.en] ?? value.ru
  }
  Object.values(value).forEach(addUrdu)
  return value
}
