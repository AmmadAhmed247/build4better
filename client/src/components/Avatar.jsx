import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { subscribeSpeaking } from '../lib/speech'
import { UI } from '../data/content'

const SIZE = 76
const GAP = 10
const EDGE = 16

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function AvatarFace({ speaking, pointing }) {
  return (
    <svg viewBox="0 0 100 100" className={speaking ? 'face is-speaking' : 'face'} aria-hidden="true">
      {pointing && <path className="face-pointer" d="M50 0 L60 14 L40 14 Z" />}
      <path className="face-body" d="M18 100 C18 74 32 66 50 66 C68 66 82 74 82 100 Z" />
      <circle className="face-skin" cx="50" cy="44" r="29" />
      <path className="face-hair" d="M21 44 C20 16 80 16 79 44 C70 31 58 28 50 33 C42 28 30 31 21 44 Z" />
      <g className="face-eyes">
        <circle cx="39" cy="46" r="3.6" />
        <circle cx="61" cy="46" r="3.6" />
      </g>
      <circle className="face-glasses" cx="39" cy="46" r="9" />
      <circle className="face-glasses" cx="61" cy="46" r="9" />
      <path className="face-glasses" d="M48 46 H52" />
      <ellipse className="face-mouth" cx="50" cy="60" rx="7" ry="3" />
    </svg>
  )
}

export function useSpeaking() {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => subscribeSpeaking(setSpeaking), [])
  return speaking
}

function findTarget(key) {
  return key ? document.querySelector(`[data-guide="${key}"]`) : null
}

function toBox(rect) {
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
}

// Walks to the highlighted element, standing below it unless there is no room.
export default function Avatar({ guide, lang, onSkip, dock }) {
  const speaking = useSpeaking()
  const bubbleRef = useRef(null)
  const [box, setBox] = useState(null)
  const [anchorBox, setAnchorBox] = useState(null)
  const [dockBox, setDockBox] = useState(null)
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [bubbleHeight, setBubbleHeight] = useState(100)
  const target = guide?.target
  const anchor = guide?.anchor

  useLayoutEffect(() => {
    const measure = () => {
      const element = findTarget(target)
      setBox(element ? toBox(element.getBoundingClientRect()) : null)
      // A form field's button sits right below it, so stand under the button instead.
      const anchorElement = findTarget(anchor)
      setAnchorBox(anchorElement ? toBox(anchorElement.getBoundingClientRect()) : null)
      const dockElement = dock ? findTarget('dock-avatar') : null
      setDockBox(dockElement ? toBox(dockElement.getBoundingClientRect()) : null)
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    findTarget(target)?.scrollIntoView({ block: 'nearest' })
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [target, anchor, dock, guide])

  useLayoutEffect(() => {
    if (bubbleRef.current) setBubbleHeight(bubbleRef.current.offsetHeight)
  }, [guide, viewport])

  const bubbleWidth = Math.min(340, viewport.width - EDGE * 2)
  let x = viewport.width - SIZE - EDGE
  let y = viewport.height - SIZE - 104
  let bubbleTop = y - bubbleHeight - 6
  let bubbleLeft = viewport.width - bubbleWidth - EDGE

  if (box) {
    const stand = anchorBox ?? box
    // The lesson dock holds Help me, so the avatar never covers it.
    const floor = dockBox ? dockBox.top : viewport.height
    const fitsBelow = stand.bottom + GAP + SIZE + bubbleHeight + 14 < floor
    x = clamp(stand.left + stand.width / 2 - SIZE / 2, 8, viewport.width - SIZE - 8)
    y = fitsBelow ? stand.bottom + GAP : Math.max(8, box.top - SIZE - GAP)
    bubbleTop = fitsBelow ? y + SIZE + 6 : Math.max(8, y - bubbleHeight - 6)
    bubbleLeft = clamp(x + SIZE / 2 - bubbleWidth / 2, EDGE, viewport.width - bubbleWidth - EDGE)
  } else if (dockBox) {
    x = dockBox.left
    y = dockBox.top
  }

  const tone = guide?.tone === 'error' ? 'error' : 'guide'
  const showBubble = guide?.line && (box || !dockBox)

  return (
    <>
      {box && (
        <div
          className={`spotlight spotlight-${tone}`}
          style={{ left: box.left - 6, top: box.top - 6, width: box.width + 12, height: box.height + 12 }}
        />
      )}
      <div className="avatar" style={{ transform: `translate(${x}px, ${y}px)` }}>
        <AvatarFace speaking={speaking} pointing={Boolean(box)} />
      </div>
      {showBubble && (
        <div
          ref={bubbleRef}
          className={`bubble bubble-${tone}`}
          style={{ left: bubbleLeft, top: bubbleTop, width: bubbleWidth }}
          role="status"
          aria-live="polite"
        >
          <p>{guide.line[lang]}</p>
          {guide.skippable && (
            <button type="button" className="bubble-skip" onClick={onSkip}>
              {UI.skip[lang]}
            </button>
          )}
        </div>
      )}
    </>
  )
}
