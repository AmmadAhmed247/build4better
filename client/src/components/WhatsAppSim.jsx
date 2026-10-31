import {
  ArrowLeft,
  BatteryFull,
  Camera,
  CheckCheck,
  Folder,
  Globe,
  Mic,
  MicOff,
  MessageCircle,
  Paperclip,
  Phone,
  PhoneOff,
  Play,
  Search,
  SendHorizontal,
  Settings,
  Smile,
  Trash2,
  Video,
  VideoOff,
  Wifi,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import SelfView from './SelfView'
import { MUTE_LINE, UNMUTE_LINE } from '../data/content'
import { CHATS, WA_LINES as LINE } from '../data/whatsapp'
import { tr } from '../lib/i18n'

const MIN_RECORDING_MS = 1000
const REPLY_DELAY_MS = 1800
const CALL_STEPS_MS = [1600, 2200]
const PHONE_BELOW = 768

const PHONE_APPS = [
  ['app-instagram', 'Instagram', 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-700', Camera],
  ['app-facebook', 'Facebook', 'bg-blue-600', 'f'],
  ['wa-icon', 'WhatsApp', 'bg-[#00a884]', MessageCircle],
  ['app-youtube', 'YouTube', 'bg-red-600', Play],
  ['app-browser', 'Internet', 'bg-sky-500', Globe],
  ['app-camera', 'Camera', 'bg-stone-700', Camera],
  ['app-phone', 'Phone', 'bg-emerald-600', Phone],
  ['app-settings', 'Settings', 'bg-slate-500', Settings],
]

function clock() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function duration(seconds) {
  return `0:${String(seconds).padStart(2, '0')}`
}

function Face({ chat, size = 'size-14' }) {
  return (
    <span className={`grid flex-none place-items-center rounded-full text-xl font-bold text-white ${size} ${chat.tone}`}>
      {chat.name.split('- ')[1][0]}
    </span>
  )
}

function Bubble({ message }) {
  return (
    <div className={`fade-up flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-lg shadow-sm ${message.mine ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
        {message.voice ? (
          <span className="flex items-center gap-2 py-1">
            <Play size="1.375rem" className="text-[#00806a]" />
            <span className="h-1 w-28 rounded bg-[#00806a]/50" aria-hidden="true" />
            {duration(message.voice)}
          </span>
        ) : (
          <p className="wrap-anywhere">{message.text}</p>
        )}
        <p className="mt-0.5 flex items-center justify-end gap-1 text-sm text-stone-600">
          {message.time} {message.mine && <CheckCheck size="1rem" className="text-sky-600" />}
        </p>
      </div>
    </div>
  )
}

function CallModal({ call, chat, seconds, lang, onMute, onCamera, onEnd }) {
  const label = { calling: 'Calling...', ringing: 'Ringing...', connected: duration(seconds) }[call.phase]
  return (
    <div className="fade-up absolute inset-0 z-10 flex flex-col items-center justify-between bg-[#0b141a] p-6 text-white">
      <div className="mt-8 grid justify-items-center gap-2">
        <Face chat={chat} size="size-28" />
        <h2 className="text-2xl font-bold">{chat.name}</h2>
        <p className="text-xl" role="status">{label}</p>
        <p className="flex items-center gap-2 text-lg">
          {call.video ? <Video size="1.375rem" /> : <Phone size="1.375rem" />} {call.video ? 'Video call' : 'Voice call'}
        </p>
      </div>
      {call.camera && <SelfView lang={lang} className="h-32 w-44 rounded-xl bg-black object-cover -scale-x-100 p-1 text-center text-base" />}
      <div className="mb-4 flex items-start gap-4">
        <button
          type="button"
          data-guide="wa-mute"
          disabled={call.phase !== 'connected'}
          onClick={onMute}
          className={`grid size-20 place-items-center rounded-full border-0 text-sm font-bold disabled:opacity-40 ${call.muted ? 'bg-amber-500 text-black' : 'bg-white text-black'}`}
        >
          {call.muted ? <MicOff size="1.625rem" /> : <Mic size="1.625rem" />}
          {call.muted ? 'Unmute' : 'Mute'}
        </button>
        {call.video && (
          <button
            type="button"
            data-guide="wa-camera"
            disabled={call.phase !== 'connected'}
            onClick={onCamera}
            className="grid size-20 place-items-center rounded-full border-0 bg-white text-sm font-bold text-black disabled:opacity-40"
          >
            {call.camera ? <VideoOff size="1.625rem" /> : <Video size="1.625rem" />}
            Camera
          </button>
        )}
        <button
          type="button"
          aria-label="End call"
          data-guide="wa-end"
          onClick={onEnd}
          className="grid size-20 place-items-center rounded-full border-0 bg-red-600 text-white transition hover:bg-red-700"
        >
          <PhoneOff size="2.125rem" />
        </button>
      </div>
    </div>
  )
}

export default function WhatsAppSim({ lang, setGuide, onExit }) {
  const [open, setOpen] = useState(false)
  const [wrongIcon, setWrongIcon] = useState(null)
  const [chats, setChats] = useState(CHATS)
  const [activeId, setActiveId] = useState('ahmed')
  const [showList, setShowList] = useState(false)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)
  const [flow, setFlow] = useState(null)
  const [mistake, setMistake] = useState(null)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [typing, setTyping] = useState(false)
  const [call, setCall] = useState(null)
  const [callSeconds, setCallSeconds] = useState(0)
  const [phone, setPhone] = useState(window.innerWidth < PHONE_BELOW)
  const recordStart = useRef(0)
  const replyTimer = useRef(null)
  const endRef = useRef(null)

  const active = chats.find((chat) => chat.id === activeId)
  const hasText = Boolean(draft.trim())

  useEffect(() => {
    let line
    let target = null
    let tone
    if (!open) {
      if (phone) line = wrongIcon ? LINE.wrongApp : LINE.phoneHome
      else line = wrongIcon ? LINE.wrongIcon : LINE.desktop
      target = wrongIcon ?? 'wa-icon'
      tone = wrongIcon ? 'error' : undefined
    } else if (mistake) {
      ;({ line, target } = mistake)
      tone = 'error'
    } else if (call) {
      if (call.phase !== 'connected') [line, target] = [LINE.calling, 'wa-end']
      else if (call.video && !call.camera && !call.cameraSeen) [line, target] = [LINE.camera, 'wa-camera']
      else if (call.muted) [line, target] = [UNMUTE_LINE, 'wa-mute']
      else if (!call.muteSeen) [line, target] = [MUTE_LINE, 'wa-mute']
      else [line, target] = [LINE.connected, 'wa-end']
    } else if (flow === 'text') {
      if (!focused && !hasText) [line, target] = [LINE.clickBox, 'wa-input']
      else if (!hasText) [line, target] = [LINE.typeNow, 'wa-input']
      else [line, target] = [LINE.pressSend, 'wa-send']
    } else if (flow === 'voice') {
      ;[line, target] = [recording ? LINE.recording : LINE.mic, 'wa-mic']
    } else if (flow === 'calls') {
      ;[line, target] = [LINE.calls, 'wa-calls']
    } else {
      line = flow === 'done' ? LINE.done : LINE.menu
    }
    setGuide({ line, target, tone })
  }, [open, phone, wrongIcon, mistake, flow, focused, hasText, recording, setGuide, call])

  useEffect(() => {
    const onResize = () => setPhone(window.innerWidth < PHONE_BELOW)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [active.messages.length, typing, activeId])

  useEffect(() => () => clearTimeout(replyTimer.current), [])

  useEffect(() => {
    if (!recording) return undefined
    const timer = setInterval(() => setRecordSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [recording])

  useEffect(() => {
    if (!call || call.phase === 'connected') return undefined
    const next = call.phase === 'calling' ? 'ringing' : 'connected'
    const timer = setTimeout(
      () => setCall((current) => current && { ...current, phase: next }),
      CALL_STEPS_MS[call.phase === 'calling' ? 0 : 1],
    )
    return () => clearTimeout(timer)
  }, [call])

  useEffect(() => {
    if (call?.phase !== 'connected') return undefined
    const timer = setInterval(() => setCallSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [call?.phase])

  function addMessage(chatId, message) {
    setChats((current) =>
      current.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, { id: crypto.randomUUID(), time: clock(), ...message }] }
          : chat,
      ),
    )
  }

  function queueReply() {
    const { id, reply } = active
    setTyping(true)
    clearTimeout(replyTimer.current)
    replyTimer.current = setTimeout(() => {
      addMessage(id, { mine: false, text: reply })
      setTyping(false)
    }, REPLY_DELAY_MS)
  }

  function startFlow(next) {
    setDraft('')
    setFocused(false)
    setMistake(null)
    setShowList(false)
    setFlow(next)
  }

  function sendText() {
    if (!hasText) {
      setMistake({ line: LINE.emptySend, target: 'wa-input' })
      return
    }
    addMessage(activeId, { mine: true, text: draft.trim() })
    setDraft('')
    setMistake(null)
    queueReply()
    if (flow === 'text') setFlow('done')
  }

  function startRecording() {
    if (recording) return
    recordStart.current = Date.now()
    setRecordSeconds(0)
    setMistake(null)
    setRecording(true)
  }

  // Listens on the window so letting go anywhere still stops the recording.
  useEffect(() => {
    if (!recording) return undefined
    const stop = () => {
      const held = Date.now() - recordStart.current
      setRecording(false)
      if (held < MIN_RECORDING_MS) {
        setMistake({ line: LINE.tooShort, target: 'wa-mic' })
        return
      }
      addMessage(activeId, { mine: true, voice: Math.max(1, Math.round(held / 1000)) })
      queueReply()
      setFlow((current) => (current === 'voice' ? 'done' : current))
    }
    window.addEventListener('pointerup', stop)
    window.addEventListener('keyup', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('keyup', stop)
    }
    // Queueing a reply only needs the chat that is open while recording.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, activeId])

  function startCall(video) {
    setCallSeconds(0)
    setMistake(null)
    setCall({ video, phase: 'calling', muted: false, camera: false })
  }

  function toggleMute() {
    setCall((current) => ({ ...current, muted: !current.muted, muteSeen: current.muteSeen || current.muted }))
  }

  function toggleCamera() {
    setCall((current) => ({ ...current, camera: !current.camera, cameraSeen: true }))
  }

  function endCall() {
    setCall(null)
    if (flow === 'calls') setFlow('done')
  }

  function chooseChat(id) {
    setActiveId(id)
    setShowList(false)
    setTyping(false)
    clearTimeout(replyTimer.current)
  }

  function closeWindow() {
    setCall(null)
    setRecording(false)
    setFlow(null)
    setMistake(null)
    setOpen(false)
  }

  const filtered = chats.filter((chat) => chat.name.toLowerCase().includes(query.trim().toLowerCase()))
  const lessons = [
    ['text', tr(lang, 'Text message', 'Message likhna')],
    ['voice', tr(lang, 'Voice note', 'Voice note')],
    ['calls', tr(lang, 'Calls', 'Call karna')],
  ]
  const lastText = (chat) => {
    const last = chat.messages.at(-1)
    return last.voice ? 'Voice message' : last.text
  }
  const notHere = () => setMistake({ line: LINE.notHere, target: 'wa-attach' })

  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-2 pb-32 text-stone-900 lg:p-4 lg:pb-4">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative flex h-[calc(min(100dvh,var(--shell-height))-9.5rem)] min-h-[440px] flex-col overflow-hidden rounded-2xl border border-stone-400 bg-white shadow-lg lg:h-[calc(min(100dvh,var(--shell-height))-2rem)]">
          {!open && phone && (
            <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-900 via-purple-800 to-rose-700 text-white">
              <div className="flex items-center justify-between px-4 py-2 text-base font-semibold">
                <span>{clock()}</span>
                <span className="flex items-center gap-2">
                  <Wifi size="1.125rem" /> <BatteryFull size="1.25rem" />
                </span>
              </div>
              <span className="mx-auto mb-3 rounded-full bg-mz-gold px-3 py-1 font-bold text-mz-dark">
                {tr(lang, 'Practice only', 'Sirf practice')}
              </span>
              <div className="grid grid-cols-4 gap-x-2 gap-y-5 px-3">
                {PHONE_APPS.map(([id, label, tone, Mark]) => (
                  <button
                    type="button"
                    key={id}
                    data-guide={id}
                    onClick={() => {
                      if (id !== 'wa-icon') {
                        setWrongIcon(id)
                        return
                      }
                      setWrongIcon(null)
                      setOpen(true)
                    }}
                    className="grid justify-items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-white"
                  >
                    <span className={`grid size-15 place-items-center rounded-2xl text-3xl font-bold shadow ${tone}`}>
                      {typeof Mark === 'string' ? Mark : <Mark size="2rem" fill={id === 'wa-icon' ? 'white' : 'none'} />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onExit}
                className="mx-auto mt-auto mb-3 flex min-h-12 items-center gap-1 rounded-full border-0 bg-black/40 px-5 text-lg font-semibold text-white"
              >
                <ArrowLeft size="1.25rem" /> {tr(lang, 'Home', 'Home')}
              </button>
            </div>
          )}

          {!open && !phone && (
            <div className="relative flex flex-1 flex-col bg-gradient-to-br from-sky-700 to-teal-800">
              <span className="absolute top-3 right-3 rounded-full bg-mz-gold px-3 py-1 font-bold text-mz-dark">
                {tr(lang, 'Practice only', 'Sirf practice')}
              </span>
              <div className="flex flex-1 flex-col flex-wrap content-start gap-3 p-4">
                <button
                  type="button"
                  data-guide="wa-icon"
                  onClick={() => {
                    setWrongIcon(null)
                    setOpen(true)
                  }}
                  className="grid w-28 justify-items-center gap-1 rounded-xl border-0 bg-transparent p-2 text-lg font-semibold text-white transition hover:bg-white/20"
                >
                  <span className="grid size-16 place-items-center rounded-2xl bg-[#00a884] shadow">
                    <MessageCircle size="2.375rem" fill="white" className="text-white" />
                  </span>
                  WhatsApp
                </button>
                {[
                  ['pc-browser', Globe, 'Internet'],
                  ['pc-files', Folder, 'Files'],
                  ['pc-bin', Trash2, 'Recycle Bin'],
                ].map(([id, Icon, label]) => (
                  <button
                    type="button"
                    key={id}
                    data-guide={id}
                    onClick={() => setWrongIcon(id)}
                    className="grid w-28 justify-items-center gap-1 rounded-xl border-0 bg-transparent p-2 text-lg font-semibold text-white transition hover:bg-white/20"
                  >
                    <span className="grid size-16 place-items-center rounded-2xl bg-white/20">
                      <Icon size="2.25rem" />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between bg-black/50 px-3 py-1 text-white">
                <button
                  type="button"
                  onClick={onExit}
                  className="flex min-h-11 items-center gap-1 border-0 bg-transparent text-lg font-semibold text-white"
                >
                  <ArrowLeft size="1.25rem" /> {tr(lang, 'Home', 'Home')}
                </button>
                <span className="text-lg">{clock()}</span>
              </div>
            </div>
          )}

          {open && (
            <div className="fade-up flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between bg-[#00806a] px-3 py-1 text-white">
                <strong className="text-lg">WhatsApp</strong>
                <button
                  type="button"
                  aria-label="Close WhatsApp"
                  onClick={closeWindow}
                  className="grid size-11 place-items-center border-0 bg-transparent text-white"
                >
                  <X size="1.5rem" />
                </button>
              </div>
              <div data-guide="wa-lessons" className="flex gap-2 overflow-x-auto bg-[#f0f2f5] p-2">
                {lessons.map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    data-guide={`wa-lesson-${id}`}
                    onClick={() => startFlow(id)}
                    className={`min-h-12 flex-none rounded-full border-2 border-[#00806a] px-4 text-lg font-semibold transition ${
                      flow === id ? 'bg-[#00806a] text-white' : 'bg-white text-[#00594a]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative flex min-h-0 flex-1">
                <aside className={`${showList ? 'flex' : 'hidden'} w-full flex-col border-r border-stone-300 bg-white md:flex md:w-80 md:flex-none`}>
                  <label className="m-2 flex items-center gap-2 rounded-xl bg-[#f0f2f5] px-3">
                    <Search size="1.25rem" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search"
                      aria-label="Search chats"
                      className="min-h-12 w-full min-w-0 border-0 bg-transparent text-lg outline-none"
                    />
                  </label>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {filtered.map((chat) => (
                      <button
                        type="button"
                        key={chat.id}
                        data-guide={`wa-chat-${chat.id}`}
                        onClick={() => chooseChat(chat.id)}
                        className={`flex w-full items-center gap-3 border-0 border-b border-stone-200 p-3 text-left transition hover:bg-[#f0f2f5] ${
                          chat.id === activeId ? 'bg-[#e9edef]' : 'bg-white'
                        }`}
                      >
                        <Face chat={chat} />
                        <span className="min-w-0 flex-1">
                          <span className="flex justify-between gap-2">
                            <strong className="truncate text-lg">{chat.name}</strong>
                            <small className="flex-none text-sm text-stone-600">{chat.messages.at(-1).time}</small>
                          </span>
                          <span className="block truncate text-base text-stone-600">{lastText(chat)}</span>
                        </span>
                      </button>
                    ))}
                    {filtered.length === 0 && <p className="p-4 text-lg">{tr(lang, 'No chats found', 'Koi chat nahi mili')}</p>}
                  </div>
                </aside>

                <section className={`${showList ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col md:flex`}>
                  <header className="flex items-center gap-2 bg-[#f0f2f5] p-2">
                    <button
                      type="button"
                      aria-label="All chats"
                      onClick={() => setShowList(true)}
                      className="grid size-11 flex-none place-items-center border-0 bg-transparent md:hidden"
                    >
                      <ArrowLeft size="1.5rem" />
                    </button>
                    <Face chat={active} size="size-12" />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-lg">{active.name}</strong>
                      <span className="block truncate text-base text-stone-600">{typing ? 'typing...' : active.status}</span>
                    </div>
                    <div data-guide="wa-calls" className="flex flex-none gap-1">
                      <button
                        type="button"
                        aria-label="Video call"
                        data-guide="wa-video"
                        onClick={() => startCall(true)}
                        className="grid size-12 place-items-center rounded-full border-0 bg-transparent transition hover:bg-stone-300"
                      >
                        <Video size="1.625rem" />
                      </button>
                      <button
                        type="button"
                        aria-label="Voice call"
                        data-guide="wa-voice"
                        onClick={() => startCall(false)}
                        className="grid size-12 place-items-center rounded-full border-0 bg-transparent transition hover:bg-stone-300"
                      >
                        <Phone size="1.625rem" />
                      </button>
                    </div>
                  </header>

                  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[#efeae2] p-3">
                    {active.messages.map((message) => (
                      <Bubble key={message.id} message={message} />
                    ))}
                    {typing && <p className="w-fit rounded-xl bg-white px-3 py-2 text-lg shadow-sm">...</p>}
                    <div ref={endRef} />
                  </div>

                  <form
                    className="flex items-center gap-1 bg-[#f0f2f5] p-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      sendText()
                    }}
                  >
                    {recording ? (
                      <p role="status" className="flex min-h-14 flex-1 items-center gap-2 px-3 text-lg font-semibold text-red-700">
                        <span className="size-3 animate-pulse rounded-full bg-red-600" /> {duration(recordSeconds)}
                      </p>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label="Emoji"
                          onClick={notHere}
                          className="hidden size-12 flex-none place-items-center border-0 bg-transparent sm:grid"
                        >
                          <Smile size="1.625rem" />
                        </button>
                        <button
                          type="button"
                          aria-label="Attach"
                          data-guide="wa-attach"
                          onClick={notHere}
                          className="grid size-12 flex-none place-items-center border-0 bg-transparent"
                        >
                          <Paperclip size="1.625rem" />
                        </button>
                        <input
                          data-guide="wa-input"
                          value={draft}
                          placeholder="Type a message"
                          aria-label="Type a message"
                          autoComplete="off"
                          onFocus={() => setFocused(true)}
                          onChange={(event) => {
                            setDraft(event.target.value)
                            setMistake(null)
                          }}
                          className="min-h-14 w-full min-w-0 rounded-xl border-0 bg-white px-3 text-lg outline-none"
                        />
                      </>
                    )}
                    {hasText && !recording ? (
                      <button
                        type="submit"
                        aria-label="Send"
                        data-guide="wa-send"
                        className="grid size-14 flex-none place-items-center rounded-full border-0 bg-[#00806a] text-white transition hover:brightness-95"
                      >
                        <SendHorizontal size="1.625rem" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Hold to record a voice message"
                        data-guide="wa-mic"
                        onPointerDown={(event) => {
                          event.preventDefault()
                          startRecording()
                        }}
                        onKeyDown={(event) => {
                          if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
                            event.preventDefault()
                            startRecording()
                          }
                        }}
                        onContextMenu={(event) => event.preventDefault()}
                        className={`grid size-14 flex-none touch-none place-items-center rounded-full border-0 text-white transition select-none ${
                          recording ? 'scale-110 bg-red-600' : 'bg-[#00806a]'
                        }`}
                      >
                        <Mic size="1.75rem" />
                      </button>
                    )}
                  </form>
                </section>

                {call && (
                  <CallModal
                    call={call}
                    chat={active}
                    seconds={callSeconds}
                    lang={lang}
                    onMute={toggleMute}
                    onCamera={toggleCamera}
                    onEnd={endCall}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <div data-guide="side-slot" data-follow className="hidden h-44 lg:block" />
      </div>
    </main>
  )
}
