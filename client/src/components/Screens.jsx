import Icon from './Icons'
import { PAY_SCREENS } from './PayScreens'

// Pretend app screens. Anything with data-guide can be tapped and checked by the lesson.

function Bar({ title }) {
  return <div className="app-bar">{title}</div>
}

function Tap({ id, className = 'app-button', children }) {
  return (
    <button type="button" data-guide={id} className={className}>
      {children}
    </button>
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

function GoogleBox({ children }) {
  return (
    <div className="g-box">
      <Icon name="plus" size={20} />
      {children}
      <Icon name="mic" size={20} />
      <Icon name="camera" size={20} />
    </div>
  )
}

function SearchHome({ values, onChange }) {
  return (
    <div className="g-home">
      <img className="g-logo" src="/brands/google.png" alt="Google" />
      <GoogleBox>
        <input
          data-guide="query"
          aria-label="Search"
          autoComplete="off"
          value={values.query ?? ''}
          onChange={(event) => onChange('query', event.target.value)}
        />
      </GoogleBox>
      <div className="g-buttons">
        <Tap id="search" className="g-button">Google Search</Tap>
        <Tap id="lucky" className="g-button">I&apos;m Feeling Lucky</Tap>
      </div>
      <p className="g-offered">Google offered in: <span lang="ur">اردو</span></p>
    </div>
  )
}

const G_RESULTS = [
  ['result', 'weather.example', 'https://weather.example', 'Karachi weather today and this week', 'Today 24°C and sunny. See the hourly forecast and the next 7 days.'],
  ['other', 'news.example', 'https://news.example › weather', 'Weather news this week', 'Rain is expected in some parts of the country on Friday.'],
]

function SearchResults() {
  return (
    <div className="g-results">
      <img className="g-small" src="/brands/google.png" alt="Google" />
      <GoogleBox><span className="g-query">weather</span></GoogleBox>
      <div className="g-tabs"><b>All</b><span>Images</span><span>News</span><span>Videos</span></div>
      <Tap id="ad" className="g-result">
        <small className="g-sponsored">Sponsored</small>
        <cite>win-prize.example</cite>
        <strong>Win a free phone now!</strong>
        <span>Claim your prize today. Limited offer.</span>
      </Tap>
      {G_RESULTS.map(([id, site, url, title, snippet]) => (
        <Tap key={id} id={id} className="g-result">
          <small>{site}</small>
          <cite>{url}</cite>
          <strong>{title}</strong>
          <span>{snippet}</span>
        </Tap>
      ))}
    </div>
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
  ...PAY_SCREENS,
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
