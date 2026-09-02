import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { MailService } from "../mail/mail.service";
import { HashUtil } from "../../common/utils/hash.util";
import { OtpUtil } from "../../common/utils/otp.util";
import { OtpType, Role, UserStatus } from "@prisma/client";
import { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from "./dto/auth.dto";
import { AuthTokenService } from "./auth_token.service";
import { AuthOtpService } from "./auth_otp.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly tokenService: AuthTokenService,
    private readonly otpService: AuthOtpService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, dto.username ? { username: dto.username } : {}],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email.toLowerCase()) throw new ConflictException("A user with this email already exists");
      throw new ConflictException("A user with this username already exists");
    }

    const hashedPassword = await HashUtil.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username || null,
        password: hashedPassword,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        phoneNumber: dto.phoneNumber || null,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      select: { id: true, email: true, username: true, firstName: true, lastName: true, role: true, isEmailVerified: true, createdAt: true },
    });

    const tokens = this.tokenService.generateTokens(user);
    return { message: "Registration successful.", user, ...tokens };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const identifier = dto.identifier.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException(`Your account has been ${user.status.toLowerCase()}`);
    }

    const isPasswordValid = await HashUtil.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials");

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = this.tokenService.generateTokens(user);
    const tokenHash = await HashUtil.hash(tokens.refreshToken);

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId: user.id, ipAddress, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return {
      user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, role: user.role, status: user.status, isEmailVerified: user.isEmailVerified },
      ...tokens,
    };
  }

  refreshToken(refreshToken: string, ipAddress?: string) { return this.tokenService.refreshToken(refreshToken, ipAddress); }
  verifyEmailOtp(email: string, code: string) { return this.otpService.verifyEmailOtp(email, code); }
  resendVerificationOtp(email: string) { return this.otpService.resendVerificationOtp(email); }
  forgotPassword(email: string) { return this.otpService.forgotPassword(email); }
  resetPassword(dto: ResetPasswordDto) { return this.otpService.resetPassword(dto); }
  changePassword(userId: string, dto: ChangePasswordDto) { return this.otpService.changePassword(userId, dto); }
  logout(userId: string) { return this.tokenService.logout(userId); }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, firstName: true, lastName: true, avatarUrl: true, phoneNumber: true, role: true, status: true, isEmailVerified: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException("User profile not found");
    return user;
  }
}
