require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Inject Supabase config into HTML at request time
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

// Serve logo images from env or static
app.get('/logo-icon.png', (req, res) => {
  const logoPath = path.join(__dirname, 'logo-icon.png');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).end();
  }
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`🛍️  DALOR Web App running on port ${PORT}`);
});
