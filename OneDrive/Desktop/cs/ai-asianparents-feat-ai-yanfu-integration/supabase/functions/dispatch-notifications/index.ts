import { serve } from 'std/http/server.ts';
import { RequestSchema } from './lib/schema.ts';
import { processQueue } from './lib/processor.ts';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      ...init.headers
    },
    status: init.status ?? 200
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'content-type'
      }
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const raw = await req.json();
    const payload = RequestSchema.parse(raw);
    const result = await processQueue(payload.limit ?? 50);
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error) {
      return jsonResponse({ error: error.message }, { status: 400 });
    }
    return jsonResponse({ error: 'Unknown error' }, { status: 500 });
  }
});
