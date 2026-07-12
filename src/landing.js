// VibeCast landing page
// Single-file HTML, no framework, no build step. Rendered inline.

export function renderLanding() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCast — YouTube to viral thread in 30 seconds</title>
  <meta name="description" content="Paste a YouTube URL, pick a voice, get a 5-tweet thread + 90s Shorts script. Built for creators who hate writing hooks.">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: #0a0a0a;
      color: #f5f5f5;
      min-height: 100vh;
      line-height: 1.6;
    }
    .container { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
    h1 { font-size: 36px; font-weight: 800; margin-bottom: 16px; line-height: 1.1; }
    h1 .accent { background: linear-gradient(120deg, #ff4ecd, #5b8def); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .tagline { color: #a0a0a0; font-size: 18px; margin-bottom: 32px; }
    .demo { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; margin: 32px 0; }
    .demo label { display: block; font-size: 14px; color: #a0a0a0; margin-bottom: 8px; font-weight: 600; }
    .demo input, .demo select { width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #f5f5f5; font-size: 16px; margin-bottom: 16px; font-family: inherit; }
    .demo input:focus, .demo select:focus { outline: none; border-color: #5b8def; }
    .demo button { width: 100%; padding: 14px; background: linear-gradient(120deg, #ff4ecd, #5b8def); border: none; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .demo button:hover { opacity: 0.9; }
    .demo button:disabled { opacity: 0.5; cursor: not-allowed; }
    .result { margin-top: 24px; padding: 20px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 8px; white-space: pre-wrap; font-size: 14px; display: none; }
    .result.show { display: block; }
    .tweet { background: #1a1a1a; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #5b8def; }
    .voice-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .pill { padding: 6px 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 999px; font-size: 13px; cursor: pointer; }
    .pill.active { background: #5b8def; border-color: #5b8def; color: #fff; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #2a2a2a; color: #666; font-size: 13px; text-align: center; }
    .footer a { color: #5b8def; text-decoration: none; }
    .pricing { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .pricing-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
    .pricing-row .label { color: #a0a0a0; }
    .pricing-row .value { font-weight: 700; }
    .badge { display: inline-block; padding: 2px 8px; background: #5b8def; color: #fff; border-radius: 4px; font-size: 11px; font-weight: 700; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>VibeCast <span class="accent">🎙️</span></h1>
    <p class="tagline">YouTube URL → 5-tweet viral thread + 90s Shorts script. In 30 seconds. Pick a voice, paste a link, ship the post.</p>

    <div class="demo">
      <label>YouTube URL</label>
      <input type="text" id="url" placeholder="https://youtu.be/dQw4w9WgXcQ" />

      <label>Voice</label>
      <div class="voice-pills" id="voices">
        <div class="pill active" data-voice="punchy-founder">🚀 Punchy Founder</div>
        <div class="pill" data-voice="data-narrator">📊 Data Narrator</div>
        <div class="pill" data-voice="contrarian-curator">🧨 Contrarian</div>
        <div class="pill" data-voice="storyteller">📖 Storyteller</div>
      </div>

      <button id="go" onclick="generate()">Generate thread →</button>

      <div class="result" id="result"></div>
    </div>

    <div class="pricing">
      <div class="pricing-row">
        <span class="label">Free tier <span class="badge">3/day</span></span>
        <span class="value">$0</span>
      </div>
      <div class="pricing-row">
        <span class="label">Per call after that <span class="badge">x402</span></span>
        <span class="value">$0.005 USDT0</span>
      </div>
      <div class="pricing-row">
        <span class="label">Settlement</span>
        <span class="value">X Layer (USDT0)</span>
      </div>
    </div>

    <p style="color: #a0a0a0; font-size: 14px; margin-top: 24px;">
      VibeCast is an Agent Service Provider (ASP) on <a href="https://okx.ai" style="color: #5b8def;">OKX.AI</a>. Built for the OKX.AI Genesis Hackathon.
    </p>

    <div class="footer">
      POST <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px;">/api/thread</code> · GET <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px;">/.well-known/x402</code> · <a href="/health">/health</a>
    </div>
  </div>

  <script>
    let selectedVoice = 'punchy-founder';

    document.querySelectorAll('.pill').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        selectedVoice = p.dataset.voice;
      });
    });

    async function generate() {
      const url = document.getElementById('url').value.trim();
      const btn = document.getElementById('go');
      const result = document.getElementById('result');

      if (!url) {
        result.className = 'result show';
        result.textContent = '⚠️  Paste a YouTube URL first.';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Generating…';
      result.className = 'result show';
      result.textContent = '⏳  Fetching transcript + generating thread…';

      try {
        const res = await fetch('/api/thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, voice: selectedVoice }),
        });

        if (res.status === 402) {
          const challenge = await res.json();
          result.textContent = '💳  Payment required. This is a paid call.\n\nChallenge:\n' + JSON.stringify(challenge, null, 2);
          return;
        }

        if (!res.ok) {
          const err = await res.json();
          result.textContent = '❌  ' + (err.message || err.error || 'Request failed');
          return;
        }

        const data = await res.json();
        let html = '';
        data.tweets.forEach((t, i) => {
          html += '<div class="tweet"><strong>' + (i+1) + '/</strong> ' + escapeHtml(t) + '</div>';
        });
        html += '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #2a2a2a;"><strong>Shorts script:</strong>\n\n' + escapeHtml(data.shorts_script) + '</div>';
        html += '<div style="margin-top: 12px; color: #666; font-size: 12px;">Voice: ' + data.voice + ' · Free calls used: ' + data.meta.freeCallsUsed + ' · Paid: ' + data.meta.paid + '</div>';
        result.innerHTML = html;
      } catch (err) {
        result.textContent = '❌  ' + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Generate thread →';
      }
    }

    function escapeHtml(s) {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}
