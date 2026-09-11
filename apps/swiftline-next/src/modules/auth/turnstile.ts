import { z } from "zod";

const turnstileResponseSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  action: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export type TurnstileOptions = {
  secret: string;
  token: string;
  remoteIp?: string | null;
  expectedHostname?: string;
  fetchImpl?: typeof fetch;
};

export async function verifyTurnstile(options: TurnstileOptions): Promise<boolean> {
  if (!options.secret || !options.token || options.token.length > 4096) return false;
  const body = new URLSearchParams({ secret: options.secret, response: options.token });
  if (options.remoteIp) body.set("remoteip", options.remoteIp);

  try {
    const response = await (options.fetchImpl ?? fetch)(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body, signal: AbortSignal.timeout(8_000) },
    );
    if (!response.ok) return false;
    const parsed = turnstileResponseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.success) return false;
    return !options.expectedHostname || parsed.data.hostname === options.expectedHostname;
  } catch {
    return false;
  }
}
