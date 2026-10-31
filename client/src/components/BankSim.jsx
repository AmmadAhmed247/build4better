import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  Copy,
  Droplet,
  Eye,
  EyeOff,
  Flame,
  Landmark,
  Receipt,
  Send,
  Smartphone,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BANK_LINES as LINE, RECIPIENT, TOPUP_NUMBER } from '../data/bankSim'
import { tr } from '../lib/i18n'

const START_BALANCE = 125000
const IBAN_FORMAT = /^PK\d{2}[A-Z]{4}[0-9A-Z]{16}$/

const DESTINATIONS = [
  ['Meezan Bank', Landmark],
  ['Easypaisa', Wallet],
  ['JazzCash', Wallet],
  ['HBL', Landmark],
]

const CATEGORIES = [
  ['Electricity', Zap, ['K-Electric', 'FESCO', 'LESCO']],
  ['Gas', Flame, ['SSGC', 'SNGPL']],
  ['Water', Droplet, ['KWSC', 'WASA']],
  ['Internet', Wifi, ['PTCL', 'StormFiber']],
]

const FIRST_BILLS = [
  { company: 'K-Electric', invoice: '04 29384 1234567 8', amount: 2450 },
  { company: 'SSGC', invoice: '04 29384 1234567 3', amount: 1320 },
]

function money(value) {
  return `Rs. ${value.toLocaleString('en-PK')}`
}

function digits(value) {
  return value.replace(/[\s-]/g, '').toUpperCase()
}

function dueDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 25).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function billFor(company, bills) {
  const known = bills.find((bill) => bill.company === company)
  if (known) return known
  return { company, invoice: `04 29384 1234567 ${company.length % 10}`, amount: 2450 }
}

function Primary({ guide, onClick, children, disabled }) {
  return (
    <button
      type="button"
      data-guide={guide}
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-mz-green px-4 text-lg font-bold text-white transition hover:bg-mz-dark active:scale-[0.98] disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Heading({ title, onBack }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        className="grid size-11 place-items-center rounded-xl border border-stone-300 bg-white transition hover:bg-stone-100"
      >
        <ArrowLeft size={22} />
      </button>
      <h2 className="text-xl font-bold text-mz-dark">{title}</h2>
    </div>
  )
}

function CopyRow({ label, value, guide, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-stone-200 py-2 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-stone-500">{label}</p>
        <p className="font-semibold break-all text-stone-900">{value}</p>
      </div>
      {onCopy && (
        <button
          type="button"
          data-guide={guide}
          onClick={() => onCopy(value)}
          className="flex min-h-11 flex-none items-center gap-1 rounded-xl border-2 border-mz-gold bg-white px-3 font-semibold text-mz-dark transition hover:bg-amber-50"
        >
          <Copy size={18} /> Copy
        </button>
      )}
    </div>
  )
}

function Field({ id, label, value, onChange, error, clip, mode = 'text' }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block font-semibold text-stone-800">{label}</label>
      <div className="flex gap-2">
        <input
          id={id}
          data-guide={id}
          value={value}
          inputMode={mode}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-14 w-full min-w-0 rounded-xl border-2 bg-white px-3 text-lg transition outline-none ${
            error ? 'border-red-400 bg-red-50' : 'border-stone-300 focus:border-mz-green'
          }`}
        />
        {clip !== undefined && (
          <button
            type="button"
            data-guide={`${id}-paste`}
            disabled={!clip}
            onClick={() => onChange(clip)}
            className="flex min-h-14 flex-none items-center gap-1 rounded-xl bg-mz-gold px-3 font-semibold text-mz-dark transition disabled:opacity-40"
          >
            <ClipboardPaste size={18} /> Paste
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-1 font-medium text-red-700">{error}</p>}
    </div>
  )
}

function Done({ title, rows, children }) {
  return (
    <div className="fade-up text-center">
      <CheckCircle2 size={84} className="mx-auto text-mz-green" />
      <h2 className="mt-2 text-2xl font-bold text-mz-dark">{title}</h2>
      <dl className="my-4 rounded-2xl bg-stone-50 p-3 text-left">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-stone-200 py-2 last:border-0">
            <dt className="text-stone-500">{label}</dt>
            <dd className="text-right font-semibold wrap-anywhere">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-2">{children}</div>
    </div>
  )
}

export default function BankSim({ lang, setGuide, onExit, onRealWorld }) {
  const [stage, setStage] = useState('dash')
  const [balance, setBalance] = useState(START_BALANCE)
  const [hidden, setHidden] = useState(false)
  const [activity, setActivity] = useState([])
  const [bills, setBills] = useState(FIRST_BILLS.map((bill) => ({ ...bill, status: 'Unpaid' })))
  const [clip, setClip] = useState('')
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [bank, setBank] = useState('')
  const [iban, setIban] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(null)
  const [bill, setBill] = useState(null)
  const [invoice, setInvoice] = useState('')
  const [phone, setPhone] = useState('')
  const toastTimer = useRef(null)

  // The avatar first points at Copy, then at Paste once something is copied.
  useEffect(() => {
    const copied = Boolean(clip)
    const steps = {
      dash: [LINE.dash, null],
      'send-bank': [LINE.sendBank, 'dest-0'],
      'send-account': copied ? [LINE.paste, 'iban-paste'] : [LINE.copyIban, 'copy-iban'],
      'send-amount': [LINE.amount, 'amount'],
      'send-review': [LINE.review, 'confirm-pay'],
      'send-done': [LINE.sendDone, 'real-world'],
      'bill-category': [LINE.billCategory, null],
      'bill-company': [LINE.billCompany, null],
      'bill-form': copied ? [LINE.paste, 'invoice-paste'] : [LINE.copyInvoice, 'copy-invoice'],
      'bill-details': [LINE.billDetails, 'pay-now'],
      'bill-done': [LINE.billDone, 'real-world'],
      topup: [LINE.topup, 'phone'],
      'topup-done': [LINE.done, null],
      bills: [LINE.myBills, null],
    }
    const [line, target] = steps[stage]
    setGuide({ line, target })
  }, [stage, clip, setGuide])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  function open(next) {
    setError('')
    setClip('')
    setStage(next)
  }

  function showError(text, line, target) {
    setError(text)
    setGuide({ line, target, tone: 'error' })
  }

  async function copy(value) {
    setClip(value)
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // The Paste button still works from the app's own copy.
    }
    clearTimeout(toastTimer.current)
    setToast('Copied to clipboard!')
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  function startSend() {
    setBank('')
    setIban('')
    setAmount('')
    open('send-bank')
  }

  function checkIban() {
    const value = digits(iban)
    if (!IBAN_FORMAT.test(value)) {
      showError(
        tr(lang, 'An IBAN has 24 characters and starts with PK.', 'IBAN 24 huroof ka hota hai aur PK se shuru hota hai.'),
        LINE.ibanFormat,
        'iban',
      )
    } else if (value !== RECIPIENT.iban) {
      showError(tr(lang, 'This account was not found.', 'Yeh account nahi mila.'), LINE.ibanUnknown, 'iban')
    } else {
      open('send-amount')
    }
  }

  function checkAmount() {
    const value = Number(amount)
    if (!Number.isInteger(value) || value <= 0) {
      showError(tr(lang, 'Please enter a valid amount.', 'Sahi raqam likhein.'), LINE.amountBad, 'amount')
    } else if (value > balance) {
      showError(tr(lang, 'Your balance is too low.', 'Balance kam hai.'), LINE.amountBad, 'amount')
    } else {
      setError('')
      setStage('send-review')
    }
  }

  function record(title, value) {
    setBalance((current) => current - value)
    setActivity((current) => [{ id: crypto.randomUUID(), title, value }, ...current].slice(0, 4))
  }

  function confirmSend() {
    record(`To ${RECIPIENT.name}`, Number(amount))
    setStage('send-done')
  }

  function chooseCompany(company) {
    setBill(billFor(company, bills))
    setInvoice('')
    open('bill-form')
  }

  function fetchBill() {
    if (digits(invoice) !== digits(bill.invoice)) {
      showError(
        tr(lang, 'This number does not match your bill.', 'Yeh number bill se nahi milta.'),
        LINE.invoiceBad,
        'invoice',
      )
      return
    }
    setError('')
    setStage('bill-details')
  }

  function payBill() {
    record(`${bill.company} bill`, bill.amount)
    setBills((current) => {
      const paid = { ...bill, status: 'Paid' }
      const exists = current.some((item) => item.company === bill.company)
      return exists ? current.map((item) => (item.company === bill.company ? paid : item)) : [...current, paid]
    })
    setStage('bill-done')
  }

  function finishTopup() {
    const value = Number(amount)
    if (digits(phone) !== TOPUP_NUMBER) {
      showError(tr(lang, 'Please check the number.', 'Number dobara dekhein.'), LINE.topupBad, 'phone')
    } else if (!Number.isInteger(value) || value <= 0 || value > balance) {
      showError(tr(lang, 'Please enter a valid amount.', 'Sahi raqam likhein.'), LINE.amountBad, 'amount')
    } else {
      record(`Top-up ${TOPUP_NUMBER}`, value)
      setError('')
      setStage('topup-done')
    }
  }

  const realWorld = (
    <button
      type="button"
      data-guide="real-world"
      onClick={onRealWorld}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-easy px-4 text-lg font-bold text-white transition hover:brightness-95"
    >
      {tr(lang, 'Try real world easypaisa', 'Real World easypaisa try karein')} <ArrowRight size={20} />
    </button>
  )
  const backHome = <Primary guide="dash-back" onClick={() => open('dash')}>{tr(lang, 'Back to dashboard', 'Wapas Dashboard')}</Primary>

  const helperTitle = tr(lang, 'Practice details', 'Practice ki tafseelat')
  const showRecipient = stage.startsWith('send-') && stage !== 'send-done'
  const showBill = stage === 'bill-form' || stage === 'bill-details'
  const showPhone = stage === 'topup'

  return (
    <main className="min-h-0 flex-1 overflow-y-auto text-stone-900">
      <header className="sticky top-0 z-10 bg-mz-dark text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
          <button type="button" onClick={onExit} className="flex min-h-11 items-center gap-1 border-0 bg-transparent font-semibold text-white">
            <ArrowLeft size={20} /> {tr(lang, 'Home', 'Home')}
          </button>
          <strong className="whitespace-nowrap text-mz-gold">Meezan Style<span className="hidden sm:inline"> Bank</span></strong>
          <span className="flex-none rounded-full bg-mz-gold px-2 py-0.5 text-sm font-bold whitespace-nowrap text-mz-dark">
            {tr(lang, 'Practice only', 'Sirf practice')}
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-4 p-4 pb-32 lg:grid-cols-[1fr_340px] lg:items-start lg:pb-4">
        <div className={`grid gap-4 lg:sticky lg:top-20 lg:order-2 ${showRecipient || showBill || showPhone ? '' : 'hidden lg:grid'}`}>
        {(showRecipient || showBill || showPhone) && (
          <aside className="fade-up rounded-2xl border-2 border-mz-gold bg-amber-50 p-4">
            <h3 className="mb-1 font-bold text-mz-dark">{helperTitle}</h3>
            {showRecipient && (
              <>
                <CopyRow label="Name" value={RECIPIENT.name} />
                <CopyRow label="Bank" value={RECIPIENT.bank} />
                <CopyRow label="IBAN" value={RECIPIENT.iban} guide="copy-iban" onCopy={copy} />
              </>
            )}
            {showBill && (
              <div className="rounded-xl bg-white p-3">
                <p className="font-bold">{bill.company}</p>
                <p className="text-sm text-stone-500">Sample bill · {RECIPIENT.name}</p>
                <CopyRow label="Consumer / Invoice No." value={bill.invoice} guide="copy-invoice" onCopy={copy} />
                <CopyRow label="Amount Due" value={money(bill.amount)} />
                <CopyRow label="Due Date" value={dueDate()} />
              </div>
            )}
            {showPhone && <CopyRow label="Mobile" value={TOPUP_NUMBER} />}
          </aside>
        )}
          <div data-guide="side-slot" className="hidden h-44 lg:block" />
        </div>

        <div key={stage} className="fade-up min-w-0 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          {stage === 'dash' && (
            <>
              <p className="text-stone-600">Assalam o Alaikum,</p>
              <h1 className="mb-3 text-2xl font-bold text-mz-dark">Saathi Practice</h1>
              <div className="rounded-2xl bg-gradient-to-br from-mz-dark to-mz-green p-5 text-white">
                <p className="opacity-90">{tr(lang, 'Pretend balance', 'Farzi balance')}</p>
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-3xl">{hidden ? 'Rs. ••••••' : money(balance)}</strong>
                  <button
                    type="button"
                    aria-label={hidden ? 'Show balance' : 'Hide balance'}
                    onClick={() => setHidden(!hidden)}
                    className="grid size-11 place-items-center rounded-xl bg-white/15"
                  >
                    {hidden ? <Eye size={22} /> : <EyeOff size={22} />}
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ['bank-send', Send, 'Send Money', startSend],
                  ['bank-bill', Receipt, 'Bill Payment', () => open('bill-category')],
                  [
                    'bank-topup',
                    Smartphone,
                    'Top-up',
                    () => {
                      setPhone('')
                      setAmount('')
                      open('topup')
                    },
                  ],
                  ['bank-bills', Wallet, 'My Bills', () => open('bills')],
                ].map(([guide, Icon, label, action]) => (
                  <button
                    type="button"
                    key={guide}
                    data-guide={guide}
                    onClick={action}
                    className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white font-bold text-mz-dark transition hover:-translate-y-0.5 hover:border-mz-gold hover:shadow"
                  >
                    <Icon size={32} className="text-mz-green" /> {label}
                  </button>
                ))}
              </div>
              {activity.length > 0 && (
                <section className="mt-4">
                  <h3 className="font-bold">{tr(lang, 'Recent payments', 'Haal hi ki adaigiyan')}</h3>
                  {activity.map((item) => (
                    <p key={item.id} className="flex justify-between border-b border-stone-200 py-2">
                      <span>{item.title}</span>
                      <b>− {money(item.value)}</b>
                    </p>
                  ))}
                </section>
              )}
            </>
          )}

          {stage === 'send-bank' && (
            <>
              <Heading title={tr(lang, 'Select destination bank', 'Bank chunein')} onBack={() => open('dash')} />
              <div className="grid gap-2">
                {DESTINATIONS.map(([name, Icon], index) => (
                  <button
                    type="button"
                    key={name}
                    data-guide={`dest-${index}`}
                    onClick={() => {
                      setBank(name)
                      open('send-account')
                    }}
                    className="flex min-h-16 items-center gap-3 rounded-2xl border border-stone-200 px-4 text-lg font-semibold transition hover:border-mz-green"
                  >
                    <Icon className="text-mz-green" /> {name}
                  </button>
                ))}
              </div>
            </>
          )}

          {stage === 'send-account' && (
            <>
              <Heading title={`${tr(lang, 'Enter IBAN', 'IBAN likhein')}: ${bank}`} onBack={() => open('send-bank')} />
              <Field id="iban" label="IBAN" value={iban} clip={clip} error={error} onChange={(value) => { setIban(value); setError('') }} />
              <Primary guide="iban-next" onClick={checkIban}>{tr(lang, 'Verify account', 'Tasdeeq karein')}</Primary>
            </>
          )}

          {stage === 'send-amount' && (
            <>
              <Heading title={tr(lang, 'Enter amount', 'Raqam likhein')} onBack={() => setStage('send-account')} />
              <p className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 font-semibold text-mz-dark">
                <CheckCircle2 size={20} /> {RECIPIENT.name}
              </p>
              <Field id="amount" label="Amount (Rs.)" mode="numeric" value={amount} error={error} onChange={(value) => { setAmount(value); setError('') }} />
              <Primary guide="amount-next" onClick={checkAmount}>{tr(lang, 'Continue', 'Aage barhein')}</Primary>
            </>
          )}

          {stage === 'send-review' && (
            <>
              <Heading title={tr(lang, 'Review transaction', 'Dobara dekh lein')} onBack={() => setStage('send-amount')} />
              <p className="mb-4 rounded-2xl bg-stone-50 p-4 text-lg">
                Sending <b>{money(Number(amount))}</b> to <b>{RECIPIENT.name}</b> from <b>Meezan Bank</b> to <b>{bank}</b>
              </p>
              <Primary guide="confirm-pay" onClick={confirmSend}>Confirm &amp; Pay</Primary>
            </>
          )}

          {stage === 'send-done' && (
            <Done
              title={tr(lang, 'Money sent', 'Paise bhej diye gaye')}
              rows={[['To', RECIPIENT.name], ['Amount', money(Number(amount))], ['Bank', bank], ['Balance', money(balance)]]}
            >
              {realWorld}
              {backHome}
            </Done>
          )}

          {stage === 'bill-category' && (
            <>
              <Heading title="Bill Payment" onBack={() => open('dash')} />
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((item) => {
                  const [name, Icon] = item
                  return (
                    <button
                      type="button"
                      key={name}
                      data-guide={`cat-${name}`}
                      onClick={() => {
                        setCategory(item)
                        setStage('bill-company')
                      }}
                      className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 font-bold transition hover:border-mz-green"
                    >
                      <Icon size={32} className="text-mz-green" /> {name}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {stage === 'bill-company' && (
            <>
              <Heading title={category[0]} onBack={() => setStage('bill-category')} />
              <div className="grid gap-2">
                {category[2].map((company) => (
                  <button
                    type="button"
                    key={company}
                    data-guide={`company-${company}`}
                    onClick={() => chooseCompany(company)}
                    className="min-h-16 rounded-2xl border border-stone-200 px-4 text-left text-lg font-semibold transition hover:border-mz-green"
                  >
                    {company}
                  </button>
                ))}
              </div>
            </>
          )}

          {stage === 'bill-form' && (
            <>
              <Heading title={bill.company} onBack={() => open('bill-category')} />
              <Field id="invoice" label="Consumer / Invoice No." value={invoice} clip={clip} error={error} onChange={(value) => { setInvoice(value); setError('') }} />
              <Primary guide="fetch-bill" onClick={fetchBill}>Verify / Fetch Bill</Primary>
            </>
          )}

          {stage === 'bill-details' && (
            <>
              <Heading title={tr(lang, 'Bill details', 'Bill ki tafseel')} onBack={() => setStage('bill-form')} />
              <dl className="mb-4 rounded-2xl bg-stone-50 p-3">
                {[
                  ['Consumer Name', RECIPIENT.name],
                  ['Due Date', dueDate()],
                  ['Billing Amount', money(bill.amount)],
                  ['Status', 'Unpaid'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-stone-200 py-2 last:border-0">
                    <dt className="text-stone-500">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <Primary guide="pay-now" onClick={payBill}>Pay Now</Primary>
            </>
          )}

          {stage === 'bill-done' && (
            <Done
              title={tr(lang, 'Bill paid', 'Bill ada ho gaya')}
              rows={[['Company', bill.company], ['Invoice', bill.invoice], ['Amount', money(bill.amount)], ['Status', 'Paid'], ['Balance', money(balance)]]}
            >
              {realWorld}
              {backHome}
            </Done>
          )}

          {stage === 'topup' && (
            <>
              <Heading title="Top-up" onBack={() => open('dash')} />
              <Field id="phone" label="Mobile Number" mode="numeric" value={phone} error={error} onChange={(value) => { setPhone(value); setError('') }} />
              <Field id="amount" label="Amount (Rs.)" mode="numeric" value={amount} onChange={setAmount} />
              <Primary guide="topup-next" onClick={finishTopup}>Top-up Now</Primary>
            </>
          )}

          {stage === 'topup-done' && (
            <Done title={tr(lang, 'Top-up done', 'Top-up ho gaya')} rows={[['Mobile', phone], ['Amount', money(Number(amount))], ['Balance', money(balance)]]}>
              {backHome}
            </Done>
          )}

          {stage === 'bills' && (
            <>
              <Heading title="My Bills" onBack={() => open('dash')} />
              <div className="grid gap-2">
                {bills.map((item) => (
                  <div key={item.company} className="flex items-center justify-between gap-2 rounded-2xl border border-stone-200 p-3">
                    <div>
                      <p className="font-bold">{item.company}</p>
                      <p className="text-stone-500">{money(item.amount)}</p>
                    </div>
                    {item.status === 'Paid' ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-mz-dark">Paid</span>
                    ) : (
                      <button
                        type="button"
                        data-guide={`pay-${item.company}`}
                        onClick={() => chooseCompany(item.company)}
                        className="min-h-11 rounded-xl bg-mz-green px-4 font-bold text-white"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && (
        <p role="status" className="fade-up fixed top-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-stone-900 px-5 py-2 font-semibold whitespace-nowrap text-white shadow-lg">
          {toast}
        </p>
      )}
    </main>
  )
}
