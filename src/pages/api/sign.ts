import type { APIRoute } from 'astro';
import { createHash, timingSafeEqual } from 'node:crypto';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const safeEqual = (a: string, b: string) => {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
};

// Returns a signed Cloudinary upload payload for one strip tag.
// The browser then uploads the (already webp) file straight to Cloudinary,
// which avoids Vercel's ~4.5MB request body limit.
export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const password = import.meta.env.UPLOAD_PASSWORD;
  if (!apiKey || !apiSecret || !cloudName || !password) {
    return json({ error: 'Server is missing Cloudinary / UPLOAD_PASSWORD env vars' }, 500);
  }

  let body: { strip?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (typeof body.password !== 'string' || !safeEqual(body.password, password)) {
    return json({ error: 'Wrong password' }, 401);
  }
  const strip = Number(body.strip);
  if (!Number.isInteger(strip) || strip < 1 || strip > 6) {
    return json({ error: 'strip must be 1-6' }, 400);
  }

  const tags = `strip-${strip}`;
  const timestamp = Math.floor(Date.now() / 1000);
  // Params must be signed alphabetically as k=v&k=v, then the secret appended.
  const signature = createHash('sha1')
    .update(`format=webp&tags=${tags}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  return json({ cloudName, apiKey, tags, timestamp, signature });
};
