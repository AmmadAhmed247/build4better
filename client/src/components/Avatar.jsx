import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { subscribeSpeaking } from '../lib/speech'
import { UI } from '../data/content'

const BASE_SIZE = 76
const BASE_SMALL = 56
const BASE_BUBBLE = 340
const GAP = 8
const EDGE = 16
const WIDE_FROM = 1024

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

const EYES = [
  { cx: 29, tilt: -6 },
  { cx: 71, tilt: 6 },
]
const EYE_Y = 50
const LOOK_X = 6
const LOOK_Y = 13
const LOOK_FULL_AT = 140
const CURSOR_OFFSET_X = 34
const CURSOR_OFFSET_Y = -6
const CURSOR_EDGE = 72
const CURSOR_SPRING = { stiffness: 170, damping: 20, mass: 0.6 }

const pointer = { x: null, y: null, touch: false }
const pointerListeners = new Set()

function trackPointer(event) {
  pointer.x = event.clientX
  pointer.y = event.clientY
  pointer.touch = event.pointerType === 'touch'
  pointerListeners.forEach((listener) => listener())
}

window.addEventListener('pointermove', trackPointer, { passive: true })
window.addEventListener('pointerdown', trackPointer, { passive: true })

function subscribePointer(listener) {
  pointerListeners.add(listener)
  return () => pointerListeners.delete(listener)
}

// Runs outside React so moving the mouse never re-renders the app.
function usePupils() {
  const svgRef = useRef(null)

  useEffect(() => {
    let frame = null
    const look = () => {
      frame = null
      const svg = svgRef.current
      if (!svg || pointer.x === null) return
      const box = svg.getBoundingClientRect()
      if (box.width === 0) return
      svg.querySelectorAll('.face-look').forEach((pupil, index) => {
        const dx = pointer.x - (box.left + (EYES[index].cx / 100) * box.width)
        const dy = pointer.y - (box.top + (EYE_Y / 100) * box.height)
        const distance = Math.hypot(dx, dy) || 1
        const reach = Math.min(distance / LOOK_FULL_AT, 1)
        pupil.style.transform = `translate(${(dx / distance) * LOOK_X * reach}px, ${(dy / distance) * LOOK_Y * reach}px)`
      })
    }
    const queue = () => {
      if (frame === null) frame = requestAnimationFrame(look)
    }
    queue()
    const unsubscribe = subscribePointer(queue)
    return () => {
      unsubscribe()
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return svgRef
}

export function AvatarFace({ speaking }) {
  const svgRef = usePupils()
  return (
    <svg ref={svgRef} viewBox="0 0 100 100" className={speaking ? 'face is-speaking' : 'face'} aria-hidden="true">
      <g className="face-eyes">
        {EYES.map(({ cx, tilt }) => (
          <g key={cx}>
            <ellipse className="face-eye" cx={cx} cy={EYE_Y} rx="19" ry="28" transform={`rotate(${tilt} ${cx} ${EYE_Y})`} />
            <g className="face-look">
              <circle className="face-pupil" cx={cx} cy={EYE_Y} r="12" />
              <circle className="face-glint" cx={cx - 3} cy={EYE_Y + 6} r="2.4" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}

// A mouse pointer gets a pair of eyes trailing it. Touch screens have nothing to trail.
export function CursorEyes({ hidden }) {
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, CURSOR_SPRING)
  const smoothY = useSpring(y, CURSOR_SPRING)

  useEffect(() => {
    const leave = () => setActive(false)
    const unsubscribe = subscribePointer(() => {
      setActive(!pointer.touch)
      x.set(Math.min(pointer.x + CURSOR_OFFSET_X, window.innerWidth - CURSOR_EDGE))
      y.set(Math.max(pointer.y + CURSOR_OFFSET_Y, 0))
    })
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      unsubscribe()
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [x, y])

  if (hidden || !active) return null
  return (
    <motion.div className="cursor-eyes" style={reduced ? { x, y } : { x: smoothX, y: smoothY }}>
      <AvatarFace />
    </motion.div>
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

function toBox(element, frame) {
  if (!element) return null
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect()
  const follow = 'follow' in element.dataset
  if (width === 0) return null
  return {
    left: left - frame.left,
    top: top - frame.top,
    right: right - frame.left,
    bottom: bottom - frame.top,
    width,
    height,
    follow,
  }
}

function measure(targetKey) {
  const element = findTarget(targetKey)
  // Fixed layers start inside the frame's border.
  const shell = document.querySelector('.shell')
  const outer = shell.getBoundingClientRect()
  const frame = {
    left: outer.left + shell.clientLeft,
    top: outer.top + shell.clientTop,
    width: shell.clientWidth,
    height: shell.clientHeight,
  }
  return {
    // Some inputs sit inside a bigger visible box, so ring that box.
    target: toBox(element?.closest('[data-ring]') ?? element, frame),
    phone: toBox(element?.closest('.phone'), frame),
    dock: toBox(findTarget('dock-avatar'), frame),
    slot: toBox(findTarget('side-slot'), frame),
    nav: toBox(findTarget('nav-tips'), frame),
    width: frame.width,
    height: frame.height,
    scale: parseFloat(getComputedStyle(document.documentElement).fontSize) / 16,
  }
}

// Avatar and bubble stay clear of the app: beside it on wide screens, in a corner on phones.
function place({ target, phone, dock, slot, nav, width, height, scale }, bubbleHeight) {
  const wide = width >= WIDE_FROM
  const SIZE = BASE_SIZE * scale
  const SMALL = BASE_SMALL * scale
  const bubbleLimit = BASE_BUBBLE * scale

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
        width: clamp(width - left - EDGE, 180, bubbleLimit),
      },
    }
  }

  const floor = nav ? nav.top - GAP * 2 : height - GAP
  const bubble = {
    left: clamp((width - Math.min(bubbleLimit, width - EDGE * 2)) / 2, EDGE, width),
    top: floor - bubbleHeight - GAP,
    width: Math.min(bubbleLimit, width - EDGE * 2),
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
