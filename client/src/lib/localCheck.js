// Offline answers, used when no API key is set or the backend cannot be reached.

const SIGNS = [
  {
    id: 'secret',
    severe: true,
    test: /\b(otp|o\.t\.p|pin|cvv|password|passcode|code)\b/i,
    en: 'It mentions a secret code like an OTP or PIN. A real bank never asks for these.',
    ru: 'Is mein OTP ya PIN jaisa khufia code maanga gaya hai. Asli bank yeh kabhi nahi maangta.',
  },
  {
    id: 'blocked',
    severe: false,
    test: /(block|band ho|suspend|freeze|expire|deactivat|khatam)/i,
    en: 'It tries to scare you by saying your account or SIM will be closed.',
    ru: 'Yeh account ya SIM band hone ka keh kar aap ko darata hai.',
  },
  {
    id: 'urgent',
    severe: false,
    test: /(urgent|immediately|right now|within \d+|fauran|jaldi|abhi|turant|last chance)/i,
    en: 'It rushes you. Scammers do not want you to stop and think.',
    ru: 'Yeh aap ko jaldi karwata hai. Scammer nahi chahte ke aap ruk kar sochein.',
  },
  {
    id: 'prize',
    severe: false,
    test: /(lottery|prize|winner|won |jeet|inaam|lucky draw|reward|free gift)/i,
    en: 'It promises a prize you never entered for.',
    ru: 'Yeh aise inaam ka wada karta hai jis mein aap ne hissa hi nahi liya.',
  },
  {
    id: 'link',
    severe: false,
    test: /(https?:\/\/|www\.|bit\.ly|tinyurl|click here|link par|\.xyz|\.top)/i,
    en: 'It has a link. Links in surprise messages can steal your details.',
    ru: 'Is mein link hai. Achanak aaye message ke link aap ki maloomat chura sakte hain.',
  },
  {
    id: 'money',
    severe: false,
    test: /(send money|transfer|paise bhej|fee|processing charge|easypaisa|jazzcash|deposit)/i,
    en: 'It asks you to send money or pay a fee.',
    ru: 'Yeh aap se paise bhejne ya fee dene ko kehta hai.',
  },
  {
    id: 'authority',
    severe: false,
    test: /(police|fia|court|arrest|government|sarkari|bisp|customs|manager)/i,
    en: 'It pretends to be someone powerful so you feel afraid to say no.',
    ru: 'Yeh kisi bare idare ka naam le kar darata hai taake aap inkaar na karein.',
  },
]

const TOPICS = [
  {
    test: /screenshot|screen shot/i,
    lessonId: 'screenshot',
    en: 'A screenshot saves a picture of your screen. Let us practise it together.',
    ru: 'Screenshot aap ki screen ki tasveer save karta hai. Aaiye mil kar practice karein.',
  },
  {
    test: /google|search|dhoond|talash/i,
    lessonId: 'google',
    en: 'You can find almost anything on Google. Let us practise a search together.',
    ru: 'Google par aap taqreeban har cheez dhoond sakte hain. Aaiye search ki practice karein.',
  },
  {
    test: /video|call|whatsapp/i,
    lessonId: 'video',
    en: 'Answering a video call takes just one tap. Let us practise it together.',
    ru: 'Video call uthane ke liye sirf ek tap chahiye. Aaiye mil kar practice karein.',
  },
  {
    test: /\bai\b|chatgpt|claude|gemini/i,
    lessonId: 'ai',
    en: 'AI is like a helpful assistant you can type questions to. Let us try it safely.',
    ru: 'AI ek madadgaar ki tarah hai jis se aap likh kar sawal pooch sakte hain. Aaiye mehfooz tareeqe se try karein.',
  },
  {
    test: /bank|paise|money|transfer/i,
    lessonId: 'ep-send',
    en: 'You can practise sending money with no risk in our practice bank.',
    ru: 'Aap hamare practice bank mein baghair kisi khatre ke paise bhejne ki practice kar sakte hain.',
  },
]

const SAFE_REMINDER = {
  en: 'No warning signs found, but this does not prove it is safe. Never share your OTP, PIN or password.',
  ru: 'Koi khatre ki nishani nahi mili, lekin is se yeh sabit nahi hota ke yeh mehfooz hai. Apna OTP, PIN ya password kabhi share na karein.',
}

const SHARED_SECRET =
  /\b\d{13,19}\b|(my|mera|meri)\s+(pin|otp|password|cvv)|(pin|otp|password|cvv)\s*(is|hai|:)\s*\S+/i

export function containsSecret(text) {
  return SHARED_SECRET.test(text.replace(/[\s-](?=\d)/g, ''))
}

export const SECRET_WARNING = {
  en: 'Please keep that private. Never type your PIN, OTP, password or card number here or anywhere you were not expecting. I did not send it anywhere.',
  ru: 'Isay apne paas rakhein. Apna PIN, OTP, password ya card number yahan ya kisi anjaan jagah kabhi na likhein. Main ne yeh kahin nahi bheja.',
}

export function localAnswer(message, lang) {
  const found = SIGNS.filter((sign) => sign.test.test(message))
  const looksLikeMessage = message.trim().split(/\s+/).length > 6

  if (found.length > 0 && (looksLikeMessage || found.some((sign) => sign.severe))) {
    const danger = found.some((sign) => sign.severe) || found.length >= 2
    return {
      kind: 'scam_check',
      risk: danger ? 'danger' : 'careful',
      reply: danger
        ? lang === 'ru'
          ? 'Yeh scam lagta hai. Is ka jawab na dein.'
          : 'This looks like a scam. Please do not reply.'
        : lang === 'ru'
          ? 'Ehtiyat karein. Is mein ek khatre ki nishani hai.'
          : 'Please be careful. This has a warning sign.',
      warning_signs: found.map((sign) => sign[lang]),
      next_step:
        lang === 'ru'
          ? 'Message delete kar dein. Agar fikar ho to apne card ki pusht par likhe number par bank ko call karein.'
          : 'Delete the message. If you are worried, call the number printed on the back of your bank card.',
    }
  }

  const topic = TOPICS.find((item) => item.test.test(message))
  if (topic) {
    return {
      kind: 'answer',
      risk: 'none',
      reply: topic[lang],
      warning_signs: [],
      next_step: '',
      lessonId: topic.lessonId,
    }
  }

  if (looksLikeMessage) {
    return {
      kind: 'scam_check',
      risk: 'none',
      reply: SAFE_REMINDER[lang],
      warning_signs: [],
      next_step: lang === 'ru' ? 'Agar shak ho to ghar walon se pooch lein.' : 'If you feel unsure, ask a family member.',
    }
  }

  return {
    kind: 'answer',
    risk: 'none',
    reply:
      lang === 'ru'
        ? 'Main abhi offline hoon. Aap mujhe koi shakki message paste karein, ya Tips section dekhein.'
        : 'I am offline right now. You can paste a suspicious message for me to check, or open Tips.',
    warning_signs: [],
    next_step: '',
  }
}
