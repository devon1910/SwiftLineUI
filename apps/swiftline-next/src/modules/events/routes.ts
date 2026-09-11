import { NextResponse } from "next/server";
import { resultFailure, resultOk, resultResponse } from "@/lib/http";
import type { ResultResponse } from "@/lib/http";
import { getOptionalVerifiedIdentity } from "./auth";
import { eventRepository } from "./repository";
import { createEventsService } from "./service";
import { parsePositiveBigInt, parseSearchEventsQuery } from "./validation";

const eventsService = createEventsService(eventRepository);
const SUCCESS_MESSAGE = "Operation completed successfully";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

function response<T>(result: ResultResponse<T>): NextResponse {
  const response = resultResponse(result);
  Object.entries(NO_STORE_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

function ok<T>(data: T): NextResponse {
  return response(resultOk(data, SUCCESS_MESSAGE));
}

function failure<T>(message: string, status: number): NextResponse {
  return response(resultFailure<T>(message, status));
}

function genericServerFailure<T>(): NextResponse {
  return failure<T>("An error occurred while processing the request", 500);
}

function eventIdFromUrl(request: Request): unknown {
  const url = new URL(request.url);
  return url.searchParams.get("eventId") ?? url.searchParams.get("EventId");
}

export async function handleGetEvent(request: Request, pathEventId?: unknown): Promise<NextResponse> {
  const parsedId = parsePositiveBigInt(pathEventId ?? eventIdFromUrl(request));
  if (!parsedId.ok) return failure<null>(parsedId.message, 400);

  const identity = await getOptionalVerifiedIdentity(request);
  try {
    const event = await eventsService.getPublicEvent(parsedId.value, identity?.id ?? null);
    return event ? ok(event) : failure<null>("Event not found", 404);
  } catch {
    return genericServerFailure<null>();
  }
}

export async function handleSearchEvents(request: Request): Promise<NextResponse> {
  const parsedQuery = parseSearchEventsQuery(new URL(request.url));
  if (!parsedQuery.ok) return failure<null>(parsedQuery.message, 400);

  const identity = await getOptionalVerifiedIdentity(request);
  try {
    const data = await eventsService.searchPublicEvents(parsedQuery.value, identity?.id ?? null);
    return ok(data);
  } catch {
    return genericServerFailure<null>();
  }
}
