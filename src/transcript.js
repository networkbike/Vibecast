// YouTube data fetcher — uses the official YouTube Data API v3
//
// Strategy 1: Supadata API (best — returns full transcript, no rate limits from our IP)
// Strategy 2: YouTube Data API for video metadata (title, description, channel, tags)
// Strategy 3: External proxy (legacy)
// Strategy 4: youtube-transcript npm package
// Strategy 5: Direct timedtext fetch
// Strategy 6: Metadata fallback

import { YoutubeTranscript } from 'youtube-transcript';

const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;
const YT_API_KEY = process.env.YT_API_KEY;
const YT_PROXY_URL = process.env.YT_PROXY_URL; // legacy

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

// Strategy 1: YouTube Data API v3 — fetch video metadata
// Returns: { title, description, channelTitle, channelId, tags, defaultAudioLanguage, ... }
async function fetchYouTubeDataApi(videoId) {
  if (!YT_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      id: videoId,
      part: 'snippet,contentDetails,statistics',
      key: YT_API_KEY,
      maxResults: '1',
    });
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) {
      console.error('YouTube Data API error:', res.status);
      return null;
    }
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    return {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: item.snippet?.title || `YouTube video ${videoId}`,
      author: item.snippet?.channelTitle || 'Unknown channel',
      description: item.snippet?.description || '',
      tags: item.snippet?.tags || [],
      categoryId: item.snippet?.categoryId,
      publishedAt: item.snippet?.publishedAt,
      duration: item.contentDetails?.duration,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
    };
  } catch (err) {
    console.error('YouTube Data API fetch failed:', err.message);
    return null;
  }
}

// Legacy metadata fetcher (used by older fallback paths)
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

  let videoMeta = null;
  let transcript = '';
  let usedStrategy = null;

  // Strategy 1: Supadata API (best — handles YouTube scraping on their own IPs)
  if (SUPADATA_API_KEY) {
    try {
      // Try English first, fall back to no-lang param if that fails
      let res = await fetch(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&lang=en`,
        {
          headers: { 'x-api-key': SUPADATA_API_KEY },
          signal: AbortSignal.timeout(15000),
        }
      );
      if (!res.ok) {
        // Fallback: try without lang
        res = await fetch(
          `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
          {
            headers: { 'x-api-key': SUPADATA_API_KEY },
            signal: AbortSignal.timeout(15000),
          }
        );
      }
      if (res.ok) {
        const rawText = await res.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch {
          // Some Supadata responses are just plain text
          transcript = rawText.replace(/\s+/g, ' ').trim();
          data = null;
        }
        if (data) {
          // Supadata returns either:
          //   { content: [{ text, offset, duration, lang }], lang: "en" }  -- segments (most common)
          //   { content: "string", lang: "en" }  -- plain text (less common)
          //   { transcript: [{ text, ... }] }  -- alternate field name
          //   [{ text, ... }]  -- raw array
          if (Array.isArray(data.content)) {
            transcript = data.content
              .map(s => (typeof s === 'string' ? s : s.text || ''))
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          } else if (typeof data.content === 'string') {
            transcript = data.content;
          } else if (Array.isArray(data.transcript)) {
            transcript = data.transcript
              .map(s => (typeof s === 'string' ? s : s.text || ''))
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          } else if (Array.isArray(data)) {
            transcript = data
              .map(s => (typeof s === 'string' ? s : s.text || ''))
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
        if (transcript && transcript.length >= 50) {
          usedStrategy = 'supadata';
          videoMeta = await fetchVideoMetadata(videoId);
        }
      } else {
        const errText = await res.text();
        console.error('Supadata API error:', res.status, errText.slice(0, 200));
      }
    } catch (err) {
      console.error('Supadata fetch failed:', err.message);
    }
  }

  // Strategy 2: YouTube Data API (best — reliable, official, no scraping)
  if (YT_API_KEY) {
    const apiData = await fetchYouTubeDataApi(videoId);
    if (apiData) {
      videoMeta = apiData;
      // Build a "transcript" from description + tags + title for the LLM
      const parts = [];
      parts.push(`Title: ${apiData.title}`);
      parts.push(`Channel: ${apiData.author}`);
      if (apiData.description && apiData.description.length > 50) {
        parts.push(`\nDescription:\n${apiData.description.slice(0, 3000)}`);
      }
      if (apiData.tags && apiData.tags.length > 0) {
        parts.push(`\nTags: ${apiData.tags.slice(0, 20).join(', ')}`);
      }
      transcript = parts.join('\n');
      usedStrategy = 'youtube-data-api';
    }
  }

  // Strategy 3: External proxy (kept for backward compat with the previous deploy)
  if (!usedStrategy && YT_PROXY_URL) {
    try {
      const proxyRes = await fetch(`${YT_PROXY_URL}/transcript?id=${videoId}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData.transcript && proxyData.transcript.length >= 50) {
          transcript = proxyData.transcript;
          usedStrategy = 'proxy';
          if (!videoMeta) {
            // Get metadata from proxy or fallback
            videoMeta = await fetchVideoMetadata(videoId);
          }
        }
      }
    } catch (err) {
      console.error('Proxy fetch failed:', err.message);
    }
  }

  // Strategy 4: Direct youtube-transcript npm (may fail on Render's IP)
  if (!usedStrategy) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
      if (transcript && transcript.length >= 50) {
        usedStrategy = 'youtube-transcript';
        if (!videoMeta) {
          videoMeta = await fetchVideoMetadata(videoId);
        }
      }
    } catch (err) {
      console.error('youtube-transcript failed:', err.message);
    }
  }

  // Strategy 5: Direct timedtext fetch
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
            if (!videoMeta) {
              videoMeta = await fetchVideoMetadata(videoId);
            }
          }
        }
      }
    } catch (err) {
      console.error('timedtext failed:', err.message);
    }
  }

  // Strategy 6: Final fallback — generic template based on whatever metadata we have
  if (!usedStrategy) {
    if (!videoMeta) {
      videoMeta = {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: `YouTube video ${videoId}`,
        author: 'Unknown channel',
      };
    }
    const title = videoMeta.title;
    const author = videoMeta.author;
    transcript = `Video titled "${title}" by ${author}. ` +
      `Title suggests the video is about: ${title.replace(/[^\w\s]/g, ' ')}. ` +
      `(Could not fetch full transcript or description — generate a thread that ` +
      `introduces the topic and the creator, with hooks that would make someone ` +
      `click through to watch.)`;
    usedStrategy = 'metadata-fallback';
  }

  return {
    transcript,
    videoMeta,
    transcriptStrategy: usedStrategy,
  };
}
