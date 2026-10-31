# Saathi

A safe practice space that helps older people build confidence with everyday digital tasks. Pretend apps, a voice guide in Roman Urdu or English, and help that fades until they can do the task alone.

## Run it

```bash
cd backend && npm install && npm start
cd client && npm install && npm run dev
```

Open http://localhost:5173.

For a single production server, run `npm run build` in `client`, then `npm start` in `backend` and open http://localhost:3001.

## Gemini API key

Add your key to `GEMINI_API_KEY` in `backend/.env`, then restart the backend. The voice guide uses this key. Lessons and tips never need a key.

To choose other models, set `GEMINI_MODELS` to a comma separated list. They are tried in order.

## Chat service keys

Chat (`/api/ask`, used by Ask Saathi, the Scam Detector and the form helper) has its own Gemini and Groq key pools, separate from every other section. It tries Gemini first, then falls back to Groq automatically on rate limits, server errors, timeouts or network errors.

Set these in `backend/.env`, then restart the backend:

| Variable | Value |
| --- | --- |
| `CHAT_GEMINI_API_KEYS` | One or more Gemini keys, separated by commas |
| `CHAT_GROQ_API_KEYS` | One or more Groq keys, separated by commas |
| `CHAT_GROQ_MODEL` | Groq model for text |
| `CHAT_GROQ_VISION_MODEL` | Groq model for messages with an image |

A provider with no keys is skipped. If neither has keys, or both fail, chat uses the offline rules in `client/src/lib/localCheck.js`, and photo checks are unavailable. Free-tier limits still apply to each key, so more keys spread the load but do not remove the limits.

## Recorded voices

Scripted lines play from `client/public/audio`. After changing any line, run `npm run voices` in `client`, then rebuild.
