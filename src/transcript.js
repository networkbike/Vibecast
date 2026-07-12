// YouTube transcript fetcher
// Tries captions first (fast, free), falls back to a manual approach
// if you have youtube-transcript installed.
//
// For a real production service you'd add Whisper fallback for videos
// without captions. For the hackathon, captions-only is fine — most
// viral videos have them.

import { YoutubeTranscript } from 'youtube-transcript';

export async function fetchTranscript(url) {
  // Extract video ID from various YouTube URL formats
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract YouTube video ID from URL');
  }

  // Minimal video metadata. For a real app, call the YouTube Data API.
  // For the hackathon, the transcript + LLM's knowledge of context is enough.
  const videoMeta = {
    id: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: `YouTube video ${videoId}`,
    author: 'Unknown channel',
  };

  let transcript = '';
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    transcript = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
  } catch (err) {
    throw new Error(
      `Could not fetch transcript for ${videoId}. The video may have captions disabled, be age-restricted, or be private. Try a different URL. (${err.message?.slice(0, 100)})`
    );
  }

  if (!transcript || transcript.length < 50) {
    throw new Error('Transcript is empty or too short to summarize. Try a longer video.');
  }

  return { transcript, videoMeta };
}

function extractVideoId(url) {
  // youtu.be/VIDEOID
  let m = url.match(/youtu\.be\/([\w-]{11})/);
  if (m) return m[1];

  // youtube.com/watch?v=VIDEOID
  m = url.match(/[?&]v=([\w-]{11})/);
  if (m) return m[1];

  // youtube.com/shorts/VIDEOID
  m = url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (m) return m[1];

  return null;
}
