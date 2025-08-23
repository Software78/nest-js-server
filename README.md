# NestJS Authentication API with PostgreSQL, MongoDB, Redis and Docker

A complete NestJS application with JWT authentication, multiple database support (PostgreSQL, MongoDB, Redis), Docker containerization, and **enterprise-grade security features**.

## 🛡️ **Security Features**

- **Rate Limiting**: Protection against brute force attacks
- **Strong Password Policy**: 12+ characters with complexity requirements
- **Secure JWT**: Short-lived tokens with issuer/audience validation
- **CORS Protection**: Restricted origins and methods
- **Security Headers**: Helmet.js for comprehensive protection
- **Input Validation**: Class-validator with strict validation
- **Data Redaction**: Sensitive data automatically excluded from logs
- **Network Isolation**: Database ports not exposed publicly
- **Strong Authentication**: bcrypt with 12 rounds

## 🔐 **Authentication & Authorization**

- **JWT Authentication** - Login/Register with refresh tokens
- **Password Reset** - OTP-based password recovery via email
- **Rate Limiting** - Configurable limits per endpoint type
- **Session Management** - Secure token handling

## 🗄️ **Multi-Database Support**

- **PostgreSQL** - Primary database with TypeORM
- **MongoDB** - Document storage (internal use only)
- **Redis** - Caching and session management (internal use only)

## 🆔 **Advanced Features**

- **Dual ID System** - Integer IDs for internal use, UUIDs for external APIs
- **Data Redaction** - Sensitive fields automatically excluded from logs and responses
- **Soft Deletes** - Records marked as deleted without physical removal
- **Request Tracking** - Unique request IDs for debugging and monitoring

## 🐳 **Docker & Docker Compose**

- **Complete containerization** for development and production
- **Network isolation** for security
- **Health checks** for all services
- **Environment-based configuration**

## 📧 **Email Service**

- **SMTP integration** with fallback logging
- **OTP delivery** for password resets
- **Configurable templates**

## 📊 **Structured Logging**

- **Winston** with request tracking
- **Request ID correlation**
- **Sensitive data redaction**
- **Configurable log levels**

## 🚀 **Production Ready**

- **Environment-based configuration**
- **Security best practices**
- **Performance optimizations**
- **Comprehensive error handling**

## 📋 **Prerequisites**

- Node.js (v18 or higher)
- Docker & Docker Compose
- npm

## 🚀 **Quick Start**

### 1. **Clone and Install Dependencies**

```bash
git clone <your-repo>
cd nest_js_example
npm install
```

### 2. **Environment Configuration**

**IMPORTANT**: Copy the secure environment template and update with your values:

```bash
cp env.secure .env
# Edit .env with your actual passwords and configuration
```

**Required Environment Variables:**

- `DB_PASSWORD` - Strong PostgreSQL password
- `MONGO_PASSWORD` - Strong MongoDB password
- `REDIS_PASSWORD` - Strong Redis password
- `JWT_SECRET` - Cryptographically secure random string (64+ chars)

### 3. **Generate Strong JWT Secret**

```bash
openssl rand -base64 64
```

### 4. **Start the Application**

**Development with hot reload:**

```bash
# Start only databases
npm run docker:dev

# In another terminal, run the app locally
npm run start:dev
```

**Full production setup:**

```bash
npm run docker:prod
```

## 🔒 **Security Configuration**

### **Rate Limiting**

- **Default**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **Registration**: 5 requests per minute
- **Login**: 5 attempts per minute
- **Password Reset**: 3 requests per minute

### **Password Requirements**

- **Minimum length**: 12 characters
- **Complexity**: Uppercase, lowercase, number, special character
- **Hashing**: bcrypt with 12 rounds

### **JWT Security**

- **Access token**: 15 minutes expiration
- **Issuer validation**: `nestjs-auth-api`
- **Audience validation**: `nestjs-users`
- **No weak fallbacks**

### **CORS Protection**

- **Development**: `localhost:3000`, `localhost:3001`
- **Production**: Configurable allowed origins
- **Methods**: GET, POST, PUT, DELETE, PATCH
- **Headers**: Content-Type, Authorization, x-request-id

## 📚 **API Documentation**

### **Authentication Endpoints**

- `POST /auth/register` - Register new user (rate limited: 5/min)
- `POST /auth/login` - User login (rate limited: 5/min)
- `POST /auth/refresh` - Refresh JWT tokens (rate limited: 10/min)
- `POST /auth/forgot-password` - Request password reset (rate limited: 3/min)
- `POST /auth/reset-password` - Reset password with OTP (rate limited: 5/min)
- `POST /auth/logout` - Logout and invalidate tokens

### **Protected Endpoints**

- `GET /users` - Get all users (paginated)
- `GET /users/:uuid` - Get user by UUID
- `GET /profile` - Get current user profile

### **Public Endpoints**

- `GET /` - Welcome message
- `GET /docs` - Swagger documentation (development only)

## 🏗️ **Project Structure**

```
src/
├── auth/                    # Authentication module
│   ├── dto/               # Validation DTOs
│   ├── guards/            # JWT authentication guards
│   ├── strategies/        # Passport JWT strategy
│   ├── auth.controller.ts # Auth endpoints with rate limiting
│   ├── auth.service.ts    # Authentication business logic
│   └── auth.module.ts     # Auth module configuration
├── common/                 # Shared functionality
│   ├── database/          # Database configuration
│   ├── dto/               # Response DTOs
│   ├── services/          # Common services
│   ├── utils/             # Utility functions
│   ├── interceptors/      # Request tracking
│   └── common.module.ts   # Common module
├── entities/               # Database entities
├── users/                  # User management
└── main.ts                # Application entry point
```

## 🔧 **Configuration**

### **Environment Variables**

See `env.secure` for a complete template with security best practices.

### **Docker Compose**

- **Development**: `docker-compose.dev.yml`
- **Production**: `docker-compose.yml`
- **Security**: Database ports not exposed publicly

## 🚨 **Security Checklist**

- [x] Strong password requirements
- [x] Rate limiting on all endpoints
- [x] JWT security hardening
- [x] CORS protection
- [x] Security headers (Helmet.js)
- [x] Input validation and sanitization
- [x] Data redaction in logs
- [x] Network isolation
- [x] No weak fallbacks
- [x] Secure authentication flow

## 📝 **Development Notes**

- **Swagger**: Only enabled in development
- **Logging**: Sensitive data automatically redacted
- **Validation**: Strict input validation with class-validator
- **Testing**: Comprehensive test coverage
- **Linting**: ESLint with security-focused rules

## 🤝 **Contributing**

1. Follow security best practices
2. Update security documentation
3. Test all security features
4. Review rate limiting configuration
5. Validate input sanitization

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For security issues, please contact the development team directly.
