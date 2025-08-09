# NestJS Authentication API with PostgreSQL and Docker

A complete NestJS application with JWT authentication, PostgreSQL database, Docker containerization, and advanced security features.

## Features

- 🔐 **JWT Authentication** - Login/Register with refresh tokens
- 🔑 **Password Reset** - OTP-based password recovery via email
- 🗄️ **PostgreSQL Database** - TypeORM with BaseEntity architecture
- 🆔 **Dual ID System** - Integer IDs for internal use, UUIDs for external APIs
- 🛡️ **Security-First** - Data redaction, input validation, soft deletes
- 🐳 **Docker & Docker Compose** - Complete containerization
- 📧 **Email Service** - SMTP integration with fallback logging
- 📊 **Structured Logging** - Winston with request tracking
- 🔒 **Password Security** - bcrypt hashing with 12 rounds
- ✅ **Input Validation** - class-validator with comprehensive DTOs
- 🚀 **Production-Ready** - Environment-based configuration

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user  
- `POST /auth/refresh` - Refresh JWT tokens
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/logout` - Logout and invalidate tokens

### Users (Protected)
- `GET /users` - Get all users (paginated)
- `GET /users/:uuid` - Get user by UUID

### Public
- `GET /` - Welcome message

## Project Setup

### Prerequisites
- Node.js (v18 or higher)
- Docker & Docker Compose
- npm

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Configuration:**
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestjs_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application
PORT=3000
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=logs

# SMTP Configuration (optional - if not configured, OTPs will be logged instead)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourapp.com
```

## Running the Application

### Option 1: Docker (Recommended)

**Development with hot reload:**
```bash
# Start only PostgreSQL database
npm run docker:dev

# In another terminal, run the app locally
npm run start:dev
```

**Full production setup:**
```bash
# Build and start both app and database
npm run docker:prod
```

### Option 2: Local Development

**Start PostgreSQL database only:**
```bash
docker-compose -f docker-compose.dev.yml up postgres
```

**Run the application:**
```bash
# Development with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Request password reset
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Reset password with OTP
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp_code": "123456",
    "new_password": "newpassword123"
  }'
```

### Get users (protected)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get specific user by UUID (protected)
```bash
curl -X GET http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
src/
├── auth/
│   ├── dto/                     # Authentication DTOs
│   │   ├── auth-response.dto.ts # Auth response with user data
│   │   ├── login.dto.ts         # Login request validation
│   │   ├── register.dto.ts      # Registration validation
│   │   ├── refresh-token.dto.ts # Token refresh
│   │   └── forgot-password.dto.ts # Password reset DTOs
│   ├── guards/
│   │   └── jwt-auth.guard.ts    # JWT authentication guard
│   ├── strategies/
│   │   └── jwt.strategy.ts      # Passport JWT strategy
│   ├── auth.controller.ts       # Auth endpoints
│   ├── auth.service.ts         # Auth business logic
│   └── auth.module.ts          # Auth module
├── common/
│   ├── dto/                    # Shared response DTOs
│   │   ├── base-response.dto.ts      # Generic base response
│   │   ├── pagination.dto.ts         # Pagination utilities
│   │   └── paginated-response.dto.ts # Paginated responses
│   ├── services/
│   │   └── email.service.ts    # Email/OTP service
│   ├── logger/
│   │   └── winston.config.ts   # Winston logging configuration
│   ├── utils/
│   │   ├── data-redaction.util.ts   # Security data redaction
│   │   └── user-transform.util.ts   # User entity transformations
│   ├── interceptors/
│   │   └── request-id.interceptor.ts # Request tracking
│   └── common.module.ts        # Common module
├── entities/
│   ├── base.entity.ts          # Base entity with UUID/timestamps
│   ├── user.entity.ts          # User database entity
│   └── otp.entity.ts           # OTP entity for password reset
├── users/
│   ├── users.controller.ts     # User management endpoints
│   ├── users.service.ts        # User business logic
│   └── users.module.ts         # Users module
├── app.controller.ts           # Main app controller
├── app.module.ts              # Root module
├── app.service.ts             # Main app service
└── main.ts                    # Application entry point

scripts/
└── init-db.sql                # Database initialization script
```

## Database Architecture

The application uses PostgreSQL with TypeORM and a sophisticated entity architecture designed for security and performance.

### BaseEntity (Extended by all entities)
- `id` - Integer primary key (internal use only, hidden from API responses)
- `uuid` - UUID for external identification (exposed in API responses)
- `created_at` - Creation timestamp (auto-generated)
- `updated_at` - Last update timestamp (auto-updated)
- `deleted_at` - Soft delete timestamp (for soft deletes)

### User Entity
- Extends `BaseEntity`
- `email` - Unique email address
- `first_name` - User's first name  
- `last_name` - User's last name
- `password` - Hashed password (excluded from responses)
- `refresh_token` - JWT refresh token (excluded from responses)

### OTP Entity
- Extends `BaseEntity`
- `email` - Email address for OTP delivery
- `otp_code` - 6-digit verification code
- `type` - OTP type (password_reset, etc.)
- `is_used` - Whether OTP has been consumed
- `expires_at` - OTP expiration timestamp

### Security Features
- **Dual ID System**: Integer IDs for performance, UUIDs for external APIs
- **Data Redaction**: Sensitive fields automatically excluded from logs and responses
- **Soft Deletes**: Records marked as deleted without physical removal
- **Schema Sync**: Automatic database schema synchronization in development

## Development Scripts

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run start:dev

# Production build
npm run build

# Run tests
npm test
npm run test:e2e

# Linting and formatting
npm run lint
npm run format

# Docker commands
npm run docker:dev    # Start dev database only
npm run docker:prod   # Full production setup
```

## Security Features

### Authentication & Authorization
- **JWT Authentication** with access and refresh tokens
- **Password Hashing** with bcrypt (12 rounds)
- **Token Expiration** - Access tokens (15min), Refresh tokens (7 days)
- **Protected Routes** with JWT guards

### Data Security
- **Integer ID Protection** - Never expose database IDs externally
- **UUID External IDs** - Secure, non-enumerable external identifiers
- **Data Redaction** - Automatic removal of sensitive data from logs
- **Password Exclusion** - Passwords never included in API responses
- **Input Validation** - Comprehensive validation with class-validator

### Infrastructure Security
- **Environment Configuration** - Secrets stored in environment variables
- **CORS Enabled** - Cross-origin resource sharing configured
- **Request Tracking** - Unique request IDs for audit trails
- **Structured Logging** - Security-focused logging with Winston
- **Email Security** - OTP-based password reset with expiration

## Production Deployment

### Security Checklist
1. **Set strong `JWT_SECRET`** - Use a cryptographically secure random string
2. **Configure database credentials** - Use strong passwords and restricted access
3. **Set `NODE_ENV=production`** - Enables production optimizations
4. **Configure SMTP** - Set up email service for password reset functionality
5. **Review logging levels** - Set appropriate LOG_LEVEL for production
6. **Enable SSL/TLS** - Use HTTPS in production environments

### Deployment Options
- **Docker Compose**: Use `docker-compose.yml` for container orchestration
- **Database Migrations**: Consider switching from synchronize to migrations for production
- **Secrets Management**: Use container secrets or vault solutions for sensitive data
- **Monitoring**: Implement health checks and monitoring for the application

## License

This project is [MIT licensed](LICENSE).