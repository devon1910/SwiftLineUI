import { describe, expect, it } from "vitest";

import { resultFailure, resultOk, resultResponse } from "../../src/lib/http";

describe("Result envelope", () => {
  it("matches the SwiftLine API success shape", async () => {
    const response = resultResponse(resultOk({ service: "swiftline-next" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { service: "swiftline-next" },
      message: "Operation completed successfully",
      status: true,
    });
  });

  it("keeps failures in the same envelope", async () => {
    const response = resultResponse(resultFailure("Database is not ready", 503));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      data: null,
      message: "Database is not ready",
      status: false,
    });
  });
});
