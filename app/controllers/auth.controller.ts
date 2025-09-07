import {
  PutItemCommand,
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import {
  hashPassword,
  comparePassword,
} from "../utils/encryption/passwordHashing";
import { LoginDto, RegisterDto } from "../dto/dto";
import { Role } from "../enums/role";
import { logger } from "../utils/logger/logger";
import { generateJwtToken } from "../utils/jwt/jwt";
import { ErrorType } from "../utils/shared/errorTypes";
import { response } from "../utils/shared/response";
import { v4 as uuidv4 } from "uuid";
import { CustomApiError } from "../utils/shared/customError";
import { IUser } from "../interface/user.interface";

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });
const USERS_TABLE = process.env.USERS_TABLE;

const registerUser = async (dto: RegisterDto) => {
  const checkEmailParams = new QueryCommand({
    TableName: USERS_TABLE,
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": { S: dto.email },
    },
    Limit: 1,
  });

  const existingUser = await dynamo.send(checkEmailParams);
  if (existingUser.Items && existingUser.Items.length > 0) {
    logger.warn("Registration attempt with existing email", {
      email: dto.email,
    });
    throw new CustomApiError("Email already in use", 409, ErrorType.Conflict);
  }

  const userId = uuidv4();
  const hashed = await hashPassword(dto.password);

  const params = new PutItemCommand({
    TableName: USERS_TABLE,
    Item: {
      userId: { S: userId },
      email: { S: dto.email },
      password: { S: hashed },
      role: { S: dto.role || Role.USER },
      fullName: { S: dto.fullName || "" },
      createdAt: { S: new Date().toISOString() },
    },
  });

  try {
    await dynamo.send(params);
    logger.info("User registered successfully", { userId });
    return response(201, {
      success: true,
      message: "User registered successfully",
    });
  } catch (err: any) {
    logger.error("Error during registration: ", err);
    throw new CustomApiError(
      "Registration failed",
      500,
      ErrorType.InternalServerError
    );
  }
};

const loginUser = async (dto: LoginDto) => {
  try {
    const params = new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: dto.email },
      },
    });

    const result = await dynamo.send(params);

    if (!result.Items || result.Items.length === 0) {
      logger.warn("User not found during login", { dto });
      throw new CustomApiError("User Not Found", 404, ErrorType.NotFound);
    }

    const user = result.Items[0];
    const storedHash = user.password?.S ?? "";

    const valid = await comparePassword(dto.password, storedHash);
    if (!valid) {
      logger.warn("Invalid password attempt", { dto });
      throw new CustomApiError("Unauthorized", 401, ErrorType.Unauthorized);
    }

    const token = await generateJwtToken(user ?? {});

    const userData: IUser = {
      userId: user.userId?.S ?? "",
      email: user.email?.S ?? "",
      fullName: user.fullName?.S ?? "",
      role: user.role?.S ?? "USER",
      createdAt: user.createdAt?.S ?? "",
    };

    logger.info("Login successful", { userId: user.userId.S });

    return response(200, {
      message: "Login successful",
      token: token,
      user: userData,
    });
  } catch (err: any) {
    logger.error("Error during login: ", { err });
    throw new CustomApiError(
      "Login failed",
      500,
      ErrorType.InternalServerError
    );
  }
};

export { registerUser, loginUser };
