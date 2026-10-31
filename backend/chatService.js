// The chat service has its own Gemini and Groq keys, so it never shares load with other sections.
const { GoogleGenAI, Type } = require('@google/genai')
const GroqModule = require('groq-sdk')

const Groq = GroqModule.default ?? GroqModule

const TEXT_TIMEOUT_MS = 10000
const IMAGE_TIMEOUT_MS = 20000
const GEMINI_TEXT_BUDGET_MS = 14000
const GEMINI_IMAGE_BUDGET_MS = 24000
const TEMPERATURE = 0.2
const MAX_HISTORY = 10
const MAX_TEXT = 4000
const MAX_LIST_ITEMS = 6

const KINDS = ['answer', 'scam_check']
const RISKS = ['danger', 'careful', 'none']

const REPLY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    kind: { type: Type.STRING, enum: KINDS },
    risk: { type: Type.STRING, enum: RISKS },
    reply: { type: Type.STRING },
    warning_signs: { type: Type.ARRAY, items: { type: Type.STRING } },
    next_step: { type: Type.STRING },
  },
  required: ['kind', 'risk', 'reply', 'warning_signs', 'next_step'],
}

const JSON_RULE = `Return only one JSON object with exactly these keys: ${REPLY_SCHEMA.required.join(', ')}.`

// Shown when a provider keeps returning something that cannot be read.
const FRIENDLY_FALLBACK = {
  kind: 'answer',
  risk: 'none',
  reply: 'Maaf kijiye, mujhe jawab dene mein mushkil hui. Baraye meherbani apna sawal dobara bhejein.',
  warning_signs: [],
  next_step: '',
}

function readKeys(name) {
  return (process.env[name] || '').split(',').map((key) => key.trim()).filter(Boolean)
}

const geminiClients = readKeys('CHAT_GEMINI_API_KEYS').map(
  (apiKey) => new GoogleGenAI({ apiKey, httpOptions: { timeout: IMAGE_TIMEOUT_MS, retryOptions: { attempts: 1 } } }),
)
const groqClients = readKeys('CHAT_GROQ_API_KEYS').map((apiKey) => new Groq({ apiKey, maxRetries: 0 }))
const groqTextModel = (process.env.CHAT_GROQ_MODEL || '').trim()
const groqVisionModel = (process.env.CHAT_GROQ_VISION_MODEL || '').trim()

const nextKey = { gemini: 0, groq: 0 }

// Each request starts on the next key, so the load spreads across the pool.
function rotated(provider, clients) {
  const start = nextKey[provider] % clients.length
  nextKey[provider] += 1
  return clients.map((_, offset) => {
    const index = (start + offset) % clients.length
    return { client: clients[index], index }
  })
}

function hasChatProvider() {
  return geminiClients.length > 0 || (groqClients.length > 0 && Boolean(groqTextModel))
}

function cleanList(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .slice(0, MAX_LIST_ITEMS)
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Both providers pass through here, so the client always gets the same shape.
function normalizeReply(raw) {
  const reply = cleanText(raw?.reply)
  if (!reply) throw new SyntaxError('reply is empty')
  const kind = KINDS.includes(raw.kind) ? raw.kind : 'answer'
  const isScamCheck = kind === 'scam_check'
  return {
    kind,
    risk: isScamCheck && RISKS.includes(raw.risk) ? raw.risk : 'none',
    reply,
    warning_signs: isScamCheck ? cleanList(raw.warning_signs) : [],
    next_step: cleanText(raw.next_step),
  }
}

function parseReply(text) {
  return normalizeReply(JSON.parse(text))
}

function cleanTurns(history, message) {
  const turns = (Array.isArray(history) ? history : [])
    .filter((turn) => ['user', 'assistant'].includes(turn?.role) && typeof turn.text === 'string' && turn.text.trim())
    .slice(-MAX_HISTORY)
    .map((turn) => ({ role: turn.role, text: turn.text.slice(0, MAX_TEXT) }))
  // Conversations open with the user, and the current message is sent separately.
  while (turns[0]?.role === 'assistant') turns.shift()
  const last = turns.at(-1)
  if (last?.role === 'user' && last.text === message) turns.pop()
  return turns
}

function geminiContents({ turns, text, image }) {
  const parts = []
  if (image) parts.push({ inlineData: { mimeType: image.mediaType, data: image.data } })
  parts.push({ text })
  return [
    ...turns.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    { role: 'user', parts },
  ]
}

function groqMessages({ system, turns, text, image }) {
  const content = image
    ? [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: `data:${image.mediaType};base64,${image.data}` } },
      ]
    : text
  return [
    { role: 'system', content: `${system}\n\n${JSON_RULE}` },
    ...turns.map((turn) => ({ role: turn.role, content: turn.text })),
    { role: 'user', content },
  ]
}

function isNetworkOrServerError(err) {
  return !err.status || err.status >= 500
}

function describe(err) {
  return err.status ?? err.name
}

async function askGemini(request, models, outcome) {
  const timeout = request.image ? IMAGE_TIMEOUT_MS : TEXT_TIMEOUT_MS
  const deadline = Date.now() + (request.image ? GEMINI_IMAGE_BUDGET_MS : GEMINI_TEXT_BUDGET_MS)

  for (const { client, index } of rotated('gemini', geminiClients)) {
    for (const model of models) {
      const remaining = deadline - Date.now()
      if (remaining <= 0) return null
      try {
        const response = await client.models.generateContent({
          model,
          contents: geminiContents(request),
          config: {
            abortSignal: AbortSignal.timeout(Math.min(timeout, remaining)),
            systemInstruction: request.system,
            temperature: TEMPERATURE,
            responseMimeType: 'application/json',
            responseSchema: REPLY_SCHEMA,
          },
        })
        const answer = parseReply(response.text)
        console.log(`Chat answered by gemini key #${index + 1} (${model})`)
        return answer
      } catch (err) {
        if (err instanceof SyntaxError) {
          outcome.unreadable = true
          console.error(`Chat gemini key #${index + 1} (${model}) returned unreadable JSON`)
          continue
        }
        outcome.lastStatus = err.status
        console.error(`Chat gemini key #${index + 1} (${model}) failed: ${describe(err)}`)
        // Busy models clear by moving on. Key problems need the next key.
        if (!isNetworkOrServerError(err) && err.status !== 404) break
      }
    }
  }
  return null
}

function isBadJsonError(err) {
  return err.status === 400 && err.error?.error?.code === 'json_validate_failed'
}

async function askGroq(request, outcome) {
  const model = request.image ? groqVisionModel : groqTextModel
  if (!model) return null
  const timeout = request.image ? IMAGE_TIMEOUT_MS : TEXT_TIMEOUT_MS
  let unreadableRetries = 1

  for (const { client, index } of rotated('groq', groqClients)) {
    for (;;) {
      try {
        const response = await client.chat.completions.create(
          {
            model,
            messages: groqMessages(request),
            temperature: TEMPERATURE,
            response_format: { type: 'json_object' },
          },
          { timeout },
        )
        const answer = parseReply(response.choices[0]?.message?.content ?? '')
        console.log(`Chat answered by groq key #${index + 1} (${model})`)
        return answer
      } catch (err) {
        if (err instanceof SyntaxError || isBadJsonError(err)) {
          outcome.unreadable = true
          console.error(`Chat groq key #${index + 1} (${model}) returned unreadable JSON`)
          if (unreadableRetries > 0) {
            unreadableRetries -= 1
            continue
          }
          return null
        }
        outcome.lastStatus = err.status
        console.error(`Chat groq key #${index + 1} (${model}) failed: ${describe(err)}`)
        break
      }
    }
  }
  return null
}

// Tries Gemini, then Groq. Returns null when both are unreachable, so the caller can respond with an error.
async function askChat({ system, models, history, message, text, image }) {
  const request = { system, turns: cleanTurns(history, message), text, image }
  const outcome = { unreadable: false, lastStatus: undefined }

  const answer =
    (geminiClients.length > 0 ? await askGemini(request, models, outcome) : null) ??
    (groqClients.length > 0 ? await askGroq(request, outcome) : null)

  if (answer) return { answer }
  if (outcome.unreadable) return { answer: FRIENDLY_FALLBACK }
  return { answer: null, status: outcome.lastStatus }
}

module.exports = { askChat, hasChatProvider }
