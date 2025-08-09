import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  @ApiProperty({ description: 'Error details', required: false })
  error?: any;

  @ApiProperty({ 
    description: 'Response timestamp',
    example: '2023-01-01T00:00:00.000Z'
  })
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success'): BaseResponseDto<T> {
    return new BaseResponseDto(true, message, data);
  }

  static error<T = any>(message: string, error?: any): BaseResponseDto<T> {
    return new BaseResponseDto<T>(false, message, undefined, error);
  }
}