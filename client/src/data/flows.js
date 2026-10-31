// Builds step lists for each pretend payment. All names and numbers here are made up.

const T = (en, ru, ur) => ({ en, ru, ur })

export const PERSON = { name: 'Ahmed Raza', number: '03001234567' }
export const IBAN = 'PK00MEZN0000000000000001'
const PIN = '12345'

const EASYPAISA = { logo: '/brands/easypaisa.png', wallet: 'Easypaisa Wallet' }

export const KE = {
  ...EASYPAISA,
  key: 'ke',
  company: 'K-Electric',
  companyUr: 'کے الیکٹرک',
  category: 'cat-electricity',
  categoryName: 'Electricity',
  companies: [['co-ke', 'K-Electric'], ['co-lesco', 'LESCO'], ['co-iesco', 'IESCO']],
  refLabel: 'Account No.',
  reference: '0400001234567',
  name: 'Saathi Practice',
  month: 'Jul-2026',
  due: '20 Aug 2026',
  amount: '6591',
  late: '6864',
  paperLogo: '/brands/ke.png',
}

export const SSGC = {
  ...KE,
  key: 'ssgc',
  company: 'SSGC',
  companyUr: 'سوئی سدرن گیس',
  category: 'cat-gas',
  categoryName: 'Gas',
  companies: [['co-ssgc', 'SSGC'], ['co-sngpl', 'SNGPL']],
  refLabel: 'Consumer No.',
  reference: '1100002222',
  amount: '1850',
  late: '1945',
  paperLogo: null,
}

export const KWSC = {
  ...KE,
  key: 'kwsc',
  company: 'KWSC',
  companyUr: 'کراچی واٹر بورڈ',
  category: 'cat-water',
  categoryName: 'Water',
  companies: [['co-kwsc', 'KWSC'], ['co-wasa', 'WASA']],
  refLabel: 'Consumer No.',
  reference: '2200003333',
  amount: '980',
  late: '1030',
  paperLogo: null,
}

export const VOUCHER = {
  ...KE,
  key: 'invoice',
  company: 'School Fee Voucher',
  companyUr: 'اسکول فیس واؤچر',
  refLabel: 'Invoice No.',
  reference: '100200300400',
  amount: '4500',
  late: '4700',
  paperLogo: null,
}

function loginStep(screen, brandName) {
  return {
    id: 'login',
    screen,
    action: 'fill',
    target: 'pin',
    submit: 'login',
    value: PIN,
    say: T(
      `This is a practice ${brandName} app. Never use your real PIN here. Type 1 2 3 4 5, then press Sign in.`,
      `Yeh practice ${brandName} app hai. Yahan apna asli PIN kabhi na likhein. 1 2 3 4 5 likhein, phir Sign in dabayein.`,
      'یہ پریکٹس ایپ ہے۔ یہاں اپنا اصلی پن کبھی نہ لکھیں۔ ایک دو تین چار پانچ لکھیں، پھر سائن ان دبائیں۔',
    ),
    wrong: T(
      'The practice PIN is 1 2 3 4 5. No problem, please type it again.',
      'Practice PIN 1 2 3 4 5 hai. Koi baat nahi, dobara likhein.',
      'پریکٹس پن ایک دو تین چار پانچ ہے۔ کوئی بات نہیں، دوبارہ لکھیں۔',
    ),
  }
}

function amountStep(data) {
  return {
    id: 'amount',
    screen: 'pay-amount',
    data,
    action: 'fill',
    target: 'amount',
    submit: 'amount-next',
    value: data.amount,
    say: T(
      `Check the name. Type ${data.amount}, then press Next.`,
      `Naam dekh lein. ${data.amount} likhein, phir Next dabayein.`,
      `نام دیکھ لیں۔ ${data.amount} لکھیں، پھر نیکسٹ دبائیں۔`,
    ),
    wrong: T(
      `The amount should be ${data.amount}. Check the number and try again.`,
      `Raqam ${data.amount} honi chahiye. Number dekh kar dobara likhein.`,
      `رقم ${data.amount} ہونی چاہیے۔ نمبر دیکھ کر دوبارہ لکھیں۔`,
    ),
  }
}

function finishSteps(data) {
  return [
    {
      id: 'confirm',
      screen: 'pay-confirm',
      data,
      target: 'send-now',
      pay: data.amount,
      say: T(
        'Always check the name and the amount. Once you press Send Now, money cannot easily come back.',
        'Hamesha naam aur raqam dekh lein. Send Now dabane ke baad paise aasani se wapas nahi aate.',
        'ہمیشہ نام اور رقم دیکھ لیں۔ سینڈ ناؤ دبانے کے بعد پیسے آسانی سے واپس نہیں آتے۔',
      ),
    },
    {
      id: 'success',
      screen: 'pay-success',
      data,
      target: 'back-home',
      say: T(
        'Done! This is your proof of payment. Press Back to home.',
        'Ho gaya! Yeh aap ki adaigi ka saboot hai. Back to home dabayein.',
        'ہو گیا! یہ آپ کی ادائیگی کا ثبوت ہے۔ بیک ٹو ہوم دبائیں۔',
      ),
    },
  ]
}

export function sendSteps() {
  const data = { ...EASYPAISA, ...PERSON, amount: '500', amountLabel: 'Sent' }
  return [
    {
      id: 'tile',
      screen: 'ep-home',
      target: 'send-money',
      say: T('Press Send Money.', 'Send Money dabayein.', 'سینڈ منی دبائیں۔'),
    },
    {
      id: 'sheet',
      screen: 'ep-sheet',
      target: 'sheet-easypaisa',
      say: T(
        'If the other person has easypaisa, press easypaisa.',
        'Agar doosre ke paas easypaisa hai to easypaisa dabayein.',
        'اگر دوسرے کے پاس ایزی پیسہ ہے تو ایزی پیسہ دبائیں۔',
      ),
    },
    {
      id: 'number',
      screen: 'ep-transfer',
      data: { ...data, title: 'easypaisa Transfer' },
      action: 'fill',
      target: 'number',
      submit: 'select',
      value: PERSON.number,
      say: T(
        `Type the mobile number ${PERSON.number}, then press Select.`,
        `Mobile number ${PERSON.number} likhein, phir Select dabayein.`,
        'موبائل نمبر لکھیں، پھر سلیکٹ دبائیں۔',
      ),
      wrong: T(
        `One wrong digit can send money to a stranger. The number is ${PERSON.number}.`,
        `Ek ghalat number se paise kisi anjaan ko ja sakte hain. Number ${PERSON.number} hai.`,
        'ایک غلط نمبر سے پیسے کسی انجان کو جا سکتے ہیں۔ نمبر دیکھ کر دوبارہ لکھیں۔',
      ),
    },
    amountStep(data),
    ...finishSteps(data),
  ]
}

export function billSteps(bill) {
  const data = { ...bill, number: bill.reference, name: bill.company, amountLabel: 'Paid' }
  return [
    {
      id: 'paper',
      screen: 'bill-paper',
      data: bill,
      target: 'paper-ref',
      say: T(
        `First look at your paper bill. The ${bill.refLabel} is your bill's identity. Press it.`,
        `Pehle apna kaghaz wala bill dekhein. ${bill.refLabel} aap ke bill ki pehchan hai. Is ko dabayein.`,
        'پہلے اپنا کاغذ والا بل دیکھیں۔ یہ نمبر آپ کے بل کی پہچان ہے۔ اس کو دبائیں۔',
      ),
    },
    {
      id: 'tile',
      screen: 'ep-home',
      target: 'bill-payment',
      say: T('Now press Bill Payment.', 'Ab Bill Payment dabayein.', 'اب بل پیمنٹ دبائیں۔'),
    },
    {
      id: 'category',
      screen: 'ep-bills',
      target: bill.category,
      say: T(
        `Press ${bill.categoryName}.`,
        `${bill.categoryName} dabayein.`,
        `${bill.categoryName} دبائیں۔`,
      ),
    },
    {
      id: 'company',
      screen: 'ep-companies',
      data: bill,
      target: bill.companies[0][0],
      say: T(
        `Choose your company. Press ${bill.company}.`,
        `Apni company chunein. ${bill.company} dabayein.`,
        `اپنی کمپنی چنیں۔ ${bill.companyUr} دبائیں۔`,
      ),
    },
    ...referenceSteps(bill, data),
  ]
}

export function invoiceSteps() {
  const data = { ...VOUCHER, number: VOUCHER.reference, name: VOUCHER.company, amountLabel: 'Paid' }
  return [
    {
      id: 'paper',
      screen: 'bill-paper',
      data: VOUCHER,
      target: 'paper-ref',
      say: T(
        'Fee challans and many online orders give you an invoice number. It tells the app exactly what you are paying for. Press it.',
        'Fee challan aur kai online orders par invoice number hota hai. Yeh app ko batata hai ke aap kis cheez ki adaigi kar rahe hain. Is ko dabayein.',
        'فیس چالان اور کئی آن لائن آرڈرز پر انوائس نمبر ہوتا ہے۔ یہ ایپ کو بتاتا ہے کہ آپ کس چیز کی ادائیگی کر رہے ہیں۔ اس کو دبائیں۔',
      ),
    },
    {
      id: 'tile',
      screen: 'ep-home',
      target: 'bill-payment',
      say: T('Press Bill Payment.', 'Bill Payment dabayein.', 'بل پیمنٹ دبائیں۔'),
    },
    {
      id: 'category',
      screen: 'ep-bills',
      target: 'cat-invoice',
      say: T('Press Invoice or Voucher.', 'Invoice / Voucher dabayein.', 'انوائس یا واؤچر دبائیں۔'),
    },
    ...referenceSteps(VOUCHER, data),
  ]
}

function referenceSteps(bill, data) {
  return [
    {
      id: 'reference',
      screen: 'ep-bill-form',
      data: bill,
      action: 'fill',
      target: 'reference',
      submit: 'ref-next',
      value: bill.reference,
      say: T(
        `Type the ${bill.refLabel} from your paper: ${bill.reference}. Then press Next.`,
        `Kaghaz se ${bill.refLabel} likhein: ${bill.reference}. Phir Next dabayein.`,
        'کاغذ سے نمبر لکھیں۔ پھر نیکسٹ دبائیں۔',
      ),
      wrong: T(
        `That does not match the paper. The number is ${bill.reference}.`,
        `Yeh kaghaz se nahi milta. Number ${bill.reference} hai.`,
        'یہ کاغذ سے نہیں ملتا۔ نمبر دیکھ کر دوبارہ لکھیں۔',
      ),
    },
    {
      id: 'details',
      screen: 'ep-bill-details',
      data: bill,
      target: 'pay-now',
      pay: bill.amount,
      say: T(
        `The app found your bill. Match the amount and due date with your paper, then press Pay Now.`,
        `App ne aap ka bill dhoond liya. Raqam aur aakhri tareekh kaghaz se mila lein, phir Pay Now dabayein.`,
        'ایپ نے آپ کا بل ڈھونڈ لیا۔ رقم اور آخری تاریخ کاغذ سے ملا لیں، پھر پے ناؤ دبائیں۔',
      ),
    },
    finishSteps(data)[1],
  ]
}

export function ibanSteps() {
  const data = { ...EASYPAISA, name: PERSON.name, number: IBAN, amount: '1000', amountLabel: 'Sent' }
  return [
    {
      id: 'explain',
      screen: 'iban-explain',
      target: 'iban-understood',
      say: T(
        'An IBAN is a 24 character bank address. It starts with PK, then two numbers, then four letters for the bank. You can find it in your bank app or on your account papers. Press I understand.',
        'IBAN 24 huroof ka bank pata hota hai. Yeh PK se shuru hota hai, phir do number, phir bank ke chaar huroof. Yeh aap ki bank app ya account ke kaghazat par hota hai. Samajh Gaya dabayein.',
        'آئی بان چوبیس حروف کا بینک پتا ہوتا ہے۔ یہ پی کے سے شروع ہوتا ہے، پھر دو نمبر، پھر بینک کے چار حروف۔ یہ آپ کی بینک ایپ یا اکاؤنٹ کے کاغذات پر ہوتا ہے۔ سمجھ گیا دبائیں۔',
      ),
    },
    {
      id: 'tile',
      screen: 'ep-home',
      target: 'send-money',
      say: T('Press Send Money.', 'Send Money dabayein.', 'سینڈ منی دبائیں۔'),
    },
    {
      id: 'sheet',
      screen: 'ep-sheet',
      target: 'sheet-bank',
      say: T(
        'The money is going to a bank account, so press Bank.',
        'Paise bank account mein ja rahe hain, is liye Bank dabayein.',
        'پیسے بینک اکاؤنٹ میں جا رہے ہیں، اس لیے بینک دبائیں۔',
      ),
    },
    {
      id: 'bank',
      screen: 'ep-banks',
      target: 'bank-meezan',
      say: T(
        'Choose the other person\'s bank. Press Meezan Bank.',
        'Doosre shakhs ka bank chunein. Meezan Bank dabayein.',
        'دوسرے شخص کا بینک چنیں۔ میزان بینک دبائیں۔',
      ),
    },
    {
      id: 'tab',
      screen: 'ep-account',
      target: 'tab-iban',
      sets: { ibanTab: true },
      say: T(
        'This is where the IBAN goes. Press the IBAN tab.',
        'IBAN yahan likha jata hai. IBAN wala tab dabayein.',
        'آئی بان یہاں لکھا جاتا ہے۔ آئی بان والا ٹیب دبائیں۔',
      ),
    },
    {
      id: 'paste',
      screen: 'ep-account',
      target: 'paste',
      sets: { iban: IBAN },
      say: T(
        'Do not type an IBAN by hand. Copy it from the message and press Paste.',
        'IBAN haath se na likhein. Message se copy karein aur Paste dabayein.',
        'آئی بان ہاتھ سے نہ لکھیں۔ میسج سے کاپی کریں اور پیسٹ دبائیں۔',
      ),
    },
    {
      id: 'next',
      screen: 'ep-account',
      target: 'details-next',
      say: T(
        'Check it starts with PK, then press Next.',
        'Dekh lein yeh PK se shuru ho raha hai, phir Next dabayein.',
        'دیکھ لیں یہ پی کے سے شروع ہو رہا ہے، پھر نیکسٹ دبائیں۔',
      ),
    },
    amountStep(data),
    ...finishSteps(data),
  ]
}

export function raastSteps() {
  const data = { ...EASYPAISA, ...PERSON, amount: '500', amountLabel: 'Sent' }
  return [
    {
      id: 'explain',
      screen: 'raast-explain',
      target: 'raast-understood',
      say: T(
        'Raast is the State Bank of Pakistan\'s instant payment system. It moves money between banks and wallets in seconds, often using just a mobile number as your Raast ID. Press I understand.',
        'Raast State Bank of Pakistan ka fauri payment nizam hai. Yeh seconds mein paise banks aur wallets ke darmiyan bhejta hai, aksar sirf mobile number se, jo aap ki Raast ID hoti hai. Samajh Gaya dabayein.',
        'راست اسٹیٹ بینک آف پاکستان کا فوری پیمنٹ نظام ہے۔ یہ سیکنڈوں میں پیسے بینکوں اور والٹس کے درمیان بھیجتا ہے، اکثر صرف موبائل نمبر سے، جو آپ کی راست آئی ڈی ہوتی ہے۔ سمجھ گیا دبائیں۔',
      ),
    },
    {
      id: 'tile',
      screen: 'ep-home',
      target: 'send-money',
      say: T('Press Send Money.', 'Send Money dabayein.', 'سینڈ منی دبائیں۔'),
    },
    {
      id: 'sheet',
      screen: 'ep-sheet',
      target: 'sheet-raast',
      say: T('Press Raast.', 'Raast dabayein.', 'راست دبائیں۔'),
    },
    {
      id: 'number',
      screen: 'ep-transfer',
      data: { ...data, title: 'Raast Transfer', raast: true },
      action: 'fill',
      target: 'number',
      submit: 'select',
      value: PERSON.number,
      say: T(
        `Type the Raast ID, ${PERSON.number}, then press Select.`,
        `Raast ID likhein, ${PERSON.number}, phir Select dabayein.`,
        'راست آئی ڈی لکھیں، پھر سلیکٹ دبائیں۔',
      ),
      wrong: T(
        `The Raast ID is ${PERSON.number}. Please check it and type again.`,
        `Raast ID ${PERSON.number} hai. Dekh kar dobara likhein.`,
        'راست آئی ڈی دیکھ کر دوبارہ لکھیں۔',
      ),
    },
    amountStep(data),
    ...finishSteps(data),
  ]
}

export function jazzcashSteps() {
  const data = { logo: '/brands/jazzcash.png', wallet: 'JazzCash Wallet', ...PERSON, amount: '700', amountLabel: 'Sent' }
  return [
    loginStep('jc-login', 'JazzCash'),
    {
      id: 'tile',
      screen: 'jc-home',
      target: 'jc-send',
      say: T('Press Send Money.', 'Send Money dabayein.', 'سینڈ منی دبائیں۔'),
    },
    {
      id: 'number',
      screen: 'jc-send',
      action: 'fill',
      target: 'number',
      submit: 'select',
      value: PERSON.number,
      say: T(
        `Type ${PERSON.number}, then press Continue.`,
        `${PERSON.number} likhein, phir Continue dabayein.`,
        'موبائل نمبر لکھیں، پھر کنٹینیو دبائیں۔',
      ),
      wrong: T(
        `The number is ${PERSON.number}. Please check and type again.`,
        `Number ${PERSON.number} hai. Dekh kar dobara likhein.`,
        'نمبر دیکھ کر دوبارہ لکھیں۔',
      ),
    },
    amountStep(data),
    ...finishSteps(data),
  ]
}

export function meezanSteps() {
  const data = { logo: null, wallet: 'Meezan Account', name: PERSON.name, number: IBAN, amount: '2000', amountLabel: 'Sent' }
  return [
    loginStep('mz-login', 'Meezan'),
    {
      id: 'tile',
      screen: 'mz-home',
      target: 'mz-transfer',
      say: T('Press Fund Transfer.', 'Fund Transfer dabayein.', 'فنڈ ٹرانسفر دبائیں۔'),
    },
    {
      id: 'paste',
      screen: 'mz-payee',
      target: 'paste',
      sets: { iban: IBAN },
      say: T(
        'Banks ask for the IBAN here. Press Paste, so no letter is missed.',
        'Bank yahan IBAN maangta hai. Paste dabayein taake koi harf na reh jaye.',
        'بینک یہاں آئی بان مانگتا ہے۔ پیسٹ دبائیں تاکہ کوئی حرف نہ رہ جائے۔',
      ),
    },
    {
      id: 'next',
      screen: 'mz-payee',
      target: 'details-next',
      say: T(
        'Check the IBAN, then press Continue.',
        'IBAN dekh lein, phir Continue dabayein.',
        'آئی بان دیکھ لیں، پھر کنٹینیو دبائیں۔',
      ),
    },
    amountStep(data),
    ...finishSteps(data),
  ]
}

function withBrief(steps, brief) {
  return steps.map((step) => ({ ...step, brief }))
}

export const SEND_BRIEF = [
  { en: 'Send Rs 500 to Ahmed Raza', ru: 'Ahmed Raza ko Rs 500 bhejein' },
  { en: `Mobile: ${PERSON.number}`, ru: `Mobile: ${PERSON.number}` },
  { en: `Practice PIN: ${PIN}`, ru: `Practice PIN: ${PIN}` },
]

export function billBrief(bill) {
  return [
    { en: `Pay your ${bill.company} bill`, ru: `${bill.company} ka bill ada karein` },
    { en: `${bill.refLabel}: ${bill.reference}`, ru: `${bill.refLabel}: ${bill.reference}` },
    { en: `Amount: Rs ${bill.amount}`, ru: `Raqam: Rs ${bill.amount}` },
  ]
}

export const IBAN_BRIEF = [
  { en: 'Send Rs 1000 to Meezan Bank by IBAN', ru: 'IBAN se Meezan Bank mein Rs 1000 bhejein' },
  { en: `IBAN: ${IBAN}`, ru: `IBAN: ${IBAN}` },
]

export const RAAST_BRIEF = [
  { en: 'Send Rs 500 by Raast', ru: 'Raast se Rs 500 bhejein' },
  { en: `Raast ID: ${PERSON.number}`, ru: `Raast ID: ${PERSON.number}` },
]

// One long test in easypaisa: same steps, no step by step coaching.
export function scenarioSteps() {
  return [
    { ...loginStep('ep-login', 'easypaisa'), brief: [{ en: `Sign in. Practice PIN: ${PIN}`, ru: `Sign in karein. Practice PIN: ${PIN}` }] },
    ...withBrief(billSteps(KE), billBrief(KE)),
    ...withBrief(invoiceSteps(), billBrief(VOUCHER)),
    ...withBrief(ibanSteps().filter((step) => step.id !== 'explain'), IBAN_BRIEF),
    ...withBrief(raastSteps().filter((step) => step.id !== 'explain'), RAAST_BRIEF),
  ]
}

export { loginStep }
