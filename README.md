# Saathi

A safe practice space that helps older people in Pakistan build confidence with everyday digital tasks. Pretend apps, a voice guide in Roman Urdu, Urdu or English, and help that fades until they can do the task alone.

Everything in the practice apps is made up. No real money moves, no real account is touched, and no form reaches the government.

## Contents

- [Run it](#run-it)
- [Features](#features)
- [How a lesson works](#how-a-lesson-works)
- [Where everything lives](#where-everything-lives)
- [How the backend works](#how-the-backend-works)
- [Keys and settings](#keys-and-settings)
- [What works without keys](#what-works-without-keys)
- [Privacy](#privacy)
- [Languages and voices](#languages-and-voices)
- [Common changes](#common-changes)

## Run it

You need Node.js 20.19 or newer. Run these in two terminals:

```bash
cd backend && npm install && npm start
cd client && npm install && npm run dev
```

Open http://localhost:5173. The client calls the backend at `VITE_API_URL`, or `http://localhost:3000` when that is not set. Production builds use the URL in `client/.env.production`.

For a single production server, run `npm run build` in `client`, then `npm start` in `backend` and open http://localhost:3001.

The app runs without any keys. To turn on AI, copy `backend/.env.example` to `backend/.env` and see [Keys and settings](#keys-and-settings).

## Features

| Feature | What the person does | Main code |
| --- | --- | --- |
| Payment lessons | Practise payments on pretend easypaisa, JazzCash and Meezan apps | `LessonRunner.jsx`, `PayScreens.jsx`, `data/flows.js` |
| Tips | Learn small tasks such as taking a screenshot | `LessonRunner.jsx`, `Screens.jsx`, `data/content.js` |
| Bank Simulator | Move through a full pretend bank with a helper panel | `BankSim.jsx`, `data/bankSim.js` |
| Real World Test | Finish four payments in a row with no step by step help | `LessonRunner.jsx`, `scenarioSteps` in `data/flows.js` |
| My Passbook | Read a pretend statement, then pick a payment to practise | `Passbook.jsx` |
| WhatsApp practice | Send messages and voice notes, and make calls | `WhatsAppSim.jsx`, `SelfView.jsx`, `data/whatsapp.js` |
| Form Helper | Fill a practice pension form, or look up a word from any form | `GovernmentFormAssistant.jsx` |
| Scam Detector | Paste a strange message and get a risk result | `ScamPanel` in `Dashboard.jsx` |
| Ask Saathi | Chat with Saathi and send screenshots | `AskSaathi.jsx` |
| Voice guide | Speak or type a need and get taken to the right practice | `HelpPanel` in `Dashboard.jsx` |
| Family SOS | Call or text a saved family member | `SosDialog` in `Dashboard.jsx` |

Paths are under `client/src`, and component files are in `client/src/components`.

### Payment lessons

Each lesson has three rounds, described in [How a lesson works](#how-a-lesson-works). The Lessons page groups them by provider:

| Provider | Lessons |
| --- | --- |
| easypaisa | Send money, gas bill, water bill, invoice number, IBAN, Raast |
| JazzCash | Send money |
| Meezan Bank | Fund transfer by IBAN |
| K-Electric | Electricity bill, paid through easypaisa |

The practice PIN is `12345`. Lessons start with Rs 50,000 and the balance drops as the person pays.

The easypaisa send money lesson also hides a scam. From round 2, a fake urgent message asking for an OTP appears partway through. If the person shares the OTP, the app marks the warning signs in the message and lets them try again. Deleting it earns praise. Falling for it also stops them earning the "did it alone" badge in round 3.

### Tips

Four short lessons: joining a video call, taking a screenshot, searching on Google and using AI safely. They run once with full help.

### Bank Simulator

A pretend bank with a Rs 125,000 balance. The person can send money by IBAN, pay electricity, gas, water and internet bills, top up a mobile and view their bills. It also teaches copy and paste, because Saathi first points at Copy and then at Paste.

Details are checked like a real app. A badly formed IBAN, an unknown account, a wrong invoice number or an amount above the balance each show an error and a spoken hint. The balance, activity and paid bills reset when the person leaves.

### Real World Test

One sitting of four tasks on the pretend easypaisa app: a K-Electric bill, a fee voucher, an IBAN transfer and a Raast payment. It opens with the task list and has no guiding voice, but the person can still press Help me.

### My Passbook

A pretend October statement that shows opening balance, money in, money out and each entry in plain words. Below it are six payment options that open the matching lesson at round 1.

### WhatsApp practice

The person first finds the green WhatsApp icon on a pretend computer, or a pretend phone below 768px wide. Tapping another app gets a gentle correction. They then pick a task:

- **Messages:** click the box, type and press Send. A pretend family member replies after a short wait.
- **Voice notes:** press the mic and send. This is a simulation, so the microphone is never used.
- **Voice and video calls:** Saathi teaches Camera, Mute, Unmute and End call. Video calls show the person's own camera on their device only, and nothing is recorded or sent.

### Form Helper

- **Pension Form:** a practice form with six boxes. Pressing a box or its i button explains what to write. Values are formatted and checked as the person goes, for example CNIC dashes and the 24 character IBAN. There is also a Fill a sample button.
- **Any Form:** explains common words such as Domicile, Attested Copy and S/O. If a word is not listed, the person types it and Saathi explains it through `/api/ask`.

Nothing in the form is saved or sent. Only a typed word in Any Form goes to the backend.

### Scam Detector

Opens as a side panel. The person pastes a message and gets a risk level of `danger`, `careful` or `none`, plus the warning signs and one next step. It works offline with simpler rules. It takes text only, so photos go through Ask Saathi.

Saathi never says a message is definitely safe. A clean result only says no warning signs were found.

### Ask Saathi

A chat page with starter questions, spoken answers, tap-to-answer suggested replies and a photo button. Photos are shrunk in the browser to 1280px on the longest side before sending, and can be removed or replaced before sending. Saathi replies one step at a time and stays on digital topics, so it politely declines anything else.

The chat keeps its last 10 turns for context. A screenshot is remembered through a one line description, so the image itself is sent only once. The conversation is lost when the page is left.

### Voice guide

The floating helper button appears on every page and can be dragged. It opens a panel where the person presses the mic or types. Recording stops by itself after a pause or at 15 seconds. The backend turns the request into up to three short steps and picks the matching feature, which then appears as a Show me button.

The mic needs a secure link, so it works on `localhost` or HTTPS but not on plain HTTP.

### Family SOS

A red button on the home page. The person saves a family number once, and it stays on that device. After that they get one big Call button and a pre-written help message, which open the phone's own calling and SMS apps.

### Comfort and accessibility

- A language picker on first launch, which can be changed from the home page.
- Three text sizes, saved on the device.
- A short spoken tour on first launch, and a hint about Ask Saathi after 30 seconds on the home or Tips page.
- A Saathi avatar that points at the next button on screen.
- A Stop voice button at the top whenever Saathi is speaking.
- Motion that respects the reduced motion setting on the home page and help panels.

## How a lesson works

Help fades over three rounds:

| Round | Name | Help given |
| --- | --- | --- |
| 1 | Full help | Saathi speaks and points at the exact button |
| 2 | Voice only | Saathi speaks but does not point |
| 3 | On your own | The person reads a task list and works alone. Help me is still there, and each press is counted |

Finishing round 3 with no help presses and no scam failure earns the "did it alone" badge.

A wrong tap never does harm. `LessonRunner` catches every tap on the phone screen, blocks the wrong ones, speaks a kind correction and returns to the current step after a few seconds. The end screen shows mistakes, helps used and the scam result. Results are saved in the browser.

Every lesson is a list of steps. Each step names a screen, the button or field to use and the line to speak:

```js
{ id: 'amount', screen: '...', action: 'fill', target: '...', value: '500', say: { en, ru, ur } }
```

Screens mark their buttons with `data-guide="..."`. The same key is how `LessonRunner` checks a tap and how the avatar finds what to point at.

## Where everything lives

```text
backend/
  server.js                 Express app, /api routes, Saathi's prompts, serves the built client
  chatService.js            Chat keys, Gemini to Groq fallback, reply clean-up
  .env.example              List of settings

client/
  public/audio/             Recorded voice lines, generated by npm run voices
  public/brands/            Provider logos
  scripts/
    make-voices.mjs         Records every scripted line
    list-urdu.mjs           Lists text with no Urdu script yet
  src/
    App.jsx                 Screen switching, intro, progress, saved settings
    components/
      Dashboard.jsx         Home page, voice guide, Scam Detector, Family SOS
      LessonRunner.jsx      Runs rounds, steps, wrong taps and the scam moment
      Screens.jsx           Phone screens for tips, plus the screen list
      PayScreens.jsx        Pretend payment app screens
      BankSim.jsx           Bank Simulator
      Passbook.jsx          My Passbook
      WhatsAppSim.jsx       WhatsApp practice
      SelfView.jsx          Own camera during a pretend video call
      GovernmentFormAssistant.jsx  Form Helper
      AskSaathi.jsx         Chat
      Avatar.jsx            Saathi's face, speech bubble and pointing
      Icons.jsx             Small shared icons
    data/
      content.js            Lessons, spoken lines, app text, scam message
      flows.js              Step lists and pretend bills, names and numbers
      bankSim.js            Bank Simulator lines and sample details
      whatsapp.js           Pretend chats and WhatsApp lines
      urdu.js               Urdu script text, looked up by the English line
    lib/
      localCheck.js         Offline scam rules and the secret check
      speech.js             Plays recorded lines, live speech or the browser voice
      recorder.js           Mic recording, turned into WAV for the voice guide
      audioName.js          Turns a line into its audio file name
      i18n.js               Language lookup
      storage.js            Saves settings and progress in the browser
```

## How the backend works

| Route | Used by | What it does | Needs |
| --- | --- | --- | --- |
| `GET /api/health` | Ask Saathi | Says whether chat AI is available | Nothing |
| `POST /api/ask` | Ask Saathi, Scam Detector, Form Helper | Answers a question, a message or a photo | `CHAT_*` keys |
| `POST /api/guide` | Voice guide | Understands speech or text and picks a feature | `GEMINI_API_KEY` |
| `POST /api/speak` | Live answers | Turns text into speech, up to 1500 characters | Internet, no key |

Chat flow for `/api/ask`:

1. The browser checks for card numbers, PINs and passwords. If it finds one, it warns the person and sends nothing.
2. `server.js` checks the request and adds Saathi's rules and the reply language.
3. `chatService.js` tries each Gemini key and model, then each Groq key. Each request starts on the next key, which spreads the load.
4. Both providers return the same fields: `kind`, `risk`, `reply`, `warning_signs`, `next_step`, `speak_text`, `screen_summary` and `suggested_replies`.
5. If a provider's reply cannot be read, the person gets a friendly retry message. If both are unreachable, the browser uses the offline rules.

Spoken answers go through `/api/speak`, because browsers often have no Urdu voice. If that fails, `speech.js` uses the browser's own voice.

## Keys and settings

Put these in `backend/.env`, then restart the backend.

| Variable | Used for |
| --- | --- |
| `GEMINI_API_KEY` | Voice guide only |
| `GEMINI_MODELS` | Gemini models, separated by commas and tried in order. Also used by chat |
| `CHAT_GEMINI_API_KEYS` | Chat, one or more Gemini keys separated by commas |
| `CHAT_GROQ_API_KEYS` | Chat, one or more Groq keys separated by commas |
| `CHAT_GROQ_MODEL` | Groq model for text |
| `CHAT_GROQ_VISION_MODEL` | Groq model for messages with an image |
| `PORT` | Backend port, 3001 by default |

Chat has its own key pools, so it never shares load with the voice guide. It moves on from Gemini to Groq on rate limits, server errors, timeouts or network errors. A provider with no keys is skipped.

Free-tier limits still apply to each key, so more keys spread the load but do not remove the limits.

## What works without keys

| Part of the app | With no keys |
| --- | --- |
| Lessons, Tips, Bank Simulator, Real World Test, Passbook, WhatsApp, Family SOS, Pension Form | Works fully |
| Scripted voice | Works, from the recorded files |
| Scam Detector | Works with the offline rules in `client/src/lib/localCheck.js` |
| Ask Saathi, text | Works with the offline rules, which give simple answers and lesson links |
| Ask Saathi, photos | Unavailable |
| Voice guide, typed | Works with simple keyword matching |
| Voice guide, mic | Unavailable, because it needs `GEMINI_API_KEY` |
| Form Helper, typing a new word | Unavailable, and the listed words still work |

## Privacy

There is no login and no database. The backend stores nothing.

- **Kept in the browser only:** language, text size, lesson progress, intro status and the family number, under the `localStorage` key `saathi.state`.
- **Sent to Gemini or Groq:** chat text, chat photos, scam checks, form word lookups and voice guide speech or text, but only when keys are set.
- **Sent to Microsoft's Edge speech service:** the text of live answers that Saathi reads aloud.
- **Never sent:** anything `containsSecret` catches, such as a 13 to 19 digit number or text like "my PIN is 1234". The Pension Form values and the camera picture also stay on the device.

`containsSecret` is a simple pattern check, not a guarantee, and it does not read photos. Saathi's prompts add a second layer by telling the model never to ask for secrets and to treat pasted messages as material to examine, not as instructions.

## Languages and voices

The app supports English (`en`), Roman Urdu (`ru`) and Urdu script (`ur`). Roman Urdu shows on screen but is spoken from the Urdu script version, which sounds far better.

Text is written like `{ en, ru, ur }`. Many lines leave out `ur` and get it from `client/src/data/urdu.js` through `addUrdu`, falling back to Roman Urdu if no match exists. Run `node scripts/list-urdu.mjs` in `client` to list the gaps.

Saathi speaks in this order:

1. Scripted lines play from `client/public/audio`. Each file name is a hash of its text.
2. Live answers come from `/api/speak`.
3. If either fails, the browser's own voice reads the line.

After changing any spoken line, run `npm run voices` in `client`, then rebuild. A changed line has a new file name, so until then it falls back to the browser voice.

## Common changes

| To do this | Change this |
| --- | --- |
| Add a lesson | Add its steps in `data/flows.js`, add it to `LESSONS` in `data/content.js`, then add it to `PROVIDERS` or `TIPS` |
| Add a phone screen | Add it to `PAY_SCREENS` or `SCREENS`, with `data-guide` on anything tappable |
| Change app text | Edit `data/content.js`, or the `TEXT` block at the top of the component |
| Add a feature for the voice guide | Add it to `GUIDE_FEATURES` in `backend/server.js`, and handle it in `openFeature` in `App.jsx` |
| Add an offline scam rule | Add it to `SIGNS` in `lib/localCheck.js` |
| Change how Saathi talks | Edit `SYSTEM` or `GUIDE_SYSTEM` in `backend/server.js` |
| Check the code | Run `npm run lint` in `client`. There are no automated tests yet |
