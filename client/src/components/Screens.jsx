import Icon from './Icons'
import SelfView from './SelfView'
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
  const items = [children].flat()
  const preview = items.filter((item) => item?.type === SelfView)
  const actions = items.filter((item) => item?.type !== SelfView)
  return (
    <div className="call">
      <div className="call-person">
        <div className="call-picture" aria-hidden="true">{face ? '🙂' : 'A'}</div>
        <strong>{name}</strong>
        <span>{status}</span>
      </div>
      {preview}
      <div className="call-actions">{actions}</div>
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

function CallCamera({ values, lang }) {
  return (
    <CallScreen status={values.muted ? 'Muted' : 'Camera on'} face>
      <SelfView lang={lang} />
      <Tap id="mute" className={values.muted ? 'round-button round-red' : 'round-button'}>
        {values.muted ? 'Unmute' : 'Mute'}
      </Tap>
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
    <div className="g-box" data-ring>
      <Icon name="plus" size={20} />
      {children}
      <Icon name="mic" size={20} />
      <Icon name="camera" size={20} />
    </div>
  )
}

function GoogleBar() {
  return (
    <div className="g-bar">
      <span>Gmail</span>
      <span>Images</span>
      <Icon name="grid" size={20} />
      <b className="g-account">S</b>
    </div>
  )
}

function SearchHome({ values, onChange }) {
  return (
    <div className="g-home">
      <GoogleBar />
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
      <div className="g-shortcuts">
        {[
          ['g-news', 'doc', 'News'],
          ['g-maps', 'home', 'Maps'],
          ['g-videos', 'game', 'Videos'],
          ['g-translate', 'spark', 'Translate'],
        ].map(([id, icon, label]) => (
          <Tap key={id} id={id} className="g-shortcut">
            <span><Icon name={icon} size={20} /></span>
            {label}
          </Tap>
        ))}
      </div>
      <div className="g-trending">
        <strong>Trending searches</strong>
        {[
          ['g-trend-1', 'Eid holidays 2026'],
          ['g-trend-2', 'Cricket score today'],
          ['g-trend-3', 'Petrol price today'],
        ].map(([id, label]) => (
          <Tap key={id} id={id} className="g-trend">
            <Icon name="search" size={16} /> {label}
          </Tap>
        ))}
      </div>
      <p className="g-offered">Google offered in: <span lang="ur">اردو</span></p>
      <footer className="g-footer">
        <span>Pakistan</span>
        <span>About · Privacy · Terms · Settings</span>
      </footer>
    </div>
  )
}

const G_RESULTS = [
  ['result', 'Weather Example', 'https://weather.example', 'Karachi weather today and this week', 'Today 24°C and sunny. See the hourly forecast and the next 7 days.'],
  ['other', 'News Example', 'https://news.example › weather', 'Weather news this week', 'Rain is expected in some parts of the country on Friday.'],
  ['other-2', 'Sky Example', 'https://sky.example › karachi', 'Is it going to rain tomorrow?', 'Check the chance of rain, wind and humidity for your city.'],
]

const G_DAYS = [
  ['Mon', '24°'],
  ['Tue', '26°'],
  ['Wed', '25°'],
  ['Thu', '23°'],
  ['Fri', '22°'],
]

const G_QUESTIONS = [
  ['g-q-1', 'What is the weather like in Karachi today?'],
  ['g-q-2', 'Will it rain this week?'],
  ['g-q-3', 'What is the hottest month in Karachi?'],
]

function SearchResults() {
  return (
    <div className="g-results">
      <div className="g-results-top">
        <img className="g-small" src="/brands/google.png" alt="Google" />
        <b className="g-account">S</b>
      </div>
      <GoogleBox><span className="g-query">weather</span></GoogleBox>
      <div className="g-tabs"><b>All</b><span>Images</span><span>News</span><span>Videos</span><span>Maps</span></div>
      <p className="g-count">About 2,140,000 results (0.42 seconds)</p>

      <Tap id="g-weather" className="g-weather">
        <span className="g-weather-now">
          <span className="g-sun" aria-hidden="true" />
          <strong>24°C</strong>
          <span>Karachi · Sunny</span>
        </span>
        <span className="g-days">
          {G_DAYS.map(([day, degrees]) => (
            <span key={day}><small>{day}</small>{degrees}</span>
          ))}
        </span>
      </Tap>

      <Tap id="ad" className="g-result">
        <small className="g-sponsored">Sponsored</small>
        <cite>win-prize.example</cite>
        <strong>Win a free phone now!</strong>
        <span>Claim your prize today. Limited offer.</span>
      </Tap>
      <Tap id={G_RESULTS[0][0]} className="g-result">
        <small>{G_RESULTS[0][1]}</small>
        <cite>{G_RESULTS[0][2]}</cite>
        <strong>{G_RESULTS[0][3]}</strong>
        <span>{G_RESULTS[0][4]}</span>
      </Tap>

      <div className="g-ask">
        <strong>People also ask</strong>
        {G_QUESTIONS.map(([id, question]) => (
          <Tap key={id} id={id} className="g-question">
            {question} <Icon name="down" size={16} />
          </Tap>
        ))}
      </div>

      {G_RESULTS.slice(1).map(([id, site, url, title, snippet]) => (
        <Tap key={id} id={id} className="g-result">
          <small>{site}</small>
          <cite>{url}</cite>
          <strong>{title}</strong>
          <span>{snippet}</span>
        </Tap>
      ))}

      <div className="g-related">
        <strong>Related searches</strong>
        <div>
          {['weather tomorrow', 'weather lahore', 'rain today', 'weather islamabad'].map((word) => (
            <Tap key={word} id={`g-rel-${word}`} className="g-chip">
              <Icon name="search" size={14} /> {word}
            </Tap>
          ))}
        </div>
      </div>
      <Tap id="g-next" className="g-more">More results</Tap>
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
