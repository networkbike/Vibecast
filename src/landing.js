// VibeCast landing page + no-JS result page
// Two single-file HTML strings, no framework, no build step.

const GITHUB_REPO = 'https://github.com/networkbike/Vibecast';
const GITHUB_ISSUES = 'https://github.com/networkbike/Vibecast/issues';
const HACKATHON_URL = 'https://web3.okx.com/xlayer/build-x-series';
const X402_DOCS = 'https://github.com/coinbase/x402';

export function renderLanding() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCast — YouTube to viral thread in 30 seconds</title>
  <meta name="description" content="Paste a YouTube URL, pick a voice, get a 5-tweet thread + 90s Shorts script. Built for creators who hate writing hooks.">
  <meta property="og:title" content="VibeCast — YouTube to viral thread in 30 seconds">
  <meta property="og:description" content="Paste a YouTube URL, pick a voice, get a 5-tweet thread + 90s Shorts script. Free tier + paid via x402 on X Layer.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://vibecast-ptrq.onrender.com">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="VibeCast — YouTube to viral thread in 30 seconds">
  <meta name="twitter:description" content="Open source Agent Service Provider on OKX.AI. Built for the OKX.AI Genesis Hackathon.">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: #0a0a0a;
      color: #f5f5f5;
      min-height: 100vh;
      line-height: 1.6;
    }
    .container { max-width: 760px; margin: 0 auto; padding: 0 24px 48px; }
    /* Top navigation bar */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #1a1a1a;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 100%;
    }
    .navbar-brand {
      font-size: 16px;
      font-weight: 700;
      color: #f5f5f5;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .navbar-brand .dot {
      width: 8px;
      height: 8px;
      background: #00d4aa;
      border-radius: 50%;
      box-shadow: 0 0 8px #00d4aa;
    }
    .navbar-links {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .navbar-links a {
      color: #a0a0a0;
      text-decoration: none;
      font-size: 14px;
      padding: 6px 12px;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .navbar-links a:hover {
      color: #f5f5f5;
      background: #1a1a1a;
    }
    .navbar-links .github {
      color: #f5f5f5;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .navbar-links .github:hover {
      background: #2a2a2a;
      border-color: #3a3a3a;
    }
    .navbar-links .github svg {
      width: 14px;
      height: 14px;
    }
    /* Badges row */
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 32px 0 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 999px;
      font-size: 12px;
      color: #a0a0a0;
      text-decoration: none;
    }
    .badge .dot-live {
      width: 6px;
      height: 6px;
      background: #00d4aa;
      border-radius: 50%;
      box-shadow: 0 0 6px #00d4aa;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    /* Hero */
    h1 {
      font-size: 40px;
      font-weight: 800;
      margin: 28px 0 16px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    h1 .accent {
      background: linear-gradient(120deg, #ff4ecd, #5b8def);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tagline {
      color: #a0a0a0;
      font-size: 18px;
      margin-bottom: 24px;
    }
    /* Demo card */
    .demo {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .demo label {
      display: block;
      font-size: 14px;
      color: #a0a0a0;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .demo input, .demo select {
      width: 100%;
      padding: 12px 16px;
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #f5f5f5;
      font-size: 16px;
      margin-bottom: 16px;
      font-family: inherit;
    }
    .demo input:focus, .demo select:focus {
      outline: none;
      border-color: #5b8def;
    }
    .demo button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(120deg, #ff4ecd, #5b8def);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }
    .demo button:hover { opacity: 0.9; }
    .demo button:disabled { opacity: 0.5; cursor: not-allowed; }
    .result {
      margin-top: 24px;
      padding: 20px;
      background: #0a0a0a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      white-space: pre-wrap;
      font-size: 14px;
      display: none;
    }
    .result.show { display: block; }
    .tweet {
      background: #1a1a1a;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      border-left: 3px solid #5b8def;
    }
    .voice-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .pill {
      padding: 6px 12px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 999px;
      font-size: 13px;
      cursor: pointer;
      user-select: none;
    }
    .pill.active {
      background: #5b8def;
      border-color: #5b8def;
      color: #fff;
    }
    /* Pricing card */
    .pricing {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    .pricing-row .label { color: #a0a0a0; }
    .pricing-row .value { font-weight: 700; }
    .pill-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #5b8def;
      color: #fff;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      margin-left: 8px;
    }
    /* Features */
    .features {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin: 24px 0;
    }
    .feature {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
    }
    .feature-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: linear-gradient(120deg, #ff4ecd, #5b8def);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .feature-content { flex: 1; }
    .feature-title { font-weight: 700; font-size: 14px; margin-bottom: 2px; }
    .feature-desc { color: #a0a0a0; font-size: 13px; }
    /* Footer */
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #1a1a1a;
      color: #666;
      font-size: 13px;
      text-align: center;
    }
    .footer a { color: #5b8def; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      margin-bottom: 12px;
    }
    @media (min-width: 640px) {
      .features { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>

  <nav class="navbar">
    <a href="/" class="navbar-brand">
      <span class="dot"></span>
      VibeCast
    </a>
    <div class="navbar-links">
      <a href="#demo">Demo</a>
      <a href="${HACKATHON_URL}" target="_blank" rel="noopener">Hackathon</a>
      <a href="${X402_DOCS}" target="_blank" rel="noopener">x402</a>
      <a href="${GITHUB_REPO}" target="_blank" rel="noopener" class="github">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        GitHub
      </a>
    </div>
  </nav>

  <div class="container">
    <div class="badges">
      <span class="badge"><span class="dot-live"></span> Live on Render</span>
      <a href="${GITHUB_REPO}" target="_blank" rel="noopener" class="badge">Open source · MIT</a>
      <a href="${HACKATHON_URL}" target="_blank" rel="noopener" class="badge">OKX.AI Hackathon</a>
      <span class="badge">x402 · USDT0 on X Layer</span>
    </div>

    <h1>VibeCast <span class="accent">🎙️</span></h1>
    <p class="tagline">YouTube URL → 5-tweet viral thread + 90s Shorts script. In 30 seconds. Pick a voice, paste a link, ship the post.</p>

    <div class="demo" id="demo">
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

      <!-- No-JS fallback: plain HTML form. Works in every browser. -->
      <noscript>
        <p style="color:#a0a0a0;font-size:13px;margin-top:16px;">JavaScript is disabled. The button above won't work, but the form below will.</p>
        <form method="POST" action="/api/thread" style="margin-top:16px;">
          <label>YouTube URL</label>
          <input type="text" name="url" placeholder="https://youtu.be/dQw4w9WgXcQ" required />
          <label>Voice</label>
          <select name="voice">
            <option value="punchy-founder">🚀 Punchy Founder</option>
            <option value="data-narrator">📊 Data Narrator</option>
            <option value="contrarian-curator">🧨 Contrarian Curator</option>
            <option value="storyteller">📖 Storyteller</option>
          </select>
          <input type="hidden" name="format" value="html" />
          <button type="submit">Generate thread (no-JS) →</button>
        </form>
      </noscript>
    </div>

    <div class="features">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <div class="feature-content">
          <div class="feature-title">30 seconds from URL to thread</div>
          <div class="feature-desc">YouTube transcript fetch + LLM generation + x402 settlement in one HTTP call.</div>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">💰</div>
        <div class="feature-content">
          <div class="feature-title">Real x402 payments</div>
          <div class="feature-desc">Settled in USDT0 on X Layer mainnet. No signup, no accounts, sub-cent per call.</div>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🎙️</div>
        <div class="feature-content">
          <div class="feature-title">4 voice presets</div>
          <div class="feature-desc">Punchy Founder, Data Narrator, Contrarian Curator, Storyteller. Add your own.</div>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🆓</div>
        <div class="feature-content">
          <div class="feature-title">3 free calls per day</div>
          <div class="feature-desc">Try it before you pay. No signup, no credit card. Just paste a URL.</div>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🔌</div>
        <div class="feature-content">
          <div class="feature-title">Open source, MIT</div>
          <div class="feature-desc">Read the code, run it yourself, fork it. <a href="${GITHUB_REPO}" target="_blank" rel="noopener" style="color:#5b8def;">github.com/networkbike/Vibecast</a></div>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🌐</div>
        <div class="feature-content">
          <div class="feature-title">Listed on OKX.AI</div>
          <div class="feature-desc">Agent ID #5287 on OKX.AI Marketplace. Other agents can call this service.</div>
        </div>
      </div>
    </div>

    <div class="pricing">
      <div class="pricing-row">
        <span class="label">Free tier <span class="pill-badge">3/day</span></span>
        <span class="value">$0</span>
      </div>
      <div class="pricing-row">
        <span class="label">Per call after that <span class="pill-badge">x402</span></span>
        <span class="value">$0.005 USDT0</span>
      </div>
      <div class="pricing-row">
        <span class="label">Settlement</span>
        <span class="value">X Layer (USDT0)</span>
      </div>
    </div>

    <p style="color: #a0a0a0; font-size: 14px;">
      VibeCast is an Agent Service Provider (ASP) on <a href="https://okx.ai" style="color: #5b8def;">OKX.AI</a>. Built for the <a href="${HACKATHON_URL}" style="color: #5b8def;">OKX.AI Genesis Hackathon</a>.
    </p>

    <div class="footer">
      <div class="footer-links">
        <a href="${GITHUB_REPO}" target="_blank" rel="noopener">GitHub</a>
        <a href="${GITHUB_ISSUES}" target="_blank" rel="noopener">Issues</a>
        <a href="${HACKATHON_URL}" target="_blank" rel="noopener">Hackathon</a>
        <a href="${X402_DOCS}" target="_blank" rel="noopener">x402 protocol</a>
        <a href="https://github.com/networkbike/Vibecast/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a>
      </div>
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

// No-JS result page — returned when the form posts with format=html
export function renderResultPage(data) {
  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const tweetsHtml = (data.tweets || [])
    .map((t, i) => `<div class="tweet"><strong>${i + 1}/</strong> ${escapeHtml(t.replace(/^\d+\/\s*/, ''))}</div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCast — Generated Thread</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; min-height: 100vh; line-height: 1.6; padding: 32px 16px; }
    .container { max-width: 720px; margin: 0 auto; }
    .navbar { position: sticky; top: 0; background: rgba(10, 10, 10, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #1a1a1a; padding: 14px 16px; margin: -32px -16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .navbar a { color: #a0a0a0; text-decoration: none; font-size: 14px; padding: 6px 12px; border-radius: 6px; }
    .navbar a:hover { color: #f5f5f5; background: #1a1a1a; }
    h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
    h1 .accent { background: linear-gradient(120deg, #ff4ecd, #5b8def); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .meta { color: #a0a0a0; font-size: 14px; margin-bottom: 24px; }
    .meta a { color: #5b8def; text-decoration: none; }
    h2 { font-size: 20px; margin-bottom: 16px; margin-top: 24px; }
    .tweet { background: #1a1a1a; padding: 16px 20px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #5b8def; font-size: 15px; }
    .tweet strong { color: #5b8def; margin-right: 6px; }
    .shorts { background: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 24px; border: 1px solid #2a2a2a; }
    .shorts h2 { font-size: 18px; margin-bottom: 12px; color: #ff4ecd; margin-top: 0; }
    .shorts pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.7; color: #e0e0e0; }
    .back { display: inline-block; margin-top: 24px; padding: 12px 20px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #5b8def; text-decoration: none; font-weight: 600; }
    .back:hover { background: #2a2a2a; }
  </style>
</head>
<body>
  <nav class="navbar">
    <a href="/">VibeCast 🎙️</a>
    <a href="https://github.com/networkbike/Vibecast" target="_blank" rel="noopener">GitHub</a>
  </nav>
  <div class="container">
    <h1>VibeCast <span class="accent">🎙️</span></h1>
    <p class="meta">Voice: ${escapeHtml(data.voice || 'punchy-founder')} · Source: <a href="${escapeHtml(data.meta?.url || '#')}">${escapeHtml(data.meta?.url || '')}</a> · Free calls remaining: ${data.meta?.freeCallsRemaining ?? 'n/a'}</p>

    <h2>5-tweet thread</h2>
    ${tweetsHtml}

    <div class="shorts">
      <h2>90-second Shorts script</h2>
      <pre>${escapeHtml(data.shorts_script || '')}</pre>
    </div>

    <a class="back" href="/">← Generate another thread</a>
  </div>
</body>
</html>`;
}
