import { useEffect, useRef, useState } from 'react'
import { AvatarFace, useSpeaking } from './Avatar'
import { LESSONS, UI } from '../data/content'
import { containsSecret, localAnswer, SECRET_WARNING } from '../lib/localCheck'
import { speak } from '../lib/speech'

const MAX_IMAGE_SIDE = 1280

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

function Reply({ item, lang, onOpenLesson }) {
  const { answer } = item
  const spoken = [answer.reply, answer.next_step].filter(Boolean).join(' ')
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
      <div className="reply-actions">
        <button type="button" className="text-button" onClick={() => speak(toLine(spoken), lang)}>
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
    // Starts at the top of the newest item so the risk heading is always seen.
    endRef.current?.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [items, busy])

  function addAnswer(answer) {
    setItems((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', answer }])
    speak(toLine([answer.reply, answer.next_step].filter(Boolean).join(' ')), lang)
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
    const history = items.map((item) => ({
      role: item.role,
      text: item.role === 'user' ? item.text : item.answer.reply,
    }))
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', text: trimmed, preview: attachment?.preview },
    ])
    setText('')
    setImage(null)

    // Card numbers and personal PINs never leave the device.
    if (containsSecret(trimmed)) {
      addAnswer({ kind: 'answer', risk: 'none', reply: SECRET_WARNING[lang], warning_signs: [], next_step: '' })
      return
    }

    setBusy(true)
    try {
      addAnswer(await fetchAnswer(trimmed, attachment, history))
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
          <button type="button" className="secondary" onClick={() => setText(UI.example)}>
            {UI.askExample[lang]}
          </button>
        )}
        {items.map((item) =>
          item.role === 'user' ? (
            <div className="mine" key={item.id}>
              {item.preview && <img src={item.preview} alt="" />}
              {item.text && <p>{item.text}</p>}
            </div>
          ) : (
            <Reply key={item.id} item={item} lang={lang} onOpenLesson={onOpenLesson} />
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
        {image && <img className="ask-preview" src={image.preview} alt="" />}
        <textarea
          rows={2}
          value={text}
          placeholder={UI.askPlaceholder[lang]}
          aria-label={UI.askPlaceholder[lang]}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="ask-buttons">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          <button type="button" className="secondary" onClick={() => fileRef.current.click()}>
            {UI.askPhoto[lang]}
          </button>
          <button type="submit" className="primary" disabled={busy}>
            {UI.askSend[lang]}
          </button>
        </div>
      </form>
    </main>
  )
}
