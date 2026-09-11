import { NextResponse } from "next/server";

export type Result<T> = {
  data: T | null;
  message: string;
  status: boolean;
};

export type ResultResponse<T> = {
  body: Result<T>;
  statusCode: number;
};

export function resultOk<T>(data: T, message = "Operation completed successfully"): ResultResponse<T> {
  return {
    body: { data, message, status: true },
    statusCode: 200,
  };
}

export function resultCreated<T>(data: T, message = "Operation completed successfully"): ResultResponse<T> {
  return {
    body: { data, message, status: true },
    statusCode: 201,
  };
}

export function resultFailure<T>(
  message = "Bad Request",
  statusCode = 400,
  data: T | null = null,
): ResultResponse<T> {
  return {
    body: { data, message, status: false },
    statusCode,
  };
}

export function resultResponse<T>(result: ResultResponse<T>): NextResponse<Result<T>> {
  return NextResponse.json(result.body, { status: result.statusCode });
}
