// Lists text that still falls back to Roman Urdu in Urdu mode.
import { LESSONS, SCAM, UI } from '../src/data/content.js'
import { URDU } from '../src/data/urdu.js'

const missing = new Set()

function walk(value) {
  if (!value || typeof value !== 'object') return
  if (typeof value.en === 'string' && typeof value.ru === 'string' && value.ur === value.ru && !URDU[value.en]) {
    missing.add(value.en)
  }
  Object.values(value).forEach(walk)
}

;[UI, LESSONS, SCAM].forEach(walk)
console.log(JSON.stringify([...missing], null, 0))
console.log(missing.size, 'missing')
