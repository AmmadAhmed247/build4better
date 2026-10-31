import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { subscribeSpeaking } from '../lib/speech'
import { UI } from '../data/content'

const SIZE = 76
const SMALL = 56
const GAP = 8
const EDGE = 16
const WIDE_FROM = 1024

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function AvatarFace({ speaking }) {
  return (
    <svg viewBox="0 0 100 100" className={speaking ? 'face is-speaking' : 'face'} aria-hidden="true">
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

export function useWide() {
  const [wide, setWide] = useState(window.innerWidth >= WIDE_FROM)
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= WIDE_FROM)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return wide
}

function findTarget(key) {
  return key ? document.querySelector(`[data-guide="${key}"]`) : null
}

function toBox(element) {
  if (!element) return null
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  const follow = 'follow' in element.dataset
  return width > 0 ? { left, top, right, bottom, width, height, follow } : null
}

function measure(targetKey) {
  const element = findTarget(targetKey)
  return {
    // Some inputs sit inside a bigger visible box, so ring that box.
    target: toBox(element?.closest('[data-ring]') ?? element),
    phone: toBox(element?.closest('.phone')),
    dock: toBox(findTarget('dock-avatar')),
    slot: toBox(findTarget('side-slot')),
    nav: toBox(findTarget('nav-tips')),
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// Avatar and bubble stay clear of the app: beside it on wide screens, in a corner on phones.
function place({ target, phone, dock, slot, nav, width, height }, bubbleHeight) {
  const wide = width >= WIDE_FROM

  // Some screens fill the page, so the avatar walks over while the text stays in the side column.
  if (wide && slot && slot.follow) {
    const bubble = { left: slot.left, top: slot.top, width: slot.width }
    if (!target) return { size: SIZE, x: slot.left, y: slot.top + bubbleHeight + GAP, bubble }
    return {
      size: SMALL,
      x: clamp(target.right - SMALL + 8, 4, width - SMALL - 4),
      y: Math.max(4, target.top - SMALL + 16),
      bubble,
    }
  }
  if (wide && slot) {
    return {
      size: SIZE,
      x: slot.left,
      y: slot.top,
      bubble: { left: slot.left + SIZE + GAP, top: slot.top, width: slot.width - SIZE - GAP },
    }
  }
  if (wide && phone && target) {
    const x = phone.right + 14
    const y = clamp(target.top + target.height / 2 - SIZE / 2, GAP, height - SIZE - GAP)
    const left = x + SIZE + GAP
    return {
      size: SIZE,
      x,
      y,
      bubble: {
        left,
        top: clamp(y, GAP, height - bubbleHeight - GAP),
        width: clamp(width - left - EDGE, 180, 340),
      },
    }
  }

  const floor = nav ? nav.top - GAP * 2 : height - GAP
  const bubble = {
    left: clamp((width - Math.min(340, width - EDGE * 2)) / 2, EDGE, width),
    top: floor - bubbleHeight - GAP,
    width: Math.min(340, width - EDGE * 2),
  }

  if (target) {
    return {
      size: SMALL,
      x: clamp(target.right - SMALL + 8, 4, width - SMALL - 4),
      y: Math.max(4, target.top - SMALL + 16),
      bubble: dock ? null : bubble,
    }
  }
  if (dock) return { size: SIZE, x: dock.left, y: dock.top, bubble: null }
  return { size: SIZE, x: width - SIZE - EDGE, y: bubble.top - SIZE - 4, bubble }
}

export default function Avatar({ guide, lang, onSkip }) {
  const speaking = useSpeaking()
  const bubbleRef = useRef(null)
  const [layout, setLayout] = useState(() => measure(null))
  const [bubbleHeight, setBubbleHeight] = useState(100)
  const target = guide?.target

  useEffect(() => {
    findTarget(target)?.scrollIntoView({ block: 'nearest' })
  }, [target, guide])

  // Tracks every frame, because animations and images keep moving things after a render.
  useEffect(() => {
    let frame
    const tick = () => {
      const next = measure(target)
      setLayout((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [target])

  useLayoutEffect(() => {
    if (bubbleRef.current) setBubbleHeight(bubbleRef.current.offsetHeight)
  }, [guide, layout])

  const { size, x, y, bubble } = place(layout, bubbleHeight)
  const tone = guide?.tone === 'error' ? 'error' : 'guide'
  const ring = layout.target

  return (
    <>
      {ring && (
        <div
          className={`spotlight spotlight-${tone}`}
          style={{ left: ring.left - 3, top: ring.top - 3, width: ring.width + 6, height: ring.height + 6 }}
        />
      )}
      <div className="avatar" style={{ width: size, height: size, transform: `translate(${x}px, ${y}px)` }}>
        <AvatarFace speaking={speaking} />
      </div>
      {guide?.line && bubble && (
        <div
          ref={bubbleRef}
          className={`bubble bubble-${tone}`}
          style={bubble}
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
