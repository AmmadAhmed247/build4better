import { Camera, Check, CreditCard, FileText, Landmark, MessageCircle, MessagesSquare, Search, ShieldAlert, Sparkles, Video, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import AskSaathi from './components/AskSaathi'
import Avatar, { AvatarFace, useSpeaking } from './components/Avatar'
import BankSim from './components/BankSim'
import GovernmentFormAssistant from './components/GovernmentFormAssistant'
import Dashboard, { HelpOverlay } from './components/Dashboard'
import LessonRunner from './components/LessonRunner'
import WhatsAppSim from './components/WhatsAppSim'
import { LESSONS, LINES, PROVIDERS, TIPS, UI } from './data/content'
import { skipSpeaking, speak, stopSpeaking } from './lib/speech'
import { loadState, saveState } from './lib/storage'

const ASK_HINT_DELAY_MS = 30000
const FONT_SCALES = [100, 115, 130]

const FEATURES = [
  ['lessons', CreditCard, UI.featureLessons],
  ['scam', ShieldAlert, UI.scamBox],
  ['forms', FileText, UI.formsBox],
  ['whatsapp', MessagesSquare, { en: 'WhatsApp', ru: 'WhatsApp' }],
  ['video', Video, LESSONS.video.title],
  ['screenshot', Camera, LESSONS.screenshot.title],
  ['google', Search, LESSONS.google.title],
  ['ai', Sparkles, LESSONS.ai.title],
  ['ask', MessageCircle, UI.ask],
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
  const [view, setView] = useState(saved.lang ? 'home' : 'language')
  const [active, setActive] = useState(null)
  const [providerId, setProviderId] = useState(PROVIDERS[0].id)
  const [helpPanel, setHelpPanel] = useState(null)
  const [scamMessage, setScamMessage] = useState('')
  const [guide, setGuideState] = useState(null)
  const introRunning = useRef(false)
  const fontStep = saved.fontStep ?? 0
  const hintShown = useRef(false)
  const introPlayed = useRef(Boolean(saved.introSeen))

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
    document.documentElement.style.fontSize = `${FONT_SCALES[fontStep]}%`
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
    setView('home')
    // Started from the tap so browsers allow speech.
    if (!introPlayed.current) {
      introPlayed.current = true
      setTimeout(() => playIntro(), 300)
    }
  }

  useEffect(() => {
    if (!['home', 'tips'].includes(view) || hintShown.current) return undefined
    const timer = setTimeout(() => {
      if (introRunning.current) return
      hintShown.current = true
      setGuide({ line: LINES.askHint, target: 'nav-ask', onDone: () => setGuide(null) })
    }, ASK_HINT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [view, setGuide])

  function go(next) {
    introRunning.current = false
    setGuide(null)
    setView(next)
  }

  function startLesson(id, round) {
    setGuide(null)
    setActive((current) => ({ id, round, run: (current?.run ?? 0) + 1 }))
    setView('lesson')
  }

  function exitLesson(nextRound) {
    if (nextRound) startLesson(active.id, nextRound)
    else go({ tip: 'tips', practice: 'lessons' }[LESSONS[active.id].kind] ?? 'home')
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
    else if (['lessons', 'ask', 'whatsapp', 'forms'].includes(key)) go(key)
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

  if (view === 'language') {
    return (
      <main className="language">
        <div className="language-face"><AvatarFace /></div>
        <h1>Saathi</h1>
        <p>{UI.chooseLanguage.ru} · <span lang="ur">{UI.chooseLanguage.ur}</span> · {UI.chooseLanguage.en}</p>
        <button type="button" className="primary" onClick={() => chooseLanguage('ru')}>Roman Urdu</button>
        <button type="button" className="primary" lang="ur" onClick={() => chooseLanguage('ur')}>اردو</button>
        <button type="button" className="primary" onClick={() => chooseLanguage('en')}>English</button>
      </main>
    )
  }

  return (
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
          <header className="page-head">
            <h1>{UI.lessonsTitle[lang]}</h1>
            <button type="button" className="text-button" onClick={() => go('home')}>{UI.back[lang]}</button>
          </header>
          <p className="lead">{UI.lessonsLead[lang]}</p>
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

      {view === 'forms' && <GovernmentFormAssistant lang={lang} setGuide={setGuide} onExit={() => go('home')} />}

      {view === 'whatsapp' && <WhatsAppSim lang={lang} setGuide={setGuide} onExit={() => go('home')} />}

      {view === 'bank' && (
        <BankSim
          lang={lang}
          setGuide={setGuide}
          onExit={() => go('home')}
          onRealWorld={() => startLesson('scenario', 3)}
        />
      )}

      {view === 'tips' && (
        <main className="page">
          <h1>{UI.tipsTitle[lang]}</h1>
          <p className="lead">{UI.tipsLead[lang]}</p>
          {TIPS.map((id) => (
            <LessonCard key={id} lesson={LESSONS[id]} lang={lang} progress={saved.progress} onStart={startLesson} />
          ))}
        </main>
      )}

      {view === 'ask' && <AskSaathi lang={lang} onOpenLesson={(id) => startLesson(id, 1)} />}

      {!['lesson', 'bank', 'whatsapp', 'forms'].includes(view) && (
        <nav className="nav">
          {[
            ['home', 'nav-practice', UI.practice],
            ['tips', 'nav-tips', UI.tips],
            ['ask', 'nav-ask', UI.ask],
          ].map(([id, guideKey, label]) => (
            <button
              type="button"
              key={id}
              data-guide={guideKey}
              className={view === id ? 'nav-item is-active' : 'nav-item'}
              onClick={() => go(id)}
            >
              {label[lang]}
            </button>
          ))}
        </nav>
      )}

      {view !== 'ask' && (!['home', 'lessons', 'tips', 'forms'].includes(view) || guide?.line) && (
        <Avatar guide={guide} lang={lang} onSkip={endIntro} />
      )}
    </div>
  )
}

export default App
