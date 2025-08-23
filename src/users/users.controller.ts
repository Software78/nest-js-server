import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  BaseResponseDto,
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description: 'Retrieve a paginated list of all users',
  })
  @ApiQuery({ type: PaginationQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.usersService.findAllPaginated(paginationQuery);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get user by UUID',
    description: 'Retrieve a specific user by their UUID',
  })
  @ApiParam({ name: 'uuid', description: 'User UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: BaseResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: BaseResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findOne(
    @Param('uuid') uuid: string,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    return this.usersService.findOneByUuid(uuid);
  }
}
