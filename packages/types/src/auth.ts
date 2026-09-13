export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRoleInfo[];
  type: 'access' | 'refresh' | 'guest';
  sessionId?: string;
}

export interface UserRoleInfo {
  roleCode: string;
  restaurantId?: string;
  branchId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  roles: UserRoleInfo[];
}

export interface SignupDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GuestSession {
  sessionId: string;
  branchId: string;
  tableId?: string;
  restaurantId: string;
  expiresAt: Date;
}
