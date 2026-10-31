import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Box, Camera, Check, CreditCard, FileText, Home, Landmark, Lightbulb, MessageCircle, MessagesSquare, PenLine, Search, ShieldAlert, Sparkles, Video, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import AskSaathi from './components/AskSaathi'
import Avatar, { AvatarFace, CursorEyes, useSpeaking } from './components/Avatar'
import BankSim from './components/BankSim'
import GovernmentFormAssistant from './components/GovernmentFormAssistant'
import Dashboard, { HelpOverlay } from './components/Dashboard'
import HeroLanding from './components/HeroLanding'
import LessonRunner from './components/LessonRunner'
import PageHeader from './components/PageHeader'
import Passbook from './components/Passbook'
import WhatsAppSim from './components/WhatsAppSim'
import { LESSONS, LINES, PROVIDERS, TIPS, UI } from './data/content'
import { skipSpeaking, speak, stopSpeaking } from './lib/speech'
import { loadState, saveState } from './lib/storage'

const ASK_HINT_DELAY_MS = 30000
const FONT_SCALES = [1, 1.15, 1.3]

const FEATURES = [
  ['lessons', CreditCard, UI.featureLessons],
  ['scam', ShieldAlert, UI.scamBox],
  ['forms', FileText, UI.formsBox],
  ['passbook', BookOpen, UI.passbookBox],
  ['whatsapp', MessagesSquare, { en: 'WhatsApp', ru: 'WhatsApp' }],
  ['video', Video, LESSONS.video.title],
  ['screenshot', Camera, LESSONS.screenshot.title],
  ['google', Search, LESSONS.google.title],
  ['ai', Sparkles, LESSONS.ai.title],
  ['ask', MessageCircle, UI.ask],
]

const HERO_CONTENT = {
  brand: 'Saathi',
  lines: [
    { text: 'Practice that', after: 0 },
    { text: 'makes', after: 1 },
    { text: 'phones', before: 2 },
    { text: 'feel easy' },
  ],
  stickers: [
    { label: 'Payments', Icon: CreditCard, paper: 'bg-lime-50', badge: 'bg-lime-600' },
    { label: 'WhatsApp', Icon: PenLine, paper: 'bg-fuchsia-50', badge: 'bg-fuchsia-500' },
    { label: 'Forms', Icon: Box, paper: 'bg-violet-50', badge: 'bg-violet-500' },
  ],
  badge: { name: 'Your practice partner', status: 'Safe to practise', face: <AvatarFace /> },
  tagline: 'No real money moves. Try as many times as you like.',
  card: { image: '/brands/easypaisa.png', kicker: 'Practice app', title: 'Payment lessons' },
  dock: [
    { label: 'Payment lessons', Icon: CreditCard, tone: 'text-lime-700' },
    { label: 'WhatsApp', Icon: MessagesSquare, tone: 'text-emerald-700' },
    { label: 'Scam Detector', Icon: ShieldAlert, tone: 'text-red-700' },
    { label: 'Form Helper', Icon: FileText, tone: 'text-sky-700' },
  ],
}

const LANGUAGES = [
  ['ru', 'Roman Urdu'],
  ['ur', 'اردو'],
  ['en', 'English'],
]

const MENU = [
  ['home', 'nav-practice', UI.practice, Home],
  ['tips', 'nav-tips', UI.tips, Lightbulb],
  ['ask', 'nav-ask', UI.ask, MessageCircle],
]

const INTRO = [
  { line: LINES.welcome, target: null },
  { line: LINES.introPractice, target: 'nav-practice' },
  { line: LINES.introTips, target: 'nav-tips' },
  { line: LINES.introAsk, target: 'nav-ask' },
]

function StopVoice({ lang }) {
  const speaking = useSpeaking()
  if (!speaking) return null
  return (
    <button
      type="button"
      data-guide="stop-voice"
      onClick={skipSpeaking}
      className="fixed top-2 left-1/2 z-[60] flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full border-2 border-white bg-stone-900 px-4 text-lg font-bold whitespace-nowrap text-white shadow-lg"
    >
      <VolumeX size={22} /> {UI.stopVoice[lang]}
    </button>
  )
}

function BrandLogo({ src, className }) {
  const [missing, setMissing] = useState(false)
  if (!src || missing) {
    return <span className={`${className} card-icon-bank`} aria-hidden="true"><Landmark size={28} /></span>
  }
  return <img className={className} src={src} alt="" onError={() => setMissing(true)} />
}

function LessonCard({ lesson, lang, progress, onStart }) {
  const finished = progress?.[lesson.id] ?? {}
  if (lesson.kind === 'tip') {
    return (
      <button type="button" className="tip-card" data-guide={`lesson-${lesson.id}`} onClick={() => onStart(lesson.id, 1)}>
        <span className="card-icon" aria-hidden="true">{lesson.icon}</span>
        <span>
          <strong>{lesson.title[lang]}</strong>
          <small>{lesson.blurb[lang]}</small>
        </span>
        {finished[1] && <span className="tick" aria-label="Done"><Check size={24} strokeWidth={3} /></span>}
      </button>
    )
  }
  return (
    <article className="practice-card">
      <div className="practice-head">
        <BrandLogo className="card-logo" src={lesson.logo} />
        <div>
          <h2>{lesson.title[lang]}</h2>
          <p>{lesson.blurb[lang]}</p>
        </div>
      </div>
      {finished[3]?.alone && <p className="done-badge">{UI.doneAlone[lang]}</p>}
      <div className="rounds">
        {UI.rounds.map((round, index) => (
          <button
            type="button"
            key={round.en}
            data-guide={`${lesson.id}-round-${index + 1}`}
            className="round-choice"
            onClick={() => onStart(lesson.id, index + 1)}
          >
            <span className="round-label">
              {UI.round[lang]} {index + 1}
              {finished[index + 1] && <Check size={15} strokeWidth={3} aria-label="Done" />}
            </span>
            <strong>{round[lang]}</strong>
          </button>
        ))}
      </div>
    </article>
  )
}

function App() {
  const [saved, setSaved] = useState(loadState)
  const [lang, setLang] = useState(saved.lang ?? null)
  const [view, setView] = useState(saved.lang ? 'home' : 'welcome')
  const [active, setActive] = useState(null)
  const [providerId, setProviderId] = useState(PROVIDERS[0].id)
  const [helpPanel, setHelpPanel] = useState(null)
  const [scamMessage, setScamMessage] = useState('')
  const [guide, setGuideState] = useState(null)
  const introRunning = useRef(false)
  const fontStep = saved.fontStep ?? 0
  const hintShown = useRef(false)
  const introPlayed = useRef(Boolean(saved.introSeen))
  const viewRef = useRef(view)
  const historyDepth = useRef(0)
  const scrollSpots = useRef({})
  const askOpened = useRef(false)
  if (view === 'ask') askOpened.current = true

  const setGuide = useCallback((next) => {
    setGuideState(next ? { ...next, nonce: Math.random() } : null)
  }, [])

  // Every guide change speaks once, then runs its follow-up.
  useEffect(() => {
    if (!guide?.line) {
      stopSpeaking()
      return undefined
    }
    speak(guide.line, lang, guide.onDone)
    return stopSpeaking
  }, [guide, lang])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', FONT_SCALES[fontStep])
  }, [fontStep])

  useEffect(() => {
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en'
  }, [lang])

  const update = useCallback((patch) => {
    setSaved((current) => {
      const next = { ...current, ...patch }
      saveState(next)
      return next
    })
  }, [])

  const endIntro = useCallback(() => {
    introRunning.current = false
    update({ introSeen: true })
    setGuide(null)
  }, [setGuide, update])

  const playIntro = useCallback(
    function playStep(index = 0) {
      if (index === INTRO.length) {
        endIntro()
        return
      }
      introRunning.current = true
      setGuide({ ...INTRO[index], skippable: true, onDone: () => playStep(index + 1) })
    },
    [endIntro, setGuide],
  )

  function chooseLanguage(code) {
    setLang(code)
    update({ lang: code })
    if (view === 'language') back()
    else go('home', null, { replace: true })
    // Started from the tap so browsers allow speech.
    if (!introPlayed.current) {
      introPlayed.current = true
      setTimeout(() => playIntro(), 300)
    }
  }

  useEffect(() => {
    window.history.replaceState({ view, active: null, depth: 0 }, '')
    const onPop = ({ state }) => {
      if (!state) return
      const page = document.querySelector('.shell main:not([hidden])')
      if (page) scrollSpots.current[viewRef.current] = page.scrollTop
      historyDepth.current = state.depth
      introRunning.current = false
      setHelpPanel(null)
      setGuide(null)
      setActive(state.active)
      setView(state.view)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // Only the first entry is written here. Every later one comes from go().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    viewRef.current = view
    const page = document.querySelector('.shell main:not([hidden])')
    if (page) page.scrollTop = scrollSpots.current[view] ?? 0
  }, [view])

  useEffect(() => {
    if (!['home', 'tips'].includes(view) || hintShown.current) return undefined
    const timer = setTimeout(() => {
      if (introRunning.current) return
      hintShown.current = true
      setGuide({ line: LINES.askHint, target: 'nav-ask', onDone: () => setGuide(null) })
    }, ASK_HINT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [view, setGuide])

  function rememberScroll() {
    const page = document.querySelector('.shell main:not([hidden])')
    if (page) scrollSpots.current[viewRef.current] = page.scrollTop
  }

  // The browser's history is the back stack, so its Back button and ours always agree.
  function go(next, lesson = active, { replace = false } = {}) {
    introRunning.current = false
    rememberScroll()
    delete scrollSpots.current[next]
    if (!replace) historyDepth.current += 1
    const entry = { view: next, active: lesson, depth: historyDepth.current }
    if (replace) window.history.replaceState(entry, '')
    else window.history.pushState(entry, '')
    setGuide(null)
    setActive(lesson)
    setView(next)
  }

  function back() {
    if (historyDepth.current > 0) window.history.back()
    else go('home', null, { replace: true })
  }

  function startLesson(id, round, { replace = false, from = view } = {}) {
    go('lesson', { id, round, from, run: (active?.run ?? 0) + 1 }, { replace })
  }

  function exitLesson(nextRound) {
    if (nextRound) startLesson(active.id, nextRound, { replace: true, from: active.from })
    else back()
  }

  function openFeature(key, spoken) {
    if (key === 'scam') {
      if (spoken) setScamMessage(spoken)
      setHelpPanel('scam')
      return
    }
    setHelpPanel(null)
    if (key === 'bank') go('bank')
    else if (key === 'scenario') startLesson('scenario', 3)
    else if (['lessons', 'ask', 'whatsapp', 'forms', 'passbook'].includes(key)) go(key)
    else startLesson(key, 1)
  }

  function recordResult(result) {
    const progress = saved.progress ?? {}
    const lessonProgress = progress[active.id] ?? {}
    const alone = active.round === 3 && result.helps === 0 && result.scam !== 'fell'
    update({
      progress: { ...progress, [active.id]: { ...lessonProgress, [active.round]: { ...result, alone } } },
    })
  }

  if (view === 'welcome') {
    return (
      <>
        <CursorEyes />
        <HeroLanding content={HERO_CONTENT}>
          <p className="mb-3 text-center text-lg font-semibold">
            {UI.chooseLanguage.ru} · <span lang="ur">{UI.chooseLanguage.ur}</span> · {UI.chooseLanguage.en}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {LANGUAGES.map(([code, label]) => (
              <button
                type="button"
                key={code}
                lang={code === 'ur' ? 'ur' : undefined}
                className="min-h-14 rounded-2xl border-0 bg-white px-6 text-lg font-bold text-emerald-900 shadow-lg"
                onClick={() => chooseLanguage(code)}
              >
                {label}
              </button>
            ))}
          </div>
        </HeroLanding>
      </>
    )
  }

  if (view === 'language') {
    return (
      <>
        <CursorEyes />
        <main className="language">
          <button type="button" className="back-button" onClick={back}>
            <ArrowLeft size="1.375rem" className="rtl:rotate-180" aria-hidden="true" /> {UI.back[lang]}
          </button>
          <div className="language-face"><AvatarFace /></div>
          <h1 className="display">Saathi</h1>
          <p>{UI.chooseLanguage.ru} · <span lang="ur">{UI.chooseLanguage.ur}</span> · {UI.chooseLanguage.en}</p>
          {LANGUAGES.map(([code, label]) => (
            <button type="button" className="primary" key={code} lang={code === 'ur' ? 'ur' : undefined} onClick={() => chooseLanguage(code)}>
              {label}
            </button>
          ))}
        </main>
      </>
    )
  }

  const avatarShown = view !== 'ask' && (!['home', 'lessons', 'tips', 'forms', 'passbook'].includes(view) || Boolean(guide?.line))
  const bankHidden = view !== 'bank'
  const bankKept = view === 'bank' || (view === 'lesson' && active?.from === 'bank')
  const activeTab = view === 'lessons' ? 'home' : view

  return (
    <>
    <CursorEyes hidden={avatarShown} />
    <div className="shell">
      <StopVoice lang={lang} />
      <HelpOverlay
        lang={lang}
        panel={helpPanel}
        scamMessage={scamMessage}
        compact={!['home', 'tips', 'lessons'].includes(view)}
        onPanel={setHelpPanel}
        onScamMessage={setScamMessage}
        onOpen={openFeature}
      />
      {view === 'lesson' && (
        <LessonRunner
          key={active.run}
          lesson={LESSONS[active.id]}
          round={active.round}
          lang={lang}
          guide={guide}
          setGuide={setGuide}
          onExit={exitLesson}
          onFinish={recordResult}
        />
      )}

      {view === 'home' && (
        <Dashboard
          lang={lang}
          fontStep={fontStep}
          fontSteps={FONT_SCALES.length}
          familyNumber={saved.familyNumber}
          features={FEATURES}
          onFontStep={(step) => update({ fontStep: step })}
          onSaveNumber={(familyNumber) => update({ familyNumber })}
          onLanguage={() => go('language')}
          onBank={() => go('bank')}
          onScenario={() => startLesson('scenario', 3)}
          onFeature={openFeature}
        />
      )}

      {view === 'lessons' && (
        <main className="page page-wide">
          <PageHeader lang={lang} title={UI.lessonsTitle[lang]} lead={UI.lessonsLead[lang]} onBack={back} />
          <div className="provider-tabs" role="tablist" aria-label={UI.lessonsTitle[lang]}>
            {PROVIDERS.map((provider) => (
              <button
                type="button"
                role="tab"
                key={provider.id}
                data-guide={`tab-${provider.id}`}
                aria-selected={provider.id === providerId}
                className={provider.id === providerId ? 'provider-tab is-active' : 'provider-tab'}
                onClick={() => setProviderId(provider.id)}
              >
                <BrandLogo className="provider-logo" src={provider.logo} />
                <span>{provider.name}</span>
              </button>
            ))}
          </div>
          <div className="lesson-grid" role="tabpanel">
            {PROVIDERS.find((provider) => provider.id === providerId).lessons.map((id) => (
              <LessonCard key={id} lesson={LESSONS[id]} lang={lang} progress={saved.progress} onStart={startLesson} />
            ))}
          </div>
        </main>
      )}

      {view === 'passbook' && <Passbook lang={lang} onStart={(id) => startLesson(id, 1)} onExit={back} />}

      {view === 'forms' && <GovernmentFormAssistant lang={lang} setGuide={setGuide} onExit={back} />}

      {view === 'whatsapp' && <WhatsAppSim lang={lang} setGuide={setGuide} onExit={back} />}

      {bankKept && (
        <BankSim
          lang={lang}
          away={bankHidden}
          setGuide={setGuide}
          onExit={back}
          onRealWorld={() => startLesson('scenario', 3)}
        />
      )}

      {view === 'tips' && (
        <main className="page">
          <PageHeader lang={lang} title={UI.tipsTitle[lang]} lead={UI.tipsLead[lang]} />
          {TIPS.map((id) => (
            <LessonCard key={id} lesson={LESSONS[id]} lang={lang} progress={saved.progress} onStart={startLesson} />
          ))}
        </main>
      )}

      {askOpened.current && <AskSaathi lang={lang} hidden={view !== 'ask'} onOpenLesson={(id) => startLesson(id, 1)} />}

      {!['lesson', 'bank', 'whatsapp', 'forms', 'passbook'].includes(view) && (
        <nav className="nav">
          {MENU.map(([id, guideKey, label, Icon]) => (
            <button
              type="button"
              key={id}
              data-guide={guideKey}
              aria-current={activeTab === id ? 'page' : undefined}
              className={activeTab === id ? 'nav-item is-active' : 'nav-item'}
              onClick={() => {
                if (activeTab !== id) go(id)
                else if (view !== id) back()
              }}
            >
              {activeTab === id && (
                <motion.span layoutId="dock-active" className="nav-active" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
              )}
              <Icon size="1.5rem" aria-hidden="true" />
              <span>{label[lang]}</span>
            </button>
          ))}
        </nav>
      )}

      {avatarShown && (
        <Avatar guide={guide} lang={lang} onSkip={endIntro} />
      )}
    </div>
    </>
  )
}

export default App
