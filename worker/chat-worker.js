/**
 * Muchi Medicine Store chat proxy — Cloudflare Worker.
 *
 * Paste this into the Cloudflare dashboard's Worker editor (Workers & Pages →
 * your worker → Edit code) and deploy. It reads the Anthropic API key from
 * the ANTHROPIC_API_KEY secret you already set on the worker, so the key
 * never reaches the browser. The site's script.js calls this worker instead
 * of Anthropic directly.
 *
 * After deploying, the worker's URL is shown at the top of its dashboard
 * page (or under Settings → Domains & Routes if you haven't set one):
 *   https://<worker-name>.<your-subdomain>.workers.dev
 * Set CHAT_CONFIG.apiEndpoint in script.js to that exact URL.
 *
 * Optional: set an ALLOWED_ORIGIN environment variable/secret to your site's
 * real origin (e.g. "https://muchimedicinestore.com") to restrict which
 * sites may call this worker. Without it, any site can call the endpoint.
 *
 * (No functional change — another no-op edit to prompt a fresh build attempt.)
 */

const MODEL = 'claude-sonnet-5';
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 10;

const SYSTEM_PROMPT =
  "You are the friendly chat assistant for Muchi Medicine Store, a patent " +
  "medicine store in Iperin, Ogun State, Nigeria, serving the community for " +
  "over 2 years. Speak in a warm, approachable tone, and keep replies short. " +
  "Store hours: Mon-Fri 7am-7pm, Sat 8am-6pm, Sun 8am-3pm. Address: Plot 34, " +
  "Area 5, Opic Estate, Small Road, Ogun State, Nigeria. On the shelf: " +
  "multivitamins, analgesics (pain relief), cough medicine, and women's " +
  "health/personal care items. You cannot diagnose conditions or prescribe " +
  "treatment — for anything beyond general product questions, warmly point " +
  "the customer to visit or call the store and speak with staff.";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders);
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return jsonResponse({ error: 'Message is required' }, 400, corsHeaders);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: 'Message is too long' }, 400, corsHeaders);
    }

    const history = Array.isArray(body.history) ? body.history : [];
    const messages = history
      .filter(function (entry) {
        return entry
          && (entry.role === 'user' || entry.role === 'assistant')
          && typeof entry.content === 'string';
      })
      .slice(-MAX_HISTORY_MESSAGES)
      .map(function (entry) {
        return { role: entry.role, content: entry.content };
      });
    messages.push({ role: 'user', content: message });

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'Server is not configured' }, 500, corsHeaders);
    }

    try {
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: messages,
        }),
      });

      if (!anthropicResponse.ok) {
        console.error('Anthropic API error:', anthropicResponse.status, await anthropicResponse.text());
        return jsonResponse({ error: 'Upstream API error' }, 502, corsHeaders);
      }

      const data = await anthropicResponse.json();
      const reply = (data.content || [])
        .filter(function (block) { return block.type === 'text'; })
        .map(function (block) { return block.text; })
        .join('\n')
        .trim();

      return jsonResponse(
        { reply: reply || "Sorry, I didn't catch that — could you try again?" },
        200,
        corsHeaders
      );
    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Something went wrong' }, 500, corsHeaders);
    }
  },
};

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders),
  });
}
