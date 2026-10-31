import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  GripHorizontal,
  Languages,
  Landmark,
  LoaderCircle,
  Mic,
  Minus,
  Phone,
  Plus,
  ShieldAlert,
  Siren,
  Square,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AvatarFace, useSpeaking } from './Avatar'
import { LINES, UI } from '../data/content'
import { addUrdu } from '../lib/i18n'
import { containsSecret, localAnswer, SECRET_WARNING } from '../lib/localCheck'
import { startRecording } from '../lib/recorder'
import { speak, stopSpeaking } from '../lib/speech'

const T = (en, ru, ur) => ({ en, ru, ur })

const TEXT = {
  sos: T('Family SOS', 'Family SOS'),
  smaller: T('Make text smaller', 'Likhai chhoti karein'),
  bigger: T('Make text bigger', 'Likhai bari karein'),
  listen: T('Listen', 'Sunein'),
  help: T('Not understanding something? Press here', 'Kuch samajh nahi aa raha? Yahan dabayein'),
  micStart: T('Press and speak', 'Dabayein aur bolein'),
  micStop: T('Listening... press to stop', 'Sun raha hoon... rokne ke liye dabayein'),
  thinking: T('Let me think...', 'Main soch raha hoon...'),
  micBlocked: T(
    'The microphone is blocked. Press Allow in your browser, or type below.',
    'Microphone band hai. Browser mein Allow dabayein, ya neeche likh dein.',
  ),
  micSecure: T(
    'The microphone needs a secure link. Please type below.',
    'Microphone ke liye secure link chahiye. Baraye meherbani neeche likh dein.',
  ),
  micFailed: T(
    'I could not understand that. Please try again, or type below.',
    'Main samajh nahi saka. Dobara koshish karein, ya neeche likh dein.',
  ),
  typeHere: T('Your words will appear here. You can also type.', 'Aap ki baat yahan likhi jayegi. Aap khud bhi likh sakte hain.'),
  go: T('Ask', 'Poochein'),
  open: T('Show me', 'Mujhe dikhayein'),
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

addUrdu(TEXT)

const GREETING = LINES.greeting
const TILE_TONES = ['bg-lime-700', 'bg-fuchsia-600', 'bg-violet-600', 'bg-sky-700']

const ROUTES = [
  [/scam|fraud|dhoka|دھوکا|فراڈ/i, 'scam'],
  [/whatsapp|واٹس/i, 'whatsapp'],
  [/screenshot|screen shot|اسکرین/i, 'screenshot'],
  [/google|گوگل|search/i, 'google'],
  [/video|ویڈیو/i, 'video'],
  [/\bai\b|chatgpt/i, 'ai'],
  [/iban|آئی بان/i, 'ep-iban'],
  [/raast|راست/i, 'ep-raast'],
  [/bill|bijli|بل|بجلی/i, 'ep-ke'],
  [/payment|paise|bank|money|بینک|پیسے/i, 'bank'],
]

const RISK_STYLE = {
  danger: ['border-red-500 bg-red-50 text-red-900', AlertTriangle],
  careful: ['border-amber-500 bg-amber-50 text-amber-900', ShieldAlert],
  none: ['border-emerald-500 bg-emerald-50 text-emerald-900', CheckCircle2],
}

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${url} failed: ${response.status}`)
  return response.json()
}

async function checkMessage(message, lang) {
  try {
    return await post('/api/ask', { message, lang })
  } catch {
    return localAnswer(message, lang)
  }
}

function offlineGuide(text, lang) {
  const local = localAnswer(text, lang)
  const feature = ROUTES.find(([pattern]) => pattern.test(text))?.[1] ?? local.lessonId ?? 'none'
  return { transcript: text, reply: local.reply, speech: local.reply, feature }
}

function FontButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-12 items-center justify-center rounded-2xl border-0 bg-white/90 text-lg font-bold text-stone-900 disabled:opacity-45"
    >
      A{children}
    </button>
  )
}

function ScamResult({ answer, lang }) {
  const risk = answer.kind === 'scam_check' ? answer.risk : 'none'
  const [style, Icon] = RISK_STYLE[risk]
  const resultRef = useRef(null)

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
      className={`mt-4 scroll-mt-4 rounded-2xl border-2 p-4 text-lg ${style}`}
    >
      {answer.kind === 'scam_check' && (
        <p className="flex items-center gap-2 text-xl font-bold">
          <Icon size="1.75rem" /> {UI.risk[risk][lang]}
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

function ScamPanel({ lang, message, onMessage }) {
  const [answer, setAnswer] = useState(null)
  const [checking, setChecking] = useState(false)

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
    <>
      <h2 className="flex items-center gap-2 pr-14 text-2xl font-bold text-red-800">
        <ShieldAlert size="1.75rem" /> {TEXT.scamTitle[lang]}
      </h2>
      <ol className="my-3 list-decimal pl-7 text-lg">
        <li>{TEXT.stepOne[lang]}</li>
        <li>{TEXT.stepTwo[lang]}</li>
        <li>{TEXT.stepThree[lang]}</li>
      </ol>
      <form onSubmit={check}>
        <textarea
          data-guide="scam-box"
          rows={5}
          value={message}
          aria-label={TEXT.scamPlaceholder[lang]}
          placeholder={TEXT.scamPlaceholder[lang]}
          onChange={(event) => {
            onMessage(event.target.value)
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
              onMessage(UI.example)
              setAnswer(null)
            }}
            className="min-h-14 rounded-2xl border-2 border-stone-500 bg-white px-4 text-lg font-semibold"
          >
            {TEXT.example[lang]}
          </button>
        </div>
      </form>
      {answer && <ScamResult answer={answer} lang={lang} />}
    </>
  )
}

function HelpPanel({ lang, onOpen }) {
  const [status, setStatus] = useState('idle')
  const [text, setText] = useState('')
  const [guide, setGuide] = useState(null)
  const [note, setNote] = useState('')
  const speaking = useSpeaking()
  const recording = useRef(null)
  const statusRef = useRef('idle')

  function changeStatus(next) {
    statusRef.current = next
    setStatus(next)
  }

  useEffect(() => {
    speak(GREETING, lang)
    return () => {
      recording.current?.stop()
      stopSpeaking()
    }
  }, [lang])

  function showGuide(answer) {
    setText(answer.transcript)
    setGuide(answer)
    speak({ en: answer.reply, ru: answer.reply, ur: answer.speech || answer.reply, live: true }, lang)
  }

  async function askByText(event) {
    event.preventDefault()
    const request = text.trim()
    if (!request || statusRef.current !== 'idle') return
    setNote('')
    if (containsSecret(request)) {
      setText('')
      setGuide(null)
      setNote(SECRET_WARNING[lang])
      return
    }
    changeStatus('thinking')
    try {
      showGuide(await post('/api/guide', { message: request, lang }))
    } catch {
      showGuide(offlineGuide(request, lang))
    }
    changeStatus('idle')
  }

  async function toggleMic() {
    if (statusRef.current === 'listening') {
      recording.current?.stop()
      return
    }
    if (statusRef.current !== 'idle') return
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setNote(TEXT.micSecure[lang])
      return
    }
    stopSpeaking()
    setNote('')
    setGuide(null)
    setText('')
    try {
      recording.current = await startRecording()
      changeStatus('listening')
      const audio = await recording.current.done
      changeStatus('thinking')
      const answer = await post('/api/guide', { audio, lang })
      if (answer.transcript.trim()) showGuide(answer)
      else setNote(TEXT.micFailed[lang])
    } catch (error) {
      setNote(error.name === 'NotAllowedError' ? TEXT.micBlocked[lang] : TEXT.micFailed[lang])
    }
    recording.current = null
    changeStatus('idle')
  }

  const label = { idle: TEXT.micStart, listening: TEXT.micStop, thinking: TEXT.thinking }[status][lang]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 pr-14">
        <motion.div
          className="w-20 flex-none"
          animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AvatarFace speaking={speaking} />
        </motion.div>
        <div className="min-w-44 flex-1">
          <p className="text-lg font-semibold">{GREETING[lang]}</p>
          <button
            type="button"
            onClick={() => speak(GREETING, lang)}
            className="mt-1 flex min-h-11 items-center gap-1 border-0 bg-transparent text-lg font-semibold text-blue-800 underline"
          >
            <Volume2 size="1.25rem" /> {TEXT.listen[lang]}
          </button>
        </div>
      </div>

      <div className="grid justify-items-center gap-2">
        <div className="relative grid size-32 place-items-center">
          {status === 'listening' &&
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
            aria-pressed={status === 'listening'}
            aria-label={label}
            disabled={status === 'thinking'}
            whileTap={{ scale: 0.94 }}
            onClick={toggleMic}
            className={`relative grid size-28 place-items-center rounded-full border-0 text-white shadow-lg ${
              status === 'listening' ? 'bg-red-700' : 'bg-blue-700'
            }`}
          >
            {status === 'idle' && <Mic size="2.75rem" />}
            {status === 'listening' && <Square size="2.375rem" fill="white" />}
            {status === 'thinking' && <LoaderCircle size="2.75rem" className="animate-spin" />}
          </motion.button>
        </div>
        <p className="text-center text-xl font-semibold" role="status">{label}</p>
      </div>

      <form className="grid gap-2" onSubmit={askByText}>
        <textarea
          data-guide="voice-text"
          rows={2}
          value={text}
          aria-label={TEXT.typeHere[lang]}
          placeholder={TEXT.typeHere[lang]}
          onChange={(event) => setText(event.target.value)}
          className="w-full resize-y rounded-xl border-2 border-stone-400 bg-white p-3 text-lg"
        />
        <button
          type="submit"
          data-guide="voice-go"
          disabled={!text.trim() || status !== 'idle'}
          className="min-h-14 rounded-xl border-0 bg-blue-700 px-5 text-lg font-bold text-white disabled:opacity-40"
        >
          {TEXT.go[lang]}
        </button>
      </form>

      {note && <p className="rounded-xl bg-amber-50 p-3 text-lg text-amber-900" role="alert">{note}</p>}

      {guide && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          data-guide="guide-reply"
          className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 text-lg text-blue-950"
        >
          <p className="whitespace-pre-line">{guide.reply}</p>
          {guide.feature !== 'none' && (
            <button
              type="button"
              data-guide="guide-open"
              onClick={() => onOpen(guide.feature, guide.transcript)}
              className="mt-3 min-h-14 w-full rounded-xl border-0 bg-emerald-700 px-4 text-lg font-bold text-white"
            >
              {TEXT.open[lang]}
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Floating help that stays available on every page.
export function HelpOverlay({ lang, panel, scamMessage, compact, onPanel, onScamMessage, onOpen }) {
  const dragArea = useRef(null)
  const dragged = useRef(false)

  useEffect(() => {
    if (!panel) return undefined
    const onKey = (event) => event.key === 'Escape' && onPanel(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel, onPanel])

  return (
    <MotionConfig reducedMotion="user">
      <div ref={dragArea} className="pointer-events-none fixed inset-2 z-20" />
      <motion.button
        type="button"
        data-guide="help-pop"
        drag
        dragConstraints={dragArea}
        dragElastic={0}
        dragMomentum={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
        onDragStart={() => {
          dragged.current = true
        }}
        onDragEnd={() => {
          // The browser may send a click right after a drag, and that one must not open the panel.
          setTimeout(() => {
            dragged.current = false
          }, 100)
        }}
        onClick={() => {
          if (!dragged.current) onPanel('help')
        }}
        aria-label={TEXT.help[lang]}
        title={TEXT.help[lang]}
        className={`fixed z-20 flex cursor-grab touch-none items-center border border-white/60 bg-white/90 text-left text-sm leading-tight font-bold text-emerald-900 shadow-lg backdrop-blur-md select-none ${
          compact ? 'top-[42%] right-0 rounded-l-2xl border-r-0 p-1' : 'right-3 bottom-28 max-w-48 gap-1.5 rounded-2xl px-2 py-1.5'
        }`}
      >
        <span className={`pointer-events-none flex-none ${compact ? 'w-6' : 'w-8'}`}><AvatarFace /></span>
        {!compact && (
          <>
            <span className="pointer-events-none">{TEXT.help[lang]}</span>
            <GripHorizontal size="0.875rem" className="pointer-events-none flex-none text-emerald-500" aria-hidden="true" />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {panel && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onPanel(null)}
            className="fixed inset-0 z-30 bg-black/45"
          />
        )}
        {panel && (
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={panel === 'help' ? TEXT.help[lang] : TEXT.scamTitle[lang]}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 text-stone-900 shadow-2xl wrap-anywhere"
          >
            <button
              type="button"
              aria-label={TEXT.close[lang]}
              data-guide="panel-close"
              onClick={() => onPanel(null)}
              className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-xl border-2 border-stone-300 bg-white"
            >
              <X size="1.5rem" />
            </button>
            {panel === 'help' ? (
              <HelpPanel
                lang={lang}
                onOpen={onOpen}
              />
            ) : (
              <ScamPanel lang={lang} message={scamMessage} onMessage={onScamMessage} />
            )}
          </motion.aside>
        )}
      </AnimatePresence>

    </MotionConfig>
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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4"
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
            <X size="1.5rem" />
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
              <Phone size="1.625rem" /> {TEXT.sosCall[lang]}
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
  const [sosOpen, setSosOpen] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-0 flex-1 overflow-y-auto text-stone-900">
        <header className="sticky top-2 z-10 mx-auto mt-2 w-[calc(100%-1.5rem)] max-w-6xl rounded-3xl border border-white/30 bg-[var(--glass-dark)] shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
            <strong className="text-2xl font-extrabold tracking-tight text-white uppercase">Saathi</strong>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <FontButton label={TEXT.smaller[lang]} disabled={fontStep === 0} onClick={() => onFontStep(fontStep - 1)}>
                <Minus size="0.875rem" />
              </FontButton>
              <FontButton label={TEXT.bigger[lang]} disabled={fontStep === fontSteps - 1} onClick={() => onFontStep(fontStep + 1)}>
                <Plus size="0.875rem" />
              </FontButton>
              <button
                type="button"
                aria-label={UI.language[lang]}
                title={UI.language[lang]}
                onClick={onLanguage}
                className="grid size-12 place-items-center rounded-2xl border-0 bg-white/90 text-stone-900"
              >
                <Languages size="1.375rem" />
              </button>
              <motion.button
                type="button"
                data-guide="sos"
                whileTap={{ scale: 0.96 }}
                onClick={() => setSosOpen(true)}
                className="flex min-h-12 items-center gap-2 rounded-2xl border-0 bg-red-700 px-3 text-lg font-bold whitespace-nowrap text-white"
              >
                <Siren size="1.375rem" /> {TEXT.sos[lang]}
              </motion.button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl p-4 pb-48 wrap-anywhere lg:pb-8">
        <section className="min-w-0">
          <h1 className="display mt-3 mb-5 text-white [text-shadow:0_2px_20px_rgb(20_40_30/45%)]">{TEXT.practiceTitle[lang]}</h1>
          <div className="grid gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              data-guide="bank-sim"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBank}
              className="flex min-h-36 flex-col items-start justify-center gap-1 rounded-3xl border border-white/30 bg-[var(--glass-dark)] p-5 text-left text-white shadow-lg backdrop-blur-md"
            >
              <Landmark size="2rem" className="text-mz-gold" />
              <strong className="text-xl">{UI.bankBox[lang]}</strong>
              <span className="text-lg">{UI.bankBoxLead[lang]}</span>
            </motion.button>
            <motion.button
              type="button"
              data-guide="scenario"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScenario}
              className="flex min-h-36 flex-col items-start justify-center gap-1 rounded-3xl border border-white/30 bg-[var(--glass-dark)] p-5 text-left text-white shadow-lg backdrop-blur-md"
            >
              <img src="/brands/easypaisa.png" alt="" className="size-9 rounded-lg bg-white" />
              <strong className="text-xl">{UI.scenarioButton[lang]}</strong>
              <span className="text-lg">{UI.scenarioLead[lang]}</span>
            </motion.button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {features.map(([key, FeatureIcon, label], index) => (
              <motion.button
                type="button"
                key={key}
                data-guide={`box-${key}`}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onFeature(key)}
                className="flex min-h-44 flex-col items-center justify-center gap-1 rounded-3xl border-0 bg-[var(--glass-light)] p-3 text-center text-lg font-semibold shadow-lg"
              >
                <span className={`mb-1 grid size-14 place-items-center rounded-full text-white ${key === 'scam' ? 'bg-red-700' : TILE_TONES[index % TILE_TONES.length]}`}>
                  <FeatureIcon size="1.75rem" aria-hidden="true" />
                </span>
                {label[lang]}
                <span className="text-base leading-snug font-normal text-stone-600">{UI.featureHelp[key][lang]}</span>
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
