// VibeCast thread generator
// Given a YouTube URL + voice, returns a 5-tweet thread + 90s Shorts script.

import { fetchTranscript } from './transcript.js';
import { getVoicePrompt } from './voices.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Hard fallback when OPENAI_API_KEY is missing — uses a deterministic template.
// Lets you ship and demo even before keys are wired up.
function fallbackThread({ url, voice, transcript, videoMeta, transcriptStrategy }) {
  const title = videoMeta?.title || 'this video';
  const author = videoMeta?.author && videoMeta.author !== 'Unknown channel' ? videoMeta.author : null;
  const hasRealTranscript = transcriptStrategy === 'youtube-transcript' || transcriptStrategy === 'timedtext-direct';

  let tweets;
  if (hasRealTranscript) {
    tweets = [
      `1/ Just watched "${title}" — here's what stuck with me 🧵`,
      `2/ The single biggest idea: the source content has a clear point of view that the summary can preserve.`,
      `3/ Most people miss this because they're skimming. The video's value is in the specifics.`,
      `4/ If you're building anything around this topic, the takeaway is: don't paraphrase — preserve the original framing.`,
      `5/ Full breakdown + the part everyone skipped 👇\n\n#VibeCast`,
    ];
  } else {
    // Metadata-fallback: we couldn't fetch the transcript (rate limit) so
    // generate a "topic intro" thread that hooks people into watching.
    const looksGeneric = !title || title.startsWith('YouTube video');
    const authorTag = author ? ` by ${author}` : '';
    const header = looksGeneric
      ? `1/ Found a video worth your time 🧵`
      : `1/ "${title}"${authorTag} is one of those videos people will be quoting all week 🧵`;
    tweets = [
      header,
      `2/ If you haven't seen it yet, here's why it's worth your time ⤵️`,
      `3/ The hook is sharper than 90% of content in this space — it earns the watch in the first 30 seconds.`,
      `4/ The middle is where the real value is. Most threads will skip it. Watch it yourself.`,
      `5/ Full thread + a 90s Shorts script coming. For now: go watch the video 👇\n\n#VibeCast`,
    ];
  }

  const shorts = `[HOOK — first 3 seconds]
"Three things from ${title} you'll want to remember."

[BEAT 1 — 0:00–0:30]
Walk through the headline idea. Cut on the action.

[BEAT 2 — 0:30–0:60]
Show the surprising moment. Use a close-up or zoom if possible.

[BEAT 3 — 0:60–0:90]
Land the takeaway. End on a still frame + text overlay.

CTA: "Full thread on @yourhandle"`;

  return { tweets, shorts_script: shorts, voice, source: 'fallback' };
}

// OpenAI path
async function callOpenAI({ systemPrompt, userPrompt }) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set — cannot call LLM. Using fallback.');
  }

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');

  return JSON.parse(content);
}

export async function generateThread({ url, voice = 'punchy-founder' }) {
  // 1. Fetch the YouTube transcript + minimal video metadata
  const { transcript, videoMeta, transcriptStrategy } = await fetchTranscript(url);

  // 2. If no LLM key, use fallback (lets you ship a demo immediately)
  if (!OPENAI_API_KEY) {
    return fallbackThread({ url, voice, transcript, videoMeta, transcriptStrategy });
  }

  // 3. Build the prompt
  const systemPrompt = getVoicePrompt(voice);

  const userPrompt = `You are generating a 5-tweet X thread + a 90-second YouTube Shorts script from a YouTube video transcript.

VIDEO TITLE: ${videoMeta?.title || 'Untitled'}
VIDEO CHANNEL: ${videoMeta?.author || 'Unknown'}
TRANSCRIPT (may be truncated):
"""
${transcript.slice(0, 6000)}
"""

OUTPUT FORMAT (strict JSON, no markdown, no backticks):
{
  "tweets": [
    "tweet 1 text — 280 chars max",
    "tweet 2 text",
    "tweet 3 text",
    "tweet 4 text",
    "tweet 5 text — has a hook/teaser that makes people want to read the full thread"
  ],
  "shorts_script": "A 90-second YouTube Shorts script. Open with a 3-second hook, then 3 beats (~25s each), end with a clear CTA. Use [BRACKETS] for visual direction. Total: 90 seconds when read at natural pace."
}

CONSTRAINTS:
- 5 tweets, each under 280 characters
- Use the voice's style rigorously
- Reference the actual content of the transcript — don't invent claims
- If the transcript is thin, use the video title + channel context to make a reasonable summary
- No "Thread:" or "1/" prefixes unless the voice's style demands them (punchy-founder omits them)
- Shorts script must be production-ready, not a summary`;

  // 4. Call the LLM
  const result = await callOpenAI({ systemPrompt, userPrompt });

  // 5. Validate
  if (!result.tweets || !Array.isArray(result.tweets) || result.tweets.length !== 5) {
    throw new Error('LLM did not return 5 tweets');
  }
  if (!result.shorts_script || typeof result.shorts_script !== 'string') {
    throw new Error('LLM did not return a shorts_script');
  }

  return {
    tweets: result.tweets,
    shorts_script: result.shorts_script,
    voice,
    video: videoMeta,
    source: 'openai',
  };
}
