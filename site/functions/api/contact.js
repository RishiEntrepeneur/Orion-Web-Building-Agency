/**
 * POST /api/contact
 *
 * A Cloudflare Pages Function: one file, no dependencies, no build step. It is
 * picked up automatically from functions/ and deployed alongside the static
 * page, so the site gains a real server without gaining a toolchain that can
 * fail between writing a page and having it online.
 *
 * Configure in the Pages dashboard under Settings -> Environment variables:
 *   RESEND_API_KEY  required for delivery
 *   CONTACT_TO      where briefs land
 *   CONTACT_FROM    verified sender, once a domain is verified in Resend
 */

const MAX = { name: 120, email: 200, brief: 5000 };

/** Trimmed string, capped. Anything that is not a string becomes empty. */
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Expected JSON." }, 400);
  }

  const name = str(body.name, MAX.name);
  const email = str(body.email, MAX.email);
  const brief = str(body.brief, MAX.brief);

  // A field no person can see. Bots fill everything in, so a value here means
  // a bot -- accepted quietly rather than refused, because telling a bot it was
  // detected only teaches whoever wrote it to try something else.
  if (str(body.company, 80)) return json({ ok: true, delivered: false });

  if (!name || !brief) {
    return json({ ok: false, error: "A name and a brief are required." }, 422);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "That email address does not look right." }, 422);
  }

  /* `||` with a trim, not `??`. A variable that exists but is blank is a
     string, so `??` would hand the empty value straight through -- which for a
     recipient means mail addressed to nobody and for the key means a request
     sent with an empty bearer token. Leaving a variable empty is the most
     ordinary thing a person does in a hosting dashboard. */
  const to = (env.CONTACT_TO || "").trim() || "rishiorion2912@gmail.com";
  const key = (env.RESEND_API_KEY || "").trim();
  const from = (env.CONTACT_FROM || "").trim() || "Orion <onboarding@resend.dev>";

  if (!key) {
    // Never report a send that did not happen. The page turns this into an
    // instruction to email directly rather than a tick that means nothing.
    return json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Website brief from ${name}`,
        text: `${brief}\n\n--\n${name}\n${email}`,
      }),
    });
    if (!res.ok) {
      return json(
        { ok: false, error: "Could not send that just now. Please email me directly." },
        502,
      );
    }
  } catch {
    return json(
      { ok: false, error: "Could not send that just now. Please email me directly." },
      502,
    );
  }

  return json({ ok: true, delivered: true });
}

/** Anything other than POST. */
export const onRequest = () =>
  new Response("Method not allowed", { status: 405, headers: { allow: "POST" } });
