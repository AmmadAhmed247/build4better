import Icon from './Icons'
import { tr } from '../lib/i18n'

const PAY_FROM = 'Rs.'

function Tap({ id, className = 'pay-btn', children }) {
  return (
    <button type="button" data-guide={id} className={className}>
      {children}
    </button>
  )
}

function Head({ title, sub, logo }) {
  return (
    <header className="pay-head">
      <span className="pay-back" aria-hidden="true"><Icon name="back" size={20} /></span>
      <div className="pay-title">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {logo && <img src={logo} alt="" />}
      </div>
    </header>
  )
}

function Field({ id, label, value, onChange, mode = 'numeric', type = 'text' }) {
  return (
    <label className="pay-label">
      {label}
      <input
        data-guide={id}
        className="pay-input"
        type={type}
        inputMode={mode}
        autoComplete="off"
        value={value ?? ''}
        onChange={(event) => onChange(id, event.target.value)}
      />
    </label>
  )
}

function EpLogin({ values, onChange }) {
  return (
    <div className="pay-center">
      <img className="pay-logo" src="/brands/easypaisa.png" alt="easypaisa" />
      <Field id="pin" label="Enter your 5 digit PIN" type="password" value={values.pin} onChange={onChange} />
      <Tap id="login">Sign in</Tap>
      <Tap id="forgot" className="pay-link">Forgot PIN?</Tap>
    </div>
  )
}

const EP_TILES = [
  ['send-money', 'send', 'Send Money'],
  ['bill-payment', 'bill', 'Bill Payment'],
  ['loads', 'load', 'Loads & Packages'],
  ['easycash', 'cash', 'Easycash'],
  ['deposit', 'deposit', 'Term Deposit'],
  ['insurance', 'umbrella', 'Insurance'],
  ['rewards', 'gift', 'Rewards'],
  ['games', 'game', 'Games'],
  ['see-all', 'grid', 'See All'],
]

const EP_NAV = [
  ['home', 'Home'],
  ['card', 'Cards'],
  ['scan', 'Pay'],
  ['tag', 'Promotions'],
  ['crown', 'Zen'],
]

function EpHome({ balance }) {
  return (
    <div className="ep">
      <div className="ep-top">
        <span className="ep-avatar">SP</span>
        <strong>Hey There 👋</strong>
        <span className="ep-bell"><Icon name="bell" /></span>
      </div>
      <div className="ep-search"><Icon name="search" size={18} /> Search or Ask</div>
      <div className="ep-balance">
        <span>easypaisa Account <Icon name="down" size={14} /></span>
        <strong>Rs. {balance.toLocaleString('en-PK')}.00</strong>
        <small>Hide Balance <Icon name="eye" size={14} /></small>
      </div>
      <h3 className="ep-section">More with easypaisa</h3>
      <div className="ep-tiles">
        {EP_TILES.map(([id, icon, label]) => (
          <Tap key={id} id={id} className="ep-tile">
            <Icon name={icon} size={24} />
            <span>{label}</span>
          </Tap>
        ))}
      </div>
      <nav className="ep-nav">
        {EP_NAV.map(([icon, label], index) => (
          <span key={label} className={index === 0 ? 'is-on' : ''}>
            <Icon name={icon} size={20} />
            {label}
          </span>
        ))}
      </nav>
    </div>
  )
}

const EP_SHEET = [
  ['sheet-easypaisa', null, 'easypaisa'],
  ['sheet-bank', 'bank', 'Bank'],
  ['sheet-wallet', 'wallet', 'Wallet'],
  ['sheet-raast', 'raast', 'Raast'],
  ['sheet-cnic', 'id', 'CNIC'],
]

function EpSheet({ balance }) {
  return (
    <div className="ep-sheet-wrap">
      <EpHome balance={balance} />
      <div className="ep-dim">
        <div className="ep-sheet">
          <h3>Send Money</h3>
          <div className="ep-sheet-grid">
            {EP_SHEET.map(([id, icon, label]) => (
              <Tap key={id} id={id} className="ep-sheet-tile">
                {icon ? <Icon name={icon} size={30} /> : <img src="/brands/easypaisa.png" alt="" />}
                <span>{label}</span>
              </Tap>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EpTransfer({ values, onChange, data }) {
  return (
    <div className="pay-page">
      <Head title={data.title} />
      <div className="pay-tabs">
        <span className="is-on">Send Money</span>
        <span>History</span>
      </div>
      <div className="pay-body">
        <div className="pay-switch">
          <span className="is-on"><Icon name="user" size={16} /> Mobile No.</span>
          <span><Icon name="card" size={16} /> {data.raast ? 'IBAN' : 'Digital Account No.'}</span>
        </div>
        <Field
          id="number"
          label={data.raast ? 'Enter Raast ID (Mobile No.)' : 'Enter or Select Receiver Number'}
          value={values.number}
          onChange={onChange}
        />
        <div className="pay-row">
          <span className="pay-plus"><Icon name="plus" size={16} /></span>
          <b>{values.number || 'Receiver'}</b>
          <Tap id="select" className="pay-text">Select</Tap>
        </div>
      </div>
    </div>
  )
}

function PayAmount({ values, onChange, data, balance }) {
  return (
    <div className="pay-page">
      <Head title="Enter Amount" sub={`Pay To: ${data.name}`} logo={data.logo} />
      <div className="pay-amount">
        <label>
          <span>Rs.</span>
          <input
            data-guide="amount"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Amount"
            placeholder="0"
            value={values.amount ?? ''}
            onChange={(event) => onChange('amount', event.target.value)}
          />
        </label>
        <p>My Balance: <b>{PAY_FROM} {balance.toLocaleString('en-PK')}.00</b></p>
        <span className="pay-note">+ Add a Message</span>
        <Tap id="amount-next">Next</Tap>
      </div>
    </div>
  )
}

function PayConfirm({ values, data, balance }) {
  return (
    <div className="pay-page">
      <Head title="Confirm Transaction" />
      <div className="pay-body">
        <h4>Pay From</h4>
        <div className="pay-card">
          <b>{data.wallet}</b>
          <span>Balance: Rs. {balance.toLocaleString('en-PK')}.00</span>
        </div>
        <h4>Pay To</h4>
        <div className="pay-card">
          <b>{data.name}</b>
          <span className="pay-wrap">{data.number}</span>
        </div>
        <h4>Payment Summary</h4>
        <div className="pay-card pay-summary">
          <p><span>Transfer Amount</span><span>Rs. {values.amount}</span></p>
          <p><span>Fee (including tax)</span><span>Free</span></p>
          <p className="pay-total"><span>Total Amount</span><span>Rs. {values.amount}.00</span></p>
        </div>
        <Tap id="send-now">Send Now</Tap>
      </div>
    </div>
  )
}

function PaySuccess({ data }) {
  return (
    <div className="pay-success">
      <span className="pay-tick"><Icon name="check" size={46} /></span>
      <h2>Rs. {data.amount}.00</h2>
      <p>Successfully {data.amountLabel} to</p>
      {data.logo && <img src={data.logo} alt="" />}
      <b>{data.name}</b>
      <span className="pay-wrap">{data.number}</span>
      <div className="pay-success-actions">
        <Tap id="back-home" className="pay-outline">Back to home</Tap>
        <Tap id="share" className="pay-circle"><Icon name="share" size={20} /></Tap>
        <Tap id="receipt" className="pay-circle"><Icon name="doc" size={20} /></Tap>
      </div>
    </div>
  )
}

function EpBanks() {
  const banks = [['bank-meezan', 'Meezan Bank'], ['bank-hbl', 'HBL'], ['bank-ubl', 'UBL'], ['bank-abl', 'Allied Bank']]
  return (
    <div className="pay-page">
      <Head title="Select Bank" />
      <div className="pay-body">
        {banks.map(([id, name]) => (
          <Tap key={id} id={id} className="pay-list">
            <span className="pay-mark">{name[0]}</span>
            {name}
            <Icon name="chevron" size={18} />
          </Tap>
        ))}
      </div>
    </div>
  )
}

function EpAccount({ values }) {
  const iban = values.ibanTab
  return (
    <div className="pay-page">
      <Head title="Account Details" sub="Bank selected: Meezan Bank" />
      <div className="pay-body">
        <div className="pay-switch">
          <Tap id="tab-account" className={iban ? 'pay-seg' : 'pay-seg is-on'}><Icon name="user" size={16} /> Account No.</Tap>
          <Tap id="tab-iban" className={iban ? 'pay-seg is-on' : 'pay-seg'}><Icon name="card" size={16} /> IBAN</Tap>
        </div>
        <label className="pay-label">
          Enter Receiver&apos;s {iban ? 'IBAN' : 'Account Number'}
          <div className="pay-input pay-readonly pay-wrap" data-guide="iban-box">{values.iban || ' '}</div>
        </label>
        {iban && <Tap id="paste" className="pay-chip">Paste</Tap>}
        <label className="pay-label">
          Select Purpose of Payment
          <div className="pay-input pay-readonly">Others <Icon name="down" size={16} /></div>
        </label>
        <Tap id="details-next">Next</Tap>
      </div>
    </div>
  )
}

function IbanExplain({ lang }) {
  return (
    <div className="pay-page">
      <Head title="What is an IBAN?" />
      <div className="pay-body">
        <p className="iban-sample">
          <mark>PK</mark><mark className="alt">00</mark><mark>MEZN</mark><span>0000000000000001</span>
        </p>
        <ul className="iban-key">
          <li><b>PK</b> Pakistan</li>
          <li><b>00</b> {tr(lang, 'Check digits', 'Check number')}</li>
          <li><b>MEZN</b> {tr(lang, 'Bank code', 'Bank ka code')}</li>
          <li><b>16</b> {tr(lang, 'Account number', 'Account number')}</li>
        </ul>
        <Tap id="iban-understood">{tr(lang, 'I understand', 'Samajh Gaya')}</Tap>
      </div>
    </div>
  )
}

function RaastExplain({ lang }) {
  return (
    <div className="pay-page">
      <Head title="What is Raast?" />
      <div className="pay-body">
        <div className="raast-flow">
          <span><Icon name="wallet" size={26} /> easypaisa</span>
          <b><Icon name="flash" size={22} /></b>
          <span><Icon name="bank" size={26} /> {tr(lang, 'Bank', 'Bank')}</span>
        </div>
        <ul className="iban-key">
          <li><b>Raast</b> {tr(lang, 'Run by the State Bank', 'State Bank ka nizam')}</li>
          <li><b>{tr(lang, 'Fast', 'Tez')}</b> {tr(lang, 'Arrives in seconds', 'Seconds mein')}</li>
          <li><b>Raast ID</b> {tr(lang, 'Often your mobile number', 'Aksar mobile number')}</li>
        </ul>
        <Tap id="raast-understood">{tr(lang, 'I understand', 'Samajh Gaya')}</Tap>
      </div>
    </div>
  )
}

const EP_BILLS = [
  ['cat-electricity', 'flash', 'Electricity'],
  ['cat-gas', 'flame', 'Gas'],
  ['cat-water', 'drop', 'Water'],
  ['cat-internet', 'wifi', 'Internet'],
  ['cat-invoice', 'voucher', 'Invoice / Voucher'],
  ['cat-mobile', 'phone', 'Mobile Postpaid'],
]

function EpBills() {
  return (
    <div className="pay-page">
      <Head title="Bill Payment" />
      <div className="pay-body ep-tiles ep-tiles-bills">
        {EP_BILLS.map(([id, icon, label]) => (
          <Tap key={id} id={id} className="ep-tile">
            <Icon name={icon} size={28} />
            <span>{label}</span>
          </Tap>
        ))}
      </div>
    </div>
  )
}

function EpCompanies({ data }) {
  return (
    <div className="pay-page">
      <Head title={data.categoryName} sub="Select Company" />
      <div className="pay-body">
        {data.companies.map(([id, name]) => (
          <Tap key={id} id={id} className="pay-list">
            <span className="pay-mark">{name[0]}</span>
            {name}
            <Icon name="chevron" size={18} />
          </Tap>
        ))}
      </div>
    </div>
  )
}

function EpBillForm({ values, onChange, data }) {
  return (
    <div className="pay-page">
      <Head title={data.company} sub="Enter bill details" logo={data.paperLogo} />
      <div className="pay-body">
        <Field id="reference" label={`Enter ${data.refLabel}`} value={values.reference} onChange={onChange} />
        <p className="pay-hint">The number is printed on your bill.</p>
        <Tap id="ref-next">Next</Tap>
      </div>
    </div>
  )
}

function EpBillDetails({ data }) {
  return (
    <div className="pay-page">
      <Head title="Bill Details" sub={data.company} logo={data.paperLogo} />
      <div className="pay-body">
        <div className="pay-card pay-summary">
          <p><span>{data.refLabel}</span><span>{data.reference}</span></p>
          <p><span>Billing Month</span><span>{data.month}</span></p>
          <p><span>Due Date</span><span>{data.due}</span></p>
          <p><span>After Due Date</span><span>Rs. {data.late}</span></p>
          <p className="pay-total"><span>Amount Due</span><span>Rs. {data.amount}</span></p>
        </div>
        <Tap id="pay-now">Pay Now</Tap>
      </div>
    </div>
  )
}

function BillPaper({ data }) {
  return (
    <div className="paper">
      <div className="paper-head">
        {data.paperLogo ? <img src={data.paperLogo} alt="" /> : <strong>{data.company}</strong>}
        <span>Sample bill</span>
      </div>
      <p className="paper-name">{data.name}</p>
      <Tap id="paper-ref" className="paper-field">
        <small>{data.refLabel}</small>
        <b>{data.reference}</b>
      </Tap>
      <div className="paper-grid">
        <Tap id="paper-amount" className="paper-field">
          <small>Amount Due</small>
          <b>Rs. {data.amount}</b>
        </Tap>
        <Tap id="paper-date" className="paper-field">
          <small>Due Date</small>
          <b>{data.due}</b>
        </Tap>
      </div>
      <div className="paper-bars" aria-hidden="true" />
    </div>
  )
}

function JcLogin({ values, onChange }) {
  return (
    <div className="pay-center">
      <img className="pay-logo" src="/brands/jazzcash.png" alt="JazzCash" />
      <Field id="pin" label="Enter MPIN" type="password" value={values.pin} onChange={onChange} />
      <Tap id="login">Sign in</Tap>
      <Tap id="forgot" className="pay-link">Forgot MPIN?</Tap>
    </div>
  )
}

const JC_TILES = [
  ['jc-send', 'send', 'Send Money'],
  ['jc-bills', 'bill', 'Pay Bills'],
  ['jc-load', 'load', 'Mobile Load'],
  ['jc-qr', 'scan', 'Scan QR'],
  ['jc-cards', 'card', 'Cards'],
  ['jc-more', 'grid', 'More'],
]

function JcHome({ balance }) {
  return (
    <div className="jc">
      <div className="jc-top">
        <span>Practice Wallet</span>
        <strong>Rs. {balance.toLocaleString('en-PK')}.00</strong>
      </div>
      <div className="ep-tiles jc-tiles">
        {JC_TILES.map(([id, icon, label]) => (
          <Tap key={id} id={id} className="ep-tile">
            <Icon name={icon} size={26} />
            <span>{label}</span>
          </Tap>
        ))}
      </div>
    </div>
  )
}

function JcSend({ values, onChange }) {
  return (
    <div className="pay-page">
      <Head title="Send Money" sub="To JazzCash Account" logo="/brands/jazzcash.png" />
      <div className="pay-body">
        <Field id="number" label="Enter Mobile Number" value={values.number} onChange={onChange} />
        <Tap id="select">Continue</Tap>
      </div>
    </div>
  )
}

function MzLogin({ values, onChange }) {
  return (
    <div className="pay-center">
      <div className="mz-mark" aria-label="Meezan Bank practice">Meezan Bank</div>
      <Field id="pin" label="Password" type="password" value={values.pin} onChange={onChange} />
      <Tap id="login">Login</Tap>
      <Tap id="forgot" className="pay-link">Forgot Password?</Tap>
    </div>
  )
}

const MZ_TILES = [
  ['mz-transfer', 'send', 'Fund Transfer'],
  ['mz-bills', 'bill', 'Bill Payment'],
  ['mz-accounts', 'bank', 'My Accounts'],
  ['mz-raast', 'raast', 'Raast'],
  ['mz-cards', 'card', 'Debit Card'],
  ['mz-more', 'grid', 'More'],
]

function MzHome({ balance }) {
  return (
    <div className="mz">
      <div className="mz-top">
        <span>Current Account</span>
        <strong>PKR {balance.toLocaleString('en-PK')}.00</strong>
      </div>
      <div className="ep-tiles jc-tiles">
        {MZ_TILES.map(([id, icon, label]) => (
          <Tap key={id} id={id} className="ep-tile">
            <Icon name={icon} size={26} />
            <span>{label}</span>
          </Tap>
        ))}
      </div>
    </div>
  )
}

function MzPayee({ values }) {
  return (
    <div className="pay-page">
      <Head title="Fund Transfer" sub="Other Bank Account" />
      <div className="pay-body">
        <label className="pay-label">
          IBAN
          <div className="pay-input pay-readonly pay-wrap">{values.iban || ' '}</div>
        </label>
        <Tap id="paste" className="pay-chip">Paste</Tap>
        <Tap id="details-next">Continue</Tap>
      </div>
    </div>
  )
}

export const PAY_SCREENS = {
  'ep-login': EpLogin,
  'ep-home': EpHome,
  'ep-sheet': EpSheet,
  'ep-transfer': EpTransfer,
  'ep-banks': EpBanks,
  'ep-account': EpAccount,
  'ep-bills': EpBills,
  'ep-companies': EpCompanies,
  'ep-bill-form': EpBillForm,
  'ep-bill-details': EpBillDetails,
  'pay-amount': PayAmount,
  'pay-confirm': PayConfirm,
  'pay-success': PaySuccess,
  'bill-paper': BillPaper,
  'iban-explain': IbanExplain,
  'raast-explain': RaastExplain,
  'jc-login': JcLogin,
  'jc-home': JcHome,
  'jc-send': JcSend,
  'mz-login': MzLogin,
  'mz-home': MzHome,
  'mz-payee': MzPayee,
}
