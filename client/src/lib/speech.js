const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
const listeners = new Set()
let voices = []
let currentToken = 0
let fallbackTimer = null

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
    const voice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix))
    if (voice) return voice
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
  synth?.cancel()
  setSpeaking(false)
}

export function speak(line, lang, onDone) {
  stopSpeaking()
  const token = currentToken
  const { text, voice, code } = chooseVoice(line, lang)

  const finish = () => {
    if (token !== currentToken) return
    clearTimeout(fallbackTimer)
    setSpeaking(false)
    onDone?.()
  }

  // Keeps guided sequences moving if the browser cannot speak.
  const readingTime = Math.max(2500, text.length * 85)
  fallbackTimer = setTimeout(finish, readingTime + 6000)

  if (!synth) {
    clearTimeout(fallbackTimer)
    fallbackTimer = setTimeout(finish, readingTime)
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice?.lang ?? code
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.onend = finish
  utterance.onerror = finish
  setSpeaking(true)
  synth.speak(utterance)
}
