import type { APIRoute } from 'astro';

export const prerender = false;

const CRM_ENDPOINT = import.meta.env.CRM_ENDPOINT || 'https://skyguru.ai/api/v1/public/leads';
const CRM_FORM_NAME = import.meta.env.CRM_FORM_NAME || 'Брокер за 1 ден';

/**
 * Receives the "Запази място" form and forwards it to SkyGuru CRM
 * (same public leads endpoint the other Home2U campaigns use).
 *
 * CRM schema: name, phone (required), email, form,
 * utm_source/medium/campaign/term/content, gclid, fbclid.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || !phone || !email) {
    return json({ ok: false, error: 'Missing required fields' }, 422);
  }

  // UTM/click-id passthrough — attribution fields are sent flat by the form,
  // with a fallback parse of the page URL the form was submitted on.
  const utm: Record<string, string> = {};
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  for (const key of UTM_KEYS) {
    if (body[key]) utm[key] = body[key];
  }
  try {
    const pageUrl = new URL(body.page || '');
    for (const key of UTM_KEYS) {
      const value = pageUrl.searchParams.get(key);
      if (value && !utm[key]) utm[key] = value;
    }
  } catch {
    /* no page URL — skip UTM passthrough */
  }

  const crmResponse = await fetch(CRM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name,
      phone,
      email,
      form: CRM_FORM_NAME,
      ...(message ? { message } : {}),
      ...utm,
    }),
  });

  if (!crmResponse.ok) {
    const detail = await crmResponse.text().catch(() => '');
    console.error('CRM lead failed:', crmResponse.status, detail);
    return json({ ok: false, error: 'CRM rejected the lead' }, 502);
  }

  return json({ ok: true });
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
