import { describe, expect, it } from "vitest";

import { GET } from "../../src/app/api/health/route";
import { GET as GET_READY } from "../../src/app/api/health/ready/route";

describe("health endpoint", () => {
  it("returns liveness without requiring database credentials", async () => {
    const response = await GET(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { service: "swiftline-next", status: "ok" },
      status: true,
    });
  });

  it("returns a safe 503 when readiness configuration is missing", async () => {
    const response = await GET(new Request("http://localhost/api/health?ready=true"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      data: null,
      message: "Service configuration is not ready",
      status: false,
    });
  });

  it("exposes readiness at the deployment probe path", async () => {
    const response = await GET_READY();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      data: null,
      message: "Service configuration is not ready",
      status: false,
    });
  });
});
