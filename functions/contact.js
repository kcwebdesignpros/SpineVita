/**
 * Cloudflare Pages Function -> POST /contact
 *
 * The rest of the site is prerendered static HTML, but the contact form needs a
 * server to accept the submission. This Function intercepts POST /contact,
 * validates the payload, optionally forwards it to a webhook, then redirects
 * back to /contact?submitted=1 where the page shows its thank-you state.
 *
 * Non-POST requests fall through to the static contact page.
 *
 * Optional environment variable:
 *   CONTACT_WEBHOOK  - URL that receives the submission as JSON
 *                      (e.g. a Zapier/Make/n8n hook, or your own API).
 *                      If unset, submissions are logged to the Pages
 *                      deployment log (visible via `wrangler pages deployment tail`).
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Let GET (and anything else) hit the prerendered static asset.
  if (request.method !== 'POST') {
    return context.next();
  }

  const url = new URL(request.url);
  const redirectWith = (search) => {
    const target = new URL('/contact', url.origin);
    target.search = search;
    return Response.redirect(target.toString(), 303);
  };

  let ok = true;

  try {
    const form = await request.formData();
    const submission = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      service: String(form.get('service') || '').trim(),
      message: String(form.get('message') || '').trim(),
      submittedAt: new Date().toISOString(),
      source: url.hostname
    };

    // Minimal server-side validation
    if (!submission.name || !submission.email || !submission.message) {
      ok = false;
    } else if (env.CONTACT_WEBHOOK) {
      const response = await fetch(env.CONTACT_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(submission)
      });
      ok = response.ok;
    } else {
      console.log('Contact submission (set CONTACT_WEBHOOK to deliver):', JSON.stringify(submission));
    }
  } catch (error) {
    console.error('Contact form error:', error && error.message);
    ok = false;
  }

  return redirectWith(ok ? '?submitted=1' : '?error=1');
}
