import { UserResponseDto } from '../../auth/dto/auth-response.dto';
import { User } from '../../entities/user.entity';

/**
 * Transform User entity to UserResponseDto, excluding sensitive fields
 */
export function transformUserToDto(user: User): UserResponseDto {
  if (!user) {
    throw new Error('User cannot be null');
  }

  return {
    uuid: user.uuid,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Transform array of User entities to UserResponseDto array
 */
export function transformUsersToDto(users: User[]): UserResponseDto[] {
  if (!users || !Array.isArray(users)) {
    return [];
  }

  return users.filter((user) => user !== null).map(transformUserToDto);
}
