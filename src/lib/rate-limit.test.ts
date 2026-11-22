import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimit());
  it("bloquea al superar el límite dentro de la ventana", () => {
    const t = 1_000_000;
    expect(rateLimit("ip:login", 2, 60_000, t).ok).toBe(true);
    expect(rateLimit("ip:login", 2, 60_000, t + 1).ok).toBe(true);
    const third = rateLimit("ip:login", 2, 60_000, t + 2);
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.retryAfterSeconds).toBe(60);
  });
  it("vuelve a permitir cuando pasa la ventana", () => {
    const t = 2_000_000;
    rateLimit("k", 1, 1000, t);
    expect(rateLimit("k", 1, 1000, t + 1500).ok).toBe(true);
  });
});
