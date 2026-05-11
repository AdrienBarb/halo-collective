import { errorMessages } from "@/lib/constants/errorMessage";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/AppError";
import { BrevoError } from "@/lib/brevo/client";

export function errorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Invalid input", errors: error.issues },
      { status: 400 },
    );
  }

  // Brevo error bodies can leak email addresses, list ids, internal codes.
  // Log full context server-side; return only a sanitized 502 to clients.
  if (error instanceof BrevoError) {
    console.error("BrevoError", {
      status: error.status,
      message: error.message,
      body: error.body,
    });
    return NextResponse.json(
      { error: "Email provider request failed" },
      { status: 502 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, ...(error.code ? { code: error.code } : {}) },
      { status: error.statusCode },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: errorMessages.SERVER_ERROR },
    { status: 500 },
  );
}
