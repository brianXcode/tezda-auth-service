import { loginUser, registerUser } from "./app/controllers/auth.controller";
import { LoginDto, RegisterDto } from "./app/dto/dto";
import { logger } from "./app/utils/logger/logger";
import { CustomApiError } from "./app/utils/shared/customError";
import { ApplicationError } from "./app/utils/shared/errorHandler";
import { ErrorType } from "./app/utils/shared/errorTypes";
import {
  emailValidation,
  passwordValidation,
} from "./app/utils/validation/validation";
import { ActionEnum } from "./app/enums/action";

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { action, email, password, fullName, role } = body;

    if (!action || !email || !password) {
      throw new CustomApiError(
        "Missing required fields",
        400,
        ErrorType.BadRequest
      );
    }

    // Validate email
    if (!emailValidation(email)) {
      throw new CustomApiError(
        "Invalid email format",
        400,
        ErrorType.BadRequest
      );
    }

    // Validate password
    if (!passwordValidation(password)) {
      throw new CustomApiError(
        " Password must be at least 8 characters, include one uppercase letter and one number",
        400,
        ErrorType.BadRequest
      );
    }

    switch (action) {
      case ActionEnum.REGISTER:
        const registerDto: RegisterDto = {
          email,
          password,
          fullName,
          role,
        };
        return await registerUser(registerDto);

      case ActionEnum.LOGIN:
        const loginDto: LoginDto = { email, password };
        return await loginUser(loginDto);
      default:
        throw new CustomApiError("Invalid action", 400, ErrorType.BadRequest);
    }
  } catch (err) {
    logger.error("Auth Handler Error:", { err });
    return ApplicationError(err);
  }
};
