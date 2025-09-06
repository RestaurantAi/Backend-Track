import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';


import { RegisterDto, UpdateProfileDto } from './dto';
import { EventBusService } from '@app/events/services/event-bus.service';
import { User } from '@app/database';
import { UserRole } from '@app/database/entities/user-role.entity';
import { Role } from '@app/database/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBusService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.userRoles[0]?.organizationId,
      roles: user.userRoles.map(ur => ur.role.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    // Update last login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Publish login event
    await this.eventBus.publishEvent({
      eventType: 'auth.user.login',
      organizationId: payload.organizationId,
      userId: user.id,
      data: { email: user.email },
      timestamp: new Date(),
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: payload.roles,
          organizationId: payload.organizationId,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Assign default role
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'USER' },
    });

    if (defaultRole) {
      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleId: defaultRole.id,
        organizationId: registerDto.organizationId,
      });
      await this.userRoleRepository.save(userRole);
    }

    // Publish registration event
    await this.eventBus.publishEvent({
      eventType: 'auth.user.registered',
      organizationId: registerDto.organizationId,
      userId: savedUser.id,
      data: { email: savedUser.email },
      timestamp: new Date(),
    });

    const { passwordHash, ...result } = savedUser;
    return {
      success: true,
      data: result,
      message: 'User registered successfully',
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        email: user.email,
        sub: user.id,
        organizationId: user.userRoles[0]?.organizationId,
        roles: user.userRoles.map(ur => ur.role.name),
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.eventBus.publishEvent({
      eventType: 'auth.user.logout',
      organizationId: this.getOrganizationId(), // Will be set by the gateway
      userId,
      data: {},
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    // In a real application, send email with reset link
    // For now, just publish an event
    await this.eventBus.publishEvent({
      eventType: 'auth.password.reset_requested',
      organizationId: 'null',
      userId: user.id,
      data: { email, resetToken },
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Password reset link has been sent to your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.userRepository.update(payload.sub, {
        passwordHash: hashedPassword,
      });

      await this.eventBus.publishEvent({
        eventType: 'auth.password.reset_completed',
        organizationId: this.getOrganizationId(),
        userId: payload.sub,
        data: {},
        timestamp: new Date(),
      });

      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(userId, {
      passwordHash: hashedNewPassword,
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'isVerified', 'mfaEnabled'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        ...user,
        roles: user.userRoles.map(ur => ur.role.name),
        organizationId: user.userRoles[0]?.organizationId,
      },
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(userId, updateProfileDto);

    await this.eventBus.publishEvent({
      eventType: 'auth.user.profile_updated',
      organizationId: this.getOrganizationId(user),
      userId,
      data: updateProfileDto,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  }

  async verifyMFA(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA not enabled for this user');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    return {
      success: true,
      message: 'MFA verification successful',
    };
  }
  private getOrganizationId(user?: User): string {
  return user?.userRoles?.[0]?.organizationId || 'system';
}
}