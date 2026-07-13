# Configuration reference

All configuration is via environment variables. VibeCast has sensible defaults for most things — you only need to set the required ones.

## Required

### `RECEIVE_ADDRESS`

Your X Layer wallet address. This is where x402 USDT0 payments land.

- Type: hex string starting with `0x`
- Length: 42 characters
- Example: `0xe76c02987f901651db4d59b13458b6c9c273a381`
- **Must control the private key for this address** (you can use the OKX Agentic Wallet)

## Recommended

### `OPENAI_API_KEY`

OpenAI API key for thread generation. Without it, VibeCast falls back to a deterministic template (still functional, but less creative).

- Get one at https://platform.openai.com/api-keys
- Free tier: $5 credit (enough for ~2500 generations)
- Format: `sk-...` or `sk-proj-...`
- The key is sent only to `api.openai.com` (or your `OPENAI_BASE_URL`)

### `SUPADATA_API_KEY`

Supadata API key for YouTube transcript fetching. The primary transcript source.

- Get one at https://supadata.ai (free tier: 100 requests/month, no credit card)
- Format: `sd_...`
- Used to bypass Render's IP-based YouTube rate limits

## Optional

### `OPENAI_BASE_URL`

Override the OpenAI API base URL. Useful for:
- Using a different OpenAI-compatible API (Together AI, Anyscale, etc.)
- Self-hosted LLMs

- Default: `https://api.openai.com/v1`
- Examples:
  - Together AI: `https://api.together.xyz/v1`
  - OpenRouter: `https://openrouter.ai/api/v1`

### `OPENAI_MODEL`

Which OpenAI model to use for thread generation.

- Default: `gpt-4o-mini`
- Other options: `gpt-4o`, `gpt-3.5-turbo`, `claude-3-5-sonnet-20241022` (via OpenRouter)
- Smaller models = faster + cheaper, larger = better quality

### `YT_API_KEY`

YouTube Data API v3 key. Used as a fallback metadata source (title, description, channel) when Supadata doesn't return enough info.

- Get one at https://console.cloud.google.com → enable YouTube Data API v3 → create API key
- Free tier: 10,000 units/day

### `YT_PROXY_URL`

Legacy: external transcript proxy URL. Kept for backward compatibility with older deployments. Not needed for new deployments.

### `USDT0_TOKEN_ADDRESS`

The USDT0 token contract on X Layer. Used in the x402 payment challenge.

- **Don't change this unless you know what you're doing.**
- Default: `0x779ded0c9e1022225f8e0630b35a9b54be713736` (official USDT0 on X Layer)

### `X402_NETWORK`

The x402 network identifier. X Layer mainnet is `eip155:196` (CAIP-2 format).

- **Don't change this unless you know what you're doing.**
- Default: `eip155:196`

### `FREE_TIER_DAILY`

How many free calls an IP gets per day before being asked to pay.

- Default: `3`
- Set to `0` to disable the free tier (every call is paid)
- Set higher for a more generous free tier

### `PAID_PRICE_MIN_UNITS`

Price per call in USDT0 minimum units. USDT0 has 6 decimals, so:
- `1000` = $0.001 per call
- `5000` = $0.005 per call (default)
- `10000` = $0.01 per call

### `RENDER_EXTERNAL_URL`

Automatically set by Render. The full URL of your service. Used in the x402 manifest.

- Don't set this manually. Render sets it on deploy.

### `PUBLIC_URL`

Override the URL in the x402 manifest. Use this if you have a custom domain.

- Example: `https://vibecast.example.com`
- Default: `RENDER_EXTERNAL_URL` (set by Render)

## Example `.env` for production

```bash
# Required
RECEIVE_ADDRESS=0xe76c02987f901651db4d59b13458b6c9c273a381

# Recommended
OPENAI_API_KEY=sk-proj-...
SUPADATA_API_KEY=sd_...

# Optional (defaults shown)
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
USDT0_TOKEN_ADDRESS=0x779ded0c9e1022225f8e0630b35a9b54be713736
X402_NETWORK=eip155:196
FREE_TIER_DAILY=3
PAID_PRICE_MIN_UNITS=5000
PORT=3000
```

## Example `.env` for development

```bash
RECEIVE_ADDRESS=0x0000000000000000000000000000000000000000
# OpenAI key optional — falls back to template
SUPADATA_API_KEY=sd_...
```
