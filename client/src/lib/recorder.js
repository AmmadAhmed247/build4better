const SAMPLE_RATE = 16000
const MAX_RECORDING_MS = 15000
const SILENCE_STOP_MS = 1800
const SPEECH_LEVEL = 0.02

function toWav(samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const text = (offset, value) => [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  text(8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((sample, i) => {
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true)
  })
  return new Uint8Array(buffer)
}

// Browsers record different formats, so everything becomes the same small WAV.
async function toBase64Wav(blob) {
  const context = new AudioContext()
  const decoded = await context.decodeAudioData(await blob.arrayBuffer())
  await context.close()
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * SAMPLE_RATE), SAMPLE_RATE)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start()
  const rendered = await offline.startRendering()
  const bytes = toWav(rendered.getChannelData(0))
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

// Starts the mic. `done` resolves with base64 WAV after stop(), a pause, or the time limit.
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  })
  const recorder = new MediaRecorder(stream)
  const chunks = []
  const levels = new AudioContext()
  const analyser = levels.createAnalyser()
  levels.createMediaStreamSource(stream).connect(analyser)
  const samples = new Float32Array(analyser.fftSize)
  let heardSpeech = false
  let lastSound = Date.now()

  const stop = () => {
    if (recorder.state === 'recording') recorder.stop()
  }

  const watcher = setInterval(() => {
    analyser.getFloatTimeDomainData(samples)
    const level = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length)
    if (level > SPEECH_LEVEL) {
      heardSpeech = true
      lastSound = Date.now()
    } else if (heardSpeech && Date.now() - lastSound > SILENCE_STOP_MS) {
      stop()
    }
  }, 150)
  const limit = setTimeout(stop, MAX_RECORDING_MS)

  const done = new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => chunks.push(event.data)
    recorder.onerror = (event) => reject(event.error)
    recorder.onstop = () => {
      clearInterval(watcher)
      clearTimeout(limit)
      stream.getTracks().forEach((track) => track.stop())
      levels.close()
      toBase64Wav(new Blob(chunks, { type: recorder.mimeType })).then(resolve, reject)
    }
  })

  recorder.start()
  return { stop, done }
}
