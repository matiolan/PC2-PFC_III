import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";

const validKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";

describe("parsePublicEnv", () => {
  it("acepta URL y anon key válidas", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
    });
    expect(env?.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
  });

  it("usa la publishable key si no hay anon key", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: validKey,
    });
    expect(env?.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(validKey);
  });

  it("rechaza configuraciones incompletas o inválidas", () => {
    expect(parsePublicEnv({})).toBeNull();
    expect(
      parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "no-es-url", NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey }),
    ).toBeNull();
  });
});
