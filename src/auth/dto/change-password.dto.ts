import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'CurrentSecurePass123!',
        description: 'Current password',
    })
    @IsString()
    @IsNotEmpty()
    current_password: string;

    @ApiProperty({
        example: 'NewSecurePass123!',
        description:
            'New password (minimum 12 characters, must include uppercase, lowercase, number, and special character)',
        minLength: 12,
    })
    @IsString()
    @MinLength(12)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    new_password: string;
}
