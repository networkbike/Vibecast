// Simple in-memory rate limiter for the free tier
// Tracks free calls per IP per day. Resets at UTC midnight.
//
// For a real production service, swap this for a Redis-backed limiter
// (Render's free tier supports Upstash Redis for free).

const dailyCalls = new Map(); // key: ip, value: { date: 'YYYY-MM-DD', count: N }

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const today = todayUtc();

  const record = dailyCalls.get(ip);
  if (!record || record.date !== today) {
    dailyCalls.set(ip, { date: today, count: 0 });
  }

  next();
}

export async function getFreeCallsUsed(ip) {
  const today = todayUtc();
  const record = dailyCalls.get(ip);
  if (!record || record.date !== today) {
    return 0;
  }
  return record.count;
}

export async function incrementFreeCall(ip) {
  const today = todayUtc();
  const record = dailyCalls.get(ip);
  if (!record || record.date !== today) {
    dailyCalls.set(ip, { date: today, count: 1 });
  } else {
    record.count += 1;
  }
}

// Auto-cleanup every hour to prevent the Map from growing forever
setInterval(() => {
  const today = todayUtc();
  for (const [ip, record] of dailyCalls.entries()) {
    if (record.date !== today) {
      dailyCalls.delete(ip);
    }
  }
}, 60 * 60 * 1000);
