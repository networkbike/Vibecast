// VibeCast — YouTube-to-viral-thread generator
// ASP on OKX.AI Genesis Hackathon
//
// Endpoints:
//   GET  /              — landing page
//   GET  /health        — health check
//   GET  /.well-known/x402 — service manifest for OKX.AI marketplace
//   POST /api/thread    — generate a thread from a YouTube URL
//                        - First N calls per IP per day: free (HTTP 200)
//                        - After that: requires x402 payment (HTTP 402)

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { generateThread } from './thread-generator.js';
import { rateLimiter, getFreeCallsUsed } from './rate-limiter.js';
import { buildPaymentChallenge, verifyPayment } from './x402.js';
import { renderLanding } from './landing.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '64kb' }));

const PORT = process.env.PORT || 3000;
const FREE_TIER_DAILY = parseInt(process.env.FREE_TIER_DAILY || '3', 10);
const PAID_PRICE_MIN_UNITS = process.env.PAID_PRICE_MIN_UNITS || '5000';

// ─────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'vibecast',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
// x402 service manifest — OKX.AI uses this to discover pricing
// ─────────────────────────────────────────────────────────────
app.get('/.well-known/x402', (_req, res) => {
  res.json({
    x402Version: 2,
    service: {
      name: 'VibeCast',
      description:
        'YouTube-to-viral-thread generator. Paste a YouTube URL, pick a voice, get a 5-tweet thread + 90s Shorts script.',
      category: 'lifestyle',
      url: process.env.PUBLIC_URL || `https://${process.env.RENDER_EXTERNAL_URL || 'localhost:' + PORT}`,
    },
    accepts: [
      {
        scheme: 'exact',
        network: process.env.X402_NETWORK || 'eip155:196',
        asset: process.env.USDT0_TOKEN_ADDRESS,
        amount: PAID_PRICE_MIN_UNITS,
        payTo: process.env.RECEIVE_ADDRESS,
        maxTimeoutSeconds: 300,
        extra: { name: 'USD₮0', version: '1' },
      },
    ],
  });
});

// ─────────────────────────────────────────────────────────────
// Landing page
// ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(renderLanding());
});

// ─────────────────────────────────────────────────────────────
// POST /api/thread — the actual product
// Body: { url: string, voice?: string, apiKey?: string }
// Headers (when paid):
//   X-PAYMENT: <base64-encoded payment proof from x402 client>
//   PAYMENT-SIGNATURE: <signature>
// ─────────────────────────────────────────────────────────────
app.post('/api/thread', rateLimiter, async (req, res) => {
  const { url, voice = 'punchy-founder' } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'missing_url',
      message: 'POST { "url": "https://youtu.be/...", "voice": "punchy-founder" }',
    });
  }

  // YouTube URL validation (light — accept youtu.be, youtube.com, m.youtube)
  const ytRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)[\w-]{11}/;
  if (!ytRegex.test(url)) {
    return res.status(400).json({
      error: 'invalid_url',
      message: 'Pass a YouTube watch URL or youtu.be short link. Audio/podcast URLs coming soon.',
    });
  }

  // ─── Free tier check ───
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const freeCallsUsed = await getFreeCallsUsed(ip);

  let paid = false;

  if (freeCallsUsed >= FREE_TIER_DAILY) {
    // ─── x402 payment gate ───
    const paymentHeader = req.headers['x-payment'] || req.headers['payment-signature'];

    if (!paymentHeader) {
      // No payment header — return 402 challenge
      const challenge = buildPaymentChallenge({
        amount: PAID_PRICE_MIN_UNITS,
        asset: process.env.USDT0_TOKEN_ADDRESS,
        payTo: process.env.RECEIVE_ADDRESS,
        network: process.env.X402_NETWORK || 'eip155:196',
        resource: url,
        description: `VibeCast thread generation for ${url}`,
      });
      res.set('PAYMENT-REQUIRED', Buffer.from(JSON.stringify(challenge)).toString('base64'));
      return res.status(402).json(challenge);
    }

    // ─── Verify payment ───
    try {
      const valid = await verifyPayment(paymentHeader, {
        amount: PAID_PRICE_MIN_UNITS,
        payTo: process.env.RECEIVE_ADDRESS,
      });
      if (!valid) {
        return res.status(402).json({
          error: 'invalid_payment',
          message: 'Payment signature did not verify. Re-sign and retry.',
        });
      }
      paid = true;
    } catch (err) {
      console.error('Payment verification failed:', err);
      return res.status(402).json({
        error: 'payment_verification_failed',
        message: err.message || 'Could not verify payment.',
      });
    }
  }

  // ─── Generate the thread ───
  try {
    const result = await generateThread({ url, voice });

    return res.status(200).json({
      ...result,
      meta: {
        voice,
        url,
        paid,
        freeCallsUsed,
        freeCallsRemaining: Math.max(0, FREE_TIER_DAILY - freeCallsUsed - (paid ? 0 : 1)),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Thread generation failed:', err);
    return res.status(500).json({
      error: 'generation_failed',
      message: err.message || 'Thread generation failed. Try a different URL or voice.',
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✨ VibeCast API listening on port ${PORT}`);
  console.log(`   Free tier: ${FREE_TIER_DAILY} calls/IP/day`);
  console.log(`   Paid: ${PAID_PRICE_MIN_UNITS} min units via x402 on ${process.env.X402_NETWORK || 'eip155:196'}`);
});
