import { ErrorType } from "./errorTypes";
import { v4 as uuidv4 } from "uuid";
import { CustomApiError } from "./customError";

export const ApplicationError = (error: any) => {
  const errorId = uuidv4();
  const timestamp = new Date().toISOString();

  if (error instanceof CustomApiError) {
    return {
      statusCode: error.statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: errorId,
        timestamp,
        message: error.message,
        errorType: error.errorType,
      }),
    };
  }

  switch (error.name) {
    case "ConditionalCheckFailedException":
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: errorId,
          timestamp,
          message: "User with this email already exists",
          errorType: ErrorType.Conflict,
        }),
      };
    case "AccessDeniedException":
      return {
        statusCode: 403,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: errorId,
          timestamp,
          message: "Access Denied",
          errorType: ErrorType.Forbidden,
        }),
      };
  }

  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: errorId,
      timestamp,
      message: "An internal server error occurred.",
      errorType: ErrorType.InternalServerError,
    }),
  };
};
