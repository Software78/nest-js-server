# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development Workflow
```bash
# Install dependencies
npm install

# Development server with hot reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod

# Run in debug mode
npm run start:debug
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Lint and fix code
npm run lint

# Format code with Prettier
npm run format
```

### Docker Development
```bash
# Start PostgreSQL database only (recommended for development)
npm run docker:dev

# Full production Docker setup
npm run docker:prod

# Manual Docker commands
docker-compose -f docker-compose.dev.yml up postgres
docker-compose up --build
```

## Architecture Overview

This is a **NestJS authentication API** with PostgreSQL, featuring a security-first architecture with dual ID systems and comprehensive data protection.

### Core Architecture Patterns

**Modular Structure**: The application follows NestJS module patterns with clear separation of concerns:
- `AuthModule`: JWT authentication, password reset, user registration
- `UsersModule`: User management and retrieval
- `CommonModule`: Shared services, utilities, and interceptors

**Security-First Design**: 
- **Dual ID System**: Integer IDs (`id`) for internal database operations, UUIDs (`uuid`) for external API exposure
- **Data Redaction**: Comprehensive sensitive data filtering in logs and responses
- **BaseEntity Pattern**: All entities extend `BaseEntity` with automatic UUID generation, timestamps, and soft deletes

**Key Components**:
- **BaseEntity**: Provides `id` (hidden), `uuid` (exposed), timestamps, and soft delete functionality
- **RequestIdInterceptor**: Adds unique request tracking for audit trails  
- **Data Redaction Utilities**: Automatically redacts passwords, tokens, and sensitive fields from logs
- **JWT Strategy**: Passport-based authentication with access and refresh tokens

### Database Design

**Entities**:
- `User`: Email, names, hashed password, refresh tokens (extends BaseEntity)  
- `OTP`: Email-based verification codes for password reset (extends BaseEntity)

**Security Features**:
- Integer primary keys never exposed in APIs
- UUIDs used for all external references
- Passwords excluded from all responses via `@Exclude()` decorator
- Soft deletes preserve audit trails

### Authentication Flow

1. **Registration**: Email + password → JWT access token + refresh token
2. **Login**: Credentials validation → JWT tokens with 15min/7day expiration
3. **Password Reset**: Email → OTP generation → OTP validation → password update
4. **Token Refresh**: Refresh token → new access token

### Environment Configuration

Required environment variables:
```env
# Database
DB_HOST=localhost
DB_PORT=5432  
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestjs_db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Application
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Email (optional - falls back to logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com  
SMTP_PASS=your-app-password
```

## Development Notes

### Testing Strategy
- Unit tests in `*.spec.ts` files alongside source code
- E2E tests in `/test` directory
- Jest configuration in `package.json` with TypeScript support
- Coverage reports generated in `/coverage` directory

### API Documentation
- Swagger documentation available at `/docs` endpoint
- JWT authentication configured with Bearer token support
- DTOs provide comprehensive request/response validation

### Database Considerations
- **Development**: Uses `synchronize: true` for automatic schema updates
- **Production**: Should switch to migrations instead of synchronization
- **Initialization**: Database setup script in `scripts/init-db.sql`

### Security Best Practices
- All sensitive fields automatically excluded from API responses
- Comprehensive data redaction in logs and error messages  
- Password hashing with bcrypt (12 rounds)
- Input validation with class-validator on all DTOs
- CORS enabled for cross-origin requests

### Docker Development
The application supports both local and containerized development:
- Use `npm run docker:dev` to start only PostgreSQL, run app locally
- Use `npm run docker:prod` for full containerized setup
- Development dockerfile (`Dockerfile.dev`) includes hot reload
- Production dockerfile optimized for minimal image size
