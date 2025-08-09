# Scripts Directory

This directory contains utility scripts for database initialization, deployment, and other project-related tasks.

## Files

### `init-db.sql`
PostgreSQL initialization script that runs when the database container is first created.

**Purpose:**
- Creates the `nestjs_db` database if it doesn't exist
- Sets up proper user permissions for the `postgres` user
- Grants necessary privileges on the database, schema, tables, and sequences
- Configures default privileges for future database objects

**Usage:**
- Automatically executed by PostgreSQL Docker container on first startup
- Referenced in `docker-compose.yml` and `docker-compose.dev.yml`
- Maps to `/docker-entrypoint-initdb.d/init-db.sql` inside the container

## Adding New Scripts

When adding new scripts to this directory:

1. **Database Scripts:** Use `.sql` extension for SQL scripts
2. **Shell Scripts:** Use `.sh` extension and make them executable (`chmod +x script.sh`)
3. **Node Scripts:** Use `.js` or `.ts` extension for Node.js utility scripts
4. **Documentation:** Update this README when adding new scripts

## Script Categories

### Database Scripts
- `init-db.sql` - Initial database setup

### Future Scripts (Examples)
- `seed-data.sql` - Sample data for development
- `migrate.sh` - Database migration runner
- `backup.sh` - Database backup utility
- `deploy.sh` - Deployment automation

## Docker Integration

Scripts in this directory can be easily mounted into Docker containers:

```yaml
volumes:
  - ./scripts/script-name.sql:/path/in/container/script-name.sql
```

The `init-db.sql` script is automatically executed by the PostgreSQL container during initialization.