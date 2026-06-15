export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}