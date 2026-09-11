import { resultFailure, resultOk, resultResponse } from "@/lib/http";
import { checkDatabase } from "@/lib/db";
import { EnvironmentError, getEnv } from "@/lib/config";

export type HealthData = {
  service: "swiftline-next";
  status: "ok" | "ready" | "degraded";
  timestamp: string;
  database?: "up" | "down";
};

export function getLivenessResponse() {
  return resultResponse(resultOk<HealthData>({
    service: "swiftline-next",
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
}

export async function getReadinessResponse() {
  const timestamp = new Date().toISOString();

  try {
    getEnv();
  } catch (error) {
    if (error instanceof EnvironmentError) {
      return resultResponse(resultFailure<HealthData>("Service configuration is not ready", 503));
    }

    return resultResponse(resultFailure<HealthData>("Service configuration is not ready", 503));
  }

  const database = await checkDatabase();

  if (database.status === "down") {
    return resultResponse(resultFailure<HealthData>("Database is not ready", 503, {
      service: "swiftline-next",
      status: "degraded",
      timestamp,
      database: "down",
    }));
  }

  return resultResponse(resultOk<HealthData>({
    service: "swiftline-next",
    status: "ready",
    timestamp,
    database: "up",
  }, "Service is ready"));
}
