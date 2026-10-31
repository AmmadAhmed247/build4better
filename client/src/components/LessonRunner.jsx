import { useEffect, useRef, useState } from 'react'
import { LINES, SCAM, UI, WRONG_TAP } from '../data/content'
import { SCREENS } from './Screens'

const ERROR_HOLD_MS = 5500

function isCorrectValue(step, values) {
  return (values[step.target] ?? '').trim().toLowerCase() === step.value
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
  const [phase, setPhase] = useState('steps')
  const [mistakes, setMistakes] = useState(0)
  const [helps, setHelps] = useState(0)
  const [scam, setScam] = useState(null)
  const errorTimer = useRef(null)
  const showIntro = useRef(round > 1)

  const step = lesson.steps[stepIndex]
  const Screen = SCREENS[step.screen]
  const hasScam = lesson.ambushAfter && round > 1

  function showStep(level = round) {
    if (level === 1) setGuide({ line: step.say, target: step.target, anchor: step.submit })
    else if (level === 2) setGuide({ line: step.say, target: null })
    else setGuide(null)
  }

  useEffect(() => {
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
    setStepIndex(stepIndex + 1)
  }

  function showError(key, line) {
    clearTimeout(errorTimer.current)
    setMistakes((count) => count + 1)
    setGuide({ line, target: key, anchor: key === step.target ? step.submit : undefined, tone: 'error' })
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
    setStepIndex(stepIndex + 1)
  }

  const label = lesson.kind === 'tip' ? UI.tip[lang] : `${UI.round[lang]} ${round}: ${UI.rounds[round - 1][lang]}`

  if (phase === 'done') {
    const alone = round === 3 && helps === 0 && scam !== 'fell'
    return (
      <main className="done">
        <h1>{UI.doneTitle[lang]}</h1>
        <p className="done-lesson">{lesson.title[lang]} · {label}</p>
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

  const caption = guide?.line && !guide.target ? guide.line[lang] : ''

  return (
    <main className="lesson">
      <header className="lesson-top">
        <button type="button" className="text-button" onClick={() => onExit()}>
          ‹ {UI.back[lang]}
        </button>
        <span>{label}</span>
      </header>
      <div className="phone">
        <div className="phone-badge">{UI.safeBadge[lang]}</div>
        {phase === 'steps' && (
          <div className="phone-screen" onClickCapture={handleTap}>
            <Screen
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
              <p className="praise-mark" aria-hidden="true">✓</p>
              <button type="button" className="app-button" onClick={continueAfterScam}>
                {UI.continue[lang]}
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="dock">
        <div className="dock-avatar" data-guide="dock-avatar" />
        <p className="dock-caption" aria-live="polite">{caption}</p>
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
