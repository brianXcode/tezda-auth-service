import { AttributeValue } from "@aws-sdk/client-dynamodb";
import jwt, { SignOptions } from "jsonwebtoken";
import { ErrorType } from "../shared/errorTypes";
import { CustomApiError } from "../shared/customError";
import { logger } from "../logger/logger";
import { getSecret } from "../secret-manager/awsSecretManager";

const JWT_SECRET_NAME = process.env.JWT_SECRET_NAME || 'auth-service/jwt-secret-v2';
const JWT_SECRET_ENV = 'JWT_SECRET';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const generateJwtToken = async (user: Record<string, AttributeValue>): Promise<string> => {
  try {
    if (!user.email?.S || !user.userId?.S) {
      throw new CustomApiError(
        "User email and userId are required",
        400,
        ErrorType.BadRequest
      );
    }

    const payload = {
      email: user.email.S,
      id: user.userId.S,
    };

    const { secretValue: jwtSecret, source } = await getSecret(JWT_SECRET_NAME, JWT_SECRET_ENV);
    logger.info(`Using JWT secret from ${source}`);

    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };

    return jwt.sign(payload, jwtSecret, options);
  } catch (error) {
    logger.error("Error generating JWT token:", { error });
    if (error instanceof CustomApiError) {
      throw error;
    }
    throw new CustomApiError(
      "Failed to generate authentication token",
      500,
      ErrorType.InternalServerError
    );
  }
};

export { generateJwtToken };
