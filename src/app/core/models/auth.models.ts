import { UserType } from "../enums/user-type.enum";

export type LoginRequest = {
  username: string;
  password: string;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
};


export type LoginResponseData = {
  token: string;
  username: string;
  tenantId: string;

  userId: number;
  userType: UserType;

  roles: string[];
  permissions: string[];
};

export type LoginResponse = ApiResponse<LoginResponseData>;