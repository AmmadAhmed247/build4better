// Records every scripted line once, so all browsers play the same clear voice.
// Run with: npm run voices
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { BANK_LINES } from '../src/data/bankSim.js'
import { LESSONS, LINES, MUTE_LINE, UNMUTE_LINE, WRONG_TAP } from '../src/data/content.js'
import { WA_LINES } from '../src/data/whatsapp.js'
import { audioName } from '../src/lib/audioName.js'

const OUT = new URL('../public/audio/', import.meta.url)
const VOICES = { en: 'en-IN-NeerjaNeural', ur: 'ur-PK-UzmaNeural' }
const limit = Number(process.argv[2] ?? Infinity)

function collect(value, found = new Set()) {
  if (!value || typeof value !== 'object') return found
  if (typeof value.en === 'string' && typeof value.ur === 'string' && value.say === undefined) {
    found.add(`en\n${value.en}`)
    found.add(`ur\n${value.ur}`)
  }
  Object.values(value).forEach((item) => collect(item, found))
  return found
}

async function record(voice, text) {
  const tts = new MsEdgeTTS()
  await tts.setMetadata(VOICES[voice], OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
  const { audioStream } = tts.toStream(text, { rate: '-8%' })
  const chunks = []
  for await (const chunk of audioStream) chunks.push(chunk)
  tts.close()
  return Buffer.concat(chunks)
}

const spoken = [LINES, LESSONS, WRONG_TAP, MUTE_LINE, UNMUTE_LINE, BANK_LINES, WA_LINES]
  .reduce((all, group) => collect(group, all), new Set())

mkdirSync(OUT, { recursive: true })
let made = 0
let failed = 0
for (const entry of [...spoken].slice(0, limit)) {
  const [voice, text] = [entry.slice(0, 2), entry.slice(3)]
  const file = new URL(`${audioName(voice, text)}.mp3`, OUT)
  if (existsSync(file)) continue
  try {
    const audio = await record(voice, text)
    if (audio.length < 500) throw new Error('empty audio')
    writeFileSync(file, audio)
    made += 1
  } catch (error) {
    failed += 1
    console.error(`Failed: ${text.slice(0, 40)} (${error.message})`)
  }
}
console.log(`${spoken.size} lines, ${made} new recordings, ${failed} failed`)
process.exit(failed ? 1 : 0)
