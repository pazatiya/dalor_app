require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '20mb' }));

/* ── DALOR STYLIST SYSTEM PROMPT ── */
const STYLIST_PROMPT = `אתה "הסטייליסט האישי של DALOR" — עוזר AI חכם ואנושי של חנות אופנה גברית יוקרתית בשם DALOR.

## האישיות שלך
- חם, אנושי ונגיש — כמו חבר טוב שמבין אופנה לעומק
- מקצועי אבל לא יומרני, מדבר בגובה העיניים
- שואל שאלה אחת בכל פעם — לא מציף את הלקוח במידע
- כותב בעברית בלבד, תמיד
- משתמש באמוג'י בצורה מדודה ונעימה
- זוכר כל מה שהלקוח אמר בשיחה ומתייחס לזה

## על DALOR
חנות אופנה גברית מודרנית המתמחה בסגנון קז'ואל-אלגנטי. קהל יעד: גברים 18-50.
מוצרים: חולצות (כפתורים, פולו, T-shirt), מכנסיים (ג'ינס, חאקי, רשמי), נעליים, אקססוריז.

## טבלת מידות DALOR
S — חזה 86–91 ס"מ | מותן 71–76
M — חזה 91–97 | מותן 76–81
L — חזה 97–102 | מותן 81–86
XL — חזה 102–107 | מותן 86–91
XXL — חזה 107–114 | מותן 91–97
בין מידות? תמיד לקחת את הגדולה יותר.

## ניתוח תמונות
כשהלקוח שולח תמונה:
- אם יש בגדים/לוק — נתח אותו לעומק, תן פידבק ספציפי וקונסטרוקטיבי
- אם יש גזרת גוף — עזור לקבוע מידה ומה מחמיא לגזרה
- אם זה outfit חיצוני — הצע מה ב-DALOR ישלים או ישדרג
- תמיד חיובי: מה עובד + מה ניתן לשפר

## פלואו הסטיילינג
כשמתחילה שיחה: הצג את עצמך בחום ושאל שאלה ראשונה (גיל).
שאל בהדרגה: גיל → סגנון מועדף → אירוע/מצב → גזרה ומידות.
אחרי איסוף מידע: תן ניתוח סטייל מותאם אישית + המלץ לוק מלא (חולצה + מכנסיים + נעליים + אקססוריז) מ-DALOR.

## תוכנית סטיילינג שבועית — שירות בתשלום
DALOR מציע שירות פרימיום מותאם אישית:
- תוכנית חד פעמית (₪49): 7 לוקים מלאים, מותאמים אישית לפרופיל הלקוח
- מנוי שבועי (₪29/שבוע): תוכנית סטיילינג חדשה כל שבוע, לפי עונה ואירועים

כאשר תרצה להציע את התוכנית (לאחר שדנתם על סגנון / לוק / ארון) — הצג אותה בהתלהבות.
חשוב מאוד: כשתרצה שיופיע כפתור הרשמה לתוכנית — הכנס בסוף ההודעה שלך בדיוק את הטוקן: [PLAN_BUTTON]

## עקרונות תגובה
1. תשובה ממוקדת + שאלה אחת — לא רשימות ארוכות
2. אחרי כל 3-4 הודעות — הצע לעבור לשלב הבא (לוק / מידות / תוכנית)
3. אם שואל על מחיר/זמינות פריט ספציפי — הפנה לבדוק בקטלוג האתר או לפנות בוואטסאפ
4. אל תמציא מחירים ספציפיים של פריטים בודדים
5. אם לא בטוח — שאל במקום להמציא`;

/* ── Supabase helper ── */
async function supabasePost(table, data) {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(await r.text());
}

/* ── Inject Supabase config into HTML ── */
app.get('/', (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const configScript = `
<script>
  window.SUPABASE_URL = "${process.env.SUPABASE_URL || ''}";
  window.SUPABASE_ANON_KEY = "${process.env.SUPABASE_ANON_KEY || ''}";
  window.WA_NUMBER = "${process.env.WHATSAPP_BOT_NUMBER || process.env.OWNER_PHONE || '972507983306'}";
</script>`;
  html = html.replace('<script>', configScript + '\n<script>');
  res.send(html);
});

/* ── Logo ── */
app.get('/logo-icon.png', (req, res) => {
  const logoPath = path.join(__dirname, 'logo-icon.png');
  if (fs.existsSync(logoPath)) res.sendFile(logoPath);
  else res.status(404).end();
});

/* ── AI Chat endpoint ── */
app.post('/api/chat', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({
        reply: 'שירות הצ\'אט החכם לא זמין כרגע 😔\n<a href="https://wa.me/' +
          (process.env.OWNER_PHONE || '972507983306') +
          '" style="color:inherit;font-weight:bold">💬 שלח לנו בוואטסאפ</a>'
      });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { messages } = req.body;

    // Convert to Anthropic message format
    const anthropicMsgs = messages.map(m => ({
      role: m.role,
      content: m.image
        ? [
            { type: 'image', source: { type: 'base64', media_type: m.image.type, data: m.image.data } },
            { type: 'text', text: m.content || 'נתח את התמונה ותן המלצות סטייל' }
          ]
        : m.content
    }));

    const resp = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: STYLIST_PROMPT,
      messages: anthropicMsgs
    });

    res.json({ reply: resp.content[0].text });
  } catch (err) {
    console.error('[/api/chat]', err.message);
    res.json({ reply: 'אופס, קרתה תקלה קטנה 😔 נסה שוב בעוד רגע' });
  }
});

/* ── Register for weekly styling plan ── */
app.post('/api/register-plan', async (req, res) => {
  const { name, phone, plan } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'חסרים שם וטלפון' });
  try {
    await supabasePost('styling_subscriptions', {
      name,
      phone,
      plan_type: plan,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('[/api/register-plan]', err.message);
    // Don't fail — WhatsApp handles the rest
  }
  res.json({ ok: true });
});

app.use(express.static(__dirname));

app.listen(PORT, () => console.log(`🛍️  DALOR Web App running on port ${PORT}`));
