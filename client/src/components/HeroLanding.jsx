import { motion, MotionConfig } from 'framer-motion'
import { Paperclip } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

const lineRise = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
}

const stickerPop = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 16 } },
}

function Sticker({ label, Icon, paper, badge, className = '' }) {
  return (
    <motion.span variants={stickerPop} className={`inline-block flex-none tracking-normal normal-case ${className}`}>
      <motion.span
        whileHover={{ scale: 1.08, y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className={`relative block rounded-md py-2 pr-5 pl-7 text-base font-semibold leading-none text-stone-900 shadow-lg ${paper}`}
      >
        <span className={`absolute -top-4 -left-3 grid size-9 place-items-center rounded-full border-2 border-white/70 text-white ${badge}`}>
          <Icon size="1.125rem" aria-hidden="true" />
        </span>
        <Paperclip size="1rem" aria-hidden="true" className="absolute -top-3 left-6 text-stone-500" />
        {label}
      </motion.span>
    </motion.span>
  )
}

function Headline({ lines, stickers }) {
  return (
    <motion.h1
      variants={stagger}
      aria-label={lines.map((line) => line.text).join(' ')}
      className="m-0 grid gap-0 text-5xl leading-[0.92] font-extrabold tracking-[-0.045em] text-white uppercase [text-shadow:0_2px_24px_rgb(20_40_30/40%)] sm:text-7xl lg:text-8xl"
    >
      {lines.map(({ text, before, after }) => (
        <span key={text} aria-hidden="true" className="flex items-center gap-4 lg:gap-6">
          {before !== undefined && <Sticker {...stickers[before]} className="hidden -rotate-6 sm:inline-block" />}
          <span className="inline-block overflow-hidden pb-[0.06em]">
            <motion.span variants={lineRise} className="inline-block">{text}</motion.span>
          </span>
          {after !== undefined && <Sticker {...stickers[after]} className="hidden rotate-6 sm:inline-block" />}
        </span>
      ))}
    </motion.h1>
  )
}

export default function HeroLanding({ content, children }) {
  const { brand, lines, stickers, badge, tagline, card, dock } = content

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative flex h-full w-full flex-col gap-6 overflow-y-auto px-4 py-5 font-sans text-white lg:px-8"
      >
        <motion.p variants={rise} className="m-0 text-center text-2xl font-extrabold tracking-tight uppercase">{brand}</motion.p>

        <motion.div
          variants={rise}
          className="flex w-fit items-center gap-3 self-center rounded-3xl border border-white/30 bg-[var(--glass-dark)] py-3 pr-6 pl-3 backdrop-blur-md lg:absolute lg:top-[14%] lg:left-8"
        >
          <span className="w-12 flex-none">{badge.face}</span>
          <span className="grid">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="size-2 animate-pulse rounded-full bg-lime-300" />
              {badge.status}
            </span>
            <span className="text-lg font-semibold tracking-tight uppercase">{badge.name}</span>
          </span>
        </motion.div>

        <div className="my-auto grid justify-items-center gap-6">
          <Headline lines={lines} stickers={stickers} />
          <div className="flex flex-wrap justify-center gap-5 sm:hidden">
            {stickers.map((sticker) => <Sticker key={sticker.label} {...sticker} />)}
          </div>
          <motion.div variants={rise} className="w-full">{children}</motion.div>
        </div>

        <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <motion.p variants={rise} className="m-0 hidden text-xl leading-tight font-semibold tracking-tight lg:block">
            — {tagline}
          </motion.p>

          <motion.ul variants={rise} className="m-0 flex list-none justify-center gap-2 justify-self-center rounded-3xl border border-white/60 bg-white/55 p-2 backdrop-blur-md">
            {dock.map(({ label, Icon, tone }) => (
              <motion.li
                key={label}
                title={label}
                whileHover={{ y: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                className="grid size-14 place-items-center rounded-2xl bg-white shadow-md sm:size-16"
              >
                <Icon size="1.75rem" aria-hidden="true" className={tone} />
                <span className="sr-only">{label}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={rise} className="hidden w-80 justify-self-end rounded-3xl border border-white/30 bg-[var(--glass-dark)] p-3 backdrop-blur-md lg:flex lg:items-center lg:gap-3">
            <img src={card.image} alt="" className="size-16 flex-none rounded-2xl bg-white object-contain p-1" />
            <span className="grid min-w-0">
              <span className="text-xs font-medium uppercase">{card.kicker}</span>
              <span className="text-lg leading-tight font-bold tracking-tight uppercase">{card.title}</span>
            </span>
          </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  )
}
