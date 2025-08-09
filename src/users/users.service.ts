import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { BaseResponseDto, PaginatedResponseDto, PaginationQueryDto } from '../common/dto';
import { transformUserToDto, transformUsersToDto } from '../common/utils/user-transform.util';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllPaginated(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page, limit, skip, sortBy = 'created_at', sortOrder } = paginationQuery;

    try {
      const [users, total] = await this.userRepository.findAndCount({
        skip,
        take: limit,
        order: { [sortBy]: sortOrder },
        select: ['id', 'uuid', 'email', 'first_name', 'last_name', 'created_at', 'updated_at'], // Exclude password
      });

      const userDtos = transformUsersToDto(users);
      
      return PaginatedResponseDto.create(
        userDtos,
        page ?? 1,
        limit ?? 10,
        total,
        'Users retrieved successfully'
      );
    } catch (error) {
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  async findOneByUuid(uuid: string): Promise<BaseResponseDto<UserResponseDto>> {
    try {
      const user = await this.userRepository.findOne({
        where: { uuid },
        select: ['id', 'uuid', 'email', 'first_name', 'last_name', 'created_at', 'updated_at'], // Exclude password
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userDto = transformUserToDto(user);
      return BaseResponseDto.success(userDto, 'User retrieved successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        return BaseResponseDto.error('User not found', { statusCode: 404 });
      }
      return BaseResponseDto.error('Failed to retrieve user', error.message);
    }
  }
}