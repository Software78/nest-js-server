# NestJS Authentication API with PostgreSQL and Docker

A complete NestJS application with JWT authentication, PostgreSQL database, and Docker containerization.

## Features

- 🔐 JWT Authentication (Login/Register)
- 🗄️ PostgreSQL Database with TypeORM
- 🐳 Docker & Docker Compose setup
- ✅ Input validation with class-validator
- 🔒 Password hashing with bcrypt
- 🛡️ Protected routes with JWT guards
- 🚀 Production-ready configuration

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /profile` - Get user profile (protected)

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
    "firstName": "John",
    "lastName": "Doe",
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

### Access protected route
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
src/
├── auth/
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # JWT Auth Guards
│   ├── strategies/          # Passport Strategies
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.service.ts      # Auth business logic
│   └── auth.module.ts       # Auth module
├── common/
│   └── dto/                 # Shared response DTOs
│       ├── base-response.dto.ts      # Generic base response
│       ├── pagination.dto.ts         # Pagination utilities
│       ├── paginated-response.dto.ts # Paginated responses
│       └── index.ts                  # Barrel exports
├── entities/
│   └── user.entity.ts       # User database entity
├── users/
│   ├── users.controller.ts  # Users endpoints (example)
│   ├── users.service.ts     # Users business logic
│   └── users.module.ts      # Users module
├── app.controller.ts        # Main app controller
├── app.module.ts           # Root module
├── app.service.ts          # Main app service
└── main.ts                 # Application entry point

scripts/
└── init-db.sql             # Database initialization script
```

## Database

The application uses PostgreSQL with TypeORM. The database schema is automatically synchronized in development mode.

### User Entity
- `id` - Primary key
- `email` - Unique email address
- `first_name` - User's first name
- `last_name` - User's last name
- `password` - Hashed password
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

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

- Password hashing with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Input validation and sanitization
- CORS enabled
- Environment-based configuration

## Production Deployment

1. Set strong `JWT_SECRET` in production environment
2. Configure proper database credentials
3. Set `NODE_ENV=production`
4. Use `docker-compose.yml` for container orchestration
5. Consider using secrets management for sensitive data

## License

This project is [MIT licensed](LICENSE).