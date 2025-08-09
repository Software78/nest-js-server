import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base-response.dto';
import { PaginationMetaDto } from './pagination.dto';

export class PaginatedDataDto<T> {
  @ApiProperty({ description: 'Array of items', isArray: true })
  items: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(items: T[], meta: PaginationMetaDto) {
    this.items = items;
    this.meta = meta;
  }
}

export class PaginatedResponseDto<T> extends BaseResponseDto<PaginatedDataDto<T>> {
  @ApiProperty({ description: 'Paginated data', type: PaginatedDataDto })
  declare data: PaginatedDataDto<T>;

  constructor(items: T[], meta: PaginationMetaDto, message = 'Data retrieved successfully') {
    const paginatedData = new PaginatedDataDto(items, meta);
    super(true, message, paginatedData);
  }

  static create<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Data retrieved successfully'
  ): PaginatedResponseDto<T> {
    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(items, meta, message);
  }
}