// Pretend family chats for the WhatsApp practice.
export const CHATS = [
  {
    id: 'ahmed',
    name: 'Son - Ahmed',
    tone: 'bg-sky-600',
    status: 'online',
    reply: 'Walaikum Salam Ammi! Bohat khushi hui.',
    messages: [
      { id: 1, mine: false, text: 'Assalam o Alaikum! Aap kaisi hain?', time: '10:12' },
      { id: 2, mine: true, text: 'Theek hoon beta.', time: '10:15' },
    ],
  },
  {
    id: 'fatima',
    name: 'Daughter - Fatima',
    tone: 'bg-rose-600',
    status: 'online',
    reply: 'Shukriya! Main shaam ko call karungi.',
    messages: [{ id: 1, mine: false, text: 'Dawai le li aap ne?', time: 'Yesterday' }],
  },
  {
    id: 'bilal',
    name: 'Brother - Bilal',
    tone: 'bg-amber-700',
    status: 'last seen today',
    reply: 'Theek hai, baad mein baat karte hain.',
    messages: [{ id: 1, mine: false, text: 'Eid par aa rahe hain.', time: 'Monday' }],
  },
]

const T = (en, ru, ur) => ({ en, ru, ur })

export const WA_LINES = {
  desktop: T(
    'This is a practice computer. Click the green WhatsApp icon to open it.',
    'Yeh practice computer hai. WhatsApp ka sabz icon click kar ke kholein.',
    'یہ پریکٹس کمپیوٹر ہے۔ واٹس ایپ کا سبز آئیکن کلک کر کے کھولیں۔',
  ),
  phoneHome: T(
    'This is a practice phone. Tap the green WhatsApp app to open it.',
    'Yeh practice phone hai. WhatsApp ki sabz app par tap kar ke kholein.',
    'یہ پریکٹس فون ہے۔ واٹس ایپ کی سبز ایپ پر ٹیپ کر کے کھولیں۔',
  ),
  wrongApp: T(
    'That is a different app. No problem. Look for the green WhatsApp app.',
    'Yeh koi aur app hai. Koi baat nahi. WhatsApp ki sabz app dhoondein.',
    'یہ کوئی اور ایپ ہے۔ کوئی بات نہیں۔ واٹس ایپ کی سبز ایپ ڈھونڈیں۔',
  ),
  camera: T(
    'Press the Camera button so they can see you. If your browser asks, press Allow.',
    'Camera ka button dabayein taake woh aap ko dekh sakein. Browser pooche to Allow dabayein.',
    'کیمرے کا بٹن دبائیں تاکہ وہ آپ کو دیکھ سکیں۔ براؤزر پوچھے تو الاؤ دبائیں۔',
  ),
  wrongIcon: T(
    'That is a different program. No problem. Look for the green icon.',
    'Yeh koi aur program hai. Koi baat nahi. Sabz icon dhoondein.',
    'یہ کوئی اور پروگرام ہے۔ کوئی بات نہیں۔ سبز آئیکن ڈھونڈیں۔',
  ),
  menu: T(
    'Choose what you want to learn from the buttons at the top.',
    'Upar wale buttons se chunein aap kya seekhna chahte hain.',
    'اوپر والے بٹنوں سے چنیں آپ کیا سیکھنا چاہتے ہیں۔',
  ),
  clickBox: T(
    'Click here inside the box to type your message using the keyboard.',
    'Is dabbe ke andar click karein aur keyboard se apna message likhein.',
    'اس ڈبے کے اندر کلک کریں اور کی بورڈ سے اپنا میسج لکھیں۔',
  ),
  typeNow: T(
    'Good. Now type a short message, like Assalam o Alaikum.',
    'Achha. Ab chhota sa message likhein, jaise Assalam o Alaikum.',
    'اچھا۔ اب چھوٹا سا میسج لکھیں، جیسے السلام علیکم۔',
  ),
  pressSend: T(
    'Well done. Now press the green send button.',
    'Shabash. Ab sabz send button dabayein.',
    'شاباش۔ اب سبز سینڈ بٹن دبائیں۔',
  ),
  mic: T(
    "If you don't want to type, press and hold this microphone icon to record and send a voice message.",
    'Agar likhna nahi chahte to is microphone ko daba kar rakhein, aur awaaz ka message bhejein.',
    'اگر لکھنا نہیں چاہتے تو اس مائیکروفون کو دبا کر رکھیں، اور آواز کا میسج بھیجیں۔',
  ),
  recording: T(
    'Recording. Keep holding and speak. Let go to send.',
    'Recording ho rahi hai. Daba kar rakhein aur bolein. Chhorne par message chala jayega.',
    'ریکارڈنگ ہو رہی ہے۔ دبا کر رکھیں اور بولیں۔ چھوڑنے پر میسج چلا جائے گا۔',
  ),
  tooShort: T(
    'That was too quick. Keep the button pressed while you speak.',
    'Yeh bohat jaldi tha. Bolte waqt button daba kar rakhein.',
    'یہ بہت جلدی تھا۔ بولتے وقت بٹن دبا کر رکھیں۔',
  ),
  calls: T(
    'To talk directly or see your family, click the phone icon for a voice call or the video icon for a video call.',
    'Seedhi baat karne ya ghar walon ko dekhne ke liye, awaaz ki call ke liye phone, aur video call ke liye video icon click karein.',
    'سیدھی بات کرنے یا گھر والوں کو دیکھنے کے لیے، آواز کی کال کے لیے فون، اور ویڈیو کال کے لیے ویڈیو آئیکن کلک کریں۔',
  ),
  calling: T('Please wait. WhatsApp is calling.', 'Intezar karein. Call lag rahi hai.', 'انتظار کریں۔ کال لگ رہی ہے۔'),
  connected: T(
    'They answered! When you finish, press the red button.',
    'Unhon ne call utha li! Baat khatam ho to surkh button dabayein.',
    'انہوں نے کال اٹھا لی! بات ختم ہو تو سرخ بٹن دبائیں۔',
  ),
  emptySend: T(
    'The box is empty. Please type your message first.',
    'Dabba khaali hai. Pehle apna message likhein.',
    'ڈبہ خالی ہے۔ پہلے اپنا میسج لکھیں۔',
  ),
  notHere: T(
    'This button is not part of this practice. Nothing went wrong.',
    'Yeh button is practice mein shamil nahi. Kuch ghalat nahi hua.',
    'یہ بٹن اس پریکٹس میں شامل نہیں۔ کچھ غلط نہیں ہوا۔',
  ),
  done: T(
    'Wonderful! You did it yourself. Choose another lesson, or keep chatting.',
    'Zabardast! Yeh aap ne khud kiya. Doosra lesson chunein, ya baat jari rakhein.',
    'زبردست! یہ آپ نے خود کیا۔ دوسرا سبق چنیں، یا بات جاری رکھیں۔',
  ),
}
