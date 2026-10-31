import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Languages,
  Landmark,
  Mic,
  MicOff,
  Minus,
  Phone,
  Plus,
  ShieldAlert,
  Siren,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AvatarFace, useSpeaking } from './Avatar'
import { UI } from '../data/content'
import { containsSecret, localAnswer, SECRET_WARNING } from '../lib/localCheck'
import { speak } from '../lib/speech'

const T = (en, ru, ur) => ({ en, ru, ur })

const GREETING = T(
  'Hello! I am Saathi. Press the microphone and tell me what you need.',
  'Assalam o Alaikum! Main Saathi hoon. Microphone dabayein aur batayein aap ko kya chahiye.',
  'السلام علیکم! میں ساتھی ہوں۔ مائیکروفون دبائیں اور بتائیں آپ کو کیا چاہیے۔',
)

const TEXT = {
  sos: T('Family SOS', 'Family SOS'),
  smaller: T('Make text smaller', 'Likhai chhoti karein'),
  bigger: T('Make text bigger', 'Likhai bari karein'),
  listen: T('Listen', 'Sunein'),
  micStart: T('Press and speak', 'Dabayein aur bolein'),
  micStop: T('Listening... press to stop', 'Sun raha hoon... rokne ke liye dabayein'),
  micMissing: T(
    'This browser cannot hear you. Please type instead.',
    'Yeh browser awaaz nahi sun sakta. Baraye meherbani likh dein.',
  ),
  micFailed: T(
    'I could not hear you. Please try again, or type instead.',
    'Main sun nahi saka. Dobara koshish karein, ya likh dein.',
  ),
  typeHere: T('Or type here', 'Ya yahan likhein'),
  go: T('Go', 'Chalein'),
  heard: T('You said', 'Aap ne kaha'),
  movedToBox: T(
    'I put this in the box below. Press Check Message.',
    'Maine yeh neeche dabbe mein rakh diya. Check Message dabayein.',
  ),
  scamTitle: T('Is this message safe?', 'Kya yeh message theek hai?'),
  stepOne: T('Copy the strange message.', 'Ajeeb message copy karein.'),
  stepTwo: T('Paste it in this box.', 'Is dabbe mein paste karein.'),
  stepThree: T('Press Check Message.', 'Check Message dabayein.'),
  scamPlaceholder: T('Paste or type the message here', 'Message yahan paste karein ya likhein'),
  check: T('Check Message', 'Check Message'),
  checking: T('Checking...', 'Dekh raha hoon...'),
  example: T('Try an example', 'Misaal dekhein'),
  warnings: T('Warning signs', 'Khatre ki nishaniyan'),
  whatToDo: T('What to do', 'Ab kya karein'),
  practiceTitle: T('Practise safely', 'Mehfooz practice karein'),
  sosTitle: T('Get help from family', 'Ghar walon se madad lein'),
  sosCalm: T(
    'Stay calm. Do not send money or share any code until you talk to your family.',
    'Pareshan na hon. Ghar walon se baat karne tak paise na bhejein aur koi code na batayein.',
  ),
  sosCall: T('Call family now', 'Abhi ghar walon ko call karein'),
  sosText: T('Send a message for help', 'Madad ka message bhejein'),
  sosBody: T('I need your help with my phone. Please call me.', 'Mujhe phone mein madad chahiye. Please mujhe call karein.'),
  sosSave: T('Save number', 'Number save karein'),
  sosChange: T('Change number', 'Number badlein'),
  sosAsk: T('Type a family member\'s phone number once. It stays only on this device.', 'Ghar ke kisi fard ka number ek baar likhein. Yeh sirf isi device par rahega.'),
  sosLabel: T('Family phone number', 'Ghar wale ka phone number'),
  sosBad: T('Please check the number. It should have 10 to 13 digits.', 'Number dekh lein. Is mein 10 se 13 hindsay hone chahiye.'),
  close: T('Close', 'Band karein'),
}

const ROUTES = [
  [/scam|fraud|dhoka|دھوکا|فراڈ/i, 'scam'],
  [/whatsapp|واٹس/i, 'whatsapp'],
  [/screenshot|screen shot|اسکرین/i, 'screenshot'],
  [/google|گوگل|search/i, 'google'],
  [/video|ویڈیو/i, 'video'],
  [/\bai\b|chatgpt/i, 'ai'],
  [/bill|bijli|payment|paise|bank|money|بل|بینک|پیسے/i, 'bank'],
]

const RISK_STYLE = {
  danger: ['border-red-500 bg-red-50 text-red-900', AlertTriangle],
  careful: ['border-amber-500 bg-amber-50 text-amber-900', ShieldAlert],
  none: ['border-emerald-500 bg-emerald-50 text-emerald-900', CheckCircle2],
}

const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition

async function checkMessage(message, lang) {
  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lang }),
    })
    if (!response.ok) throw new Error(`ask failed: ${response.status}`)
    return await response.json()
  } catch {
    return localAnswer(message, lang)
  }
}

function Card({ className = '', children }) {
  return <section className={`min-w-0 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>
}

function FontButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 items-center justify-center rounded-xl border-2 border-stone-700 bg-white text-lg font-bold text-stone-900 disabled:opacity-35"
    >
      A{children}
    </button>
  )
}

function ScamResult({ answer, lang }) {
  const risk = answer.kind === 'scam_check' ? answer.risk : 'none'
  const [style, Icon] = RISK_STYLE[risk]
  const resultRef = useRef(null)

  // Brings the verdict into view, clear of the sticky header.
  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [answer])

  return (
    <motion.div
      ref={resultRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      data-guide="scam-result"
      className={`mt-4 scroll-mt-40 rounded-2xl border-2 p-4 text-lg ${style}`}
    >
      {answer.kind === 'scam_check' && (
        <p className="flex items-center gap-2 text-xl font-bold">
          <Icon size={28} /> {UI.risk[risk][lang]}
        </p>
      )}
      <p className="mt-1">{answer.reply}</p>
      {answer.warning_signs.length > 0 && (
        <>
          <p className="mt-3 font-bold">{TEXT.warnings[lang]}</p>
          <ul className="list-disc pl-6">
            {answer.warning_signs.map((sign) => <li key={sign}>{sign}</li>)}
          </ul>
        </>
      )}
      {answer.next_step && (
        <>
          <p className="mt-3 font-bold">{TEXT.whatToDo[lang]}</p>
          <p>{answer.next_step}</p>
        </>
      )}
    </motion.div>
  )
}

function SosDialog({ lang, number, onSave, onClose }) {
  const [editing, setEditing] = useState(!number)
  const [value, setValue] = useState(number ?? '')
  const [error, setError] = useState('')
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function save(event) {
    event.preventDefault()
    const clean = value.replace(/[\s-]/g, '')
    if (!/^\+?\d{10,13}$/.test(clean)) {
      setError(TEXT.sosBad[lang])
      return
    }
    onSave(clean)
    setEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/60 p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={TEXT.sosTitle[lang]}
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-lg rounded-3xl bg-white p-6 text-stone-900"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-red-800">{TEXT.sosTitle[lang]}</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label={TEXT.close[lang]}
            onClick={onClose}
            className="grid size-12 flex-none place-items-center rounded-xl border-2 border-stone-300 bg-white"
          >
            <X size={24} />
          </button>
        </div>
        <p className="my-3 rounded-2xl bg-amber-50 p-3 text-lg">{TEXT.sosCalm[lang]}</p>

        {editing ? (
          <form onSubmit={save}>
            <p className="mb-2 text-lg">{TEXT.sosAsk[lang]}</p>
            <label htmlFor="sos-number" className="mb-1 block text-lg font-semibold">{TEXT.sosLabel[lang]}</label>
            <input
              id="sos-number"
              type="tel"
              autoComplete="off"
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setError('')
              }}
              className={`min-h-14 w-full rounded-xl border-2 px-3 text-xl ${error ? 'border-red-500' : 'border-stone-400'}`}
            />
            {error && <p role="alert" className="mt-1 text-lg font-medium text-red-700">{error}</p>}
            <button type="submit" className="mt-3 min-h-14 w-full rounded-2xl border-0 bg-emerald-700 text-xl font-bold text-white">
              {TEXT.sosSave[lang]}
            </button>
          </form>
        ) : (
          <div className="grid gap-3">
            <a
              href={`tel:${number}`}
              className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-red-700 px-3 text-center text-xl font-bold text-white no-underline"
            >
              <Phone size={26} /> {TEXT.sosCall[lang]}
            </a>
            <a
              href={`sms:${number}?body=${encodeURIComponent(TEXT.sosBody[lang])}`}
              className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-red-700 px-3 text-center text-lg font-bold text-red-800 no-underline"
            >
              {TEXT.sosText[lang]}
            </a>
            <button type="button" onClick={() => setEditing(true)} className="min-h-12 border-0 bg-transparent text-lg font-semibold text-stone-700 underline">
              {TEXT.sosChange[lang]}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Dashboard({
  lang,
  fontStep,
  fontSteps,
  familyNumber,
  features,
  onFontStep,
  onSaveNumber,
  onLanguage,
  onBank,
  onScenario,
  onFeature,
}) {
  const [listening, setListening] = useState(false)
  const [note, setNote] = useState('')
  const [typed, setTyped] = useState('')
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState(null)
  const [checking, setChecking] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)
  const speaking = useSpeaking()
  const recognition = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => () => recognition.current?.abort(), [])

  function handleRequest(text) {
    const request = text.trim()
    if (!request) return
    const route = ROUTES.find(([pattern]) => pattern.test(request))?.[1]
    if (route === 'bank') onBank()
    else if (route && route !== 'scam') onFeature(route)
    else {
      if (route !== 'scam') setMessage(request)
      setNote(`${TEXT.heard[lang]}: "${request}". ${TEXT.movedToBox[lang]}`)
      boxRef.current?.focus()
    }
  }

  function toggleMic() {
    if (listening) {
      recognition.current?.stop()
      return
    }
    if (!Recognition) {
      setNote(TEXT.micMissing[lang])
      return
    }
    const listener = new Recognition()
    listener.lang = lang === 'ru' ? 'ur-PK' : 'en-IN'
    listener.interimResults = false
    listener.onresult = (event) => handleRequest(event.results[0][0].transcript)
    listener.onerror = () => setNote(TEXT.micFailed[lang])
    listener.onend = () => setListening(false)
    recognition.current = listener
    setNote('')
    setListening(true)
    listener.start()
  }

  async function check(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || checking) return
    // Card numbers and personal PINs never leave the device.
    if (containsSecret(text)) {
      setAnswer({ kind: 'answer', risk: 'none', reply: SECRET_WARNING[lang], warning_signs: [], next_step: '' })
      return
    }
    setChecking(true)
    setAnswer(await checkMessage(text, lang))
    setChecking(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-0 flex-1 overflow-y-auto bg-[#fbf6ec] text-stone-900">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
            <strong className="text-2xl text-[#0f5c5c]">Saathi</strong>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <FontButton label={TEXT.smaller[lang]} disabled={fontStep === 0} onClick={() => onFontStep(fontStep - 1)}>
                <Minus size={14} />
              </FontButton>
              <FontButton label={TEXT.bigger[lang]} disabled={fontStep === fontSteps - 1} onClick={() => onFontStep(fontStep + 1)}>
                <Plus size={14} />
              </FontButton>
              <button
                type="button"
                aria-label={UI.language[lang]}
                title={UI.language[lang]}
                onClick={onLanguage}
                className="grid size-12 place-items-center rounded-xl border-2 border-stone-700 bg-white text-stone-900"
              >
                <Languages size={22} />
              </button>
              <motion.button
                type="button"
                data-guide="sos"
                whileTap={{ scale: 0.96 }}
                onClick={() => setSosOpen(true)}
                className="flex min-h-12 items-center gap-2 rounded-xl border-0 bg-red-700 px-3 text-lg font-bold whitespace-nowrap text-white"
              >
                <Siren size={22} /> {TEXT.sos[lang]}
              </motion.button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 pb-40 wrap-anywhere lg:grid-cols-2 lg:pb-8">
          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <motion.div
                className="w-24 flex-none sm:w-32"
                animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <AvatarFace speaking={speaking} />
              </motion.div>
              <div className="min-w-52 flex-1">
                <p className="text-xl font-semibold">{GREETING[lang]}</p>
                <button
                  type="button"
                  onClick={() => speak(GREETING, lang)}
                  className="mt-1 flex min-h-11 items-center gap-1 border-0 bg-transparent text-lg font-semibold text-blue-800 underline"
                >
                  <Volume2 size={20} /> {TEXT.listen[lang]}
                </button>
              </div>
            </div>

            <div className="grid justify-items-center gap-2 py-2">
              <div className="relative grid size-32 place-items-center">
                {listening &&
                  [0, 1].map((ring) => (
                    <motion.span
                      key={ring}
                      className="absolute inset-0 rounded-full bg-blue-400"
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: ring * 0.8, ease: 'easeOut' }}
                    />
                  ))}
                <motion.button
                  type="button"
                  data-guide="voice-mic"
                  aria-pressed={listening}
                  aria-label={listening ? TEXT.micStop[lang] : TEXT.micStart[lang]}
                  whileTap={{ scale: 0.94 }}
                  onClick={toggleMic}
                  className={`relative grid size-28 place-items-center rounded-full border-0 text-white shadow-lg ${
                    listening ? 'bg-red-700' : 'bg-blue-700'
                  }`}
                >
                  {listening ? <MicOff size={44} /> : <Mic size={44} />}
                </motion.button>
              </div>
              <p className="text-center text-xl font-semibold" role="status">
                {listening ? TEXT.micStop[lang] : TEXT.micStart[lang]}
              </p>
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                handleRequest(typed)
                setTyped('')
              }}
            >
              <input
                value={typed}
                aria-label={TEXT.typeHere[lang]}
                placeholder={TEXT.typeHere[lang]}
                autoComplete="off"
                onChange={(event) => setTyped(event.target.value)}
                className="min-h-14 w-full min-w-0 rounded-xl border-2 border-stone-400 bg-white px-3 text-lg"
              />
              <button type="submit" className="min-h-14 flex-none rounded-xl border-0 bg-blue-700 px-5 text-lg font-bold text-white">
                {TEXT.go[lang]}
              </button>
            </form>
            {note && <p className="rounded-xl bg-blue-50 p-3 text-lg text-blue-900" role="status">{note}</p>}
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-red-800">
              <ShieldAlert size={28} /> {TEXT.scamTitle[lang]}
            </h2>
            <ol className="my-3 list-decimal pl-7 text-lg">
              <li>{TEXT.stepOne[lang]}</li>
              <li>{TEXT.stepTwo[lang]}</li>
              <li>{TEXT.stepThree[lang]}</li>
            </ol>
            <form onSubmit={check}>
              <textarea
                ref={boxRef}
                data-guide="scam-box"
                rows={4}
                value={message}
                aria-label={TEXT.scamPlaceholder[lang]}
                placeholder={TEXT.scamPlaceholder[lang]}
                onChange={(event) => {
                  setMessage(event.target.value)
                  setAnswer(null)
                }}
                className="w-full resize-y rounded-2xl border-2 border-stone-400 bg-white p-3 text-lg"
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                <button
                  type="submit"
                  data-guide="scam-check"
                  disabled={!message.trim() || checking}
                  className="min-h-14 rounded-2xl border-0 bg-red-700 px-4 text-xl font-bold text-white disabled:opacity-40"
                >
                  {checking ? TEXT.checking[lang] : TEXT.check[lang]}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessage(UI.example)
                    setAnswer(null)
                  }}
                  className="min-h-14 rounded-2xl border-2 border-stone-500 bg-white px-4 text-lg font-semibold"
                >
                  {TEXT.example[lang]}
                </button>
              </div>
            </form>
            {answer && <ScamResult answer={answer} lang={lang} />}
          </Card>

          <section className="lg:col-span-2">
            <h2 className="mb-3 text-2xl font-bold">{TEXT.practiceTitle[lang]}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <motion.button
                type="button"
                data-guide="bank-sim"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBank}
                className="flex min-h-32 flex-col items-start justify-center gap-1 rounded-3xl border-0 bg-gradient-to-br from-mz-dark to-mz-green p-5 text-left text-white"
              >
                <Landmark size={32} className="text-mz-gold" />
                <strong className="text-xl">{UI.bankBox[lang]}</strong>
                <span className="text-lg">{UI.bankBoxLead[lang]}</span>
              </motion.button>
              <motion.button
                type="button"
                data-guide="scenario"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={onScenario}
                className="flex min-h-32 flex-col items-start justify-center gap-1 rounded-3xl border-0 bg-emerald-700 p-5 text-left text-white"
              >
                <img src="/brands/easypaisa.png" alt="" className="size-9 rounded-lg bg-white" />
                <strong className="text-xl">{UI.scenarioButton[lang]}</strong>
                <span className="text-lg">{UI.scenarioLead[lang]}</span>
              </motion.button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {features.map(([key, FeatureIcon, label]) => (
                <motion.button
                  type="button"
                  key={key}
                  data-guide={`box-${key}`}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onFeature(key)}
                  className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white p-2 text-center text-lg font-semibold"
                >
                  <FeatureIcon size={30} className="text-emerald-800" />
                  {label[lang]}
                </motion.button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {sosOpen && (
          <SosDialog lang={lang} number={familyNumber} onSave={onSaveNumber} onClose={() => setSosOpen(false)} />
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
