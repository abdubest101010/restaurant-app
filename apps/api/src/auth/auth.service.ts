import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthResponse, JwtPayload, UserDto, UserRoleInfo } from '@tablebite/types';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const customerRole = await this.prisma.role.findUniqueOrThrow({ where: { code: 'customer' } });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        displayName: dto.displayName || null,
        authIdentities: { create: { provider: 'password', passwordHash } },
        userRoles: { create: { roleId: customerRole.id } },
      },
      include: { userRoles: { include: { role: true } } },
    });

    return this.issueTokens(user.id, user.email, this.mapRoles(user.userRoles));
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        authIdentities: { where: { provider: 'password' } },
        userRoles: { include: { role: true } },
      },
    });

    if (!user || user.status === 'blocked') throw new UnauthorizedException('Invalid credentials');

    const identity = user.authIdentities[0];
    if (!identity?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, identity.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, this.mapRoles(user.userRoles));
  }

  async logout(userId: string) {
    await this.prisma.authIdentity.updateMany({
      where: { userId },
      data: { refreshTokenHash: null },
    });
    return { success: true };
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      roles: this.mapRoles(user.userRoles),
    };
  }

  async issueGuestToken(branchId: string, tableId?: string, restaurantId?: string): Promise<string> {
    const sessionId = uuidv4();
    const payload: JwtPayload = {
      sub: sessionId,
      email: '',
      roles: [],
      type: 'guest',
      sessionId,
    };

    return this.jwt.sign(
      { ...payload, branchId, tableId, restaurantId },
      { expiresIn: '4h' },
    );
  }

  private async issueTokens(userId: string, email: string, roles: UserRoleInfo[]): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: userId, email, roles, type: 'access' };
    const accessToken = this.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    const refreshToken = this.jwt.sign({ ...payload, type: 'refresh' }, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

    const user = await this.me(userId);
    return { accessToken, refreshToken, user };
  }

  private mapRoles(userRoles: Array<{ role: { code: string }; restaurantId: string | null; branchId: string | null }>): UserRoleInfo[] {
    return userRoles.map((ur) => ({
      roleCode: ur.role.code,
      restaurantId: ur.restaurantId || undefined,
      branchId: ur.branchId || undefined,
    }));
  }
}
