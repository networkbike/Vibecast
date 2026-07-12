# VibeCast 🎙️

**YouTube-to-viral-thread generator. ASP on OKX.AI Genesis Hackathon.**

Paste a YouTube URL, pick a voice, get a 5-tweet thread + 90s Shorts script. Built for creators who hate writing hooks.

## What it does

```
INPUT:  YouTube URL + voice preset
OUTPUT: 5-tweet X thread + 90-second YouTube Shorts script
TIME:   ~30 seconds
COST:   $0 (3 free calls/day) or $0.005/call via x402 on X Layer
```

## Voices

| Voice | Style |
|---|---|
| 🚀 Punchy Founder | Short sentences, no fluff, lots of receipts |
| 📊 Data Narrator | Charts, numbers, evidence-led |
| 🧨 Contrarian Curator | Hot takes, "everyone is wrong" energy |
| 📖 Storyteller | Narrative arc, scene-setting, character-driven |

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Landing page with live demo |
| GET | `/health` | Health check |
| GET | `/.well-known/x402` | x402 service manifest (OKX.AI uses this) |
| POST | `/api/thread` | Generate a thread from a YouTube URL |

### POST /api/thread

**Request:**
```json
{
  "url": "https://youtu.be/dQw4w9WgXcQ",
  "voice": "punchy-founder"
}
```

**Response (free tier):**
```json
{
  "tweets": ["1/ ...", "2/ ...", "3/ ...", "4/ ...", "5/ ..."],
  "shorts_script": "...",
  "voice": "punchy-founder",
  "video": { "id": "...", "title": "...", "author": "..." },
  "meta": {
    "voice": "punchy-founder",
    "url": "https://youtu.be/...",
    "paid": false,
    "freeCallsUsed": 1,
    "freeCallsRemaining": 2,
    "generatedAt": "2026-07-12T..."
  }
}
```

**Response (paid tier, no X-PAYMENT header):** HTTP 402 with x402 challenge body.

## Local development

```bash
# 1. Install dependencies
npm install --no-audit --no-fund

# 2. Copy env template
cp .env.example .env
# Edit .env: add your OPENAI_API_KEY and X Layer wallet address

# 3. Run
npm run dev

# 4. Test
npm test

# 5. Open http://localhost:3000
```

## Deploy to Render

1. Push this repo to GitHub
2. Go to render.com → "New Web Service" → connect your repo
3. Settings:
   - **Build command:** `npm install --no-audit --no-fund`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Add env vars (from `.env.example`)
5. Deploy → you get a `*.onrender.com` URL

## Deploy to Fly.io (alternative)

```bash
fly launch --no-deploy
fly secrets set OPENAI_API_KEY=sk-... RECEIVE_ADDRESS=0x...
fly deploy
```

## Register as ASP on OKX.AI

Once deployed, your service is at `https://your-app.onrender.com/`.

1. Get an OKX Agentic Wallet: `onchainos wallet login <email>` (or use the web app at https://web3.okx.com/onchainos)
2. Get your X Layer wallet address: `onchainos wallet addresses --chain 196`
3. Set that address as `RECEIVE_ADDRESS` in your Render env vars
4. Go to https://okx.ai/tutorial/asp
5. Fill in the listing form:
   - Service name: VibeCast
   - Description: YouTube-to-viral-thread generator
   - Price: 5000 (min units = $0.005 USDT0)
   - Endpoint: `https://your-app.onrender.com/api/thread`
6. Submit → wait for review (≤ 24h)
7. Once listed, you can submit the hackathon form

## How x402 works here

VibeCast is an **A2MCP** (Agent-to-MCP) service on OKX.AI.

- **First 3 calls per IP per day** are free (HTTP 200 with result).
- **4th call and beyond** requires x402 payment:
  1. Client calls without `X-PAYMENT` header → server returns **HTTP 402** with the standard x402 challenge in the body
  2. Buyer's wallet signs an EIP-3009 `transferWithAuthorization` for the USDT0 amount
  3. Client retries with `X-PAYMENT: <base64-encoded proof>` header
  4. Server verifies the signature, then serves the result
- Settlement happens on **X Layer** (chain 196), zero gas
- See `src/x402.js` for the full spec implementation

## Tech stack

- **Runtime:** Node.js 18+ (Termux-compatible, no native deps)
- **Server:** Express
- **LLM:** OpenAI-compatible (default: gpt-4o-mini, swappable)
- **Transcript:** `youtube-transcript` npm package
- **Payments:** x402 spec-compliant (swap to `@okxweb3/x402-express` SDK in production)
- **Host:** Render free tier (or any Node host)

## License

MIT
