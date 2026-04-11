# DALOR Web App 🛍️

קטלוג ווב יוקרתי לבוט הוואטסאפ של DALOR.

## איך זה עובד

1. הבוט שולח ללקוח קישור → `https://dalor-webapp.onrender.com?session=ABC123`
2. הלקוח גולש, בוחר מוצרים, מוסיף לסל
3. לוחץ "סיים הזמנה" → נשלח לוואטסאפ עם פרטי הסל
4. הבוט ממשיך מיד לשלב תשלום

---

## Setup

### 1. Supabase
הרץ את `supabase_migration.sql` ב-SQL Editor של Supabase.

### 2. Deploy ל-Render
1. צור Repo חדש ב-GitHub והעלה את הקבצים האלה
2. ב-Render: New → Web Service → חבר ל-Repo
3. הוסף Environment Variables:
   - `SUPABASE_URL` — מ-Supabase Settings
   - `SUPABASE_ANON_KEY` — מ-Supabase Settings  
   - `OWNER_PHONE` — מספר הוואטסאפ (ללא +), לדוגמה: `972507983306`

### 3. לוגו
העלה את `logo-icon.png` לתיקיית הפרויקט (תמונת הסמל הריבועית).

### 4. עדכן את הבוט
בקובץ `bot.js`, הוסף פקודה שתשלח קישור לאפליקציה:

```js
// בתפריט הראשי — הוסף אפשרות:
{ id: 'menu_catalog', title: '🛍️ קטלוג', description: 'גלוש וסמן פריטים' }

// בטיפול ב-menu_catalog:
const sessionId = 'sess_' + from + '_' + Date.now();
const webUrl = `https://dalor-webapp.onrender.com?session=${sessionId}`;
await sendTextMessage(from, 
  `🛍️ *קטלוג DALOR*\n\nלחץ על הקישור לגלישה:\n${webUrl}\n\nכשתסיים לבחור — לחץ "סיים הזמנה" והכל יחזור לפה אוטומטית 👌`
);
```

### 5. טיפול בחזרה מהאפליקציה בבוט
כשהלקוח שולח הודעה עם `(session:` — הבוט צריך לזהות את זה ולעבור ישר לשלב התשלום:

```js
// בתחילת handleIncomingMessage, לפני הכל:
if (text.includes('(session:') && text.includes('סיימתי לבחור')) {
  await handleWebCartReturn(from, text, pushName);
  return;
}
```

---

## קבצים
- `index.html` — כל האפליקציה (HTML + CSS + JS)
- `server.js` — Express server שמגיש ומזריק config
- `package.json` — dependencies
- `render.yaml` — הגדרות Render
- `supabase_migration.sql` — טבלת web_carts
