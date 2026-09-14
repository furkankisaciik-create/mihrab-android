export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface AISuggestion {
  labelTr: string;
  labelEn: string;
  labelAr: string;
  promptTr: string;
  promptEn: string;
  promptAr: string;
}

export const AI_SUGGESTIONS: AISuggestion[] = [
  {
    labelTr: 'Namazın önemi',
    labelEn: 'Importance of prayer',
    labelAr: 'أهمية الصلاة',
    promptTr: 'Namazın İslam\'daki önemi nedir?',
    promptEn: 'What is the importance of prayer in Islam?',
    promptAr: 'ما أهمية الصلاة في الإسلام؟',
  },
  {
    labelTr: 'Abdest nasıl alınır',
    labelEn: 'How to perform wudu',
    labelAr: 'كيفية الوضوء',
    promptTr: 'Abdest nasıl alınır, adımları nelerdir?',
    promptEn: 'How to perform wudu (ablution)? What are the steps?',
    promptAr: 'كيف يُؤدَّى الوضوء؟ ما هي خطواته؟',
  },
  {
    labelTr: 'Kaza namazı nedir',
    labelEn: 'What is qada prayer',
    labelAr: 'ما هي صلاة القضاء',
    promptTr: 'Kaza namazı nedir ve nasıl kılınır?',
    promptEn: 'What is a qada (makeup) prayer and how is it performed?',
    promptAr: 'ما هي صلاة القضاء وكيف تُؤدَّى؟',
  },
  {
    labelTr: 'Tesbih duaları',
    labelEn: 'Dhikr supplications',
    labelAr: 'أذكار التسبيح',
    promptTr: 'Namaz sonrası okunacak tesbih ve zikir duaları nelerdir?',
    promptEn: 'What are the dhikr and tasbih supplications to recite after prayer?',
    promptAr: 'ما هي أذكار التسبيح التي تُقال بعد الصلاة؟',
  },
  {
    labelTr: 'Kuşluk namazı',
    labelEn: 'Duha prayer',
    labelAr: 'صلاة الضحى',
    promptTr: 'Kuşluk (duhâ) namazı nedir, kaç rekat kılınır?',
    promptEn: 'What is the Duha (forenoon) prayer and how many rakats is it?',
    promptAr: 'ما هي صلاة الضحى وكم ركعة تُصلَّى؟',
  },
  {
    labelTr: 'Ramazan orucu',
    labelEn: 'Ramadan fasting',
    labelAr: 'صيام رمضان',
    promptTr: 'Ramazan orucunun faziletleri ve önemi hakkında bilgi verir misin?',
    promptEn: 'Can you tell me about the virtues and importance of Ramadan fasting?',
    promptAr: 'هل يمكنك إخباري عن فضائل صيام رمضان وأهميته؟',
  },
];

const LOCAL_RESPONSES: Record<string, string> = {
  namaz_onemi:
    'Namaz (salah), İslam\'ın beş şartından biridir ve bir Müslümanın Allah ile doğrudan iletişim kurduğu ibadettir. Günde beş vakit kılınan namaz; sabah, öğle, ikindi, akşam ve yatsı vakitlerinde eda edilir.\n\nNamazın önemine dair bazı temel noktalar:\n\n• Kur\'an-ı Kerim\'de 700\'den fazla ayette namaza atıfta bulunulur.\n• "Namaz dinin direğidir" (Hadis) — namazı terk etmek imanı zayıflatır.\n• Namaz, günlük hayatın stresinden arınmayı, huşu içinde Allah\'a yönelmeyi sağlar.\n• Cemaatle kılınan namaz, Müslümanlar arasındaki kardeşlik bağını kuvvetlendirir.\n\nDüzenli namaz kılmak, manevî disiplin ve Allah\'a yakınlık açısından son derece değerlidir.',

  abdest:
    'Abdest (wudu), namaz kılmadan önce gerçekleştirilen temizlik ibadetinin adıdır. Adımları şöyle sıralanır:\n\n1. **Niyet** — Abdest almaya niyet edin.\n2. **Besmele** — "Bismillah" diyerek başlayın.\n3. **Elleri yıkamak** — Her iki eli bileklere kadar üç kez yıkayın.\n4. **Mazmaza** — Üç kez ağzı çalkalayın.\n5. **İstinşak** — Üç kez burnu çekin ve temizleyin.\n6. **Yüzü yıkamak** — Yüzü saç çizgisinden çene altına kadar, kulaktan kulağa uzanan alanı üç kez yıkayın.\n7. **Kolları yıkamak** — Her iki kolu dirseklere kadar sağdan başlayarak üç kez yıkayın.\n8. **Başa mesh** — Islak elle başa bir kez mesh çekin.\n9. **Kulakları mesh** — Kulakların içi ve dışına mesh çekin.\n10. **Ayakları yıkamak** — Her iki ayağı topuklara kadar sağdan başlayarak üç kez yıkayın.\n\nAbdest, helaya gitmek, derin uyku veya baygınlık gibi durumlarda bozulur.',

  kaza:
    'Kaza namazı, vaktinde kılınamayan farz namazların sonradan eda edilmesidir.\n\nTemel bilgiler:\n\n• **Hangi namazlar kaza edilebilir?** Beş vakit farz namaz (sabah, öğle, ikindi, akşam, yatsı) ile vitir namazı kaza edilebilir.\n• **Nasıl kılınır?** Kazaya kalan namazı, o vaktin namazını kılar gibi eda edersiniz. Farkı, niyet ederken "bugünkü öğle namazını kılıyorum" yerine "kazaya kalan öğle namazını kılıyorum" şeklinde niyet etmenizdir.\n• **Tertip meselesi** — Beş vakit birikmemişse, önce kazayı sonra vaktin namazını kılmak sünnettir.\n• **Çok sayıda kaza varsa** — Kaza borcu fazlaysa mutlak tertip aranmaz; uygun vakitlerde bol bol kaza etmek tavsiye edilir.\n\nMIHRAB uygulamasındaki kaza takibi ekranı, kaza borçlarınızı kaydetmenize ve ilerlemenizi takip etmenize yardımcı olur.',

  tesbih:
    'Namaz sonrasında okunması sünnet olan tesbih ve zikir duaları şunlardır:\n\n**Her birini 33 kez:**\n• **Sübhanallah** (سبحان الله) — "Allah\'ı tüm noksanlıklardan tenzih ederim."\n• **Elhamdülillah** (الحمد لله) — "Hamd yalnızca Allah\'a aittir."\n• **Allahu Ekber** (الله أكبر) — "Allah en büyüktür."\n\n**100. kez:**\n• **La ilahe illallahu vahdehu la şerike leh, lehul mulku ve lehul hamdu ve huve ala kulli şey\'in kadir** — "Allah\'tan başka ilah yoktur, O birdir, ortağı yoktur; mülk O\'nundur, hamd O\'nandır ve O her şeye kadirdir."\n\n**Ardından Ayetü\'l-Kürsi** (Bakara 255. ayet) okunması çok sevaptır.\n\nMIHRAB\'ın zikir sayacı bu tesbihleri saymanıza yardımcı olmak için tasarlanmıştır.',

  kus_luk:
    'Kuşluk namazı (Salâtü\'d-Duhâ), güneşin doğmasından öğle vaktine kadar kılınabilen nafile bir namazdır.\n\nTemel bilgiler:\n\n• **Vakti:** Güneş bir mızrak boyu (yaklaşık 20-45 dakika) yükseldikten sonra başlar, öğle azanına yakın bitmeden önce sona erer.\n• **Rekat sayısı:** En az 2, en fazla 12 rekat kılınır. En yaygın olanı 2 veya 4 rekattır.\n• **Fazileti:** Hz. Peygamber (s.a.v.) kuşluk namazını çok tavsiye etmiş; günde 360 sadaka sevabına eşit olduğunu bildirmiştir.\n• **Nasıl kılınır?** Normal nafile namaz gibi iki rekatta bir selam verilir. Okunacak sure konusunda özel bir zorunluluk yoktur.\n\nKuşluk namazı, güne manevi bir güçle başlamak isteyenler için son derece değerli bir ibadettir.',

  ramadan:
    'Ramazan, İslam takviminin dokuzuncu ayıdır ve Müslümanların oruç tuttuğu kutsal bir dönemdir.\n\n**Faziletleri:**\n• Kur\'an-ı Kerim bu ayda indirilmeye başlanmıştır (Kadir Gecesi).\n• "Kim Ramazan orucunu iman ederek ve sevabını Allah\'tan umarak tutarsa, geçmiş günahları bağışlanır." (Buhari, Müslim)\n• Oruçlunun duası iftar anında kabul edilir.\n• Laylat\'ul-Qadr (Kadir Gecesi), bin aydan hayırlıdır.\n\n**Oruç nasıl tutulur?**\n1. İmsak vaktinden önce sahur yenilir.\n2. Gün boyunca yemek, içmek ve orucu bozan davranışlardan kaçınılır.\n3. İftar vakti (akşam ezanı) oruç açılır; önce hurma veya su ile başlamak sünnettir.\n\nMIHRAB\'ın Ramazan imsakiyesi ekranı, günlük imsak ve iftar vakitlerini takip etmenize yardımcı olur.',
};

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('namaz') && (lower.includes('önem') || lower.includes('neden') || lower.includes('nedir')))
    return 'namaz_onemi';
  if (lower.includes('prayer') && (lower.includes('import') || lower.includes('why') || lower.includes('what is')))
    return 'namaz_onemi';
  if (lower.includes('abdest') || lower.includes('wudu') || lower.includes('ablution') || lower.includes('وضوء'))
    return 'abdest';
  if (lower.includes('kaza') || lower.includes('qada') || lower.includes('makeup prayer') || lower.includes('قضاء'))
    return 'kaza';
  if (
    lower.includes('tesbih') ||
    lower.includes('zikir') ||
    lower.includes('dhikr') ||
    lower.includes('tasbih') ||
    lower.includes('تسبيح') ||
    lower.includes('ذكر')
  )
    return 'tesbih';
  if (
    lower.includes('kuşluk') ||
    lower.includes('duhâ') ||
    lower.includes('duha') ||
    lower.includes('ضحى')
  )
    return 'kus_luk';
  if (lower.includes('ramazan') || lower.includes('ramadan') || lower.includes('رمضان'))
    return 'ramadan';
  return null;
}

const FALLBACK_TR =
  'Bu konuda size yardımcı olmak isterim. MIHRAB AI şu anda belirli konularda (namaz, abdest, kaza namazı, zikir, kuşluk, Ramazan) bilgi verebilmektedir. Lütfen bu konulardan biriyle ilgili soru sorun veya yukarıdaki önerilen sorulardan birini seçin.';
const FALLBACK_EN =
  "I'd like to help you with that. MIHRAB AI currently provides information on specific topics (prayer, wudu, qada, dhikr, duha, Ramadan). Please ask about one of these topics or select one of the suggested questions above.";
const FALLBACK_AR =
  'أودّ مساعدتك في هذا الأمر. يمكن لـ MIHRAB AI حاليًا تقديم معلومات حول موضوعات محددة (الصلاة، الوضوء، القضاء، الذكر، الضحى، رمضان). يُرجى طرح سؤال حول أحد هذه الموضوعات أو اختيار أحد الأسئلة المقترحة أعلاه.';

export async function sendMessage(
  content: string,
  language: string = 'tr'
): Promise<string> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

  const category = detectCategory(content);
  if (category && LOCAL_RESPONSES[category]) {
    return LOCAL_RESPONSES[category];
  }

  if (language === 'en') return FALLBACK_EN;
  if (language === 'ar') return FALLBACK_AR;
  return FALLBACK_TR;
}
