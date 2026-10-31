import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import {
  CheckCircle2,
  FileText,
  Info,
  Lightbulb,
  LoaderCircle,
  Search,
  ShieldCheck,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { AvatarFace, useSpeaking } from './Avatar'
import { containsSecret, SECRET_WARNING } from '../lib/localCheck'
import { speak, stopSpeaking } from '../lib/speech'
import PageHeader from './PageHeader'

const T = (en, ru, ur) => ({ en, ru, ur })

const TEXT = {
  title: T('Form Helper', 'Form Helper', 'فارم مددگار'),
  lead: T('Fill forms calmly, one step at a time.', 'Form aaram se bharein, ek waqt mein ek qadam.', 'فارم آرام سے بھریں، ایک وقت میں ایک قدم۔'),
  pensionTab: T('Pension Form', 'Pension Form', 'پنشن فارم'),
  genericTab: T('Any Form', 'Koi Bhi Form', 'کوئی بھی فارم'),
  privacy: T(
    'Practice only. Nothing here is saved, sent or submitted to the government.',
    'Sirf practice. Yahan kuch save nahi hota, na kahin bheja jata hai, na hukumat ko jama hota hai.',
    'صرف پریکٹس۔ یہاں کچھ محفوظ نہیں ہوتا، نہ کہیں بھیجا جاتا ہے، نہ حکومت کو جمع ہوتا ہے۔',
  ),
  filled: T('boxes filled', 'dabbe bhar gaye', 'ڈبے بھر گئے'),
  formIntro: T(
    'Press any box and I will tell you what to write. You can also press the i button.',
    'Kisi bhi dabbe par dabayein, main bataunga kya likhna hai. Aap i button bhi daba sakte hain.',
    'کسی بھی ڈبے پر دبائیں، میں بتاؤں گا کیا لکھنا ہے۔ آپ آئی بٹن بھی دبا سکتے ہیں۔',
  ),
  example: T('Example', 'Misaal', 'مثال'),
  sample: T('Fill a sample', 'Namoona bharein', 'نمونہ بھریں'),
  finish: T('Finish practice', 'Practice mukammal karein', 'پریکٹس مکمل کریں'),
  doneTitle: T('Well done!', 'Shabash!', 'شاباش!'),
  doneText: T(
    'You completed the practice form. For a real form, take your original CNIC and pension papers to your bank or pension office.',
    'Aap ne practice form mukammal kar liya. Asli form ke liye apna asli CNIC aur pension ke kaghazat bank ya pension office le jayein.',
    'آپ نے پریکٹس فارم مکمل کر لیا۔ اصلی فارم کے لیے اپنا اصلی شناختی کارڈ اور پنشن کے کاغذات بینک یا پنشن آفس لے جائیں۔',
  ),
  again: T('Practise again', 'Dobara practice karein', 'دوبارہ پریکٹس کریں'),
  listen: T('Listen', 'Sunein', 'سنیں'),
  close: T('Close', 'Band karein', 'بند کریں'),
  genericLead: T(
    'Press the i next to a word from your form to learn what it means.',
    'Apne form ke lafz ke saath i dabayein aur jaanein is ka matlab kya hai.',
    'اپنے فارم کے لفظ کے ساتھ آئی دبائیں اور جانیں اس کا مطلب کیا ہے۔',
  ),
  askTitle: T('Word not listed?', 'Lafz list mein nahi?', 'لفظ فہرست میں نہیں؟'),
  askLabel: T('Type the word from your form', 'Form ka lafz yahan likhein', 'فارم کا لفظ یہاں لکھیں'),
  ask: T('Explain this', 'Samjhayein', 'سمجھائیں'),
  asking: T('Let me look...', 'Main dekh raha hoon...', 'میں دیکھ رہا ہوں...'),
  askFailed: T(
    'I cannot explain this right now. Please ask a family member, or the office staff.',
    'Main abhi yeh samjha nahi sakta. Ghar walon ya office ke staff se pooch lein.',
    'میں ابھی یہ سمجھا نہیں سکتا۔ گھر والوں یا آفس کے عملے سے پوچھ لیں۔',
  ),
  meaning: T('What it means', 'Is ka matlab', 'اس کا مطلب'),
  infoAbout: T('Help for', 'Madad', 'مدد'),
}

const PENSION_FIELDS = [
  {
    id: 'fullName',
    label: T('Full Name', 'Poora Naam', 'پورا نام'),
    sample: 'Saathi Practice',
    example: 'Muhammad Aslam',
    help: T(
      'Write your name exactly as it is on your CNIC. Do not use a nickname.',
      'Apna naam bilkul waise likhein jaise CNIC par likha hai. Ghar ka naam na likhein.',
      'اپنا نام بالکل ویسے لکھیں جیسے شناختی کارڈ پر لکھا ہے۔ گھر کا نام نہ لکھیں۔',
    ),
    error: T('Please write your full name.', 'Apna poora naam likhein.', 'اپنا پورا نام لکھیں۔'),
    valid: (value) => value.trim().length >= 3,
  },
  {
    id: 'guardian',
    label: T("Father's or Husband's Name", 'Walid ya Shohar ka Naam', 'والد یا شوہر کا نام'),
    sample: 'Sample Name',
    example: 'Abdul Rehman',
    help: T(
      'Write the same father or husband name that is printed on your CNIC.',
      'Walid ya shohar ka wahi naam likhein jo CNIC par likha hai.',
      'والد یا شوہر کا وہی نام لکھیں جو شناختی کارڈ پر لکھا ہے۔',
    ),
    error: T('Please write this name.', 'Yeh naam likhein.', 'یہ نام لکھیں۔'),
    valid: (value) => value.trim().length >= 3,
  },
  {
    id: 'cnic',
    label: T('CNIC Number', 'CNIC Number', 'شناختی کارڈ نمبر'),
    sample: '00000-0000000-0',
    example: '00000-0000000-0',
    numeric: true,
    format: (value) => {
      const digits = value.replace(/\D/g, '').slice(0, 13)
      return [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12)].filter(Boolean).join('-')
    },
    help: T(
      'This is the 13 digit number on the front of your ID card. The dashes appear by themselves.',
      'Yeh aap ke shanakhti card ke samne likha 13 hindson ka number hai. Darmiyan ki lakeerein khud aa jayengi.',
      'یہ آپ کے شناختی کارڈ کے سامنے لکھا تیرہ ہندسوں کا نمبر ہے۔ درمیان کی لکیریں خود آ جائیں گی۔',
    ),
    error: T('A CNIC has 13 digits.', 'CNIC mein 13 hindsay hote hain.', 'شناختی کارڈ میں تیرہ ہندسے ہوتے ہیں۔'),
    valid: (value) => value.replace(/\D/g, '').length === 13,
  },
  {
    id: 'ppo',
    label: T('Pension Number (PPO)', 'Pension Number (PPO)', 'پنشن نمبر (پی پی او)'),
    sample: 'PPO-0000',
    example: 'PPO-0000',
    help: T(
      'PPO means Pension Payment Order. Look for this number on your pension book or papers.',
      'PPO ka matlab Pension Payment Order hai. Yeh number aap ki pension book ya kaghazat par hota hai.',
      'پی پی او کا مطلب پنشن پیمنٹ آرڈر ہے۔ یہ نمبر آپ کی پنشن بک یا کاغذات پر ہوتا ہے۔',
    ),
    error: T('Please write your pension number.', 'Apna pension number likhein.', 'اپنا پنشن نمبر لکھیں۔'),
    valid: (value) => value.trim().length >= 3,
  },
  {
    id: 'mobile',
    label: T('Mobile Number', 'Mobile Number', 'موبائل نمبر'),
    sample: '03001234567',
    example: '03001234567',
    numeric: true,
    format: (value) => value.replace(/\D/g, '').slice(0, 11),
    help: T(
      'Write a number you use yourself, so the office can reach you. It starts with 03 and has 11 digits.',
      'Woh number likhein jo aap khud istemal karte hain, taake office aap se rabta kar sake. Yeh 03 se shuru hota hai aur is mein 11 hindsay hote hain.',
      'وہ نمبر لکھیں جو آپ خود استعمال کرتے ہیں، تاکہ آفس آپ سے رابطہ کر سکے۔ یہ صفر تین سے شروع ہوتا ہے اور اس میں گیارہ ہندسے ہوتے ہیں۔',
    ),
    error: T('A mobile number starts with 03 and has 11 digits.', 'Mobile number 03 se shuru hota hai aur is mein 11 hindsay hote hain.', 'موبائل نمبر صفر تین سے شروع ہوتا ہے اور اس میں گیارہ ہندسے ہوتے ہیں۔'),
    valid: (value) => /^03\d{9}$/.test(value),
  },
  {
    id: 'iban',
    label: T('Bank IBAN', 'Bank IBAN', 'بینک آئی بان'),
    sample: 'PK00MEZN0000000000000001',
    example: 'PK00MEZN0000000000000001',
    format: (value) => value.replace(/\s/g, '').toUpperCase().slice(0, 24),
    help: T(
      'Your pension comes to this account. The IBAN has 24 letters and numbers, and starts with PK. You can find it in your bank app, or ask your bank.',
      'Aap ki pension is account mein aati hai. IBAN mein 24 huroof aur hindsay hote hain aur yeh PK se shuru hota hai. Yeh aap ki bank app mein milta hai, ya bank se pooch lein.',
      'آپ کی پنشن اس اکاؤنٹ میں آتی ہے۔ آئی بان میں چوبیس حروف اور ہندسے ہوتے ہیں اور یہ پی کے سے شروع ہوتا ہے۔ یہ آپ کی بینک ایپ میں ملتا ہے، یا بینک سے پوچھ لیں۔',
    ),
    error: T('An IBAN has 24 characters and starts with PK.', 'IBAN 24 huroof ka hota hai aur PK se shuru hota hai.', 'آئی بان چوبیس حروف کا ہوتا ہے اور پی کے سے شروع ہوتا ہے۔'),
    valid: (value) => /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(value),
  },
]

const COMMON_FIELDS = [
  {
    id: 'dob',
    label: T('Date of Birth', 'Tareekh e Paidaish', 'تاریخ پیدائش'),
    help: T('Write the day, month and year you were born, as shown on your CNIC.', 'Woh din, mahina aur saal likhein jab aap paida hue, jaise CNIC par likha hai.', 'وہ دن، مہینہ اور سال لکھیں جب آپ پیدا ہوئے، جیسے شناختی کارڈ پر لکھا ہے۔'),
  },
  {
    id: 'address',
    label: T('Address', 'Pata', 'پتا'),
    help: T('Write your house number, street, area and city. Use the place where you can receive letters.', 'Apna ghar ka number, gali, ilaqa aur shehar likhein. Woh pata jahan aap ko khat mil sake.', 'اپنا گھر کا نمبر، گلی، علاقہ اور شہر لکھیں۔ وہ پتا جہاں آپ کو خط مل سکے۔'),
  },
  {
    id: 'guardian',
    label: T('S/O, D/O, W/O', 'S/O, D/O, W/O', 'ولد، بنت، زوجہ'),
    help: T('These mean son of, daughter of and wife of. Write your father or husband name here.', 'In ka matlab beta, beti aur biwi hai. Yahan walid ya shohar ka naam likhein.', 'ان کا مطلب بیٹا، بیٹی اور بیوی ہے۔ یہاں والد یا شوہر کا نام لکھیں۔'),
  },
  {
    id: 'domicile',
    label: T('Domicile', 'Domicile', 'ڈومیسائل'),
    help: T('This is the district you officially belong to. It is written on your domicile certificate.', 'Yeh woh zila hai jis se aap sarkari taur par talluq rakhte hain. Yeh domicile certificate par likha hota hai.', 'یہ وہ ضلع ہے جس سے آپ سرکاری طور پر تعلق رکھتے ہیں۔ یہ ڈومیسائل سرٹیفکیٹ پر لکھا ہوتا ہے۔'),
  },
  {
    id: 'attested',
    label: T('Attested Copy', 'Attested Copy', 'تصدیق شدہ نقل'),
    help: T('A photocopy that an authorised officer has checked, signed and stamped.', 'Aisi photocopy jise kisi ikhtiyar wale afsar ne dekh kar sign aur mohar lagayi ho.', 'ایسی فوٹو کاپی جسے کسی اختیار والے افسر نے دیکھ کر دستخط اور مہر لگائی ہو۔'),
  },
  {
    id: 'signature',
    label: T('Signature or Thumb Impression', 'Dastakhat ya Angootha', 'دستخط یا انگوٹھا'),
    help: T('Sign in this box, or press your thumb with ink if you do not sign. Only do this after you understand the form.', 'Is dabbe mein dastakhat karein, ya syahi se angootha lagayein. Yeh sirf form samajhne ke baad karein.', 'اس ڈبے میں دستخط کریں، یا سیاہی سے انگوٹھا لگائیں۔ یہ صرف فارم سمجھنے کے بعد کریں۔'),
  },
]

async function explainWord(word, lang) {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lang,
      message: `On a Pakistani government form, what does the field "${word}" mean, and what should I write there? Keep it to two short sentences.`,
    }),
  })
  if (!response.ok) throw new Error(`explain failed: ${response.status}`)
  return response.json()
}

function InfoButton({ label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-12 flex-none place-items-center rounded-full border-2 border-emerald-700 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
    >
      <Info size="1.625rem" />
    </button>
  )
}

function InfoModal({ info, lang, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      stopSpeaking()
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={info.label[lang]}
        data-guide="form-info"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white p-6 text-stone-900 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-14 flex-none"><AvatarFace /></span>
            <h2 className="text-2xl font-bold text-emerald-900">{info.label[lang]}</h2>
          </div>
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
        <p className="mt-4 text-xl leading-relaxed">{info.help[lang]}</p>
        {info.example && (
          <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-lg wrap-anywhere">
            <b>{TEXT.example[lang]}:</b> <span dir="ltr">{info.example}</span>
          </p>
        )}
        <button
          type="button"
          onClick={() => speak({ ...info.help, live: true }, lang)}
          className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-0 bg-emerald-700 text-lg font-bold text-white"
        >
          <Volume2 size="1.5rem" /> {TEXT.listen[lang]}
        </button>
      </motion.div>
    </motion.div>
  )
}

function PensionForm({ lang, onInfo, setGuide }) {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [finished, setFinished] = useState(false)
  const baseId = useId()
  const filled = PENSION_FIELDS.filter((field) => field.valid(values[field.id] ?? '')).length

  useEffect(() => {
    setGuide({ line: { ...TEXT.formIntro, live: true }, target: null })
  }, [setGuide])

  function change(field, value) {
    setValues((current) => ({ ...current, [field.id]: field.format ? field.format(value) : value }))
    setErrors((current) => ({ ...current, [field.id]: false }))
  }

  function guideTo(field) {
    setGuide({ line: { ...field.help, live: true }, target: `field-${field.id}` })
  }

  function submit(event) {
    event.preventDefault()
    const invalid = PENSION_FIELDS.filter((field) => !field.valid(values[field.id] ?? ''))
    setErrors(Object.fromEntries(invalid.map((field) => [field.id, true])))
    if (invalid.length === 0) {
      setFinished(true)
      setGuide({ line: { ...TEXT.doneText, live: true }, target: null })
      return
    }
    const [first] = invalid
    document.getElementById(`${baseId}-${first.id}`)?.focus()
    setGuide({ line: { ...first.error, live: true }, target: `field-${first.id}`, tone: 'error' })
  }

  function fillSamples() {
    setValues(Object.fromEntries(PENSION_FIELDS.map((field) => [field.id, field.sample])))
    setErrors({})
  }

  function restart() {
    setValues({})
    setErrors({})
    setFinished(false)
    setGuide({ line: { ...TEXT.formIntro, live: true }, target: null })
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <CheckCircle2 size="5.25rem" className="mx-auto text-emerald-700" />
        <h2 className="mt-2 text-3xl font-bold text-emerald-900">{TEXT.doneTitle[lang]}</h2>
        <p className="my-4 text-xl leading-relaxed">{TEXT.doneText[lang]}</p>
        <button type="button" onClick={restart} className="min-h-14 w-full rounded-2xl border-0 bg-emerald-700 text-xl font-bold text-white">
          {TEXT.again[lang]}
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-semibold text-emerald-900">
            {filled} / {PENSION_FIELDS.length} {TEXT.filled[lang]}
          </p>
          <button
            type="button"
            data-guide="form-samples"
            onClick={fillSamples}
            className="min-h-11 border-0 bg-transparent text-lg font-semibold text-emerald-800 underline"
          >
            {TEXT.sample[lang]}
          </button>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={PENSION_FIELDS.length}
          aria-valuenow={filled}
          aria-label={TEXT.pensionTab[lang]}
          className="h-3 overflow-hidden rounded-full bg-emerald-100"
        >
          <motion.div
            className="h-full rounded-full bg-emerald-600"
            animate={{ width: `${(filled / PENSION_FIELDS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PENSION_FIELDS.map((field) => {
          const inputId = `${baseId}-${field.id}`
          return (
            <div key={field.id} className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-2">
                <label htmlFor={inputId} className="text-xl font-bold text-emerald-900">{field.label[lang]}</label>
                <InfoButton
                  label={`${TEXT.infoAbout[lang]}: ${field.label[lang]}`}
                  onClick={() => onInfo(field)}
                />
              </div>
              <input
                id={inputId}
                data-guide={`field-${field.id}`}
                value={values[field.id] ?? ''}
                inputMode={field.numeric ? 'numeric' : 'text'}
                autoComplete="off"
                dir="ltr"
                aria-invalid={Boolean(errors[field.id])}
                onFocus={() => guideTo(field)}
                onChange={(event) => change(field, event.target.value)}
                className={`min-h-14 w-full rounded-2xl border-2 bg-white px-4 text-lg transition outline-none ${
                  errors[field.id] ? 'border-red-500 bg-red-50' : 'border-emerald-300 focus:border-emerald-700'
                }`}
              />
              {errors[field.id] && <p role="alert" className="mt-1 text-lg font-medium text-red-700">{field.error[lang]}</p>}
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        data-guide="form-finish"
        className="mt-5 min-h-14 w-full rounded-2xl border-0 bg-emerald-700 px-4 text-xl font-bold text-white transition hover:bg-emerald-800"
      >
        {TEXT.finish[lang]}
      </button>
    </form>
  )
}

function GenericHelper({ lang, onInfo }) {
  const [word, setWord] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const wordId = useId()

  async function ask(event) {
    event.preventDefault()
    const text = word.trim()
    if (!text || busy) return
    if (containsSecret(text)) {
      setAnswer(SECRET_WARNING[lang])
      return
    }
    setBusy(true)
    try {
      const result = await explainWord(text, lang)
      setAnswer([result.reply, result.next_step].filter(Boolean).join(' '))
    } catch {
      setAnswer(TEXT.askFailed[lang])
    }
    setBusy(false)
  }

  return (
    <>
      <p className="mb-4 text-xl leading-relaxed">{TEXT.genericLead[lang]}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {COMMON_FIELDS.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-3">
            <span className="flex min-w-0 items-center gap-2 text-lg font-semibold">
              <FileText size="1.375rem" className="flex-none text-emerald-700" /> {item.label[lang]}
            </span>
            <InfoButton label={`${TEXT.infoAbout[lang]}: ${item.label[lang]}`} onClick={() => onInfo(item)} />
          </div>
        ))}
      </div>

      <form onSubmit={ask} className="mt-5">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-emerald-900">
          <Lightbulb size="1.625rem" /> {TEXT.askTitle[lang]}
        </h2>
        <label htmlFor={wordId} className="mb-1 block text-lg font-semibold">{TEXT.askLabel[lang]}</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={wordId}
            data-guide="form-word"
            value={word}
            autoComplete="off"
            maxLength={120}
            onChange={(event) => setWord(event.target.value)}
            className="min-h-14 w-full min-w-0 rounded-2xl border-2 border-emerald-300 bg-white px-4 text-lg outline-none focus:border-emerald-700"
          />
          <button
            type="submit"
            data-guide="form-ask"
            disabled={!word.trim() || busy}
            className="flex min-h-14 flex-none items-center justify-center gap-2 rounded-2xl border-0 bg-emerald-700 px-5 text-lg font-bold text-white disabled:opacity-40"
          >
            {busy ? <LoaderCircle size="1.375rem" className="animate-spin" /> : <Search size="1.375rem" />}
            {busy ? TEXT.asking[lang] : TEXT.ask[lang]}
          </button>
        </div>
      </form>

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          data-guide="form-answer"
          className="mt-4 rounded-2xl border-2 border-emerald-300 bg-white p-4 text-lg leading-relaxed"
        >
          <b className="block text-emerald-900">{TEXT.meaning[lang]}</b>
          {answer}
        </motion.div>
      )}
    </>
  )
}

export default function GovernmentFormAssistant({ lang, setGuide, onExit }) {
  const [tab, setTab] = useState('pension')
  const [info, setInfo] = useState(null)
  const speaking = useSpeaking()

  const tabs = [
    ['pension', TEXT.pensionTab],
    ['generic', TEXT.genericTab],
  ]

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-0 flex-1 overflow-y-auto text-stone-900">
        <div className="mx-auto max-w-6xl p-4 pb-40 wrap-anywhere lg:pb-10">
          <PageHeader
            lang={lang}
            title={TEXT.title[lang]}
            lead={TEXT.lead[lang]}
            onBack={onExit}
            media={<AvatarFace speaking={speaking} />}
          />

          <p className="mb-4 flex items-start gap-2 rounded-2xl bg-white/80 p-3 text-lg text-emerald-950">
            <ShieldCheck size="1.5rem" className="mt-0.5 flex-none text-emerald-700" /> {TEXT.privacy[lang]}
          </p>

          <div role="tablist" aria-label={TEXT.title[lang]} className="mb-4 grid grid-cols-2 gap-2">
            {tabs.map(([id, label]) => (
              <button
                type="button"
                role="tab"
                key={id}
                data-guide={`form-tab-${id}`}
                aria-selected={tab === id}
                onClick={() => {
                  setGuide(null)
                  setTab(id)
                }}
                className={`min-h-16 rounded-2xl border-2 px-2 text-xl font-bold transition ${
                  tab === id ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-emerald-300 bg-white text-emerald-900'
                }`}
              >
                {label[lang]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <section role="tabpanel" className="min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              {tab === 'pension' ? (
                <PensionForm lang={lang} onInfo={setInfo} setGuide={setGuide} />
              ) : (
                <GenericHelper lang={lang} onInfo={setInfo} />
              )}
            </section>
            <div data-guide="side-slot" data-follow className="hidden h-44 lg:sticky lg:top-4 lg:block" />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {info && <InfoModal info={info} lang={lang} onClose={() => setInfo(null)} />}
      </AnimatePresence>
    </MotionConfig>
  )
}
