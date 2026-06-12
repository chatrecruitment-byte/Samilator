'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'ai' | 'user'
  content: string
  type?: 'question' | 'feedback' | 'score'
  correct?: boolean
}

// Training questions based on A.Y.C Chatter Wiki + PSP PDF
const DEMO_QA = [

  // ========== RAPPORT (הכי חשוב) ==========
  {
    question: 'מה זה Rapport ולמה הוא הבסיס לכל מכירה?',
    answer: 'Rapport הוא מערכת יחסים חמה ואמינה שבה המנוי מרגיש קשר אישי. כשיש rapport טוב — המנוי מרגיש שיש לו קשר ייחודי עם המודל, סומך עליה, הופך תלוי רגשית, ומוציא הרבה כסף לאורך זמן.',
    keywords: ['קשר', 'אמון', 'רגשי', 'תלוי', 'ייחודי', 'זמן'],
  },
  {
    question: 'מה 3 סוגי ה-Rapport? תסביר כל אחד בקצרה.',
    answer: '1) Basic Rapport — בסיס של אמון: הקשבה פעילה, נקודות משותפות, שימוש בשם. 2) Emotional Rapport — עומק רגשי: אמפתיה, שיתוף בחוויות, תמיכה בקשיים. 3) Sexual Rapport — מתח מיני: פלירט עדין, בניית ציפייה, כיבוד גבולות.',
    keywords: ['basic', 'emotional', 'sexual', '3', 'אמון', 'אמפתיה', 'פלירט'],
  },
  {
    question: 'מה זה "Active Listening" ואיך עושים את זה בצ\'אט?',
    answer: 'הקשבה פעילה = להגיב לפרטים שהמנוי אמר, לשאול שאלות המשך על מה שהוא שיתף, להראות שאתה זוכר מה הוא אמר בשיחות קודמות. לא לדלג קדימה ולא לענות תשובות גנריות.',
    keywords: ['זוכר', 'שאלה', 'פרטים', 'המשך', 'גנרי', 'הגיב'],
  },
  {
    question: 'מה נושאי השיחה (Talking Points) ל-Emotional Rapport?',
    answer: 'מטרות וחלומות אישיים, חוויות בלתי נשכחות בחיים, ניסיון בזוגיות ודייטינג. אלה הנושאים שיוצרים עומק רגשי ואמון.',
    keywords: ['חלומות', 'מטרות', 'חוויות', 'זוגיות', 'דייטינג', 'עומק'],
  },
  {
    question: 'מה נושאי השיחה (Talking Points) ל-Sexual Rapport?',
    answer: 'חוויית ה-OnlyFans שלו, חיי המין שלו ופנטזיות, מה מדליק אותו ומה לא. אלה הנושאים שיוצרים מתח מיני ומקדמים לסקסטינג.',
    keywords: ['פנטזיה', 'מדליק', 'מין', 'onlyfans', 'חוויה', 'מתח'],
  },
  {
    question: 'מנוי שיתף אירוע חשוב בחייו — מה עושים עם המידע הזה?',
    answer: 'מתעדים אותו ב-Notes עם תאריך, ועושים follow-up בהמשך — שואלים איך זה הלך. לדוגמה: "ספרת שאתה נוסע לניו יורק השבוע, איך היה?" — זה מה שגורם למנוי להרגיש שאכפת לך ממנו אישית.',
    keywords: ['notes', 'follow-up', 'תאריך', 'אכפת', 'תיעוד', 'אישי'],
  },
  {
    question: 'מנוי לא ענה 24 שעות — מה עושים ומה אסור לעשות?',
    answer: 'עושים follow-up אישי — גוללים אחורה בשיחה ומוצאים פרט אישי לשאול עליו. אסור לשלוח "היי איך אתה?" — זה גנרי ולא עובד. אסור גם לשלוח PPV. חייב להיות מותאם אישית לו.',
    keywords: ['אישי', 'גלול', 'גנרי', 'לא PPV', 'follow-up', '24'],
  },
  {
    question: 'מה ההבדל בין מנוי Whale למנוי רגיל מבחינת הטיפול?',
    answer: 'Whale מטופל כמו מלך — מעדכנים אותו כל בוקר/צהריים/ערב, מקשיבים לו בתשומת לב, תומכים בו, מייחסים לו תשומת לב ייחודית. מנוי רגיל — טיפול טוב אבל לא ברמת הפינוק של ה-Whale.',
    keywords: ['מלך', 'בוקר', 'ערב', 'ייחודי', 'תומכים', 'מקשיבים'],
  },
  {
    question: 'למה חשוב לשאול מנויים על תמונות שלהם ומתי כדאי לעשות את זה?',
    answer: 'שאלת תמונות מגבירה אינטימיות ויוצרת קשר אישי. עם מנויים חדשים — להיזהר ולא לבקש מיד, כי עלול להרגיש מוזר לפני שיש קשר. לחכות עד שיש rapport בסיסי.',
    keywords: ['תמונה', 'אינטימיות', 'חדש', 'זהיר', 'rapport', 'קשר'],
  },
  {
    question: 'מנוי שיתף שיש לו בעיות כסף — איך בונים איתו rapport נכון?',
    answer: 'מקשיבים, מאמפתים, לא שופטים. לא שולחים PPV. ממשיכים לתת לו חווית GF טובה כדי שיחזור כשיהיה לו כסף. מנוי שמרגיש שמבינים אותו ישקיע יותר בעתיד.',
    keywords: ['אמפתיה', 'GF', 'לא PPV', 'יחזור', 'מקשיב', 'כסף'],
  },

  // ========== PSP ==========
  {
    question: 'מה זה PSP ומה המטרה שלו? (ה-ONE THING)',
    answer: 'PSP = Pre-Sexting Phase. זה המעבר הנכון משיחה רגילה לסקסטינג. זה ה-ONE THING שמכפיל את ה-PPV unlock rates ב-3-5x. המטרה: לגרום למנוי להיות חם מבפנים לפני שמוכרים לו.',
    keywords: ['PSP', 'מעבר', 'סקסטינג', 'PPV', '3', '5', 'חם'],
  },
  {
    question: 'למה לא כדאי לשלוח PPV מיד אחרי שמנוי אומר "I miss you" בלי PSP?',
    answer: 'כי המנוי עדיין לא חם מספיק. כשמנוי לא חם הוא חושב: "למה לשלם כשיש פורנו חינמי?", "האם היא בכלל אמיתית?", הולך לדוגמנית אחרת. חייבים לחמם אותו בהדרגה — כמו הצפרדע במים קרים.',
    keywords: ['לא חם', 'פורנו', 'אמיתית', 'צפרדע', 'בהדרגה', 'חינמי'],
  },
  {
    question: 'מה האנלוגיה של הצפרדע ב-PSP ומה המסר שלה?',
    answer: 'צפרדע שנזרקת למים רותחים — קופצת ובורחת. צפרדע שנזרקת למים קרים שמתחממים לאט — נשארת עד הסוף. המסר: לחמם את המנוי בהדרגה, לא להציף אותו ישירות בסקסטינג ו-PPV.',
    keywords: ['צפרדע', 'בהדרגה', 'מים', 'קרים', 'לאט', 'רותחים'],
  },
  {
    question: 'מה זה "אורות אדומים" ב-PSP? תן 4 דוגמאות.',
    answer: 'אורות אדומים = סימנים שלא כדאי לעבור ל-PSP וסקסטינג. דוגמאות: המנוי בחוץ, עומד לעזוב, מישהו לידו בבית, עונה תשובות קצרות חד-הברתיות, קרה לו משהו רע, מתלונן על כסף.',
    keywords: ['אדום', 'בחוץ', 'עוזב', 'חד-הברתי', 'כסף', 'מישהו'],
  },
  {
    question: 'מה זה "אורות ירוקים" ב-PSP? תן 4 דוגמאות.',
    answer: 'אורות ירוקים = סימנים שכדאי להתחיל PSP. דוגמאות: המנוי לבד בבית, אין לו תוכניות, שלח "I miss you", מחמיא לתוכן האחרון, עונה מהר, שולח הודעות ארוכות חמות, אומר שהוא משועמם.',
    keywords: ['ירוק', 'לבד', 'miss you', 'מחמיא', 'מהר', 'משועמם'],
  },
  {
    question: 'מנוי לא נותן אורות ירוקים ולא אורות אדומים — מה עושים?',
    answer: 'מפתים אותו לאורות ירוקים — שואלים אותו מה הוא עושה, האם הוא לבד בבית, האם הוא לא הולך להגיד כלום על התוכן האחרון שפרסמנו. אם הוא נותן אורות אדומים — עוצרים.',
    keywords: ['מפתה', 'לבד', 'מה עושה', 'תוכן', 'שואל', 'עוצר'],
  },
  {
    question: 'כמה שאלות PSP צריך לשאול לפני שמתחילים סקסטינג ו-PPV?',
    answer: '4-5 שאלות PSP מספיקות כדי לגרום למנוי להיות חם לגמרי. אחרי שמתחילים סקסטינג ו-PPV — ממשיכים לשאול שאלות מדי פעם, ושמים לב לאיזה חלקי גוף וקינקים הוא מזכיר כדי לדעת מה למכור.',
    keywords: ['4', '5', 'שאלות', 'חם', 'קינק', 'חלקי גוף', 'למכור'],
  },
  {
    question: 'מה ההגדרה המדויקת של PSP — מה עושים בפועל?',
    answer: 'PSP = לשאול שאלות שמ-TRIGGER את המנוי ולהגביר מה שהוא אומר. לגרום לו לומר מחמאות ודברים מיניים מעצמו. הוא מחמם את עצמו בעצמו — אנחנו רק מושכים את הלשון שלו.',
    keywords: ['trigger', 'מגביר', 'מחמאות', 'מעצמו', 'מושכים', 'לשון'],
  },
  {
    question: 'מנוי כותב "I miss you" — מה השאלת PSP הנכונה לשלוח?',
    answer: '"Really? How badly did you miss me?" 😏 — שאלה שגורמת לו להשקיע ולפרט, מגבירה את החמימות, ומתחילה את ה-PSP בצורה טבעית.',
    keywords: ['how badly', 'miss me', 'משקיע', 'מפרט', 'PSP', 'שאלה'],
  },
  {
    question: 'מה ההבדל בין אור ירוק אדום ל-Spender לעומת Time Waster?',
    answer: 'אם יש אורות אדומים ל-Spender/Whale — לא עוצרים, ממשיכים בשיחה רגילה, בונים rapport, תומכים בו. אם יש אורות אדומים ל-Time Waster/Brokie — מפסיקים לדבר מיד ועוברים למנויים אחרים.',
    keywords: ['spender', 'time waster', 'ממשיך', 'מפסיק', 'rapport', 'עוצר'],
  },

  // ========== Texting Rules & Mindset ==========
  {
    question: 'מנוי חדש נכנס לפרופיל בפעם הראשונה. מה השאלות שחובה לשאול?',
    answer: 'מאיפה אתה / מה שמך / בן כמה אתה / מה אתה עושה לפרנסה / מה התחביבים שלך / האם אתה עוסק בספורט. לאחר מכן מעדכנים את ה-Notes עם כל המידע.',
    keywords: ['שם', 'גיל', 'מאיפה', 'עבודה', 'תחביב', 'נוטס', 'ספורט'],
  },
  {
    question: 'מנוי אמר שאין לו כסף — 5 דקות אחרי כן אתה שולח לו PPV. מה הבעיה?',
    answer: 'טעות קריטית. כשמנוי אומר שאין לו כסף ממשיכים לתת לו חווית GF מעולה בלי מכירה. המטרה: שיחזור בשכר הבא ויוציא הכל. לחצן מכירה אחרי "אין לי כסף" הורס את האמון.',
    keywords: ['GF', 'חווית', 'לא PPV', 'יחזור', 'שכר', 'אמון'],
  },
  {
    question: 'מה ה-Mentality הנכון של צ\'אטר — מי הם המנויים?',
    answer: 'המנויים הם לקוחות OnlyFans שרוצים תשומת לב ממודל יפה. צריך לשחק את תפקיד הבחורה הצעירה הביישנית, להיות אמפתי, לשחק על רגשות — לא להיות מוכרן ולא רובוט מין. תמיד ללכת מעל ומעבר.',
    keywords: ['תפקיד', 'אמפתי', 'רגשות', 'לא מוכר', 'לא רובוט', 'מעבר'],
  },

  // ========== נוהל משמרת ==========
  {
    question: 'מה עושים 10 דקות לפני תחילת משמרת?',
    answer: 'יושבים מול המחשב, מתעדכנים במצב הצ\'אט, בוחרים סקריפטים ותוכן למכור, מתכננים איך למכור, מעלים סטורי באונליפאנס, ועושים Clock In בקבוצת הטלגרם.',
    keywords: ['10 דקות', 'סקריפט', 'סטורי', 'clock in', 'טלגרם', 'תכנון'],
  },
  {
    question: 'מה עושים בסוף משמרת לפני שעוזבים?',
    answer: 'מחכים שהצ\'אטר המחליף עושה Clock In, עושים Clock Out, מעדכנים אותו על שיחות פתוחות חשובות (אמצע סקריפט, מנוי חם), עוברים על מנויים חדשים, ממלאים דו"ח משמרת.',
    keywords: ['clock out', 'מחליף', 'עדכון', 'שיחות פתוחות', 'דוח', 'רשימות'],
  },

  // ========== תיוג מנויים ==========
  {
    question: 'מה האמוג\'י שמוסיפים לכל מנוי שפותח שיחה בפעם הראשונה ולמה?',
    answer: 'מוסיפים 🐢 (Turtle) — ככה יודעים שהמנוי פעיל ושוחח איתנו. מעדכנים גם את שמו בכותרת. זה הצעד הראשון בתיוג.',
    keywords: ['🐢', 'turtle', 'שם', 'כותרת', 'ראשון', 'פעיל'],
  },
  {
    question: 'מה האמוג\'י של Whale? Slave? Time Waster? Solid Spender?',
    answer: 'Whale = 🐳, Slave = ⛓️, Time Waster = ⌛, Solid Spender = 😊. תיוג נכון חוסך זמן ומאפשר לדעת איך לנהל שיחה לפני שקוראים מילה אחת.',
    keywords: ['🐳', '⛓️', '⌛', '😊', 'whale', 'slave', 'time waster'],
  },

  // ========== Note-Taking ==========
  {
    question: 'מה 4 הקטגוריות שחייבות להיות ב-Notes של מנוי?',
    answer: '1) מידע בסיסי: שם, גיל, מיקום, עיסוק, סטטוס, טראפיק. 2) מידע התנהגותי: איך לנהוג איתו, הרגלי קנייה, קינקים. 3) מידע אישיותי: עונה מועדפת, אוכל, מקומות. 4) מידע עם תאריך: הופעות, תשלומים, טיולים מתוכננים.',
    keywords: ['שם', 'גיל', 'קינק', 'קנייה', 'תאריך', 'תיוג', 'מיקום'],
  },
  {
    question: 'מנוי שיתף שהוא נוסע לחופשה בשבוע הבא — מה עושים עם המידע הזה?',
    answer: 'מתעדים ב-Notes עם תאריך, ואחרי שהוא חוזר שואלים אותו איך היה — "ספרת שנסעת לברצלונה, איך היה?" זה מה שגורם לו להרגיש שאכפת לך ממנו אישית ולא רק מכסף.',
    keywords: ['notes', 'תאריך', 'שואל', 'חזר', 'אכפת', 'אישי'],
  },
  {
    question: 'מנוי לא רוצה לשתף פרטים אישיים — מה עושים?',
    answer: 'לא לוחצים עליו בכלל. קודם בונים rapport ויוצרים תחושת בטיחות בשיחה. כשהוא ירגיש בטוח — הוא ישתף מעצמו. לחץ על מידע לפני rapport הורס את האמון.',
    keywords: ['לא לוחץ', 'rapport', 'בטיחות', 'מעצמו', 'אמון', 'בטוח'],
  },
  {
    question: 'מה ה"מידע ההתנהגותי" שצריך לתעד על מנוי ולמה הוא חשוב?',
    answer: 'איך להתנהג איתו, איך הוא מקבל החלטות, מה הקינקים שלו, מה הוא אוהב במודל, הרגלי הקנייה שלו. מידע זה מאפשר להתאים את הגישה לכל מנוי ולמכור לו בדיוק מה שהוא רוצה.',
    keywords: ['קינק', 'קנייה', 'החלטות', 'אוהב', 'התנהגות', 'מתאים'],
  },
  {
    question: 'מנוי ציין שהוא אוהב את הרגליים של המודל — מה עושים עם המידע הזה?',
    answer: 'מתעדים ב-Notes תחת "קינקים" או "מה הוא אוהב במודל". בהמשך — כשמוכרים PPV או סקריפט, מדגישים דווקא את החלק הזה. "זוכר שאמרת שאתה אוהב את הרגליים שלי?" — ממכירה גנרית למכירה מדויקת.',
    keywords: ['notes', 'קינק', 'זוכר', 'PPV', 'מדויק', 'רגליים'],
  },

  // ========== נוהל עבדים ==========
  {
    question: 'איך גישת הצ\'אט עם עבד (Slave ⛓️) שונה ממנוי רגיל?',
    answer: 'עם עבד אתה שולט לחלוטין — לא שואל שאלות פתיחה רגילות, מציב עובדות ודורש, נותן משימות, דורש טיפים. לא קוראים לו מאמי/חיים שלי. לא מבקשים ממנו אישור לכלום — אתה מכתיב הכל.',
    keywords: ['שולט', 'משימות', 'דורש', 'לא אישור', 'לא מאמי', 'מכתיב'],
  },

  // ========== מילים אסורות ==========
  {
    question: 'מנוי מבקש לקבוע פגישה — מה עושים ולמה זה מסוכן?',
    answer: 'מסרבים מיד. המילה "meet" היא מילה אסורה ב-OnlyFans שמסכנת את חשבון הדוגמנית ועלולה להוביל לחסימה ופיטורים מיידיים. גם רמיזה עקיפה אסורה.',
    keywords: ['meet', 'אסור', 'חסימה', 'פיטורים', 'פגישה', 'מסרב'],
  },
  {
    question: 'מה 3 קטגוריות המילים האסורות העיקריות שחייבים לדעת?',
    answer: '1) פגישות ומידע אישי: meet, כתובת, טלפון. 2) תשלומים חיצוניים: PayPal, ביט, Telegram. 3) תכנים אסורים: כל מה שקשור לקטינים, אלימות, חיות, ביזוי קיצוני אסור על פי OnlyFans.',
    keywords: ['meet', 'paypal', 'telegram', 'קטינים', 'אלימות', 'חיות'],
  },
  {
    question: 'מנוי מבקש לעבור לטלגרם — מה עושים?',
    answer: 'מסרבים בצורה עדינה. "Telegram" היא מילה אסורה ב-OnlyFans. כל התקשורת חייבת להישאר בתוך הפלטפורמה. אסור לפנות למנויים דרך אמצעי תקשורת חיצוני.',
    keywords: ['telegram', 'אסור', 'פלטפורמה', 'חיצוני', 'מסרב', 'תקשורת'],
  },

  // ========== Code of Conduct ==========
  {
    question: 'מנוי מבקש מידע אישי כמו מספר טלפון — מה עושים?',
    answer: 'מסרבים בצורה עדינה. אסור לחלוטין לשתף מידע אישי: טלפון, כתובת, מייל, מסמכים, מידע פיננסי. גם אסור לבקש מידע כזה מהמנוי — אלא אם הוא מציע מרצונו.',
    keywords: ['אסור', 'טלפון', 'כתובת', 'מייל', 'אישי', 'מסרב'],
  },

  // ========== Case Studies ==========
  {
    question: 'Case Study: מנוי רק התעורר ופתח שיחה. שלחת לו מיד סקסטינג ו-PPV — למה זה טעות?',
    answer: 'כי לא בדקת את הטמפרטורה שלו. יכול להיות שיש לו תוכניות בוקר, הוא לא לבד, או לא במצב רוח. קודם שואלים: מה הוא עושה, האם הוא לבד, מה התוכניות — ורק אחרי שיש אורות ירוקים מתחילים PSP.',
    keywords: ['טמפרטורה', 'לבד', 'תוכניות', 'בוקר', 'אורות', 'ירוקים'],
  },
  {
    question: 'Case Study: מנוי מתלונן שדוגמניות אחרות רימו אותו בכסף. מה הצעד הנכון?',
    answer: 'זה הזמן לבנות אמון — לא למכור! מראים אמפתיה, מבינים אותו, מבדלים את עצמנו: "אני לא כאלה, אני כאן בשבילך". רק אחרי שהרגשנו שהוא מאמין לנו ויש rapport — אפשר לעבור למכירה.',
    keywords: ['אמון', 'אמפתיה', 'מבדלים', 'לא למכור', 'rapport', 'מאמין'],
  },
  {
    question: 'Case Study: Push/Pull — מנוי ביקש תמונות ישנות. איך מוכרים אותן ב-$200 בלי לאמר "כן" ישר?',
    answer: 'משתמשים ב-Push/Pull: מראים עניין ואז מהססים — "אני לא בטוחה אם אני רוצה לשתף אותן, זה מאוד אישי". המנוי רוצה עוד, מתחנן, מרגיש שזה נדיר ומיוחד. כשהוא כבר בוער — מציעים במחיר גבוה.',
    keywords: ['push', 'pull', 'מהסס', 'נדיר', 'מיוחד', 'בוער', 'גבוה'],
  },
  {
    question: 'Case Study: Whale קנה הרבה ועכשיו הפסיק לדבר ולהוציא כסף. מה עושים?',
    answer: 'לא דוחפים מכירות. חוזרים ל-rapport — שואלים אותו איך הוא, מה קורה בחיים שלו, מראים שאכפת לנו ממנו כאדם. ה-Whale שהפסיק בדרך כלל עצר בגלל שהרגיש שמישהו מתייחס אליו כארנק ולא כאדם.',
    keywords: ['rapport', 'אכפת', 'ארנק', 'אדם', 'לא מכירות', 'חוזר'],
  },
  {
    question: 'Case Study: New Whale subscriber — כמה הודעות סקסטינג צריך לשלוח בין כל PPV?',
    answer: '2-4 הודעות סקסטינג עם שאלות בין כל PPV — לא יותר ולא פחות. כל הזמן שואלים שאלות כדי לשמור אותו מעורב וחם. שימו לב לאיזה חלקי גוף הוא מזכיר — תמכרו לו PPV שמתאים לקינק שלו.',
    keywords: ['2', '4', 'הודעות', 'שאלות', 'PPV', 'קינק', 'חם'],
  },
  {
    question: 'Case Study: "Acting needy" — איך משתמשים ב"עצבנות חמודה" כדי למכור?',
    answer: 'מראים שאתה נחוץ ורוצה ממנו תשומת לב — "אתה לא מתגעגע אלי?", "אני כל הזמן חושבת עליך". זה גורם למנוי להרגיש שיש לו כוח ועניין מהמודל, הוא משקיע יותר רגשית ומוציא יותר כסף.',
    keywords: ['נחוץ', 'עצבני', 'חמוד', 'תשומת לב', 'מתגעגע', 'חושבת'],
  },

  // ========== Case Studies המשך ==========
  {
    question: 'Case Study: מנוי אמר "אין לי כסף לקנות כלום" — אחרי 5 דקות הוא שלח סלפי. מה הצעד הנכון?',
    answer: 'מבקשים ממנו סלפי, שולחים בחזרה, בונים מתח ואינטימיות בהדרגה. אפילו מנוי שאמר "אין כסף" — כשמחממים אותו נכון עם rapport + PSP הוא מוציא כסף. זה הוכח: אנדי אמר "told you I cannot buy anything" ואחרי חימום נכון שילם $15 ואחר כך $30.',
    keywords: ['סלפי', 'חימום', 'בהדרגה', 'rapport', 'PSP', 'מחממים'],
  },
  {
    question: 'Case Study: Whale בא לקנות ומוציא הרבה כסף — מתי עוצרים עם המכירה?',
    answer: 'לא עוצרים! ממשיכים לשלוח PPV עד שהוא אומר "זה מספיק" או מפסיק לקנות מרצונו. שגיאת צ\'אטרים נפוצה — לעצור מוקדם מדי כי "לא נעים" לדחוף. אבל Whale במצב קנייה = ממשיכים עד שהוא עצמו עוצר.',
    keywords: ['לא עוצרים', 'ממשיכים', 'PPV', 'whale', 'קנייה', 'מרצונו'],
  },
  {
    question: 'Case Study: שלחת PPV ומנוי פשוט שלח תמונה שלו ולא פתח. מה עושים?',
    answer: 'ממשיכים לבנות מתח! לא מוותרים ולא שואלים "פתחת?" — ממשיכים בסקסטינג ומגדילים את הציפייה. שולחים PPV נוסף בהמשך עם סיפור טוב יותר. מנוי שלא פתח לא אומר לא — הוא עדיין חם, צריך עוד מעט דחיפה.',
    keywords: ['ממשיך', 'מתח', 'לא מוותר', 'ציפייה', 'PPV', 'חם'],
  },
  {
    question: 'Case Study: Netflix Script — מנוי אמר שהוא צופה בנטפליקס ובבית לבד. מה שולחים?',
    answer: '"אני גם צופה בנטפליקס, אין לי תוכניות, האם אתה לבד?" — אחרי שמאשר לבד ומשועמם — מתחילים לבנות מתח עם חילופי סלפי, ואז עוברים לסקריפט סקסטינג. Netflix + לבד + בבית = תנאים מושלמים להתחיל PSP.',
    keywords: ['נטפליקס', 'לבד', 'בבית', 'סלפי', 'PSP', 'מתח'],
  },
  {
    question: 'Case Study: מנוי מנסה להוריד מחיר — "אני מוכן לשלם $10 בלבד". מה התגובה הנכונה?',
    answer: 'משתמשים ב-FOMO/scarcity: "אם אתה לא יכול להרשות לעצמך, יצטרך לדבר עם מישהו אחר. רציתי לסיים ביחד אבל לא יכולה בשביל $10..." — גורמים לו לפחד שיאבד אותנו, ובדרך כלל הוא משלם יותר. לא נכנעים מיד למחיר נמוך.',
    keywords: ['FOMO', 'scarcity', 'אחר', 'יאבד', 'לא נכנעים', 'מחיר'],
  },
  {
    question: 'Case Study: מנוי "ישן" — לא ענה ולא קנה חודש שלם. מה עושים?',
    answer: 'לא מוותרים! ממשיכים לעשות follow-up אישי, שואלים איך הוא, מה קורה בחייו. מנוי שישן חודש יכול להפוך ל-Whale בחודש הבא. המקרה של Jon — לא הגיב חודש, הפך ל-Whale מהיום הראשון שפתחו שוב.',
    keywords: ['follow-up', 'לא מוותר', 'whale', 'ישן', 'אישי', 'חודש'],
  },
  {
    question: 'Case Study: "Yes Ladder" — מה זה ואיך עושים את זה לפני סקסטינג?',
    answer: 'Yes Ladder = לגרום למנוי להסכים לדברים קטנים לפני הדבר הגדול. לדוגמה: "אתה בבית?" → כן. "אתה לבד?" → כן. "אתה לא מספר לי שום דבר על התוכן האחרון שלי?" → מחמיא. ← עכשיו הוא חם ומוכן. כל "כן" קטן מוביל ל"כן" גדול של PPV.',
    keywords: ['yes ladder', 'כן', 'קטן', 'בבית', 'לבד', 'מוכן'],
  },
  {
    question: 'Case Study: מנוי שלח סלפי שלו — איך מגיבים כדי לבנות מתח?',
    answer: 'מגיבים בחיוב, שולחים סלפי חזרה, ומתחילים לשאול שאלות מיניות קלות: "רק העיניים שלך?" / "ואיפה היית מתחיל ממני?" — שאלות שגורמות לו לתאר מה הוא רוצה. ככל שהוא מפרט יותר — כך הוא חם יותר וקרוב יותר לקנות.',
    keywords: ['סלפי', 'שאלה', 'מיני', 'מפרט', 'חם', 'מתחיל'],
  },
  {
    question: 'Case Study: מנוי גדול (Drama Queen Whale) הפסיק לקנות ומגיב בקצרה. מה הגישה?',
    answer: 'לא מוכרים ולא שואלים על כסף. מראים שמתגעגעים ושאכפת — "hi daddy, how\'s your day going?", ממתינים לתגובה, ומפנקים. Whale שנפגע רגשית צריך לחוש שאכפת לנו ממנו כאדם לפני שיחזור לקנות.',
    keywords: ['drama', 'whale', 'מתגעגע', 'אכפת', 'לא מוכר', 'רגשית'],
  },
  {
    question: 'Case Study: מה זה Toolbaz ולמה צ\'אטר טוב צריך להשתמש בזה?',
    answer: 'Toolbaz.com הוא כלי AI ליצירת סיפורי מין. יש מנויים שלא אכפת להם מהתוכן — הם רוצים לשמוע פנטזיות וסיפורים. סיפורים איכותיים = retention + הזמנת customs. מכינים ספריית סיפורים מראש בין השיחות.',
    keywords: ['toolbaz', 'סיפור', 'AI', 'retention', 'customs', 'ספריה'],
  },
  {
    question: 'Case Study: שלחת PPV באמצע שיחה קרה בלי הכנה — מה יקרה ולמה?',
    answer: 'הוא כנראה לא יפתח. כשמנוי עדיין קר — הוא לא מחובר רגשית, חושב על פורנו חינמי, ולא מרגיש שזה שווה. PPV ללא הכנה = בזבוז. קודם חייבים: PSP + yes ladder + ווידוא שהוא לבד + חימום מינימום 4-5 הודעות.',
    keywords: ['קר', 'לא פותח', 'PSP', 'yes ladder', 'לבד', 'חימום'],
  },
  {
    question: 'Case Study: "Unjustified Horniness" — מה הטעות ואיך נמנעים ממנה?',
    answer: 'הגעת לסקסטינג ללא הצדקה — השיחה עדיין קרה, המנוי לא לבד, לא בנית מתח. כשמודל מדווחת "אני כל כך נרגשת עכשיו" בלי סיבה — זה נראה מזויף. חייבים להצדיק את ההתרגשות: exchange תמונות, שאלות PSP, אישור שהוא לבד.',
    keywords: ['unjustified', 'מזויף', 'קרה', 'לבד', 'להצדיק', 'PSP'],
  },
  {
    question: 'Case Study: מנוי בא לקנות PPV אחד — מה ההזדמנות שרוב הצ\'אטרים מפספסים?',
    answer: 'ממשיכים לשלוח PPV נוספים בסדרה. Whale בקנייה = לא עוצרים אחרי ה-PPV הראשון. בין כל PPV — 2-4 הודעות סקסטינג עם שאלות. עד שהוא אומר "enough" — ממשיכים. מי שעוצר מוקדם מדי מפסיד כסף.',
    keywords: ['סדרה', 'ממשיך', 'enough', 'לא עוצר', '2-4', 'PPV'],
  },
  {
    question: 'Case Study: מנוי שיתף סלפי ואמר "I always start at the lips" — מה עושים עם המידע הזה?',
    answer: 'מגיבים באותה שפה — "this is very gentlemanly of you, I don\'t like it when men go straight for sex". זה בונה emotional rapport ומגביר את המתח. ואז מנצלים את מה שהוא שיתף ("lips") בהמשך הסקסטינג — כך הוא מרגיש שהמנוי שלו אישי ומיוחד.',
    keywords: ['שפה', 'lips', 'emotional', 'rapport', 'מתח', 'אישי'],
  },
  {
    question: 'Case Study: Push/Pull — מנוי ביקש תמונות "ישנות ונדירות". איך גורמים לו לשלם $200 במקום לתת חינם?',
    answer: 'משחקים את הביישנות — "I\'m not sure if I should sell this... nobody has seen this yet... I never planned to do it". יוצרים בלעדיות: "you\'ll be the very FIRST one to see it". מנוי שמרגיש שהוא מקבל משהו נדיר ואישי שאף אחד אחר לא ראה — ישלם מחיר גבוה מרצונו.',
    keywords: ['נדיר', 'בלעדיות', 'ראשון', 'shy', 'ביישן', 'לא בטוח'],
  },
  {
    question: 'Case Study: מנוי חדש נכנס לדף — מה עדיף: לשלוח PPV מיד או לפתוח בשיחה אישית?',
    answer: 'לפתוח בשיחה אישית! "Hey Donald, I just wanted to personally welcome you to my page". קודם בונים היכרות, שואלים על הסופ"ש שלו, מתעניינים בו כאדם. המודל של דונלד עשתה זאת על פני ימים רבים לפני שהתחיל לקנות PPV — ואז הוא הפך למנוי קבוע ומשקיע.',
    keywords: ['ברוך הבא', 'אישי', 'היכרות', 'שואל', 'ימים', 'קודם'],
  },
  {
    question: 'Case Study: מנוי שאל "What if I wanna stay with you?" — זו רמיזה לפגישה. מה התגובה הנכונה?',
    answer: 'מסיטים בצורה עדינה ולא מעכלת — "Sorry babe but I have my girlfriend staying with me". לא מסרבים בצורה ישירה ולא מסבירים על "מדיניות". מנוי שקיבל "לא" עדין עם הסבר טבעי נשאר בשיחה ולא נפגע.',
    keywords: ['מסיט', 'עדין', 'חברה', 'טבעי', 'לא ישיר', 'נשאר'],
  },
  {
    question: 'Case Study: מנוי חם ומרגש מינית — מה קורה אם ממשיכים לחמם אותו?',
    answer: 'הוא יקנה ללא הגבלה כל עוד יש בכרטיס. "Once you got them all excited and horny, they will buy endlessly without limits as long as their card permits." המטרה: לא לעצור את המכירות כשהוא חם — להמשיך לשלוח PPV אחד אחרי השני.',
    keywords: ['חם', 'ללא הגבלה', 'כרטיס', 'ממשיך', 'לא עוצר', 'PPV'],
  },

  // ========== Case Studies — המשך ==========
  {
    question: 'Case Study: מנוי מספר לך על חלום רטוב שלו בבוקר. מה עושים עם המידע הזה?',
    answer: 'משתמשים במילים המדויקות שהוא אמר כדי לכתוב את תיאור ה-PPV. אם הוא אמר "you sat on my face" — תיאור ה-PPV יהיה "my pussy sitting on your face". המנוי מרגיש שה-PPV עשוי בדיוק בשבילו כי הוא מזהה את הפנטזיה שלו עצמו.',
    keywords: ['מילים', 'פנטזיה', 'חלום', 'PPV', 'מדויק', 'שלו'],
  },
  {
    question: 'Case Study: מנוי ותיק שקונה הרבה אמר "I have spent more money than I was supposed to". מה התגובה הנכונה?',
    answer: 'מקבלים בחן ולא לוחצים — "No worries daddy, you can do it whenever you want it soon, just dropping it here again to remind you in case you want it and when you need it". אל תפחידו אותו ואל תתנצלו. קבלה חמה + תזכורת עדינה שה-PPV עדיין שם.',
    keywords: ['קבלה', 'לא לוחץ', 'תזכורת', 'no worries', 'עדין', 'חן'],
  },
  {
    question: 'Case Study: מנוי שלח וידאו של עצמו. איך הופכים את זה להזדמנות מכירה?',
    answer: 'מנצלים את הוידאו שלו להצעת custom — "next time I would like to see you put the camera below your cock so that I can imagine me kneeling in front of you". נותנים לו הנחיות ספציפיות, גורמים לו להשקיע, ובהמשך מציעים custom video בתגובה לתוכן שלו.',
    keywords: ['custom', 'וידאו', 'הנחיות', 'מצלמה', 'להשקיע', 'הצעה'],
  },
  {
    question: 'Case Study: מנוי שאל "do you have a wife or girlfriend?" — למה זו הזדמנות זהב?',
    answer: 'מנוי ששואל את זה רוצה בלעדיות ואינטימיות. עונים "no daddy, just making sure I do not want to share what is mine" — משחקים את ה"קנאות החמודה". זה גורם לו להרגיש שיש ביניהם קשר אישי ובלעדי, מה שמחזק רגשית ומגדיל הוצאות.',
    keywords: ['בלעדי', 'קנאות', 'שלי', 'קשר', 'אישי', 'אינטימיות'],
  },
  {
    question: 'Case Study: מה זה GFS ומה ההבדל בינו לבין שיחה רגילה?',
    answer: 'GFS = Girlfriend Simulator. GFS ארוך טווח = שמירה על קשר יומי אמיתי: הודעת בוקר, הודעת לילה, שאלות על חיי היומיום שלו, זכירת פרטים אישיים ומעקב אחריהם. זה מה שגורם למנוי להיות emotionally dependent — הוא לא קונה פורנו, הוא "יוצא" עם המודל.',
    keywords: ['GFS', 'girlfriend', 'בוקר', 'לילה', 'יומי', 'תלות'],
  },
  {
    question: 'Case Study: איך מציעים custom video לאחר ראיפור עמוק?',
    answer: 'מחכים שהמנוי ישתף פנטזיה עמוקה או יאמר שיש לו morning wood — ואז: "Daddy, how about I make you a personalized video when I see your morning wood? What do you think of that idea?" הוא כבר חם, הרגש כבר קיים — הפנייה נחתת טבעית ובלי כפייה.',
    keywords: ['custom', 'פנטזיה', 'morning wood', 'personalized', 'טבעי', 'חם'],
  },
  {
    question: 'Case Study: מנוי על חופשה — איך שומרים על הקשר ומה שולחים?',
    answer: 'שואלים פרטים על החופשה — "last day in NY, right? What is your itinerary?" — ומראים עניין אמיתי בחיים שלו. שולחים תמונות/סקסטינג קל כדי שיחשוב עליה גם בזמן החופשה. מנוי שמקבל ניהול יחסים גם בזמן ריחוק נשאר מחובר ולא שוכח.',
    keywords: ['חופשה', 'שואל', 'עניין', 'ניהול', 'מחובר', 'פרטים'],
  },
  {
    question: 'Case Study: מנוי אמר "I didn\'t like it daddy" על תמונה שלחת. איך מגיבים?',
    answer: 'לא נבהלים ולא מתנצלים מיד — שואלים "Why didn\'t you like it?" ומחכים לתשובה. לעתים זהו פלירט קלאסי ("I loveeeeed it!!!"). הגישה: להישאר רגועה ולתחקר — לא לפנות אחורה אוטומטית. זה גם בונה מתח ופלאייפולנס.',
    keywords: ['לא נבהל', 'שואל', 'למה', 'פלירט', 'רגוע', 'מתח'],
  },
  {
    question: 'Case Study: מנוי חדש נכנס לדף — מה ההודעה הראשונה שיש לשלוח?',
    answer: '"Hey [name]! I just wanted to personally welcome you to my page" — הודעה אישית עם שמו, לא גנרית. לאחר מכן שואלים על הסוף שבוע שלו ומראים עניין בחייו. הכניסה האישית יוצרת תחושה שהמודל שמה לב אליו ספציפית — זה מה שמבדל ומייצר loyalty.',
    keywords: ['welcome', 'שם', 'אישי', 'לא גנרי', 'עניין', 'loyalty'],
  },
  {
    question: 'Case Study: מנוי שיתף שהוא מתעורר עם "morning wood" ולא מי שתטפל בו — מה עושים?',
    answer: 'מגיבים בצורה אינטימית שמראה שהמודל רוצה להיות זו שמטפלת בו — "you made me smile with this message, I wonder how much more if you showed me that morning wood" — מגבירים את הציפייה ומכינים את הקרקע ל-PPV ול-custom.',
    keywords: ['morning wood', 'ציפייה', 'אינטימי', 'מגביר', 'custom', 'טפל'],
  },
  {
    question: 'Case Study: Sleeping Fan — מה זה "Wrong Fan Trick" ואיך משתמשים בו?',
    answer: 'שולחים הודעה שנראית כאילו נשלחה בטעות למנוי הלא נכון — "oh wait, I meant to send this to someone else, sorry! But since you saw it...". זה מעורר סקרנות, גורם למנוי ל"נפול" ולפתוח שיחה, וכך מחזירים מנוי ישן שלא ענה.',
    keywords: ['טעות', 'wrong fan', 'סקרנות', 'ישן', 'מחזיר', 'בטעות'],
  },
  {
    question: 'Case Study: Sleeping Fan — מנוי לא ענה חודש שלם. מה הדרך הנכונה להחזיר אותו?',
    answer: 'לא שולחים PPV ולא הודעות מכירה. שולחים follow-up אישי ואותנטי — מזכירים פרט מהשיחה האחרונה. אם לא עובד — ה"wrong fan trick". המנוי (Jon) לא ענה חודש, חזר, והפך ל-Whale שהוציא $hundreds מהיום הראשון.',
    keywords: ['חודש', 'אישי', 'follow-up', 'wrong fan', 'whale', 'Jon'],
  },
  {
    question: 'Case Study: Sleeping Fan — איך מבנים Custom Video Deal עם מנוי? מה מבנה התשלום?',
    answer: 'מבקשים 50% מראש, 50% אחרי — "I need a deposit to start shooting, and the rest when I deliver". זה מגן מפני מנויים שלא ישלמו, ומסמל שהעסקה רצינית. לדון על הפרטים (כמה דקות, מה רוצים לראות, את שמו בוידאו) לפני שמתחילים.',
    keywords: ['50%', 'deposit', 'מקדמה', 'custom', 'מראש', 'אחרי'],
  },
  {
    question: 'Case Study: Negotiations — מנוי מתמקח ורוצה bundle זול. מה הטעות שעושים ומה עושים נכון?',
    answer: 'הטעות: לרדת מיד ל-$10 bundle כי "לא נעים". הנכון: להשתמש ב-FOMO — "if you cannot afford this I will have to talk to someone else who can". מנוי שמרגיש שיאבד את המודל עולה במחיר. אם נכנעים מהר — מכניסים אותו לדפוס של "תמיד יוזיל".',
    keywords: ['FOMO', 'bundle', 'מחיר', 'לא נכנעים', 'יאבד', 'מתמקח'],
  },
  {
    question: 'Case Study: Common Mistake — מה "Rushing the Sale" ולמה זה הורס מכירות?',
    answer: 'Rushing = לנסות למכור PPV לפני שבנית מספיק חום. המנוי לא עדיין מחובר, לא "בוער", ומרגיש שהוא ATM ולא בן אדם. כתוצאה: לא פותח, לא עונה, מבטל מנוי. חייבים ליצור rapport ו-PSP מינימלי לפני כל PPV — גם אם זה לוקח זמן.',
    keywords: ['rushing', 'מהר', 'ATM', 'חום', 'rapport', 'PSP'],
  },

]

export default function TrainingPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [score, setScore] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isDemo, setIsDemo] = useState(false)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startTraining() {
    setStarted(true)
    const firstQ = DEMO_QA[0]
    setMessages([{
      id: '1',
      role: 'ai',
      content: `שלום! אני כאן כדי לבחון אותך על מה שלמדת 🎓\n\nיש לנו ${DEMO_QA.length} שאלות היום. בהצלחה!\n\n**שאלה 1 מתוך ${DEMO_QA.length}:**\n${firstQ.question}`,
      type: 'question',
    }])
  }

  function checkAnswer(userAnswer: string, qIndex: number): { correct: boolean; feedback: string } {
    const qa = DEMO_QA[qIndex]
    const answerLower = userAnswer.toLowerCase()
    const matchedKeywords = qa.keywords.filter(kw => answerLower.includes(kw.toLowerCase()))
    const correct = matchedKeywords.length >= 2

    const feedback = correct
      ? `✅ **תשובה טובה!**\n\n${qa.answer}`
      : `❌ **לא מדויק.**\n\n**התשובה הנכונה:**\n${qa.answer}`

    return { correct, feedback }
  }

  async function sendAnswer() {
    if (!input.trim() || isLoading || finished) return
    const userText = input.trim()
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Try real OpenAI
    const systemPrompt = `אתה מאמן מקצועי לצ'אטרים ב-OnlyFans. תפקידך לבחון את המתלמד ולתת פידבק.
חומר הלימוד: כיצד לעבוד נכון עם מנויים — בניית קשר, מכירת PPV, טיפול בהתנגדויות.
שאלה נוכחית: ${DEMO_QA[questionIndex].question}
תשובת המתלמד: ${userText}

בדוק אם התשובה נכונה. תן פידבק ברור בעברית: האם נכון/לא נכון, למה, ומה התשובה הכי טובה.
סיים עם: "מוכן לשאלה הבאה?" אם יש עוד שאלות, או "סיימנו!" אם זו האחרונה.`

    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
      }),
    })
    const data = await res.json()

    let feedbackContent: string
    let correct: boolean

    if (data.demo || !data.reply) {
      setIsDemo(true)
      const result = checkAnswer(userText, questionIndex)
      feedbackContent = result.feedback
      correct = result.correct
    } else {
      feedbackContent = data.reply
      correct = data.reply.includes('✅') || data.reply.toLowerCase().includes('נכון') || data.reply.toLowerCase().includes('מצוין')
    }

    if (correct) setScore(prev => prev + 1)

    const feedbackMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: feedbackContent,
      type: 'feedback',
      correct,
    }
    setMessages(prev => [...prev, feedbackMsg])

    const nextIndex = questionIndex + 1
    setQuestionIndex(nextIndex)

    if (nextIndex < DEMO_QA.length) {
      setTimeout(() => {
        const nextQ = DEMO_QA[nextIndex]
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'ai',
          content: `**שאלה ${nextIndex + 1} מתוך ${DEMO_QA.length}:**\n${nextQ.question}`,
          type: 'question',
        }])
        setIsLoading(false)
      }, 800)
    } else {
      const finalScore = score + (correct ? 1 : 0)
      setTimeout(() => {
        setFinished(true)
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'ai',
          content: `🎉 **סיימת את האימון!**\n\nציון: **${finalScore}/${DEMO_QA.length}**\n\n${
            finalScore === DEMO_QA.length ? 'מושלם! אתה מוכן לשיחות אמיתיות 🏆' :
            finalScore >= DEMO_QA.length * 0.7 ? 'עבודה טובה! עוד קצת תרגול ותהיה מעולה 💪' :
            'כדאי לחזור על החומר ולנסות שוב 📚'
          }`,
          type: 'score',
        }])
        setIsLoading(false)
      }, 800)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-bg-hover shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">← חזור</button>
        <div className="flex items-center gap-3">
          <span className="text-text-primary font-semibold">🎓 אימון מקצועי</span>
          {isDemo && <span className="bg-accent-yellow/20 text-accent-yellow text-xs px-2 py-0.5 rounded-full">דמו</span>}
        </div>
        {started && (
          <span className="text-text-secondary text-sm">{score}/{DEMO_QA.length} ✓</span>
        )}
        {!started && <div className="w-16" />}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {!started ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="text-6xl">🎓</div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">אימון מקצועי</h1>
              <p className="text-text-secondary text-sm max-w-sm">
                הבינה תשאל אותך {DEMO_QA.length} שאלות על העבודה הנכונה עם מנויים.
                ענה בחופשיות — הבינה תתקן ותסביר.
              </p>
            </div>
            <button onClick={startTraining}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity text-lg">
              התחל אימון
            </button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-accent-purple to-accent-pink text-white rounded-[18px_18px_4px_18px]'
                      : msg.type === 'feedback' && msg.correct
                      ? 'bg-accent-green/10 border border-accent-green/30 text-text-primary rounded-[18px_18px_18px_4px]'
                      : msg.type === 'feedback' && !msg.correct
                      ? 'bg-accent-red/10 border border-accent-red/30 text-text-primary rounded-[18px_18px_18px_4px]'
                      : msg.type === 'score'
                      ? 'bg-accent-purple/10 border border-accent-purple/30 text-text-primary rounded-[18px_18px_18px_4px]'
                      : 'bg-bg-card text-text-primary rounded-[18px_18px_18px_4px]'
                  }`}>
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="bg-bg-card px-4 py-3 rounded-[18px_18px_18px_4px] flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-text-muted rounded-full"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {started && !finished && (
        <div className="p-4 bg-bg-secondary border-t border-bg-hover shrink-0 max-w-2xl mx-auto w-full">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAnswer()}
              placeholder="כתוב את תשובתך כאן..."
              disabled={isLoading}
              className="flex-1 bg-bg-card border border-bg-hover rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple text-sm disabled:opacity-50"
            />
            <button onClick={sendAnswer} disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-accent-purple to-accent-pink text-white px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-semibold">
              שלח
            </button>
          </div>
        </div>
      )}

      {/* Finished */}
      {finished && (
        <div className="p-4 bg-bg-secondary border-t border-bg-hover shrink-0 max-w-2xl mx-auto w-full">
          <div className="flex gap-3">
            <button onClick={() => { setMessages([]); setScore(0); setQuestionIndex(0); setFinished(false); setStarted(false) }}
              className="flex-1 bg-bg-hover text-text-secondary py-2.5 rounded-xl hover:bg-bg-card transition-colors text-sm">
              נסה שוב
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
              חזור לדשבורד
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
