# Frequently asked questions

## General

### What is VibeCast?

VibeCast is a paid Agent Service Provider (ASP) on the OKX.AI Marketplace. It turns YouTube videos into ready-to-post X (Twitter) threads and 90-second YouTube Shorts scripts.

### Who is it for?

Creators, founders, and writers who maintain an X presence but spend hours writing threads. VibeCast reads the source video (the one they were already going to watch), generates a thread in their voice, and includes a Shorts script.

### How much does it cost?

- **Free tier:** 3 calls per IP per day
- **Paid tier:** $0.005 (USDT0 on X Layer) per call
- The x402 protocol handles payment atomically — you don't need to sign up for anything

### Is it open source?

Yes, MIT licensed. Source at https://github.com/networkbike/Vibecast

## Technical

### How does VibeCast get the YouTube transcript?

VibeCast uses a multi-strategy approach:
1. **Supadata API** (primary) — paid service that handles YouTube scraping on their own IPs
2. **YouTube Data API v3** (fallback) — Google's official API for video metadata
3. **Direct timedtext fetch** (last resort) — direct YouTube API call
4. **Metadata fallback** — uses video title/description when transcripts are unavailable

### Why doesn't it use the official YouTube Captions API?

The YouTube Data API's `captions.download` endpoint requires OAuth consent from the video owner. For a public service that needs to read captions from any public video, we have to use a workaround. Supadata handles this on their own infrastructure.

### What is x402?

x402 is a payment protocol that uses the HTTP 402 status code for machine-to-machine payments. When a client hits a paid endpoint, the server returns 402 with a payment challenge. The client signs the payment, retries with the proof, and gets the result. Settlement is on-chain.

### What is USDT0?

USDT0 is the official Tether stablecoin deployed on X Layer (OKX's zk-EVM). It's the settlement token for VibeCast's x402 payments.

### Why X Layer?

X Layer is OKX's zk-EVM chain with zero gas fees, instant finality, and a payment-friendly design. It's the natural fit for x402 / Agent Payments Protocol.

### What's the x402 manifest at `/.well-known/x402`?

It's a service discovery document. AI agents and marketplaces (including OKX.AI) read this URL to learn about a service: its name, what it does, how much it costs, where to send payments, and what network. It's the equivalent of `robots.txt` for the agent economy.

## Operations

### How do I deploy this?

See [DEPLOY.md](DEPLOY.md). The recommended way is Render (one-click deploy, free tier).

### Why is the first request slow?

Render free tier instances sleep after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake the container. Self-ping mitigates this (VibeCast pings itself every 10 minutes).

### Can I use a different LLM?

Yes. Set `OPENAI_BASE_URL` to any OpenAI-compatible API (Together AI, OpenRouter, self-hosted) and `OPENAI_MODEL` to the model name. The code uses the standard OpenAI chat completions API.

### Can I use a different transcript provider?

Yes. The transcript strategy is pluggable. To swap Supadata for another service, edit `src/transcript.js` and modify the first strategy block. The rest of the code is provider-agnostic.

## Hackathon

### What track is VibeCast competing in?

VibeCast is competing in:
- **Social Buzz** ($1K × 10 winners) — the build-in-public story and 90s video demo
- **Lifestyle Companion** ($2.5K × 3 winners) — the personal brand assistant angle
- Optionally: **Best Product** ($10K) if judges see it as a complete product

### Is VibeCast "live" on OKX.AI?

Agent #5287 is created onchain. Status: "not listed" pending A2A activation (which requires a runtime that's interactive on the user's machine). The onchain identity, service registration, and x402 manifest are all live and verifiable.

### How do judges verify VibeCast?

1. Hit `https://vibecast-ptrq.onrender.com/health` — shows real config
2. Hit `https://vibecast-ptrq.onrender.com/.well-known/x402` — shows the x402 manifest with real payTo address
3. Hit `https://vibecast-ptrq.onrender.com/go?url=https://youtu.be/dQw4w9WgXcQ&voice=punchy-founder` — shows a real LLM-generated thread
4. Check `https://xlayer.okx.com/address/0xe76c02987f901651db4d59b13458b6c9c273a381` — verify the receiving wallet on-chain
5. Check `https://github.com/networkbike/Vibecast` — open source, MIT licensed

## License

VibeCast is MIT licensed. Free to use, modify, fork. Just keep the copyright notice.
