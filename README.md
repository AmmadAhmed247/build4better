# Saathi

A safe practice space that helps older people build confidence with everyday digital tasks. Pretend apps, a voice guide in Roman Urdu or English, and help that fades until they can do the task alone.

## Run it

```bash
cd backend && npm install && npm start
cd client && npm install && npm run dev
```

Open http://localhost:5173.

For a single production server, run `npm run build` in `client`, then `npm start` in `backend` and open http://localhost:3001.

## Claude API key

Add your key to `ANTHROPIC_API_KEY` in `backend/.env`, then restart the backend. While it is blank, Ask Saathi uses the offline rules in `client/src/lib/localCheck.js`, and photo checks are unavailable. Lessons and tips never need the key.
