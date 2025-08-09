import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { UserResponseDto } from './auth/dto/auth-response.dto';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { BaseResponseDto, RequestId, WinstonLoggerService } from './common/dto';
import { transformUserToDto } from './common/utils/user-transform.util';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Welcome message',
    description: 'Get a welcome message from the API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Welcome message',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHello(@RequestId() requestId: string): string {
    this.logger.info('Getting hello message', { requestId, action: 'getHello' });
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get the current authenticated user profile (requires JWT token)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: BaseResponseDto<UserResponseDto>
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  getProfile(@Request() req): BaseResponseDto<UserResponseDto> {
    const userDto = transformUserToDto(req.user);
    return BaseResponseDto.success(userDto, 'User profile retrieved successfully');
  }
}
