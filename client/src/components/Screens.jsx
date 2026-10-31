// Pretend app screens. Anything with data-guide can be tapped and checked by the lesson.

function Bar({ title }) {
  return <div className="app-bar">{title}</div>
}

function Field({ id, label, value, onChange, type = 'text', mode }) {
  return (
    <label className="app-label">
      {label}
      <input
        data-guide={id}
        className="app-input"
        type={type}
        inputMode={mode}
        autoComplete="off"
        value={value ?? ''}
        onChange={(event) => onChange(id, event.target.value)}
      />
    </label>
  )
}

function Tap({ id, className = 'app-button', children }) {
  return (
    <button type="button" data-guide={id} className={className}>
      {children}
    </button>
  )
}

function BankLogin({ values, onChange }) {
  return (
    <>
      <Bar title="Practice Bank" />
      <div className="app-body">
        <div className="bank-logo" aria-hidden="true">PB</div>
        <Field id="pin" label="PIN" type="password" mode="numeric" value={values.pin} onChange={onChange} />
        <Tap id="login">Log in</Tap>
        <Tap id="forgot" className="app-link">Forgot PIN?</Tap>
      </div>
    </>
  )
}

function BankHome() {
  return (
    <>
      <Bar title="Practice Bank" />
      <div className="app-body">
        <div className="balance">
          <span>Pretend balance</span>
          <strong>Rs 50,000</strong>
        </div>
        <div className="app-grid">
          <Tap id="send">Paise Bhejein<br />Send Money</Tap>
          <Tap id="bills" className="app-button app-button-quiet">Bills</Tap>
          <Tap id="statement" className="app-button app-button-quiet">Statement</Tap>
          <Tap id="cards" className="app-button app-button-quiet">Cards</Tap>
        </div>
      </div>
    </>
  )
}

function BankRecipient() {
  return (
    <>
      <Bar title="Send to" />
      <div className="app-body">
        <Tap id="sara" className="app-row"><span className="dot">S</span>Sara</Tap>
        <Tap id="ahmed" className="app-row"><span className="dot">A</span>Ahmed</Tap>
        <Tap id="bilal" className="app-row"><span className="dot">B</span>Bilal</Tap>
      </div>
    </>
  )
}

function BankAmount({ values, onChange }) {
  return (
    <>
      <Bar title="Send to Ahmed" />
      <div className="app-body">
        <Field id="amount" label="Amount (Rs)" mode="numeric" value={values.amount} onChange={onChange} />
        <Tap id="continue">Aage Barhein<br />Continue</Tap>
      </div>
    </>
  )
}

function BankReview({ values }) {
  return (
    <>
      <Bar title="Check before sending" />
      <div className="app-body">
        <dl className="review">
          <div><dt>To</dt><dd>Ahmed</dd></div>
          <div><dt>Amount</dt><dd>Rs {values.amount}</dd></div>
        </dl>
        <Tap id="confirm">Tasdeeq Karein<br />Confirm</Tap>
        <Tap id="cancel" className="app-link">Cancel</Tap>
      </div>
    </>
  )
}

function CallScreen({ children, name = 'Beta Ahmed', status, face }) {
  return (
    <div className="call">
      <div className="call-person">
        <div className="call-picture" aria-hidden="true">{face ? '🙂' : 'A'}</div>
        <strong>{name}</strong>
        <span>{status}</span>
      </div>
      <div className="call-actions">{children}</div>
    </div>
  )
}

function CallIncoming() {
  return (
    <CallScreen status="Video calling...">
      <Tap id="decline" className="round-button round-red">Decline</Tap>
      <Tap id="accept" className="round-button round-green">Answer</Tap>
    </CallScreen>
  )
}

function CallActive() {
  return (
    <CallScreen status="Camera off">
      <Tap id="mute" className="round-button">Mute</Tap>
      <Tap id="camera" className="round-button">Camera</Tap>
      <Tap id="hangup" className="round-button round-red">End</Tap>
    </CallScreen>
  )
}

function CallCamera() {
  return (
    <CallScreen status="Camera on" face>
      <Tap id="mute" className="round-button">Mute</Tap>
      <Tap id="camera-off" className="round-button">Camera</Tap>
      <Tap id="hangup" className="round-button round-red">End</Tap>
    </CallScreen>
  )
}

function ShotPhone({ taken }) {
  return (
    <div className="shot-stage">
      <div className={taken ? 'shot-phone shot-flash' : 'shot-phone'}>
        <Tap id="power" className="side-button side-power">Power</Tap>
        <Tap id="volume" className="side-button side-volume">Volume Down</Tap>
        <div className="shot-screen">
          <span>10:30</span>
          <strong>Eid Mubarak!</strong>
          {taken && <Tap id="thumbnail" className="thumbnail">Picture</Tap>}
        </div>
      </div>
    </div>
  )
}

function SearchHome({ values, onChange }) {
  return (
    <div className="app-body search-home">
      <div className="search-logo">Search</div>
      <input
        data-guide="query"
        className="app-input"
        aria-label="Search"
        autoComplete="off"
        value={values.query ?? ''}
        onChange={(event) => onChange('query', event.target.value)}
      />
      <Tap id="search">Search</Tap>
      <Tap id="lucky" className="app-link">Images</Tap>
    </div>
  )
}

function SearchResults() {
  return (
    <>
      <Bar title="weather" />
      <div className="app-body">
        <Tap id="ad" className="result">
          <small>Sponsored</small>
          <b>Win a free phone now!</b>
        </Tap>
        <Tap id="result" className="result">
          <small>weather.example</small>
          <b>Today&apos;s weather: 24°C and sunny</b>
        </Tap>
        <Tap id="other" className="result">
          <small>news.example</small>
          <b>Weather news this week</b>
        </Tap>
      </div>
    </>
  )
}

function AiChat({ values, onChange }) {
  return (
    <>
      <Bar title="AI helper" />
      <div className="app-body app-body-end">
        <input
          data-guide="question"
          className="app-input"
          aria-label="Your question"
          autoComplete="off"
          value={values.question ?? ''}
          onChange={(event) => onChange('question', event.target.value)}
        />
        <Tap id="ask">Bhejein / Send</Tap>
      </div>
    </>
  )
}

function AiAnswer() {
  return (
    <>
      <Bar title="AI helper" />
      <div className="app-body">
        <p className="chat-me">tea recipe</p>
        <p className="chat-ai">Boil water with tea leaves. Add milk and sugar. Simmer for 2 minutes, then strain.</p>
        <Tap id="understood">Samajh Gaya<br />I understand</Tap>
      </div>
    </>
  )
}

export const SCREENS = {
  'bank-login': BankLogin,
  'bank-home': BankHome,
  'bank-recipient': BankRecipient,
  'bank-amount': BankAmount,
  'bank-review': BankReview,
  'call-incoming': CallIncoming,
  'call-active': CallActive,
  'call-camera': CallCamera,
  'shot-phone': ShotPhone,
  'shot-taken': () => <ShotPhone taken />,
  'search-home': SearchHome,
  'search-results': SearchResults,
  'ai-chat': AiChat,
  'ai-answer': AiAnswer,
}
