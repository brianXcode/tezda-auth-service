import { AttributeValue } from "@aws-sdk/client-dynamodb";
import jwt, { SignOptions } from "jsonwebtoken";
import { ErrorType } from "../shared/errorTypes";
import { CustomApiError } from "../shared/customError";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const generateJwtToken = (user: Record<string, AttributeValue>): string => {
  if (!user.email?.S || !user.userId?.S) {
    throw new CustomApiError(
      "User email and userId are required",
      400,
      ErrorType.BadRequest
    );
  }

  const payload = {
    email: user.email?.S,
    id: user.userId?.S,
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export { generateJwtToken };
