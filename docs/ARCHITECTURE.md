# Architecture

## High-level diagram

```
                  ┌─────────────────────────────────────┐
                  │            VibeCast               │
                  │       (Express on Render)         │
                  │                                     │
                  │  ┌──────────┐    ┌──────────────┐  │
   YouTube URL  → │  │transcript│ →  │   thread-    │ → JSON
   + voice        │  │   .js    │    │  generator   │   response
                  │  └────┬─────┘    └──────┬───────┘  │
                  │       │                │           │
                  │       ▼                ▼           │
                  │  ┌──────────┐    ┌──────────────┐  │
                  │  │ Supadata │    │   OpenAI     │  │
                  │  │ YouTube   │    │   gpt-4o     │  │
                  │  │ oEmbed    │    │   -mini      │  │
                  │  └──────────┘    └──────────────┘  │
                  │                                     │
                  │  ┌──────────────────────────────┐  │
   x402 USDT0  →  │  │           x402              │  │
   payment         │  │  (challenge + verify)      │  │
                  │  └──────────────────────────────┘  │
                  │                                     │
                  │  ┌──────────────────────────────┐  │
   counter        │  │    rate-limiter.js          │  │
                  │  │  (in-memory, per IP/day)    │  │
                  │  └──────────────────────────────┘  │
                  └─────────────────────────────────────┘
                              │
                              ▼
                  ┌─────────────────────────────────────┐
                  │     X Layer (chain 196)            │
                  │  USDT0 contract: 0x779d...3736     │
                  │  Receive wallet: 0xe76c...a381     │
                  └─────────────────────────────────────┘
```

## Request lifecycle

### Free tier request (1st-3rd call)

```
1. Client → POST /api/thread { url, voice }
2. Express middleware (rateLimiter) attaches req.clientIp
3. Handler reads freeCallsUsed from in-memory map
4. freeCallsUsed < FREE_TIER_DAILY (3)
5. Skip x402 payment gate
6. Increment counter
7. Call transcript.js → Supadata API → real YouTube transcript
8. Call oEmbed → real video title/author
9. Build system prompt from voices.js
10. Call OpenAI gpt-4o-mini with JSON response format
11. Return 5-tweet thread + Shorts script + meta
12. Client receives HTTP 200 with JSON
```

### Paid tier request (4th+ call)

```
1. Client → POST /api/thread { url, voice }
2. freeCallsUsed >= FREE_TIER_DAILY (3)
3. No X-PAYMENT header
4. Return HTTP 402 with x402 challenge in body
5. Client (x402-aware agent) signs USDT0 transferWithAuthorization
6. Client → POST /api/thread { url, voice } with X-PAYMENT header
7. freeCallsUsed still >= FREE_TIER_DAILY
8. X-PAYMENT header present
9. verifyPayment() checks signature, amount, recipient
10. Skip free-tier counter increment (paid = don't count)
11. Generate thread (same as free path)
12. Return HTTP 200 with thread + meta.paid = true
13. Settlement: USDT0 transferred on X Layer
```

## Module structure

### `src/server.js` — Express app

The single entry point. Defines routes, middleware order, and request handlers.

**Key responsibilities:**
- Route registration (`/`, `/health`, `/.well-known/x402`, `/go`, `/api/thread`)
- Rate limit middleware
- x402 challenge building and payment verification
- Calling the thread generator
- HTML response rendering (landing page, result page)

### `src/transcript.js` — YouTube data fetcher

Multi-strategy transcript and metadata fetcher. Tries strategies in order until one succeeds:

1. **Supadata API** — paid service, returns full transcript with timestamps. 100 free requests/month.
2. **YouTube Data API v3** — Google's official API for metadata. Doesn't return transcripts but gives title/description/tags.
3. **External proxy** — legacy. Configurable via `YT_PROXY_URL`.
4. **youtube-transcript npm** — direct fetch via `youtube-transcript` package. Often rate-limited on shared Render IPs.
5. **Direct timedtext fetch** — bypass library, fetch `timedtext?v=...&fmt=json3` directly. Sometimes works.
6. **Metadata fallback** — generic template based on whatever we have. Last resort.

Returns `{ transcript, videoMeta, transcriptStrategy }`.

### `src/thread-generator.js` — LLM orchestration

Builds the LLM prompt from the voice preset + transcript, calls OpenAI, validates the response.

**Two paths:**
- **OpenAI path** (recommended) — uses `gpt-4o-mini` with `response_format: { type: 'json_object' }` to get structured output. Validates the result has 5 tweets + shorts_script.
- **Fallback path** — deterministic template that uses the real video title and a description excerpt. Functional but less creative.

### `src/x402.js` — Payment protocol

Implements the x402 v2 spec:
- `buildPaymentChallenge()` — produces the standard 402 challenge body
- `verifyPayment()` — checks the X-PAYMENT header signature, amount, recipient

In production, swap with `@okxweb3/x402-express` SDK for full on-chain verification. Hackathon MVP trusts the settlement layer.

### `src/voices.js` — Voice system prompts

Four voice presets, each with a detailed system prompt that shapes the LLM's output style:
- `punchy-founder` — short sentences, receipts
- `data-narrator` — numbers, sources
- `contrarian-curator` — hot takes
- `storyteller` — narrative arc

### `src/landing.js` — HTML templates

Two single-file HTML strings:
- `renderLanding()` — the main page with the URL input, voice pills, and (optionally) a result area
- `renderResultPage()` — standalone HTML page for the no-JS `/go` direct link flow

### `src/rate-limiter.js` — Free-tier counter

In-memory `Map<ip, { date, count }>`. Resets at UTC midnight. Not distributed — works for single-instance Render deployments.

## State management

**No persistent state.** Everything is in-memory:
- Rate limit counters (lost on redeploy, but acceptable for hackathon)
- No user accounts
- No generation history

This is intentional — the hackathon ASP pattern is stateless. Each request is independent.

## Failure modes and fallbacks

| Component fails | Behavior |
|---|---|
| Supadata API down | Falls back to YouTube oEmbed for metadata, then metadata-fallback template |
| OpenAI API down | Returns 500 with error message |
| OpenAI quota exceeded | Returns 500 with `429` error |
| Render cold start | First request takes ~30s after 15min idle, then fast |
| x402 payment with wrong amount | Returns 402 with `invalid_payment` error |
| x402 payment with wrong recipient | Returns 402 with `payment_verification_failed` |

## Security considerations

- **API keys** are passed via env vars, never in code
- **No user data** is stored (stateless)
- **x402 payments** are signed by the buyer's wallet, not VibeCast
- **IP rate limiting** prevents casual abuse but not determined attackers
- **CORS** is enabled for all origins (suitable for public API)
- **No authentication** on the API — anyone can call it (paid or free)
- **No input sanitization** beyond URL format check — relies on OpenAI to handle adversarial prompts

For production, add:
- Request signing
- Per-user rate limits
- Content moderation on generated threads
- Persistent storage for analytics
