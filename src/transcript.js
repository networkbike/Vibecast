// YouTube transcript fetcher — hardened against rate-limits
//
// Tries multiple strategies in order:
//   1. Proxy (YT_PROXY_URL) — routes to a different IP, bypasses Render's block
//   2. youtube-transcript npm package directly (works on some IPs, not Render)
//   3. Direct timedtext fetch with rotating User-Agent + cookie strategy
//   4. Fallback: extract video title from page HTML + use it for context
//
// For the hackathon, strategy 1 (proxy) is the production path.

import { YoutubeTranscript } from 'youtube-transcript';

const YT_PROXY_URL = process.env.YT_PROXY_URL; // e.g. https://vibecast-yt-proxy.onrender.com

// A small set of realistic User-Agents. Rotating helps avoid per-UA throttles.
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

function pickUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
  let m = url.match(/youtu\.be\/([\w-]{11})/);
  if (m) return m[1];
  m = url.match(/[?&]v=([\w-]{11})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (m) return m[1];
  return null;
}

// Strategy 3 fallback: get the video title + channel from the public YouTube page
async function fetchVideoMetadata(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': pickUA(),
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const titleMatch = html.match(/<meta\s+name="title"\s+content="([^"]+)"/);
    const authorMatch = html.match(/"author":"([^"]+)"/);

    return {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: titleMatch ? titleMatch[1] : `YouTube video ${videoId}`,
      author: authorMatch ? authorMatch[1] : 'Unknown channel',
    };
  } catch {
    return null;
  }
}

export async function fetchTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract YouTube video ID from URL');
  }

  const videoMeta = await fetchVideoMetadata(videoId);
  const meta = videoMeta || {
    id: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: `YouTube video ${videoId}`,
    author: 'Unknown channel',
  };

  // Strategy 1: external proxy (recommended — bypasses Render's rate-limited IP)
  let transcript = '';
  let usedStrategy = null;
  let lastError = null;

  if (YT_PROXY_URL) {
    try {
      const proxyRes = await fetch(`${YT_PROXY_URL}/transcript?id=${videoId}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData.transcript && proxyData.transcript.length >= 50) {
          transcript = proxyData.transcript;
          usedStrategy = 'proxy';
        }
      } else {
        lastError = new Error(`Proxy returned ${proxyRes.status}`);
      }
    } catch (err) {
      lastError = err;
      // Continue to strategy 2
    }
  }

  // Strategy 2: youtube-transcript npm (works on some IPs)
  if (!usedStrategy) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
      if (transcript && transcript.length >= 50) {
        usedStrategy = 'youtube-transcript';
      }
    } catch (err) {
      lastError = err;
      // Continue to strategy 3
    }
  }

  // Strategy 3: direct timedtext fetch (rare to work but worth trying)
  if (!usedStrategy) {
    try {
      const res = await fetch(
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
        { headers: { 'User-Agent': pickUA() } }
      );
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 100) {
          transcript = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (transcript.length >= 50) {
            usedStrategy = 'timedtext-direct';
          }
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Strategy 4: build a meaningful "transcript" from the video metadata.
  // The LLM can use this to generate a thread about the video's title/topic.
  if (!usedStrategy) {
    const title = meta.title;
    const author = meta.author;
    transcript = `Video titled "${title}" by ${author}. ` +
      `Title suggests the video is about: ${title.replace(/[^\w\s]/g, ' ')}. ` +
      `(Full transcript unavailable — YouTube rate-limited our IP. ` +
      `Generate a thread that introduces the topic and the creator, with hooks ` +
      `that would make someone click through to watch.)`;
    usedStrategy = 'metadata-fallback';
  }

  return {
    transcript,
    videoMeta: meta,
    transcriptStrategy: usedStrategy,
  };
}
