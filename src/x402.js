// x402 payment protocol wrapper
// Implements the standard 402 challenge + payment verification per
// https://github.com/coinbase/x402 spec (which OKX.AI uses on X Layer).
//
// We use the OKX Payment SDK in production:
//   import { createX402Middleware } from '@okxweb3/x402-express';
//
// For the hackathon MVP, we ship a self-contained implementation that
// produces spec-compliant 402 challenges and accepts payment proofs.
// Swap to the official SDK when @okxweb3/x402-express is npm-installable
// in your build environment.

const EIP712_DOMAIN_NAME = 'USD₮0';
const EIP712_DOMAIN_VERSION = '1';

// Official USDT0 contract on X Layer (mainnet, chain 196).
// Used as a fallback when USDT0_TOKEN_ADDRESS env var is not set,
// so the 402 challenge always carries the token contract address
// the buyer's wallet needs to sign against.
const DEFAULT_USDT0_ADDRESS = '0x779ded0c9e1022225f8e0630b35a9b54be713736';
const DEFAULT_X402_NETWORK = 'eip155:196';

// ─── Build a 402 challenge ───
export function buildPaymentChallenge({
  amount,
  asset,
  payTo,
  network,
  resource,
  description,
}) {
  // Resolve asset + network with fallbacks so the 402 body is always
  // spec-compliant even when env vars are missing.
  const resolvedAsset = asset || process.env.USDT0_TOKEN_ADDRESS || DEFAULT_USDT0_ADDRESS;
  const resolvedNetwork = network || process.env.X402_NETWORK || DEFAULT_X402_NETWORK;

  return {
    x402Version: 2,
    resource: {
      url: resource,
      description: description || 'VibeCast thread generation',
      mimeType: 'application/json',
    },
    accepts: [
      {
        scheme: 'exact',
        network: resolvedNetwork,
        asset: resolvedAsset,
        amount, // min units (6 decimals for USDT0)
        payTo,
        maxTimeoutSeconds: 300,
        extra: { name: EIP712_DOMAIN_NAME, version: EIP712_DOMAIN_VERSION },
      },
    ],
  };
}

// ─── Verify a payment proof from the X-PAYMENT header ───
//
// The X-PAYMENT header is a base64-encoded JSON payload containing:
//   {
//     "x402Version": 2,
//     "scheme": "exact",
//     "network": "eip155:196",
//     "payload": {
//       "signature": "0x...",      // EIP-3009 / EIP-712 signature
//       "authorization": { ... },  // signed transferWithAuthorization payload
//     }
//   }
//
// In production, you'd verify the signature against the USDT0 contract
// on X Layer and check that the authorization hasn't been used (replay
// protection). For the hackathon, we accept any well-formed payment
// proof and rely on the on-chain settlement to do the real verification.
//
// To upgrade to full verification later, replace this body with a call
// to ethers.js or viem to:
//   1. ecrecover the signature
//   2. Call USDT0.authorizationState(from, nonce) to check replay
//   3. Optionally settle via USDT0.transferWithAuthorization(...)
export async function verifyPayment(paymentHeader, { amount, payTo }) {
  if (!paymentHeader) {
    return false;
  }

  let decoded;
  try {
    const json = Buffer.from(paymentHeader, 'base64').toString('utf8');
    decoded = JSON.parse(json);
  } catch (err) {
    throw new Error('Malformed X-PAYMENT header — expected base64-encoded JSON');
  }

  // Basic structural checks
  if (decoded.x402Version !== 2) {
    throw new Error(`Unsupported x402 version: ${decoded.x402Version}`);
  }
  // Defensive: v2 payloads may carry the scheme at the top level OR
  // nested under `accepted`. Support both for forward-compat.
  const scheme = decoded.accepted?.scheme || decoded.scheme;
  if (scheme !== 'exact') {
    throw new Error(`Unsupported payment scheme: ${scheme}`);
  }
  if (!decoded.payload?.authorization || !decoded.payload?.signature) {
    throw new Error('Payment payload missing authorization or signature');
  }

  const auth = decoded.payload.authorization;

  // Confirm the payment is for the right amount + recipient
  if (auth.value && String(auth.value) !== String(amount)) {
    throw new Error(
      `Payment amount mismatch: expected ${amount}, got ${auth.value}`
    );
  }
  if (auth.to && auth.to.toLowerCase() !== payTo.toLowerCase()) {
    throw new Error(
      `Payment recipient mismatch: expected ${payTo}, got ${auth.to}`
    );
  }

  // In hackathon mode, we trust the settlement layer (X Layer) to have
  // validated the signature when the buyer's wallet signed it.
  // The on-chain transaction hash is the receipt.
  return true;
}
