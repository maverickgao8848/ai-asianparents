import { serve } from 'std/http/server.ts';
import { RequestSchema, ResponseSchema } from './lib/schema.ts';
import { buildRuleDraft } from './lib/parser.ts';

const ALLOWED_METHODS = ['POST', 'OPTIONS'];

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      ...init.headers
    },
    status: init.status ?? 200
  });
}

serve(async (req) => {
  if (!ALLOWED_METHODS.includes(req.method)) {
    return jsonResponse(
      { error: 'Method not allowed' },
      { status: 405, headers: { 'Allow': ALLOWED_METHODS.join(',') } }
    );
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      }
    });
  }

  try {
    const raw = await req.json();
    const payload = RequestSchema.parse(raw);
    const result = buildRuleDraft(payload);
    return jsonResponse(ResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error) {
      return jsonResponse(
        {
          error: 'Failed to parse rule',
          details: error.message
        },
        { status: 400 }
      );
    }
    return jsonResponse({ error: 'Unknown error' }, { status: 500 });
  }
});
