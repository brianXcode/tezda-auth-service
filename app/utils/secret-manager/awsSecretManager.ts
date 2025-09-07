import {
  SecretsManagerClient,
  GetSecretValueCommand,
  SecretsManagerServiceException,
} from "@aws-sdk/client-secrets-manager";
import { logger } from "../logger/logger";
import { CustomApiError } from "../shared/customError";
import { ErrorType } from "../shared/errorTypes";

// AWS_REGION is automatically available in Lambda environment
const region = process.env.AWS_REGION || 'us-east-1';
const client = new SecretsManagerClient({ region });

interface SecretResult {
  secretValue: string;
  source: "aws" | "env";
}

/**
 * Fetches a secret from AWS Secrets Manager with fallback to environment variables
 * @param secretName - The name of the secret in AWS Secrets Manager
 * @param envVarName - The environment variable name to fall back to
 * @returns Promise<SecretResult> - The secret value and its source
 */
async function getSecret(
  secretName: string,
  envVarName: string
): Promise<SecretResult> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    if (response.SecretString) {
      logger.info(
        `Successfully retrieved secret: ${secretName} from AWS Secrets Manager`
      );
      return {
        secretValue: response.SecretString,
        source: "aws" as const,
      };
    }
  } catch (error) {
    if (error instanceof SecretsManagerServiceException) {
      if (error.name === "ResourceNotFoundException") {
        logger.warn(
          `Secret ${secretName} not found in AWS Secrets Manager, falling back to environment variables`
        );
      } else {
        logger.error(
          `Error retrieving secret ${secretName} from AWS Secrets Manager:`,
          error
        );
      }
    } else {
      logger.error(`Unexpected error retrieving secret ${secretName}:`, {
        error,
      });
    }
  }

  // Fallback to environment variable
  const envValue = process.env[envVarName];
  if (envValue) {
    logger.info(`Using ${envVarName} from environment variables`);
    return {
      secretValue: envValue,
      source: "env" as const,
    };
  }

  throw new CustomApiError(
    `Failed to retrieve secret: ${secretName}. Not found in AWS Secrets Manager or environment variable ${envVarName}`,
    500,
    ErrorType.InternalServerError
  );
}

export { getSecret, SecretResult };
