import { Role } from "../enums/role";

export interface RegisterDto {
  email: string;
  fullName: string;
  role: Role;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
