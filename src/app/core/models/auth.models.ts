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

  tenant?: TenantInfo;

  siteTypes?: SiteType[];

  country?: string;

  avatar?: string;
}

export interface TenantInfo {
  id: string;
  name: string;

  logo?: string;

  primaryColor?: string;
}

export type SiteType =
  | 'towers'
  | 'buildings'
  | 'warehouses';

export interface JwtPayload {
  sub: string;

  email: string;

  role: string;

  permissions: string[];

  exp: number;

  iat: number;
}