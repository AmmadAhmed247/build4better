import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LINES, SCAM, UI, WRONG_TAP } from '../data/content'
import { useWide } from './Avatar'
import { SCREENS } from './Screens'

const ERROR_HOLD_MS = 5500

const START_BALANCE = 50000

function clean(value) {
  return (value ?? '').replace(/[\s-]/g, '').toLowerCase()
}

function isCorrectValue(step, values) {
  return clean(values[step.target]) === clean(step.value)
}

function TaskList({ items, lang }) {
  return (
    <ul className="task-list">
      {items.map((item) => (
        <li key={item.en}>{item[lang]}</li>
      ))}
    </ul>
  )
}

function ScamMessage({ lang, learning, onShare, onDelete, onRetry }) {
  return (
    <div className="scam">
      <div className="scam-card">
        <small>{UI.newMessage[lang]} · {SCAM.sender}</small>
        <p>
          {SCAM.parts.map((part) =>
            part.flag && learning ? (
              <mark key={part.text}>
                {part.text}
                <sup>{part.flag}</sup>
              </mark>
            ) : (
              <span key={part.text}>{part.text}</span>
            ),
          )}
        </p>
      </div>
      {learning ? (
        <>
          <ol className="scam-flags">
            {SCAM.flags.map((flag) => (
              <li key={flag.en}>{flag[lang]}</li>
            ))}
          </ol>
          <button type="button" className="app-button" onClick={onRetry}>
            {UI.tryAgain[lang]}
          </button>
        </>
      ) : (
        <>
          <button type="button" className="app-button app-button-quiet" onClick={onShare}>
            {UI.shareOtp[lang]}
          </button>
          <button type="button" className="app-button app-button-quiet" onClick={onDelete}>
            {UI.deleteMessage[lang]}
          </button>
        </>
      )}
    </div>
  )
}

export default function LessonRunner({ lesson, round, lang, setGuide, guide, onExit, onFinish }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState({})
  const [phase, setPhase] = useState(round === 3 && lesson.brief ? 'brief' : 'steps')
  const [mistakes, setMistakes] = useState(0)
  const [helps, setHelps] = useState(0)
  const [scam, setScam] = useState(null)
  const [spent, setSpent] = useState(0)
  const errorTimer = useRef(null)
  const wide = useWide()
  const showIntro = useRef(round > 1)

  const step = lesson.steps[stepIndex]
  const Screen = SCREENS[step.screen]
  const hasScam = lesson.ambushAfter && round > 1

  function showStep(level = round) {
    if (level === 1) setGuide({ line: step.say, target: step.target })
    else if (level === 2) setGuide({ line: step.say, target: null })
    else setGuide(null)
  }

  useEffect(() => {
    if (phase === 'brief') {
      setGuide({ line: LINES.readTask, target: null })
      return undefined
    }
    if (phase !== 'steps') return undefined
    if (showIntro.current) {
      showIntro.current = false
      setGuide({
        line: round === 2 ? LINES.roundTwo : LINES.roundThree,
        target: null,
        onDone: () => showStep(),
      })
    } else {
      showStep()
    }
    return () => clearTimeout(errorTimer.current)
    // Guidance only restarts when the person reaches a new step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, phase])

  function advance() {
    clearTimeout(errorTimer.current)
    if (step.sets) setValues((current) => ({ ...current, ...step.sets }))
    if (step.pay) setSpent((total) => total + Number(step.pay))
    if (hasScam && step.id === lesson.ambushAfter && scam === null) {
      setScam('pending')
      setPhase('scam')
      setGuide(null)
      return
    }
    if (stepIndex + 1 === lesson.steps.length) {
      setPhase('done')
      setGuide({ line: LINES.done, target: null })
      onFinish({ mistakes, helps, scam })
      return
    }
    moveToNext()
  }

  // Each form starts empty, so one task's number never carries into the next.
  function moveToNext() {
    const next = lesson.steps[stepIndex + 1]
    if (next.action === 'fill') setValues((current) => ({ ...current, [next.target]: '' }))
    setStepIndex(stepIndex + 1)
  }

  function showError(key, line) {
    clearTimeout(errorTimer.current)
    setMistakes((count) => count + 1)
    setGuide({ line, target: key, tone: 'error' })
    errorTimer.current = setTimeout(() => showStep(), ERROR_HOLD_MS)
  }

  function handleTap(event) {
    const element = event.target.closest('[data-guide]')
    if (!element) return
    const key = element.dataset.guide

    if (step.action === 'fill' && key === step.target) return
    if (key === (step.submit ?? step.target)) {
      if (step.action === 'fill' && !isCorrectValue(step, values)) {
        showError(step.target, step.wrong)
        return
      }
      advance()
      return
    }
    event.preventDefault()
    event.stopPropagation()
    element.blur()
    showError(key, WRONG_TAP)
  }

  function askForHelp() {
    setHelps((count) => count + 1)
    showStep(1)
  }

  function handleScamShare() {
    setScam('fell')
    setPhase('learn')
    setGuide({ line: LINES.scamFell, target: null })
  }

  function handleScamDelete() {
    setScam((current) => (current === 'fell' ? 'fell' : 'passed'))
    setPhase('praise')
    setGuide({ line: LINES.scamPassed, target: null })
  }

  function continueAfterScam() {
    setPhase('steps')
    moveToNext()
  }

  const label =
    lesson.kind === 'tip'
      ? UI.tip[lang]
      : lesson.kind === 'scenario'
        ? lesson.title[lang]
        : `${UI.round[lang]} ${round}: ${UI.rounds[round - 1][lang]}`
  const reminder = round === 3 ? (step.brief ?? lesson.brief) : null

  if (phase === 'done') {
    const alone = round === 3 && helps === 0 && scam !== 'fell'
    return (
      <main className="done">
        <h1>{UI.doneTitle[lang]}</h1>
        <p className="done-lesson">{lesson.kind === 'scenario' ? label : `${lesson.title[lang]} · ${label}`}</p>
        {alone && <p className="done-badge">{UI.doneAlone[lang]}</p>}
        <dl className="done-stats">
          <div><dt>{UI.tries[lang]}</dt><dd>{mistakes}</dd></div>
          <div><dt>{UI.helpsUsed[lang]}</dt><dd>{helps}</dd></div>
          {scam && (
            <div>
              <dt>{UI.scamResult[lang]}</dt>
              <dd>{scam === 'passed' ? UI.scamAvoided[lang] : UI.scamLearned[lang]}</dd>
            </div>
          )}
        </dl>
        {lesson.kind === 'practice' && round < 3 && (
          <button type="button" className="primary" onClick={() => onExit(round + 1)}>
            {UI.nextRound[lang]}
          </button>
        )}
        <button
          type="button"
          className={lesson.kind === 'practice' && round < 3 ? 'secondary' : 'primary'}
          onClick={() => onExit()}
        >
          {UI.allDone[lang]}
        </button>
      </main>
    )
  }

  // On wide screens a targeted line shows in the bubble beside the phone instead.
  const caption = guide?.line && (!guide.target || !wide) ? guide.line[lang] : ''

  return (
    <main className="lesson">
      <header className="lesson-top">
        <button type="button" className="text-button" onClick={() => onExit()}>
          ‹ {UI.back[lang]}
        </button>
        <span>{label}</span>
      </header>
      {reminder && phase === 'steps' && (
        <aside className="task-strip">
          <strong>{UI.yourTask[lang]}</strong>
          <TaskList items={reminder} lang={lang} />
        </aside>
      )}
      <div className={`phone brand-${lesson.brand ?? 'none'}`}>
        <div className="phone-badge">{UI.safeBadge[lang]}</div>
        {phase === 'brief' && (
          <div className="phone-screen">
            <div className="brief">
              <h2>{UI.yourTask[lang]}</h2>
              <TaskList items={lesson.brief} lang={lang} />
              <button type="button" className="primary" onClick={() => setPhase('steps')}>
                {UI.start[lang]}
              </button>
            </div>
          </div>
        )}
        {phase === 'steps' && (
          <div className="phone-screen" onClickCapture={handleTap}>
            <Screen
              lang={lang}
              data={step.data}
              balance={START_BALANCE - spent}
              values={values}
              onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
            />
          </div>
        )}
        {phase === 'scam' && (
          <div className="phone-screen">
            <ScamMessage lang={lang} onShare={handleScamShare} onDelete={handleScamDelete} />
          </div>
        )}
        {phase === 'learn' && (
          <div className="phone-screen">
            <ScamMessage lang={lang} learning onRetry={() => { setPhase('scam'); setGuide(null) }} />
          </div>
        )}
        {phase === 'praise' && (
          <div className="phone-screen">
            <div className="scam praise">
              <p className="praise-mark" aria-hidden="true"><Check size="4.5rem" strokeWidth={3} /></p>
              <button type="button" className="app-button" onClick={continueAfterScam}>
                {UI.continue[lang]}
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="dock">
        <div className="dock-avatar" data-guide="dock-avatar" />
        <p className={caption && guide?.tone === 'error' ? 'dock-caption dock-caption-error' : 'dock-caption'} aria-live="polite">{caption}</p>
        <div className="dock-actions">
          <button
            type="button"
            className="secondary"
            disabled={phase === 'steps' && round === 3}
            onClick={() => (phase === 'steps' ? showStep() : setGuide({ ...guide }))}
          >
            {UI.repeat[lang]}
          </button>
          <button type="button" className="primary" onClick={askForHelp} disabled={phase !== 'steps'}>
            {UI.help[lang]}
          </button>
        </div>
      </footer>
    </main>
  )
}
