import { errorMessages } from "@/lib/constants/errorMessage";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/AppError";

export function errorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Invalid input", errors: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: errorMessages.SERVER_ERROR },
    { status: 500 },
  );
}
