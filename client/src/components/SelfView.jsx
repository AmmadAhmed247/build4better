import { useEffect, useRef, useState } from 'react'
import { tr } from '../lib/i18n'

// Shows the person's own camera on this device only. Nothing is recorded or sent.
export default function SelfView({ lang, className = 'self-view' }) {
  const videoRef = useRef(null)
  const [problem, setProblem] = useState(null)

  useEffect(() => {
    let stream
    let stopped = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setProblem('unsupported')
        return
      }
      try {
        const opened = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (stopped) {
          opened.getTracks().forEach((track) => track.stop())
          return
        }
        stream = opened
        videoRef.current.srcObject = opened
      } catch (error) {
        setProblem(error.name === 'NotAllowedError' ? 'blocked' : 'missing')
      }
    }
    start()
    return () => {
      stopped = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  if (problem) {
    const text = {
      blocked: tr(lang, 'Camera is blocked. Allow it in your browser.', 'Camera band hai. Browser mein Allow karein.'),
      missing: tr(lang, 'No camera was found.', 'Camera nahi mila.'),
      unsupported: tr(lang, 'Camera needs a secure link.', 'Camera ke liye secure link chahiye.'),
    }[problem]
    return <p className={`${className} self-view-note`} role="status">{text}</p>
  }

  return <video ref={videoRef} className={className} autoPlay muted playsInline aria-label="Your camera" />
}
