import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../common/dto';

export class UserResponseDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'User UUID (external identifier)' 
  })
  uuid: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  last_name: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  updated_at: Date;
}

export class AuthDataDto {
  @ApiProperty({ type: UserResponseDto, description: 'User information' })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refresh_token: string;
}

export class AuthResponseDto extends BaseResponseDto<AuthDataDto> {
  @ApiProperty({ type: AuthDataDto, description: 'Authentication data' })
  declare data: AuthDataDto;

  constructor(authData: AuthDataDto, message = 'Authentication successful') {
    super(true, message, authData);
  }

  static create(authData: AuthDataDto, message = 'Authentication successful'): AuthResponseDto {
    return new AuthResponseDto(authData, message);
  }
}