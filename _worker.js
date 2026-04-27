export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const asset = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
      let html = await asset.text();

      const cfg = `<script>
  window.SUPABASE_URL = "${env.SUPABASE_URL || ''}";
  window.SUPABASE_ANON_KEY = "${env.SUPABASE_ANON_KEY || ''}";
  window.WA_NUMBER = "${env.WA_NUMBER || '972507983306'}";
</script>`;

      html = html.replace('<script>', cfg + '\n<script>');
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
