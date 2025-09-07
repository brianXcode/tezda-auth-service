export const ErrorType = {
  BadRequest: "BadRequest",
  Unauthorized: "Unauthorized",
  Forbidden: "Forbidden",
  NotFound: "NotFound",
  Conflict: "Conflict",
  InternalServerError: "InternalServerError",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];
