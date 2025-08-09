# Grafana User Management

This document covers user management and access control for your Grafana logging dashboard.

## 👥 Current Users

### Admin User
- **Username**: `admin`
- **Password**: `admin`
- **Role**: Admin
- **Permissions**: Full access - can create, edit, delete dashboards, manage users, configure data sources

### Viewer User (Read-Only)
- **Username**: `viewer`
- **Password**: `viewer123`
- **Role**: Viewer
- **Permissions**: Read-only access - can view dashboards and data, but cannot edit or create

## 🔐 Access URLs

- **Admin Access**: http://localhost:3001 (login with admin/admin)
- **Viewer Access**: http://localhost:3001 (login with viewer/viewer123)

## 🛡️ Security Configuration

### Current Security Settings
- ✅ **User sign-up disabled**: `GF_USERS_ALLOW_SIGN_UP=false`
- ✅ **Role-based access control**: Viewer users cannot edit
- ✅ **Separate credentials**: Different passwords for different access levels

### Viewer User Limitations
The viewer user can:
- ✅ View all dashboards
- ✅ Access log data
- ✅ Use filters and time ranges
- ✅ Refresh data

The viewer user CANNOT:
- ❌ Create new dashboards
- ❌ Edit existing dashboards
- ❌ Delete dashboards
- ❌ Manage data sources
- ❌ Create or manage other users
- ❌ Access admin settings

## 🔧 User Management Commands

### Create New Read-Only User
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Viewer",
    "email": "newviewer@example.com", 
    "login": "newviewer",
    "password": "secure123",
    "role": "Viewer"
  }' \
  "http://admin:admin@localhost:3001/api/admin/users"
```

### List All Users
```bash
curl -s "http://admin:admin@localhost:3001/api/org/users" | jq
```

### Delete User (by user ID)
```bash
curl -X DELETE "http://admin:admin@localhost:3001/api/admin/users/[USER_ID]"
```

### Change User Password
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword123"}' \
  "http://admin:admin@localhost:3001/api/admin/users/[USER_ID]/password"
```

### Change User Role
```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"role": "Viewer"}' \
  "http://admin:admin@localhost:3001/api/org/users/[USER_ID]"
```

## 📊 Available Roles

### Viewer
- **Access**: Read-only dashboard access
- **Use Case**: Monitoring, troubleshooting, log analysis
- **Best For**: Developers, support team, stakeholders

### Editor  
- **Access**: Can create and edit dashboards
- **Use Case**: Dashboard development and maintenance
- **Best For**: DevOps engineers, senior developers

### Admin
- **Access**: Full system access
- **Use Case**: System administration, user management
- **Best For**: System administrators, team leads

## 🎯 Best Practices

### For Production
1. **Change default passwords**: Use strong, unique passwords
2. **Use environment variables**: Store credentials securely
3. **Enable HTTPS**: Configure SSL/TLS certificates
4. **Regular user audits**: Review user access periodically
5. **Log monitoring**: Monitor access logs for security

### User Access Strategy
- **Principle of least privilege**: Give minimum required access
- **Role-based access**: Use appropriate roles for different team members
- **Regular review**: Audit user permissions quarterly
- **Strong passwords**: Enforce password complexity requirements

## 🔄 Password Management

### Recommended Password Policy
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique passwords for each user
- Regular password rotation (every 90 days)

### Secure Credential Storage
```bash
# For production, use environment variables
export GRAFANA_ADMIN_PASSWORD="your-secure-admin-password"
export GRAFANA_VIEWER_PASSWORD="your-secure-viewer-password"
```

## 🚨 Security Checklist

- [ ] Changed default admin password
- [ ] Created read-only viewer users for non-admin access
- [ ] Disabled user self-registration
- [ ] Configured appropriate user roles
- [ ] Documented access credentials securely
- [ ] Planned regular user access reviews
- [ ] Considered HTTPS for production deployment

This configuration ensures secure, role-based access to your logging dashboards while maintaining operational efficiency.