import { describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "../../src/modules/auth/turnstile";

describe("Turnstile verification", () => {
  it("accepts a successful response for the expected hostname", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ success: true, hostname: "www.theswiftline.com" }));
    await expect(verifyTurnstile({ secret: "secret", token: "token", expectedHostname: "www.theswiftline.com", fetchImpl })).resolves.toBe(true);
  });

  it("fails closed for provider errors and hostname mismatch", async () => {
    const mismatch = vi.fn(async () => Response.json({ success: true, hostname: "evil.example" }));
    await expect(verifyTurnstile({ secret: "secret", token: "token", expectedHostname: "www.theswiftline.com", fetchImpl: mismatch })).resolves.toBe(false);
    const failed = vi.fn(async () => { throw new Error("network"); });
    await expect(verifyTurnstile({ secret: "secret", token: "token", fetchImpl: failed })).resolves.toBe(false);
  });
});
