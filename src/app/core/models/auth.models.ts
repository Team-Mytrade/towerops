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
};

export type LoginResponse = ApiResponse<LoginResponseData>;