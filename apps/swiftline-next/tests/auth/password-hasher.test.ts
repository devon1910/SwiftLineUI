import { pbkdf2Sync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyAspNetIdentityPassword } from "../../src/lib/auth/password-hasher";

function identityV3Fixture(password: string): string {
  const salt = Buffer.from("00112233445566778899aabbccddeeff", "hex");
  const iterations = 10_000;
  const subkey = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const header = Buffer.alloc(13);
  header[0] = 1;
  header.writeUInt32BE(1, 1);
  header.writeUInt32BE(iterations, 5);
  header.writeUInt32BE(salt.length, 9);
  return Buffer.concat([header, salt, subkey]).toString("base64");
}

describe("ASP.NET Identity V3 password verification", () => {
  it("accepts a compatible PBKDF2-SHA256 hash", async () => {
    expect(await verifyAspNetIdentityPassword(identityV3Fixture("Correct#Password9"), "Correct#Password9")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    expect(await verifyAspNetIdentityPassword(identityV3Fixture("Correct#Password9"), "wrong")).toBe(false);
  });

  it.each(["", "not-base64", Buffer.from([0]).toString("base64")])("fails closed for malformed hash %j", async (hash) => {
    expect(await verifyAspNetIdentityPassword(hash, "password")).toBe(false);
  });
});
