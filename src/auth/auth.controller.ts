import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BaseResponseDto } from '../common/dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 registrations per minute
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email verification',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and receive JWT tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refresh attempts per minute
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Get new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<BaseResponseDto<any>> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 password reset requests per minute
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset OTP to user email',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset OTP sent successfully',
    type: BaseResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<BaseResponseDto<any>> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 password reset attempts per minute
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password using OTP code and revoke all existing sessions',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully. All existing sessions have been terminated.',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid or expired OTP',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<BaseResponseDto<any>> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 password change attempts per minute
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user password and revoke all existing sessions',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or same password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid current password or missing JWT token',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<BaseResponseDto<any>> {
    const userId = req.user.sub; // Extract user ID from JWT payload
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate refresh token and logout user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: BaseResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async logout(@Request() req): Promise<BaseResponseDto<any>> {
    const userId = req.user.sub; // Extract user ID from JWT payload
    return this.authService.logout(userId);
  }
}
