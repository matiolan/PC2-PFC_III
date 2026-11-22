/**
 * Límite de intentos en memoria por clave (IP + acción), ventana deslizante.
 * Complementa los límites de Supabase Auth y del firewall de Vercel; en un entorno
 * serverless cada instancia lleva su propio conteo, por lo que es una defensa adicional.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()) {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterMs = windowMs - (now - hits[0]);
    return { ok: false as const, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.delete(buckets.keys().next().value as string);
  return { ok: true as const, remaining: limit - hits.length };
}

export function resetRateLimit() {
  buckets.clear();
}
