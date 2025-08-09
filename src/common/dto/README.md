# Structured Response System for NestJS

This directory contains a comprehensive set of DTOs for standardizing API responses across your NestJS application using TypeScript generics.

## Overview

The response structure system provides:
- ✅ **Consistent API responses** with success/error handling
- ✅ **Generic types** for type safety and reusability  
- ✅ **Built-in pagination support** with metadata
- ✅ **Swagger documentation** integration
- ✅ **Error handling** standardization

## Core Components

### 1. BaseResponseDto<T>
Generic base response structure for all API endpoints.

```typescript
{
  "success": boolean,
  "message": string,
  "data": T | undefined,
  "error": any | undefined,
  "timestamp": string
}
```

**Static Methods:**
- `BaseResponseDto.success<T>(data: T, message?: string)` - Create success response
- `BaseResponseDto.error<T>(message: string, error?: any)` - Create error response

### 2. PaginationQueryDto
Standardized query parameters for paginated endpoints.

**Parameters:**
- `page?: number` (default: 1, min: 1)
- `limit?: number` (default: 10, min: 1, max: 100)
- `sortBy?: string` (default: 'created_at')
- `sortOrder?: 'asc' | 'desc'` (default: 'desc')

**Computed Properties:**
- `skip: number` - Calculated offset for database queries

### 3. PaginatedResponseDto<T>
Generic paginated response with items and metadata.

```typescript
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": T[],
    "meta": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number,
      "hasNext": boolean,
      "hasPrev": boolean
    }
  },
  "timestamp": string
}
```

**Static Method:**
- `PaginatedResponseDto.create<T>(items: T[], page: number, limit: number, total: number, message?: string)`

## File Structure

```
src/common/dto/
├── index.ts                    # Barrel exports
├── base-response.dto.ts        # Core response structure
├── pagination.dto.ts           # Pagination query and metadata
├── paginated-response.dto.ts   # Paginated response wrapper
├── example-usage.md           # Usage examples
└── README.md                  # This file
```

## Implementation Examples

### Basic Controller Endpoint
```typescript
@Get(':id')
async findOne(@Param('id') id: number): Promise<BaseResponseDto<UserDto>> {
  const user = await this.userService.findOne(id);
  return BaseResponseDto.success(user, 'User retrieved successfully');
}
```

### Paginated Controller Endpoint
```typescript
@Get()
async findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponseDto<UserDto>> {
  return this.userService.findAllPaginated(query);
}
```

### Service Implementation
```typescript
async findAllPaginated(query: PaginationQueryDto): Promise<PaginatedResponseDto<UserDto>> {
  const { page, limit, skip, sortBy, sortOrder } = query;
  
  const [items, total] = await this.repository.findAndCount({
    skip,
    take: limit,
    order: { [sortBy]: sortOrder }
  });

  return PaginatedResponseDto.create(items, page ?? 1, limit ?? 10, total);
}
```

## Updated Components

### Authentication Responses
- `AuthResponseDto` - Updated to use the new base structure
- `AuthDataDto` - Separated data structure for authentication responses
- `UserResponseDto` - User data structure for responses

### Users Module
- `UsersController` - Example implementation with pagination
- `UsersService` - Service layer with structured responses
- `UsersModule` - Module configuration

## Benefits

1. **Type Safety**: Full TypeScript generics support
2. **Consistency**: All responses follow the same structure  
3. **Documentation**: Automatic Swagger documentation
4. **Error Handling**: Standardized error response format
5. **Pagination**: Built-in pagination with metadata
6. **Extensibility**: Easy to extend for specific use cases
7. **Maintainability**: Centralized response logic

## Best Practices

1. Always use `BaseResponseDto.success()` for successful operations
2. Always use `BaseResponseDto.error()` for error responses  
3. Use `PaginatedResponseDto.create()` for paginated data
4. Include meaningful messages in responses
5. Implement proper error handling in services
6. Use the built-in validation for pagination parameters
7. Document response types in controller decorators

## Migration Guide

To migrate existing endpoints:

1. Import the response DTOs: `import { BaseResponseDto } from './common/dto';`
2. Update return types: `Promise<YourDto>` → `Promise<BaseResponseDto<YourDto>>`
3. Wrap responses: `return data;` → `return BaseResponseDto.success(data);`
4. Update Swagger decorators to reference the new response types

This system provides a solid foundation for consistent, well-documented, and type-safe API responses in your NestJS application.