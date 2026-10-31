// Every spoken line has English (en), Roman Urdu for screen (ru) and Urdu script for voice (ur).

export const WRONG_TAP = {
  en: 'That is not the one we need. No problem, nothing bad happened. Let us try again.',
  ru: 'Yeh woh nahi hai jo humein chahiye. Koi baat nahi, kuch kharab nahi hua. Dobara koshish karein.',
  ur: 'یہ وہ نہیں ہے جو ہمیں چاہیے۔ کوئی بات نہیں، کچھ خراب نہیں ہوا۔ دوبارہ کوشش کریں۔',
}

export const LINES = {
  welcome: {
    en: 'Hello! I am Saathi. Here you can practise safely. Nothing here is real, so you cannot lose anything.',
    ru: 'Assalam o alaikum! Main Saathi hoon. Yahan aap mehfooz practice kar sakte hain. Yahan kuch bhi asli nahi, is liye aap ka koi nuqsan nahi ho sakta.',
    ur: 'السلام علیکم! میں ساتھی ہوں۔ یہاں آپ محفوظ پریکٹس کر سکتے ہیں۔ یہاں کچھ بھی اصلی نہیں، اس لیے آپ کا کوئی نقصان نہیں ہو سکتا۔',
  },
  introPractice: {
    en: 'Press Practice to learn big tasks, like sending money.',
    ru: 'Practice dabayein aur bare kaam seekhein, jaise paise bhejna.',
    ur: 'پریکٹس دبائیں اور بڑے کام سیکھیں، جیسے پیسے بھیجنا۔',
  },
  introTips: {
    en: 'Press Tips for small tricks, like taking a screenshot.',
    ru: 'Tips dabayein aur chhoti tarkeebein seekhein, jaise screenshot lena.',
    ur: 'ٹپس دبائیں اور چھوٹی ترکیبیں سیکھیں، جیسے اسکرین شاٹ لینا۔',
  },
  introAsk: {
    en: 'Got a strange message? Press Ask Saathi and I will check it with you.',
    ru: 'Koi ajeeb message aaya? Saathi se poochein dabayein, main aap ke saath dekhunga.',
    ur: 'کوئی عجیب میسج آیا؟ ساتھی سے پوچھیں دبائیں، میں آپ کے ساتھ دیکھوں گا۔',
  },
  askHint: {
    en: 'Remember, you can ask me anything. Just press here.',
    ru: 'Yaad rakhein, aap mujh se kuch bhi pooch sakte hain. Bas yahan dabayein.',
    ur: 'یاد رکھیں، آپ مجھ سے کچھ بھی پوچھ سکتے ہیں۔ بس یہاں دبائیں۔',
  },
  roundTwo: {
    en: 'Now you know the way. I will only speak this time.',
    ru: 'Ab aap ko raasta pata hai. Is baar main sirf bataunga.',
    ur: 'اب آپ کو راستہ پتا ہے۔ اس بار میں صرف بتاؤں گا۔',
  },
  roundThree: {
    en: 'This time you do it alone. I am here if you press Help me.',
    ru: 'Is baar aap khud karein. Madad chahiye to Madad karein dabayein.',
    ur: 'اس بار آپ خود کریں۔ مدد چاہیے تو مدد کریں دبائیں۔',
  },
  scamFell: {
    en: 'This was a trick, and it is fine that it happened here. A real bank never asks for your OTP. Look at the marked warning signs.',
    ru: 'Yeh ek dhoka tha, aur achha hua yahin hua. Asli bank kabhi OTP nahi maangta. Nishan zada khatre ki nishaniyan dekhein.',
    ur: 'یہ ایک دھوکا تھا، اور اچھا ہوا یہیں ہوا۔ اصلی بینک کبھی او ٹی پی نہیں مانگتا۔ نشان زدہ خطرے کی نشانیاں دیکھیں۔',
  },
  scamPassed: {
    en: 'Well done! You did not share your OTP. That is exactly right.',
    ru: 'Shabash! Aap ne apna OTP share nahi kiya. Bilkul theek kiya.',
    ur: 'شاباش! آپ نے اپنا او ٹی پی شیئر نہیں کیا۔ بالکل ٹھیک کیا۔',
  },
  done: {
    en: 'Wonderful! You did it yourself.',
    ru: 'Zabardast! Yeh aap ne khud kiya.',
    ur: 'زبردست! یہ آپ نے خود کیا۔',
  },
}

export const LESSONS = {
  bank: {
    id: 'bank',
    kind: 'practice',
    title: { en: 'Send money', ru: 'Paise bhejna' },
    blurb: { en: 'Use a pretend bank with pretend money', ru: 'Farzi bank aur farzi paison ke saath' },
    icon: '₨',
    ambushAfter: 'amount',
    steps: [
      {
        id: 'login',
        screen: 'bank-login',
        action: 'fill',
        target: 'pin',
        submit: 'login',
        value: '1234',
        say: {
          en: 'This is a practice bank, so never use your real PIN. Type 1 2 3 4, then press Log in.',
          ru: 'Yeh practice bank hai, is liye apna asli PIN kabhi na likhein. 1 2 3 4 likhein, phir Log in dabayein.',
          ur: 'یہ پریکٹس بینک ہے، اس لیے اپنا اصلی پن کبھی نہ لکھیں۔ ایک دو تین چار لکھیں، پھر لاگ ان دبائیں۔',
        },
        wrong: {
          en: 'This box needs 1 2 3 4. No problem. Please type it again.',
          ru: 'Is dabbe mein 1 2 3 4 likhna hai. Koi baat nahi. Dobara likhein.',
          ur: 'اس خانے میں ایک دو تین چار لکھنا ہے۔ کوئی بات نہیں۔ دوبارہ لکھیں۔',
        },
      },
      {
        id: 'send',
        screen: 'bank-home',
        target: 'send',
        say: {
          en: 'This is your home page. Press Send Money.',
          ru: 'Yeh aap ka home page hai. Paise Bhejein dabayein.',
          ur: 'یہ آپ کا ہوم پیج ہے۔ پیسے بھیجیں دبائیں۔',
        },
      },
      {
        id: 'recipient',
        screen: 'bank-recipient',
        target: 'ahmed',
        say: {
          en: 'Choose who gets the money. Press Ahmed.',
          ru: 'Chunein paise kis ko bhejne hain. Ahmed ko dabayein.',
          ur: 'چنیں پیسے کس کو بھیجنے ہیں۔ احمد کو دبائیں۔',
        },
      },
      {
        id: 'amount',
        screen: 'bank-amount',
        action: 'fill',
        target: 'amount',
        submit: 'continue',
        value: '500',
        say: {
          en: 'Type 500, then press Continue.',
          ru: '500 likhein, phir Aage Barhein dabayein.',
          ur: 'پانچ سو لکھیں، پھر آگے بڑھیں دبائیں۔',
        },
        wrong: {
          en: 'The amount should be 500. Check the number and try again.',
          ru: 'Raqam 500 honi chahiye. Number dekh kar dobara likhein.',
          ur: 'رقم پانچ سو ہونی چاہیے۔ نمبر دیکھ کر دوبارہ لکھیں۔',
        },
      },
      {
        id: 'confirm',
        screen: 'bank-review',
        target: 'confirm',
        say: {
          en: 'Always check the name and amount. If they are right, press Confirm.',
          ru: 'Hamesha naam aur raqam dekh lein. Agar theek hain to Tasdeeq Karein dabayein.',
          ur: 'ہمیشہ نام اور رقم دیکھ لیں۔ اگر ٹھیک ہیں تو تصدیق کریں دبائیں۔',
        },
      },
    ],
  },
  video: {
    id: 'video',
    kind: 'tip',
    title: { en: 'Join a video call', ru: 'Video call uthana' },
    blurb: { en: 'Answer, show your face, hang up', ru: 'Call uthayein, chehra dikhayein, band karein' },
    icon: '☎',
    steps: [
      {
        id: 'answer',
        screen: 'call-incoming',
        target: 'accept',
        say: {
          en: 'Your family is calling. Press the green button to answer.',
          ru: 'Aap ke ghar wale call kar rahe hain. Sabz button daba kar call uthayein.',
          ur: 'آپ کے گھر والے کال کر رہے ہیں۔ سبز بٹن دبا کر کال اٹھائیں۔',
        },
      },
      {
        id: 'camera',
        screen: 'call-active',
        target: 'camera',
        say: {
          en: 'They cannot see you yet. Press the camera button.',
          ru: 'Woh aap ko abhi dekh nahi sakte. Camera ka button dabayein.',
          ur: 'وہ آپ کو ابھی دیکھ نہیں سکتے۔ کیمرے کا بٹن دبائیں۔',
        },
      },
      {
        id: 'end',
        screen: 'call-camera',
        target: 'hangup',
        say: {
          en: 'Now they can see you. When you finish, press the red button to end the call.',
          ru: 'Ab woh aap ko dekh sakte hain. Baat khatam ho to surkh button daba kar call band karein.',
          ur: 'اب وہ آپ کو دیکھ سکتے ہیں۔ بات ختم ہو تو سرخ بٹن دبا کر کال بند کریں۔',
        },
      },
    ],
  },
  screenshot: {
    id: 'screenshot',
    kind: 'tip',
    title: { en: 'Take a screenshot', ru: 'Screenshot lena' },
    blurb: { en: 'Save a picture of your screen', ru: 'Screen ki tasveer save karein' },
    icon: '▣',
    steps: [
      {
        id: 'power',
        screen: 'shot-phone',
        target: 'power',
        say: {
          en: 'On most phones, press Power and Volume Down together. First find the Power button on the side.',
          ru: 'Aksar phones par Power aur Volume Down ek saath dabate hain. Pehle side par Power button dhoondein.',
          ur: 'اکثر فونز پر پاور اور والیوم ڈاؤن ایک ساتھ دباتے ہیں۔ پہلے سائیڈ پر پاور بٹن ڈھونڈیں۔',
        },
      },
      {
        id: 'volume',
        screen: 'shot-phone',
        target: 'volume',
        say: {
          en: 'Now find Volume Down. On a real phone, press both quickly together.',
          ru: 'Ab Volume Down dhoondein. Asli phone par dono ko ek saath jaldi dabayein.',
          ur: 'اب والیوم ڈاؤن ڈھونڈیں۔ اصلی فون پر دونوں کو ایک ساتھ جلدی دبائیں۔',
        },
      },
      {
        id: 'open',
        screen: 'shot-taken',
        target: 'thumbnail',
        say: {
          en: 'The screen flashed, and your picture is saved. Press the small picture to open it.',
          ru: 'Screen chamki aur aap ki tasveer save ho gayi. Chhoti tasveer daba kar kholein.',
          ur: 'اسکرین چمکی اور آپ کی تصویر محفوظ ہو گئی۔ چھوٹی تصویر دبا کر کھولیں۔',
        },
      },
    ],
  },
  google: {
    id: 'google',
    kind: 'tip',
    title: { en: 'Search on Google', ru: 'Google par dhoondna' },
    blurb: { en: 'Find anything by typing a few words', ru: 'Chand alfaaz likh kar kuch bhi dhoondein' },
    icon: '⌕',
    steps: [
      {
        id: 'type',
        screen: 'search-home',
        action: 'fill',
        target: 'query',
        submit: 'search',
        value: 'weather',
        say: {
          en: 'Type the word weather in the box, then press Search.',
          ru: 'Dabbe mein weather likhein, phir Search dabayein.',
          ur: 'خانے میں ویدر لکھیں، پھر سرچ دبائیں۔',
        },
        wrong: {
          en: 'Let us use the word weather. Please type it in the box.',
          ru: 'Hum weather ka lafz istemal karte hain. Dabbe mein likhein.',
          ur: 'ہم ویدر کا لفظ استعمال کرتے ہیں۔ خانے میں لکھیں۔',
        },
      },
      {
        id: 'result',
        screen: 'search-results',
        target: 'result',
        say: {
          en: 'Skip anything marked Sponsored, because those are adverts. Press the first normal result.',
          ru: 'Sponsored wale nateeje chhor dein, woh ishtehar hote hain. Pehla aam nateeja dabayein.',
          ur: 'سپانسرڈ والے نتیجے چھوڑ دیں، وہ اشتہار ہوتے ہیں۔ پہلا عام نتیجہ دبائیں۔',
        },
      },
    ],
  },
  ai: {
    id: 'ai',
    kind: 'tip',
    title: { en: 'Use AI safely', ru: 'AI mehfooz tareeqe se' },
    blurb: { en: 'Ask a question and check the answer', ru: 'Sawal poochein aur jawab parkhein' },
    icon: '✦',
    steps: [
      {
        id: 'ask',
        screen: 'ai-chat',
        action: 'fill',
        target: 'question',
        submit: 'ask',
        value: 'tea recipe',
        say: {
          en: 'AI answers questions you type. Type tea recipe, then press Send.',
          ru: 'AI aap ke likhe sawalon ke jawab deta hai. tea recipe likhein, phir Bhejein dabayein.',
          ur: 'اے آئی آپ کے لکھے سوالوں کے جواب دیتا ہے۔ ٹی ریسیپی لکھیں، پھر بھیجیں دبائیں۔',
        },
        wrong: {
          en: 'Please type tea recipe in the box.',
          ru: 'Dabbe mein tea recipe likhein.',
          ur: 'خانے میں ٹی ریسیپی لکھیں۔',
        },
      },
      {
        id: 'understood',
        screen: 'ai-answer',
        target: 'understood',
        say: {
          en: 'AI can be wrong, so check medical or money advice with a real person. Never share passwords with it. Press I understand.',
          ru: 'AI ghalat bhi ho sakta hai, is liye dawai ya paison ki baat kisi insan se pooch lein. Is ko password kabhi na dein. Samajh Gaya dabayein.',
          ur: 'اے آئی غلط بھی ہو سکتا ہے، اس لیے دوائی یا پیسوں کی بات کسی انسان سے پوچھ لیں۔ اس کو پاس ورڈ کبھی نہ دیں۔ سمجھ گیا دبائیں۔',
        },
      },
    ],
  },
}

export const PRACTICE = ['bank']
export const TIPS = ['video', 'screenshot', 'google', 'ai']

// Each part marked with a flag number gets highlighted after the person falls for the scam.
export const SCAM = {
  sender: '+92 300 0000000',
  parts: [
    { text: 'URGENT! ', flag: 1 },
    { text: 'Your bank account will be ' },
    { text: 'BLOCKED today', flag: 2 },
    { text: '. Reply now with your ' },
    { text: 'OTP code', flag: 3 },
    { text: ' to keep it active.' },
  ],
  flags: [
    { en: 'It rushes you', ru: 'Yeh jaldi karwata hai' },
    { en: 'It tries to scare you', ru: 'Yeh aap ko darata hai' },
    { en: 'It asks for your OTP', ru: 'Yeh aap ka OTP maangta hai' },
  ],
}

export const UI = {
  chooseLanguage: { en: 'Choose your language', ru: 'Apni zaban chunein' },
  practice: { en: 'Practice', ru: 'Practice' },
  tips: { en: 'Tips', ru: 'Tips' },
  ask: { en: 'Ask Saathi', ru: 'Saathi se poochein' },
  skip: { en: 'Skip', ru: 'Chhor dein' },
  back: { en: 'Back', ru: 'Wapas' },
  repeat: { en: 'Say again', ru: 'Dobara sunein' },
  help: { en: 'Help me', ru: 'Madad karein' },
  language: { en: 'Language', ru: 'Zaban' },
  homeTitle: { en: 'Nothing here can go wrong', ru: 'Yahan kuch ghalat nahi ho sakta' },
  homeLead: {
    en: 'Practise with pretend apps until you feel sure.',
    ru: 'Farzi apps par practice karein, jab tak aap ko yaqeen na ho jaye.',
  },
  tipsTitle: { en: 'Small tricks, big help', ru: 'Chhoti tarkeebein, bari madad' },
  tipsLead: { en: 'Each one takes about a minute.', ru: 'Har ek mein taqreeban ek minute lagta hai.' },
  rounds: [
    { en: 'Full help', ru: 'Poori madad' },
    { en: 'Voice only', ru: 'Sirf awaz' },
    { en: 'On your own', ru: 'Khud karein' },
  ],
  round: { en: 'Round', ru: 'Round' },
  tip: { en: 'Tip', ru: 'Tip' },
  safeBadge: { en: 'Practice only', ru: 'Sirf practice' },
  doneAlone: { en: 'Completed without help', ru: 'Baghair madad mukammal kiya' },
  doneTitle: { en: 'You did it!', ru: 'Aap ne kar dikhaya!' },
  tries: { en: 'Things to try again', ru: 'Dobara koshishein' },
  helpsUsed: { en: 'Times you asked for help', ru: 'Madad kitni baar li' },
  scamResult: { en: 'Scam message', ru: 'Scam message' },
  scamAvoided: { en: 'Stopped', ru: 'Rok liya' },
  scamLearned: { en: 'Learned from it', ru: 'Is se seekha' },
  nextRound: { en: 'Next round', ru: 'Agla round' },
  allDone: { en: 'Back to home', ru: 'Wapas home' },
  tryAgain: { en: 'Try again', ru: 'Dobara koshish' },
  continue: { en: 'Continue', ru: 'Aage barhein' },
  newMessage: { en: 'New message', ru: 'Naya message' },
  shareOtp: { en: 'Reply with my OTP', ru: 'OTP bhej dein' },
  deleteMessage: { en: 'Delete message', ru: 'Message delete karein' },
  askTitle: { en: 'Ask Saathi', ru: 'Saathi se poochein' },
  askLead: {
    en: 'Ask anything, or paste a message you are not sure about.',
    ru: 'Kuch bhi poochein, ya shakki message yahan paste karein.',
  },
  askPlaceholder: { en: 'Type or paste here', ru: 'Yahan likhein ya paste karein' },
  askSend: { en: 'Send', ru: 'Bhejein' },
  askPhoto: { en: 'Add photo', ru: 'Tasveer' },
  askExample: { en: 'Show an example', ru: 'Misaal dikhayein' },
  askThinking: { en: 'Let me look...', ru: 'Main dekh raha hoon...' },
  askOpenLesson: { en: 'Practise this', ru: 'Is ki practice karein' },
  askListen: { en: 'Listen', ru: 'Sunein' },
  askOffline: {
    en: 'Offline mode: basic checks only',
    ru: 'Offline mode: sirf buniyadi jaanch',
  },
  photoNeedsAi: {
    en: 'I need the internet helper to read photos. Please type the message instead.',
    ru: 'Tasveer parhne ke liye internet helper chahiye. Barah e karam message likh dein.',
  },
  warningSigns: { en: 'Warning signs', ru: 'Khatre ki nishaniyan' },
  whatToDo: { en: 'What to do', ru: 'Ab kya karein' },
  risk: {
    danger: { en: 'Do not reply', ru: 'Jawab na dein' },
    careful: { en: 'Be careful', ru: 'Ehtiyat karein' },
    none: { en: 'No warning signs found', ru: 'Koi nishani nahi mili' },
  },
  example:
    'URGENT: Your account will be blocked today. Share your OTP now at http://bank-verify.xyz',
}
