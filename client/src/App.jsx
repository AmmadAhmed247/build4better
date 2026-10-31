import { useCallback, useEffect, useRef, useState } from 'react'
import AskSaathi from './components/AskSaathi'
import Avatar, { AvatarFace } from './components/Avatar'
import Icon from './components/Icons'
import LessonRunner from './components/LessonRunner'
import { LESSONS, LINES, PRACTICE, TIPS, UI } from './data/content'
import { speak, stopSpeaking } from './lib/speech'
import { loadState, saveState } from './lib/storage'

const ASK_HINT_DELAY_MS = 30000

const INTRO = [
  { line: LINES.welcome, target: null },
  { line: LINES.introPractice, target: 'nav-practice' },
  { line: LINES.introTips, target: 'nav-tips' },
  { line: LINES.introAsk, target: 'nav-ask' },
]

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
        {finished[1] && <span className="tick" aria-label="Done">✓</span>}
      </button>
    )
  }
  return (
    <article className="practice-card">
      <div className="practice-head">
        {lesson.logo ? (
          <img className="card-logo" src={lesson.logo} alt="" />
        ) : (
          <span className="card-icon card-icon-bank" aria-hidden="true"><Icon name="bank" size={30} /></span>
        )}
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
            <span>{UI.round[lang]} {index + 1}{finished[index + 1] ? ' ✓' : ''}</span>
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
  const [guide, setGuideState] = useState(null)
  const introRunning = useRef(false)
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
    setActive({ id, round, run: Math.random() })
    setView('lesson')
  }

  function exitLesson(nextRound) {
    if (nextRound) startLesson(active.id, nextRound)
    else go(LESSONS[active.id].kind === 'tip' ? 'tips' : 'home')
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
        <p>{UI.chooseLanguage.ru} · {UI.chooseLanguage.en}</p>
        <button type="button" className="primary" onClick={() => chooseLanguage('ru')}>Roman Urdu</button>
        <button type="button" className="primary" onClick={() => chooseLanguage('en')}>English</button>
      </main>
    )
  }

  return (
    <div className="shell">
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
        <main className="page">
          <header className="page-head">
            <h1>{UI.homeTitle[lang]}</h1>
            <button type="button" className="text-button" onClick={() => go('language')}>{UI.language[lang]}</button>
          </header>
          <p className="lead">{UI.homeLead[lang]}</p>
          <button type="button" className="scenario-card" data-guide="scenario" onClick={() => startLesson('scenario', 3)}>
            <img src="/brands/easypaisa.png" alt="" />
            <span>
              <strong>{UI.scenarioButton[lang]}</strong>
              <small>{UI.scenarioLead[lang]}</small>
            </span>
          </button>
          {PRACTICE.map((id) => (
            <LessonCard key={id} lesson={LESSONS[id]} lang={lang} progress={saved.progress} onStart={startLesson} />
          ))}
        </main>
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

      {view !== 'lesson' && (
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

      {view !== 'ask' && (
        <Avatar guide={guide} lang={lang} onSkip={endIntro} dock={view === 'lesson'} />
      )}
    </div>
  )
}

export default App
