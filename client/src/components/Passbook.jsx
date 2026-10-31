import {
  BadgeCheck,
  ChevronRight,
  Flame,
  Landmark,
  Receipt,
  Send,
  Wallet,
  Zap,
} from 'lucide-react'
import { addUrdu } from '../lib/i18n'
import PageHeader from './PageHeader'

const T = (en, ru, ur) => ({ en, ru, ur })

const TEXT = {
  title: T('My Passbook', 'Meri Passbook', 'میری پاس بک'),
  lead: T(
    'See where your money went, then practise a payment.',
    'Dekhein paise kahan gaye, phir payment ki practice karein.',
    'دیکھیں پیسے کہاں گئے، پھر ادائیگی کی پریکٹس کریں۔',
  ),
  practice: T('Pretend money, for practice only', 'Farzi paise, sirf practice ke liye', 'فرضی پیسے، صرف پریکٹس کے لیے'),
  holder: T('Account holder', 'Account wale ka naam', 'اکاؤنٹ والے کا نام'),
  number: T('Account number', 'Account number', 'اکاؤنٹ نمبر'),
  period: T('Month', 'Mahina', 'مہینہ'),
  available: T('Money in your account', 'Aap ke account mein paise', 'آپ کے اکاؤنٹ میں پیسے'),
  opening: T('Start of month', 'Mahine ke shuru mein', 'مہینے کے شروع میں'),
  moneyIn: T('Money in', 'Paise aaye', 'پیسے آئے'),
  moneyOut: T('Money out', 'Paise gaye', 'پیسے گئے'),
  entries: T('This month', 'Is mahine', 'اس مہینے'),
  optionsTitle: T('What would you like to practise?', 'Aap kis cheez ki practice karna chahte hain?', 'آپ کس چیز کی پریکٹس کرنا چاہتے ہیں؟'),
}

const ACCOUNT = { holder: 'Saathi Practice', number: '0000 0000 0001', period: 'Oct 2026', opening: 50000 }

const ENTRIES = [
  { id: 'pension', amount: 35000, label: T('Pension received', 'Pension aayi', 'پنشن آئی') },
  { id: 'electric', amount: -6591, label: T('K-Electric bill', 'K-Electric ka bill', 'کے الیکٹرک کا بل') },
  { id: 'gas', amount: -1850, label: T('SSGC gas bill', 'SSGC gas ka bill', 'ایس ایس جی سی گیس کا بل') },
  { id: 'ahmed', amount: -500, label: T('Sent to Ahmed Raza', 'Ahmed Raza ko bheje', 'احمد رضا کو بھیجے') },
]

const OPTIONS = [
  { id: 'ep-send', icon: Send, title: T('Send money', 'Paise bhejna', 'پیسے بھیجنا'), hint: T('To a mobile number', 'Mobile number par', 'موبائل نمبر پر') },
  { id: 'ep-ke', icon: Zap, title: T('Pay electricity bill', 'Bijli ka bill dena', 'بجلی کا بل دینا'), hint: T('Using your bill number', 'Bill ke number se', 'بل کے نمبر سے') },
  { id: 'ep-gas', icon: Flame, title: T('Pay gas bill', 'Gas ka bill dena', 'گیس کا بل دینا'), hint: T('Using your consumer number', 'Consumer number se', 'کنزیومر نمبر سے') },
  { id: 'ep-invoice', icon: Receipt, title: T('Pay a fee voucher', 'Fee voucher dena', 'فیس واؤچر دینا'), hint: T('Using an invoice number', 'Invoice number se', 'انوائس نمبر سے') },
  { id: 'ep-iban', icon: Landmark, title: T('Send to a bank', 'Bank mein bhejna', 'بینک میں بھیجنا'), hint: T('Using an IBAN', 'IBAN se', 'آئی بان سے') },
  { id: 'ep-raast', icon: Wallet, title: T('Pay with Raast', 'Raast se dena', 'راست سے دینا'), hint: T('Arrives in seconds', 'Seconds mein', 'سیکنڈوں میں') },
]

addUrdu(TEXT)

function rupees(value) {
  return `Rs ${Math.abs(value).toLocaleString('en-PK')}`
}

function totals(opening, entries) {
  const moneyIn = entries.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0)
  const moneyOut = entries.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum - entry.amount, 0)
  return { moneyIn, moneyOut, available: opening + moneyIn - moneyOut }
}

// Rows arrive one after another, like lines being printed in a passbook.
function Printed({ order, className = '', children }) {
  return (
    <div className={`motion-safe:animate-fade-slide ${className}`} style={{ animationDelay: `${order * 70}ms` }}>
      {children}
    </div>
  )
}

function AccountDetails({ lang, account }) {
  const rows = [
    [TEXT.holder, account.holder, false],
    [TEXT.number, account.number, true],
    [TEXT.period, account.period, true],
  ]
  return (
    <dl className="m-0">
      {rows.map(([label, value, printed], index) => (
        <Printed key={label.en} order={index} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-emerald-100 py-2">
          <dt className="text-lg text-stone-600">{label[lang]}</dt>
          <dd dir="ltr" className={`m-0 text-lg font-medium text-stone-900 ${printed ? 'font-mono' : ''}`}>{value}</dd>
        </Printed>
      ))}
    </dl>
  )
}

function BalanceMetrics({ lang, opening, entries }) {
  const { moneyIn, moneyOut, available } = totals(opening, entries)
  const metrics = [
    [TEXT.opening, rupees(opening), 'text-stone-900'],
    [TEXT.moneyIn, `+ ${rupees(moneyIn)}`, 'text-accent-strong'],
    [TEXT.moneyOut, `- ${rupees(moneyOut)}`, 'text-red-700'],
  ]
  return (
    <section aria-label={TEXT.available[lang]}>
      <Printed order={3} className="mt-5">
        <p className="text-lg font-medium text-stone-700">{TEXT.available[lang]}</p>
        <p dir="ltr" className="mt-1 font-mono text-4xl font-normal tracking-tight text-accent-strong sm:text-5xl rtl:text-right">
          {rupees(available)}
        </p>
      </Printed>

      <dl className="mt-4 mb-0">
        {metrics.map(([label, value, tone], index) => (
          <Printed key={label.en} order={4 + index} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-emerald-100 py-2">
            <dt className="text-lg text-stone-600">{label[lang]}</dt>
            <dd dir="ltr" className={`m-0 font-mono text-lg ${tone}`}>{value}</dd>
          </Printed>
        ))}
      </dl>

      <h2 className="mt-6 mb-1 text-xl font-bold text-stone-900">{TEXT.entries[lang]}</h2>
      <ul className="m-0 list-none p-0">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <Printed order={7 + index} className="flex flex-wrap items-baseline justify-between gap-x-4 border-0 border-b border-dashed border-emerald-200 py-2">
              <span className="text-lg text-stone-800">{entry.label[lang]}</span>
              <span dir="ltr" className={`font-mono text-lg ${entry.amount > 0 ? 'text-accent-strong' : 'text-stone-800'}`}>
                {entry.amount > 0 ? '+' : '-'} {rupees(entry.amount)}
              </span>
            </Printed>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PaymentOptions({ lang, options, onStart }) {
  return (
    <section aria-labelledby="passbook-options">
      <h2 id="passbook-options" className="mb-3 text-2xl font-bold text-stone-900">{TEXT.optionsTitle[lang]}</h2>
      <ul className="m-0 grid list-none gap-2 p-0">
        {options.map(({ id, icon: Icon, title, hint }, index) => (
          <li key={id}>
            <Printed order={index + 2}>
              <button
                type="button"
                data-guide={`passbook-${id}`}
                onClick={() => onStart(id)}
                className="group flex min-h-20 w-full items-center gap-3 rounded-xl border-2 border-transparent bg-light-green-50 px-3 text-left transition-colors hover:border-accent focus-visible:border-accent"
              >
                <Icon size="1.75rem" className="flex-none text-accent-strong" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <strong className="block text-xl font-bold text-stone-900">{title[lang]}</strong>
                  <span className="block text-lg text-stone-600">{hint[lang]}</span>
                </span>
                <ChevronRight
                  size="1.5rem"
                  className="flex-none text-accent-strong transition-transform group-hover:translate-x-1 rtl:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </Printed>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Passbook({
  lang,
  account = ACCOUNT,
  entries = ENTRIES,
  options = OPTIONS,
  onStart,
  onExit,
}) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto font-sans text-stone-900">
      <div className="mx-auto max-w-6xl p-4 pb-10 wrap-anywhere">
        <PageHeader lang={lang} title={TEXT.title[lang]} lead={TEXT.lead[lang]} onBack={onExit}>
          <p className="mt-2 flex items-center gap-2 text-lg font-medium">
            <BadgeCheck size="1.375rem" aria-hidden="true" /> {TEXT.practice[lang]}
          </p>
        </PageHeader>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="min-w-0 rounded-r-2xl border-0 border-l-8 border-double border-accent bg-white p-5 shadow-sm sm:p-6">
            <AccountDetails lang={lang} account={account} />
            <BalanceMetrics lang={lang} opening={account.opening} entries={entries} />
          </article>
          <PaymentOptions lang={lang} options={options} onStart={onStart} />
        </div>
      </div>
    </main>
  )
}
