import { apiUrl } from './api.js'
import { audioName } from './audioName.js'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
const listeners = new Set()
let voices = []
let currentToken = 0
let fallbackTimer = null
let player = null
let finishCurrent = null

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

// Ends the line early but still runs what comes after it, so guided steps keep going.
export function skipSpeaking() {
  player?.pause()
  synth?.cancel()
  finishCurrent?.()
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
    if (token !== currentToken || finishCurrent !== finish) return
    finishCurrent = null
    clearTimeout(fallbackTimer)
    setSpeaking(false)
    onDone?.()
  }
  finishCurrent = finish
  const useBrowser = () => {
    if (token === currentToken) speakWithBrowser(line, lang, finish)
  }

  const play = (source) => {
    if (token !== currentToken) return
    const audio = new Audio(source)
    player = audio
    audio.onended = finish
    audio.onerror = useBrowser
    audio.play().then(() => {
      if (token === currentToken) setSpeaking(true)
    }, useBrowser)
  }

  const voice = lang === 'en' ? 'en' : 'ur'
  const text = voice === 'en' ? line.en : line.ur
  if (!line.live) {
    play(`/audio/${audioName(voice, text)}.mp3`)
    return
  }
  fetch(apiUrl('/api/speak'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice, text }),
  })
    .then((response) => (response.ok ? response.blob() : Promise.reject(new Error('speech failed'))))
    .then((blob) => play(URL.createObjectURL(blob)))
    .catch(useBrowser)
}
