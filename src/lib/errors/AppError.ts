export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(message = "Email already registered") {
    super(message, 409, "EMAIL_EXISTS");
    this.name = "EmailAlreadyExistsError";
  }
}
