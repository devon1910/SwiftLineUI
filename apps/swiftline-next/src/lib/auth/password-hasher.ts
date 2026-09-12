import { pbkdf2 as pbkdf2Callback, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2 = promisify(pbkdf2Callback);
const identityV3Marker = 0x01;
const prfSha256 = 1;
const minimumSaltSize = 16;
const minimumSubkeySize = 16;
const maximumIterations = 1_000_000;
const defaultIterations = 100_000;

function readUint32BE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32BE(offset);
}

/** Creates ASP.NET Core Identity v3-compatible PBKDF2-SHA256 hashes. */
export async function hashAspNetIdentityPassword(password: string): Promise<string> {
  if (!password || password.length > 4096) throw new Error("Invalid password.");
  const salt = randomBytes(16);
  const subkey = await pbkdf2(password, salt, defaultIterations, 32, "sha256");
  const payload = Buffer.alloc(13 + salt.length + subkey.length);
  payload[0] = identityV3Marker;
  payload.writeUInt32BE(prfSha256, 1);
  payload.writeUInt32BE(defaultIterations, 5);
  payload.writeUInt32BE(salt.length, 9);
  salt.copy(payload, 13);
  subkey.copy(payload, 13 + salt.length);
  return payload.toString("base64");
}

export async function verifyAspNetIdentityPassword(
  hashedPassword: string | null | undefined,
  suppliedPassword: string,
): Promise<boolean> {
  if (!hashedPassword || !suppliedPassword || suppliedPassword.length > 4096) return false;

  try {
    const payload = Buffer.from(hashedPassword, "base64");
    if (payload.length < 14 || payload[0] !== identityV3Marker) return false;

    const prf = readUint32BE(payload, 1);
    const iterations = readUint32BE(payload, 5);
    const saltLength = readUint32BE(payload, 9);
    if (prf !== prfSha256 || iterations < 1 || iterations > maximumIterations) return false;
    if (saltLength < minimumSaltSize || 13 + saltLength + minimumSubkeySize > payload.length) return false;

    const salt = payload.subarray(13, 13 + saltLength);
    const expected = payload.subarray(13 + saltLength);
    const actual = await pbkdf2(suppliedPassword, salt, iterations, expected.length, "sha256");
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
