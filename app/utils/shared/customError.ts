import { ErrorType } from "./errorTypes";

export class CustomApiError extends Error {
  public readonly statusCode: number;
  public readonly errorType: ErrorType;
  public readonly originalError?: any;

  constructor(
    message: string,
    statusCode: number,
    errorType: ErrorType,
    originalError?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}
