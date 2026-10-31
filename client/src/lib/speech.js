import { audioName } from './audioName.js'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
const listeners = new Set()
let voices = []
let currentToken = 0
let fallbackTimer = null
let player = null

function loadVoices() {
  voices = synth?.getVoices() ?? []
}

if (synth) {
  loadVoices()
  synth.addEventListener?.('voiceschanged', loadVoices)
}

function setSpeaking(value) {
  listeners.forEach((fn) => fn(value))
}

function findVoice(prefixes) {
  for (const prefix of prefixes) {
    const matches = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix))
    // Neural voices sound far more natural than the older system ones.
    const best = matches.find((v) => /natural|online|google/i.test(v.name)) ?? matches[0]
    if (best) return best
  }
  return null
}

// Urdu voices read Urdu script. Without one, a South Asian voice reads the Roman text.
function chooseVoice(line, lang) {
  if (lang === 'en') {
    return { text: line.en, voice: findVoice(['en-in', 'en-gb', 'en']), code: 'en-IN' }
  }
  const urdu = findVoice(['ur'])
  if (urdu) return { text: line.ur, voice: urdu, code: 'ur-PK' }
  return { text: line.ru, voice: findVoice(['hi', 'en-in', 'en']), code: 'en-IN' }
}

export function subscribeSpeaking(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function stopSpeaking() {
  currentToken += 1
  clearTimeout(fallbackTimer)
  player?.pause()
  player = null
  synth?.cancel()
  setSpeaking(false)
}

function speakWithBrowser(line, lang, finish) {
  const { text, voice, code } = chooseVoice(line, lang)
  // Keeps guided sequences moving if the browser cannot speak.
  const readingTime = Math.max(2500, text.length * 85)
  clearTimeout(fallbackTimer)

  if (!synth) {
    fallbackTimer = setTimeout(finish, readingTime)
    return
  }
  fallbackTimer = setTimeout(finish, readingTime + 6000)
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice?.lang ?? code
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.onend = finish
  utterance.onerror = finish
  setSpeaking(true)
  synth.speak(utterance)
}

// Recorded lines come first. Live text, like AI answers, uses the browser voice.
export function speak(line, lang, onDone) {
  stopSpeaking()
  const token = currentToken

  const finish = () => {
    if (token !== currentToken) return
    clearTimeout(fallbackTimer)
    setSpeaking(false)
    onDone?.()
  }
  const useBrowser = () => {
    if (token === currentToken) speakWithBrowser(line, lang, finish)
  }

  const voice = lang === 'en' ? 'en' : 'ur'
  const audio = new Audio(`/audio/${audioName(voice, voice === 'en' ? line.en : line.ur)}.mp3`)
  player = audio
  audio.onended = finish
  audio.onerror = useBrowser
  audio.play().then(() => {
    if (token === currentToken) setSpeaking(true)
  }, useBrowser)
}
