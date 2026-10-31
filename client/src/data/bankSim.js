// Sample details for the generic bank practice. Nothing here is a real account.
export const RECIPIENT = {
  name: 'Muhammad Amaad Ahmad',
  bank: 'Meezan Bank',
  iban: 'PK36MEZN0000001234567890',
}

export const TOPUP_NUMBER = '03001234567'

const T = (en, ru, ur) => ({ en, ru, ur })

export const BANK_LINES = {
  dash: T(
    'This is your practice bank. Choose what you want to do.',
    'Yeh aap ka practice bank hai. Chunein aap kya karna chahte hain.',
    'یہ آپ کا پریکٹس بینک ہے۔ چنیں آپ کیا کرنا چاہتے ہیں۔',
  ),
  sendBank: T(
    'Choose the bank where the money should go.',
    'Woh bank chunein jahan paise bhejne hain.',
    'وہ بینک چنیں جہاں پیسے بھیجنے ہیں۔',
  ),
  copyIban: T(
    'The details are in the yellow box. Press Copy next to the IBAN.',
    'Tafseelat peele dabbe mein hain. IBAN ke saath Copy dabayein.',
    'تفصیلات پیلے ڈبے میں ہیں۔ آئی بان کے ساتھ کاپی دبائیں۔',
  ),
  copyInvoice: T(
    'This is a sample bill. Press Copy next to the invoice number.',
    'Yeh namoona bill hai. Invoice number ke saath Copy dabayein.',
    'یہ نمونہ بل ہے۔ انوائس نمبر کے ساتھ کاپی دبائیں۔',
  ),
  paste: T(
    'Copied. Now press Paste, then the green button.',
    'Copy ho gaya. Ab Paste dabayein, phir sabz button.',
    'کاپی ہو گیا۔ اب پیسٹ دبائیں، پھر سبز بٹن۔',
  ),
  ibanFormat: T(
    'An IBAN has 24 characters and starts with PK. Please paste it again.',
    'IBAN 24 huroof ka hota hai aur PK se shuru hota hai. Dobara paste karein.',
    'آئی بان چوبیس حروف کا ہوتا ہے اور پی کے سے شروع ہوتا ہے۔ دوبارہ پیسٹ کریں۔',
  ),
  ibanUnknown: T(
    'This account was not found. Please use the IBAN from the yellow box.',
    'Yeh account nahi mila. Peele dabbe wala IBAN istemal karein.',
    'یہ اکاؤنٹ نہیں ملا۔ پیلے ڈبے والا آئی بان استعمال کریں۔',
  ),
  amount: T(
    'The name was found. Type the amount, for example 500.',
    'Naam mil gaya. Raqam likhein, misaal ke taur par 500.',
    'نام مل گیا۔ رقم لکھیں، مثال کے طور پر پانچ سو۔',
  ),
  amountBad: T(
    'Please check the amount. It must be a number within your balance.',
    'Raqam dekh lein. Yeh aap ke balance ke andar honi chahiye.',
    'رقم دیکھ لیں۔ یہ آپ کے بیلنس کے اندر ہونی چاہیے۔',
  ),
  review: T(
    'Read the name and amount carefully, then press Confirm and Pay.',
    'Naam aur raqam ghaur se parhein, phir Confirm and Pay dabayein.',
    'نام اور رقم غور سے پڑھیں، پھر کنفرم اینڈ پے دبائیں۔',
  ),
  sendDone: T(
    'Well done! You can now try the real world easypaisa test.',
    'Shabash! Ab aap real world easypaisa test try kar sakte hain.',
    'شاباش! اب آپ ریئل ورلڈ ایزی پیسہ ٹیسٹ آزما سکتے ہیں۔',
  ),
  billCategory: T(
    'Which bill do you want to pay?',
    'Aap kaunsa bill ada karna chahte hain?',
    'آپ کون سا بل ادا کرنا چاہتے ہیں؟',
  ),
  billCompany: T(
    'Choose the company printed on your bill.',
    'Bill par likhi company chunein.',
    'بل پر لکھی کمپنی چنیں۔',
  ),
  invoiceBad: T(
    'This number does not match the bill. Please copy it again.',
    'Yeh number bill se nahi milta. Dobara copy karein.',
    'یہ نمبر بل سے نہیں ملتا۔ دوبارہ کاپی کریں۔',
  ),
  billDetails: T(
    'Check the name, date and amount, then press Pay Now.',
    'Naam, tareekh aur raqam dekh lein, phir Pay Now dabayein.',
    'نام، تاریخ اور رقم دیکھ لیں، پھر پے ناؤ دبائیں۔',
  ),
  billDone: T(
    'Your bill is paid. Keep this receipt as proof.',
    'Aap ka bill ada ho gaya. Yeh raseed saboot ke taur par rakhein.',
    'آپ کا بل ادا ہو گیا۔ یہ رسید ثبوت کے طور پر رکھیں۔',
  ),
  topup: T(
    'Type the mobile number from the yellow box and an amount.',
    'Peele dabbe wala mobile number aur raqam likhein.',
    'پیلے ڈبے والا موبائل نمبر اور رقم لکھیں۔',
  ),
  topupBad: T(
    'Please check the number in the yellow box.',
    'Peele dabbe wala number dobara dekhein.',
    'پیلے ڈبے والا نمبر دوبارہ دیکھیں۔',
  ),
  done: T('Done! Well done.', 'Ho gaya! Shabash.', 'ہو گیا! شاباش۔'),
  myBills: T(
    'These are your bills. Press Pay on any unpaid bill.',
    'Yeh aap ke bills hain. Kisi bhi baqi bill par Pay dabayein.',
    'یہ آپ کے بل ہیں۔ کسی بھی باقی بل پر پے دبائیں۔',
  ),
}
