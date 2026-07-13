# Deployment guide

VibeCast is a single-binary Node.js service. It runs anywhere Node 18+ runs. This guide covers the three most popular deployment targets.

## Quick comparison

| Host | Cost | Setup time | Best for |
|---|---|---|---|
| **Render** | Free tier | 5 min | Recommended for hackathon. Free. Auto-deploys from GitHub. |
| **Fly.io** | $5/mo free credit | 10 min | Production. Always-on. Better for paid x402 traffic. |
| **Railway** | $5/mo | 5 min | Easy. Card required. |
| **Self-host (VPS)** | ~$5/mo | 30 min | Full control. |

## Render (recommended)

**1. Fork this repo** to your GitHub account.

**2. Sign up at [render.com](https://render.com)** with GitHub.

**3. New Web Service** → select your fork → Render auto-detects `render.yaml`.

**4. Set environment variables** in the Render dashboard (Environment tab):
- `OPENAI_API_KEY` — your OpenAI key
- `SUPADATA_API_KEY` — your Supadata key
- `RECEIVE_ADDRESS` — your X Layer wallet (must control this)

The other env vars have defaults in `render.yaml`.

**5. Deploy.** First build takes ~2 minutes. Auto-deploys on every push to main.

**6. Verify:**
- `https://<name>.onrender.com/health` returns JSON
- `https://<name>.onrender.com/.well-known/x402` returns the manifest
- `https://<name>.onrender.com/go?url=https://youtu.be/dQw4w9WgXcQ&voice=punchy-founder` returns a thread

## Fly.io

**1. Install flyctl:** `curl -L https://fly.io/install.sh | sh`

**2. Login:** `fly auth signup` (or `fly auth login`)

**3. Launch:**
```bash
fly launch --no-deploy
# Pick a name, region, decline Postgres/Redis
```

**4. Set secrets:**
```bash
fly secrets set \
  OPENAI_API_KEY=sk-... \
  SUPADATA_API_KEY=sd_... \
  RECEIVE_ADDRESS=0x...
```

**5. Deploy:** `fly deploy`

**6. Verify:** `https://<name>.fly.dev/health`

## Railway

**1. Sign up at [railway.app](https://railway.app)** with GitHub (card required).

**2. New Project** → Deploy from GitHub repo → select your fork.

**3. Add environment variables** in Variables tab:
- Same as Render

**4. Deploy** — auto-deploys on every push.

**5. Verify:** `https://<name>.up.railway.app/health`

## Self-host (VPS)

**1. Provision a VPS** (DigitalOcean, Hetzner, Vultr, etc.) with Node 18+.

**2. SSH in and clone:**
```bash
git clone https://github.com/networkbike/Vibecast.git
cd Vibecast
npm install --no-audit --no-fund
cp .env.example .env
nano .env  # fill in real values
```

**3. Run with a process manager:**
```bash
npm install -g pm2
pm2 start src/server.js --name vibecast
pm2 startup
pm2 save
```

**4. Reverse proxy with Caddy or nginx** for HTTPS:
```
# /etc/caddy/Caddyfile
vibecast.example.com {
  reverse_proxy localhost:3000
}
```

**5. Verify:** `https://vibecast.example.com/health`

## Post-deploy checklist

- [ ] `/health` returns 200 with all config flags true
- [ ] `/.well-known/x402` returns valid manifest
- [ ] `/go?url=...&voice=...` returns a real thread
- [ ] x402 manifest URL is accessible from the public internet
- [ ] `RECEIVE_ADDRESS` is your X Layer wallet you control
- [ ] (Production) Custom domain with HTTPS

## Listing on OKX.AI

After deploying, list your ASP on OKX.AI:

1. Install OKX Onchain OS: `npx skills add okx/onchainos-skills`
2. Log in to your Agentic Wallet: `onchainos wallet login <email>`
3. Verify with the OTP code from email
4. Run: `Help me register an A2MCP ASP on OKX.AI using Onchain OS`
5. Provide your service details (name, description, price, endpoint)
6. Upload an avatar: `agent upload --file <avatar.png>`
7. Activate: `agent activate --agent-id <N> --preferred-language en-US`

Your ASP is now live on OKX.AI Marketplace.
