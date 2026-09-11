import { describe, expect, it } from "vitest";
import { handleGetEvent, handleSearchEvents } from "../../src/modules/events/routes";

async function responseBody(response: Response) {
  return response.json() as Promise<{
    data: unknown;
    message: string;
    status: boolean;
  }>;
}

describe("event route validation contract", () => {
  it.each([
    ["missing eventId", "https://swiftline.test/api/v1/Event/GetEvent"],
    ["malformed eventId", "https://swiftline.test/api/v1/Event/GetEvent?eventId=abc"],
  ])("returns 400 for %s", async (_caseName, url) => {
    const response = await handleGetEvent(new Request(url));
    const body = await responseBody(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ data: null, status: false });
  });

  it.each([
    ["Page=0&Size=20", "https://swiftline.test/api/v1/Event/SearchEvents?Page=0&Size=20"],
    ["Page=1&Size=101", "https://swiftline.test/api/v1/Event/SearchEvents?Page=1&Size=101"],
  ])("returns 400 for invalid pagination (%s)", async (_caseName, url) => {
    const response = await handleSearchEvents(new Request(url));
    const body = await responseBody(response);

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ data: null, status: false });
  });
});
