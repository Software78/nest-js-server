-- Initialize the database and user
-- This script runs when the database is first created

-- Create the database if it doesn't exist (though it should already exist from env vars)
SELECT 'CREATE DATABASE nestjs_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nestjs_db')\gexec

-- Ensure the postgres user has proper permissions
ALTER USER postgres WITH SUPERUSER CREATEDB CREATEROLE LOGIN;

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE nestjs_db TO postgres;

-- Connect to the nestjs_db database
\c nestjs_db;

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO postgres;