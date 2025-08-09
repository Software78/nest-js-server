import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { MoreThan, Repository } from 'typeorm';
import { BaseResponseDto } from '../common/dto';
import { EmailService } from '../common/services/email.service';
import { transformUserToDto } from '../common/utils/user-transform.util';
import { Otp } from '../entities/otp.entity';
import { User } from '../entities/user.entity';
import { AuthDataDto, AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };
    
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    return { access_token, refresh_token };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, first_name, last_name, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      first_name,
      last_name,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT tokens
    const { access_token, refresh_token } = this.generateTokens(savedUser.id, savedUser.email);

    // Save refresh token to database
    await this.userRepository.update(savedUser.id, { refresh_token });

    // Transform user to DTO (excluding password)
    const userDto = transformUserToDto(savedUser);

    const authData: AuthDataDto = {
      user: userDto,
      access_token,
      refresh_token,
    };

    return AuthResponseDto.create(authData, 'User registered successfully');
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const { access_token, refresh_token } = this.generateTokens(user.id, user.email);

    // Save refresh token to database
    await this.userRepository.update(user.id, { refresh_token });

    // Transform user to DTO (excluding password)
    const userDto = transformUserToDto(user);

    const authData: AuthDataDto = {
      user: userDto,
      access_token,
      refresh_token,
    };

    return AuthResponseDto.create(authData, 'Login successful');
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<BaseResponseDto<RefreshTokenResponseDto>> {
    try {
      const { refresh_token } = refreshTokenDto;
      
      // Verify the refresh token
      const payload = this.jwtService.verify(refresh_token);
      
      // Find user with this refresh token
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, refresh_token },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id, user.email);
      
      // Update refresh token in database
      await this.userRepository.update(user.id, { refresh_token: tokens.refresh_token });

      return BaseResponseDto.success(tokens, 'Tokens refreshed successfully');
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<BaseResponseDto<any>> {
    const { email } = forgotPasswordDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return BaseResponseDto.success(null, 'If the email exists, an OTP has been sent');
    }

    // Generate OTP
    const otpCode = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    // Invalidate any existing OTPs for this email
    await this.otpRepository.update(
      { email, type: 'password_reset', is_used: false },
      { is_used: true }
    );

    // Save new OTP
    const otp = this.otpRepository.create({
      email,
      otp_code: otpCode,
      type: 'password_reset',
      expires_at: expiresAt,
    });
    await this.otpRepository.save(otp);

    // Send OTP via email (will log if SMTP not configured)
    await this.emailService.sendPasswordResetOTP(email, otpCode);

    return BaseResponseDto.success(null, 'If the email exists, an OTP has been sent');
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<BaseResponseDto<any>> {
    const { email, otp_code, new_password } = resetPasswordDto;

    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        otp_code,
        type: 'password_reset',
        is_used: false,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user password and invalidate refresh token
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      refresh_token: null,
    });

    // Mark OTP as used
    await this.otpRepository.update(otp.id, { is_used: true });

    return BaseResponseDto.success(null, 'Password reset successfully');
  }

  async logout(userId: number): Promise<BaseResponseDto<any>> {
    // Invalidate refresh token
    await this.userRepository.update(userId, { refresh_token: null });
    
    return BaseResponseDto.success(null, 'Logged out successfully');
  }
}