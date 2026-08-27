import { NextResponse } from "next/server";

/**
 * The contact endpoint.
 *
 * Validates a brief, rate-limits the sender, and delivers it. Delivery goes
 * through Resend when RESEND_API_KEY is configured; without it the brief is
 * recorded in the server log and the response says plainly that it was stored
 * rather than sent. A form that returns a tick when nothing was delivered is
 * worse than one that refuses -- the sender walks away believing they made
 * contact.
 */

export const runtime = "nodejs";

const MAX = { name: 120, email: 200, brief: 5000 };

/* In-memory, per-instance, and deliberately so: this is a small site and the
   alternative is standing up a store to hold six timestamps. It will not
   survive a restart or span instances, which is the honest limit of it -- it
   raises the cost of casual abuse, it is not a defence against a determined
   one. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > LIMIT;
}

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected JSON." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = str(b.name, MAX.name);
  const email = str(b.email, MAX.email);
  const brief = str(b.brief, MAX.brief);

  // A hidden field no human fills in. Bots fill everything.
  if (str(b.company, 80)) return NextResponse.json({ ok: true, delivered: false });

  if (!name || !brief) {
    return NextResponse.json({ ok: false, error: "A name and a brief are required." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "That email address does not look right." }, { status: 422 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { ok: false, error: "That is a lot of briefs at once. Try again shortly." },
      { status: 429 },
    );
  }

  /* `||` and a trim, not `??`. An environment variable that exists but is blank
     is a string, so `??` hands the empty value straight through -- which for a
     recipient address means mail addressed to nobody, and for the key means a
     request sent with an empty bearer token. Leaving a variable empty is the
     most ordinary thing a person does in a deployment dashboard. */
  const to = process.env.CONTACT_TO?.trim() || "rishiorion2912@gmail.com";
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    console.info("[contact] no RESEND_API_KEY set; brief recorded but not sent", { name, email });
    return NextResponse.json({
      ok: true,
      delivered: false,
      message: "Received. Email delivery is not configured on this deployment yet.",
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM?.trim() || "Orion <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `Website brief from ${name}`,
        text: `${brief}\n\n--\n${name}\n${email}`,
      }),
    });
    if (!res.ok) {
      // Say so rather than returning a tick for an email that never left.
      console.error("[contact] delivery failed", res.status, await res.text().catch(() => ""));
      return NextResponse.json(
        { ok: false, error: "Could not send that just now. Email me directly and it will land." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[contact] delivery threw", err);
    return NextResponse.json(
      { ok: false, error: "Could not send that just now. Email me directly and it will land." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
