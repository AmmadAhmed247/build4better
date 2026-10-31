import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AvatarFace, useSpeaking } from './Avatar'
import { LESSONS, UI } from '../data/content'
import { containsSecret, localAnswer, SECRET_WARNING } from '../lib/localCheck'
import { speak } from '../lib/speech'

const MAX_IMAGE_SIDE = 1280

const STARTER_QUESTIONS = [
  'OTP kya hota hai?',
  'Technology kya hai?',
  'Scam message ki pehchan kya hai?',
  'Video call kaise karun?',
  'Screenshot kaise lete hain?',
  'Online payment kaise karun?',
]

// Shrinks phone photos so they stay under the API image limit.
function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve({ preview: dataUrl, mediaType: 'image/jpeg', data: dataUrl.split(',')[1] })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable image'))
    }
    image.src = url
  })
}

// Speaks without a separate Urdu translation, which only the scripted lines have.
function toLine(text) {
  return { en: text, ru: text, ur: text }
}

// AI answers carry an Urdu script version, which the recorded voice can read well.
function answerLine(answer) {
  const text = [answer.reply, answer.next_step].filter(Boolean).join(' ')
  return answer.speak_text ? { en: text, ru: text, ur: answer.speak_text, live: true } : toLine(text)
}

function Reply({ item, lang, busy, canReply, onReply, onOpenLesson }) {
  const { answer } = item
  return (
    <div className={`reply reply-${answer.kind === 'scam_check' ? answer.risk : 'plain'}`}>
      {answer.kind === 'scam_check' && <strong className="reply-risk">{UI.risk[answer.risk][lang]}</strong>}
      <p>{answer.reply}</p>
      {answer.warning_signs.length > 0 && (
        <>
          <h3>{UI.warningSigns[lang]}</h3>
          <ul>{answer.warning_signs.map((sign) => <li key={sign}>{sign}</li>)}</ul>
        </>
      )}
      {answer.next_step && (
        <>
          <h3>{UI.whatToDo[lang]}</h3>
          <p>{answer.next_step}</p>
        </>
      )}
      {canReply && answer.suggested_replies?.length > 0 && (
        <div className="reply-actions" data-guide="ask-replies">
          {answer.suggested_replies.map((reply) => (
            <button type="button" className="secondary" key={reply} disabled={busy} onClick={() => onReply(reply)}>
              {reply}
            </button>
          ))}
        </div>
      )}
      <div className="reply-actions">
        <button type="button" className="text-button" onClick={() => speak(answerLine(answer), lang)}>
          {UI.askListen[lang]}
        </button>
        {answer.lessonId && (
          <button type="button" className="secondary" onClick={() => onOpenLesson(answer.lessonId)}>
            {UI.askOpenLesson[lang]}: {LESSONS[answer.lessonId].title[lang]}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AskSaathi({ lang, onOpenLesson }) {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [online, setOnline] = useState(null)
  const speaking = useSpeaking()
  const endRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((health) => setOnline(health.ai))
      .catch(() => setOnline(false))
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    // Starts at the top of the newest item so the risk heading is always seen.
    endRef.current?.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [items, busy])

  function addAnswer(answer, isPrivate = false) {
    setItems((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', answer, private: isPrivate }])
    speak(answerLine(answer), lang)
  }

  async function fetchAnswer(message, attachment, history) {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        lang,
        history,
        image: attachment && { mediaType: attachment.mediaType, data: attachment.data },
      }),
    })
    if (!response.ok) throw new Error(`ask failed: ${response.status}`)
    return response.json()
  }

  async function send(message) {
    const trimmed = message.trim()
    if ((!trimmed && !image) || busy) return
    const attachment = image
    // Card numbers and personal PINs never leave the device, now or in later history.
    const isPrivate = containsSecret(trimmed)
    const history = items
      .filter((item) => !item.private)
      .map((item) => ({
        role: item.role,
        text: item.role === 'user' ? item.historyText : item.answer.reply,
      }))
    const userId = crypto.randomUUID()
    setItems((current) => [
      ...current,
      {
        id: userId,
        role: 'user',
        text: trimmed,
        historyText: attachment ? `[screenshot] ${trimmed}`.trim() : trimmed,
        preview: attachment?.preview,
        private: isPrivate,
      },
    ])
    setText('')

    if (isPrivate) {
      addAnswer({ kind: 'answer', risk: 'none', reply: SECRET_WARNING[lang], warning_signs: [], next_step: '' }, true)
      return
    }

    setBusy(true)
    try {
      const answer = await fetchAnswer(trimmed, attachment, history)
      // Later turns remember the picture through this short description.
      if (attachment && answer.screen_summary) {
        const historyText = `[screenshot: ${answer.screen_summary}] ${trimmed}`.trim()
        setItems((current) => current.map((item) => (item.id === userId ? { ...item, historyText } : item)))
      }
      addAnswer(answer)
      if (attachment) removeImage()
      setOnline(true)
    } catch {
      setOnline(false)
      addAnswer(
        attachment && !trimmed
          ? { kind: 'answer', risk: 'none', reply: UI.photoNeedsAi[lang], warning_signs: [], next_step: '' }
          : localAnswer(trimmed, lang),
      )
    } finally {
      setBusy(false)
    }
  }

  function removeImage() {
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handlePhoto(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    try {
      setImage(await readImage(file))
    } catch {
      addAnswer({ kind: 'answer', risk: 'none', reply: UI.photoNeedsAi[lang], warning_signs: [], next_step: '' })
    }
  }

  return (
    <main className="ask">
      <header className="ask-head">
        <div className="ask-face"><AvatarFace speaking={speaking} /></div>
        <div>
          <h1>{UI.askTitle[lang]}</h1>
          <p>{UI.askLead[lang]}</p>
        </div>
      </header>
      {online === false && <p className="ask-offline">{UI.askOffline[lang]}</p>}

      <div className="ask-list">
        {items.length === 0 && (
          <section className="rounded-2xl border-2 border-emerald-200 bg-white p-3 shadow-sm" data-guide="ask-starters-box">
            <h2 className="mb-2 text-lg font-bold text-emerald-900">{UI.askStarters[lang]}</h2>
            <div className="grid gap-2 sm:grid-cols-2" data-guide="ask-starters">
              {STARTER_QUESTIONS.map((question) => (
                <button type="button" className="secondary" key={question} disabled={busy} onClick={() => send(question)}>
                  {question}
                </button>
              ))}
              <button type="button" className="secondary" onClick={() => setText(UI.example)}>
                {UI.askExample[lang]}
              </button>
            </div>
          </section>
        )}
        {items.map((item, index) =>
          item.role === 'user' ? (
            <div className="mine" key={item.id}>
              {item.preview && <img src={item.preview} alt="" />}
              {item.text && <p>{item.text}</p>}
            </div>
          ) : (
            <Reply
              key={item.id}
              item={item}
              lang={lang}
              busy={busy}
              canReply={index === items.length - 1}
              onReply={send}
              onOpenLesson={onOpenLesson}
            />
          ),
        )}
        {busy && <p className="ask-busy">{UI.askThinking[lang]}</p>}
        <div ref={endRef} />
      </div>

      <form
        className="ask-form"
        onSubmit={(event) => {
          event.preventDefault()
          send(text)
        }}
      >
        {image && (
          <div className="relative w-fit" data-guide="ask-attachment">
            <img className="ask-preview block" src={image.preview} alt="" />
            <button
              type="button"
              data-guide="ask-remove-image"
              aria-label={UI.askRemovePhoto[lang]}
              title={UI.askRemovePhoto[lang]}
              disabled={busy}
              onClick={removeImage}
              className="absolute -top-2 -right-2 grid size-9 place-items-center rounded-full border-2 border-white bg-stone-900 text-white shadow disabled:opacity-40"
            >
              <X size="1.125rem" />
            </button>
          </div>
        )}
        <textarea
          rows={2}
          value={text}
          placeholder={UI.askPlaceholder[lang]}
          aria-label={UI.askPlaceholder[lang]}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="ask-buttons">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          <button type="button" className="secondary" disabled={busy} onClick={() => fileRef.current.click()}>
            {UI.askPhoto[lang]}
          </button>
          <button type="submit" className="primary" disabled={busy || (!text.trim() && !image)}>
            {UI.askSend[lang]}
          </button>
        </div>
      </form>
    </main>
  )
}
