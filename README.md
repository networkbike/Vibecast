# VibeCast 🎙️

> **YouTube → 5-tweet viral thread + 90s Shorts script. In 30 seconds.**
> Built for the [OKX.AI Genesis Hackathon](https://web3.okx.com/xlayer/build-x-series). Live as an Agent Service Provider (ASP) on OKX.AI Marketplace.

[![Live](https://img.shields.io/badge/Live-vibecast--ptrq.onrender.com-00d4aa?style=for-the-badge&logo=render&logoColor=white)](https://vibecast-ptrq.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node 18+](https://img.shields.io/badge/Node-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![x402 Protocol](https://img.shields.io/badge/x402-v2-ff4ecd?style=for-the-badge&logo=ethereum&logoColor=white)](https://github.com/coinbase/x402)
[![X Layer](https://img.shields.io/badge/X%20Layer-Mainnet-1a1a1a?style=for-the-badge&logo=ethereum&logoColor=white)](https://www.okx.com/xlayer)

---

## 🎯 What is VibeCast?

VibeCast is a **paid Agent Service Provider (ASP)** on the OKX.AI Marketplace. It turns any YouTube video into a ready-to-post X (Twitter) thread and a 90-second YouTube Shorts script — in 30 seconds, in your chosen voice.

**Use case:** Creators, founders, and writers who maintain an X presence but spend 1-2 hours per week writing threads. VibeCast reads the source video (the one they were already going to watch), generates a 5-tweet thread in their voice, and includes a Shorts script for cross-posting.

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│ YouTube URL  │  →   │  VibeCast    │  →   │  5 tweets +  │
│ + voice      │      │  (LLM + x402) │      │  Shorts scr. │
└─────────────┘      └──────────────┘      └──────────────┘
```

---

## ✨ Features

- **🎙️ 4 voice presets** — Punchy Founder, Data Narrator, Contrarian Curator, Storyteller
- **💰 Real x402 payments** — Settled in USDT0 on X Layer mainnet (`eip155:196`)
- **🆓 Free tier** — 3 calls/IP/day, no signup required
- **🔌 Pluggable transcript providers** — Supadata (primary), YouTube oEmbed, fallback chain
- **🤖 LLM-powered thread generation** — OpenAI gpt-4o-mini with structured output
- **📜 Open source** — MIT licensed, audited smoke tests, 15/15 passing
- **🌐 Public marketplace listing** — Registered on OKX.AI Marketplace (Agent ID 5287)
- **📱 No-JS fallback** — Direct-link demo works in any browser, no JavaScript required

---

## 🏗️ Architecture

```
            ┌──────────────┐
            │   VibeCast   │  ← Express API on Render
            │   (Node 20)  │
            └──────┬───────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
   ┌────▼───┐ ┌────▼────┐ ┌───▼────┐
   │Supadata│ │  oEmbed │ │ x402   │ ← Payment protocol
   │(caption│ │ (title) │ │gateway │
   └────┬───┘ └─────────┘ └────────┘
        │
   ┌────▼────┐
   │ YouTube │ ← Source video
   └─────────┘
```

**Request flow:**
1. Client → `POST /api/thread` with `{ url, voice }`
2. Server checks free-tier counter (3/IP/day)
3. If exhausted → returns HTTP 402 with x402 payment challenge
4. If free or paid → fetches YouTube transcript via Supadata
5. Falls back to oEmbed for video title/author
6. Sends transcript + voice prompt to OpenAI gpt-4o-mini
7. Returns 5-tweet thread + 90s Shorts script as JSON

**Payment flow:**
- Free tier: 3 calls/IP/day, no charge
- Paid tier: 5000 min units ($0.005) USDT0 per call
- Settlement: x402 v2 protocol on X Layer mainnet (chain 196)
- Receiving address: `0xe76c02987f901651db4d59b13458b6c9c273a381`

---

## 🚀 Quick start

### Run locally

```bash
git clone https://github.com/networkbike/Vibecast.git
cd Vibecast
npm install --no-audit --no-fund
cp .env.example .env
# Edit .env: add OPENAI_API_KEY and SUPADATA_API_KEY (both have free tiers)
npm run dev
# Open http://localhost:3000
```

### One-line deploy to Render

1. Click this button: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/networkbike/Vibecast)
2. Set environment variables in the Render dashboard (see [Configuration](#-configuration))
3. Done. Your service is at `https://<name>.onrender.com`

### Manual deploy

See [docs/DEPLOY.md](docs/DEPLOY.md) for step-by-step instructions on Render, Fly.io, Railway, or any Node.js host.

---

## 📚 API reference

### `POST /api/thread`

Generate a thread from a YouTube URL.

**Request body:**
```json
{
  "url": "https://youtu.be/dQw4w9WgXcQ",
  "voice": "punchy-founder"
}
```

**Voices:** `punchy-founder` | `data-narrator` | `contrarian-curator` | `storyteller`

**Response (HTTP 200):**
```json
{
  "tweets": [
    "Rick Astley's 'Never Gonna Give You Up' is the ultimate loyalty anthem...",
    "...",
    "...",
    "...",
    "..."
  ],
  "shorts_script": "Are you ready to dive into one of the catchiest songs of all time?...",
  "voice": "punchy-founder",
  "video": {
    "title": "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
    "author": "Rick Astley"
  },
  "source": "openai",
  "meta": {
    "voice": "punchy-founder",
    "url": "https://youtu.be/dQw4w9WgXcQ",
    "paid": false,
    "freeCallsUsed": 1,
    "freeCallsRemaining": 2,
    "generatedAt": "2026-07-13T..."
  }
}
```

**Response (HTTP 402 — paid tier):**
```json
{
  "x402Version": 2,
  "resource": { "url": "...", "description": "..." },
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:196",
    "asset": "0x779ded0c9e1022225f8e0630b35a9b54be713736",
    "amount": "5000",
    "payTo": "0xe76c02987f901651db4d59b13458b6c9c273a381",
    "maxTimeoutSeconds": 300
  }]
}
```

**Error responses:**
- `400` — Invalid URL, missing URL, or invalid voice
- `402` — Free tier exhausted (no payment header) or invalid payment
- `500` — Generation failed (transcript fetch error, LLM error, etc.)

### `GET /health`

Health check + config visibility.
```json
{
  "status": "ok",
  "service": "vibecast",
  "version": "0.1.0",
  "config": {
    "supadataKeySet": true,
    "ytApiKeySet": false,
    "ytProxyUrlSet": true,
    "openaiKeySet": true,
    "receiveAddressSet": true
  }
}
```

### `GET /.well-known/x402`

x402 v2 service manifest for marketplace discovery. This is what OKX.AI and other agents read to discover VibeCast.

### `GET /go?url=<youtube_url>&voice=<voice>`

Direct-link demo. Works without JavaScript — useful for demos, marketing, and browser-agnostic access. Returns a standalone HTML page with the generated thread.

---

## ⚙️ Configuration

All configuration is via environment variables. Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description | Default |
|---|---|---|---|
| `PORT` | No | HTTP port | `3000` |
| `OPENAI_API_KEY` | Recommended | OpenAI key for thread generation. Without it, falls back to template. | — |
| `OPENAI_BASE_URL` | No | OpenAI-compatible API base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | No | Model name | `gpt-4o-mini` |
| `SUPADATA_API_KEY` | Recommended | Supadata key for YouTube transcript fetch. Free tier: 100 req/month. | — |
| `YT_API_KEY` | No | YouTube Data API v3 key (alternative metadata source) | — |
| `YT_PROXY_URL` | No | Legacy: external transcript proxy | — |
| `RECEIVE_ADDRESS` | **Required** | X Layer wallet that receives x402 USDT0 payments | — |
| `USDT0_TOKEN_ADDRESS` | No | USDT0 contract on X Layer | `0x779d...3736` (official) |
| `X402_NETWORK` | No | x402 network identifier | `eip155:196` |
| `FREE_TIER_DAILY` | No | Free calls per IP per day | `3` |
| `PAID_PRICE_MIN_UNITS` | No | Price per call in USDT0 min units (6 decimals) | `5000` ($0.005) |

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for the full reference.

---

## 🧪 Testing

```bash
# Smoke tests (15 assertions, runs against live server)
npm test

# Local dev mode with auto-reload
npm run dev
```

The smoke tests verify:
- All 4 endpoints return correct status codes
- x402 manifest is well-formed
- Input validation (URL, voice)
- Free-tier counter increments correctly

---

## 📁 Project structure

```
vibecast/
├── src/
│   ├── server.js          ← Express app, x402 integration, rate limiting
│   ├── landing.js         ← HTML landing page + result page
│   ├── thread-generator.js ← OpenAI call + fallback template
│   ├── transcript.js      ← Supadata + oEmbed + fallback chain
│   ├── voices.js          ← 4 voice system prompts
│   ├── x402.js            ← x402 challenge + payment verification
│   └── rate-limiter.js    ← In-memory free-tier counter
├── test/
│   └── smoke.mjs          ← 15-assertion smoke test suite
├── docs/                  ← Project documentation
├── .env.example           ← Environment variable template
├── package.json
├── render.yaml            ← Render Blueprint
├── Dockerfile             ← For Fly.io / Docker hosts
└── README.md
```

---

## 🛣️ Roadmap

- [x] A2MCP service on OKX.AI Marketplace
- [x] x402 v2 payments on X Layer
- [x] Supadata transcript integration
- [x] 4 voice presets
- [x] Direct-link demo (no-JS)
- [ ] A2A service mode (negotiated tasks, escrow)
- [ ] Caching layer (per-video-ID transcript cache)
- [ ] Audio podcast support (Whisper fallback)
- [ ] Multi-language threads (auto-translate captions)
- [ ] Persistent storage for user history (Postgres/Redis)

---

## 🤝 Contributing

Issues and PRs welcome. See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the contribution guide.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

## 🔗 Links

- **Live demo:** https://vibecast-ptrq.onrender.com
- **Source code:** https://github.com/networkbike/Vibecast
- **OKX.AI Marketplace:** [Browse all ASPs](https://okx.ai/marketplace)
- **OKX.AI Genesis Hackathon:** https://web3.okx.com/xlayer/build-x-series
- **x402 protocol:** https://github.com/coinbase/x402
- **X Layer docs:** https://web3.okx.com/xlayer

---

**Built by [O.A Dolapo (networkbike)](https://github.com/networkbike) for the OKX.AI Genesis Hackathon.**
