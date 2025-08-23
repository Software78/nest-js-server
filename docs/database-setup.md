# Database Setup Guide

This guide covers the setup and configuration of all databases used in this NestJS application.

## Overview

The application uses three different databases:

- **PostgreSQL**: Primary relational database for user management and core data
- **MongoDB**: Document database for flexible data structures (internal use only)
- **Redis**: In-memory cache and session storage (internal use only)

**Note**: MongoDB and Redis are configured as internal services and are not exposed as public API endpoints. They are available for internal application use, caching, and session management.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm/yarn

## Quick Start

### 1. Development Environment

```bash
# Start all services including databases
npm run docker:dev

# Or manually start databases only
docker-compose -f docker-compose.dev.yml up postgres mongodb redis
```

### 2. Production Environment

```bash
# Start all services including databases
npm run docker:prod

# Or manually start databases only
docker-compose up postgres mongodb redis
```

## Database Services

### PostgreSQL

- **Port**: 5432
- **Default Database**: nestjs_db
- **Username**: postgres
- **Password**: postgres
- **Purpose**: User management, authentication, OTP storage

### MongoDB

- **Port**: 27017
- **Default Database**: nestjs_db
- **Username**: admin
- **Password**: admin123
- **Purpose**: Document storage, flexible schemas

### Redis

- **Port**: 6379
- **Password**: redis123
- **Purpose**: Caching, session storage, rate limiting

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestjs_db

# MongoDB
MONGO_URI=mongodb://admin:admin123@localhost:27017/nestjs_db?authSource=admin
MONGO_DB_NAME=nestjs_db

# Redis
REDIS_URI=redis://localhost:6379
REDIS_PASSWORD=redis123
REDIS_DB=0
```

## Feature Flags

You can disable specific databases using environment variables:

```bash
# Skip PostgreSQL
SKIP_DB=true

# Skip MongoDB
SKIP_MONGO=true

# Skip Redis
SKIP_REDIS=true
```

## Database Connections

### PostgreSQL with TypeORM

```typescript
// Entities are automatically loaded from src/entities/
// Current entities: User, Otp
```

### MongoDB with Mongoose (Internal)

```typescript
// MongoDB connection is available for internal use
// You can create custom schemas and services as needed
// No public API endpoints are exposed
```

### Redis (Internal)

```typescript
// Redis service provides methods for internal use:
// - Key-value operations
// - Hash operations
// - List operations
// - Set operations
// - Cache management
// Available via CacheService and RedisService
```

## Health Checks

All database services include health checks:

- **PostgreSQL**: `pg_isready` command
- **MongoDB**: `mongosh ping` command
- **Redis**: `redis-cli ping` command

The application waits for all databases to be healthy before starting.

## Data Persistence

All databases use Docker volumes for data persistence:

- `postgres_data`: PostgreSQL data
- `mongodb_data`: MongoDB data
- `redis_data`: Redis data

## Internal Usage Examples

### Using CacheService in your services:

```typescript
import { CacheService } from '../common/services/cache.service';

@Injectable()
export class YourService {
  constructor(private cacheService: CacheService) {}

  async getCachedData(key: string) {
    return await this.cacheService.get(key);
  }

  async setCachedData(key: string, value: any, ttl?: number) {
    await this.cacheService.set(key, value, ttl);
  }
}
```

### Using MongoDB connection for custom schemas:

```typescript
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YourSchema.name, schema: YourSchema }]),
  ],
})
export class YourModule {}
```

## Monitoring

### Grafana Dashboards

- Access Grafana at `http://localhost:3001`
- Default credentials: `admin/admin`
- Pre-configured dashboards for application logs

### Log Aggregation

- Loki collects application logs
- Promtail ships logs to Loki
- View logs in Grafana

## Troubleshooting

### Connection Issues

1. Check if databases are running:

   ```bash
   docker-compose ps
   ```

2. Check database logs:

   ```bash
   docker-compose logs postgres
   docker-compose logs mongodb
   docker-compose logs redis
   ```

3. Verify health checks:
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   docker-compose exec redis redis-cli ping
   ```

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Consider using Docker secrets for production deployments
- Enable SSL/TLS for database connections in production
- Restrict network access to database ports
- MongoDB and Redis are internal services - ensure they're not exposed to external networks
