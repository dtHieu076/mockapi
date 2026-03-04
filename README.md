# MockAPI Infrastructure Setup - Nginx Reverse Proxy

## Overview

This document explains the production-ready Nginx reverse proxy setup for the MockAPI project, enabling wildcard subdomain architecture and eliminating CORS issues.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │   User       │
  │   Browser    │
  └──────┬───────┘
         │ 
         │ 1. Request to abc.mydomain.com or mydomain.com
         ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                        DNS (Mắt Bão)                                  │
  │                  mydomain.com → Render IP                             │
  └──────────────────────────────────────────────────────────────────────┘
         │
         │ 2. HTTP Request (port 80)
         ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                   NGINX (Render Container)                            │
  │                                                                      │
  │   ┌───────────────────────────────────────────────────────────────┐  │
  │   │  server_name mydomain.com *.mydomain.com                      │  │
  │   └───────────────────────────────────────────────────────────────┘  │
  │                              │                                        │
  │         ┌───────────────────┴───────────────────┐                    │
  │         │                                           │                 │
  │   ┌─────▼──────────────┐               ┌─────────▼──────────┐        │
  │   │  /api/*            │               │  /* (Frontend)    │        │
  │   │  (API Proxy)      │               │  (Static Files)   │        │
  │   └─────────┬──────────┘               └────────┬─────────┘        │
  │            │                                    │                   │
  │            │ 3. Proxy to Backend                │ 4. Serve HTML    │
  │            ▼                                    ▼                   │
  └──────────────────────────────────────────────────────────────────────┘
         │
         │ 5. Proxy Request to Backend
         ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │              BACKEND (Spring Boot - Render Private)                 │
  │                                                                      │
  │   - Receives request with X-Forwarded-* headers                     │
  │   - Can detect subdomain from Host header                           │
  │   - No CORS needed (same origin)                                    │
  │                                                                      │
  │   Endpoints:                                                         │
  │   - /api/auth/*                                                      │
  │   - /api/subdomains/*                                               │
  │   - /api/apis/*                                                      │
  └──────────────────────────────────────────────────────────────────────┘
         │
         │ 6. Response
         ▼
  ┌──────────────┐
  │   User       │
  │   Browser    │
  └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                   │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────┐
  │                    PostgreSQL (Neon)                                 │
  │                                                                      │
  │   - ep-nameless-flower-ahqfkw3x-pooler.c-3.us-east-1.aws.neon.tech  │
  │   - Database: mockapi_projectdb                                      │
  └──────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Nginx Dockerfile (`nginx/Dockerfile`)

**Location:** `nginx/Dockerfile`

A production-ready Nginx container that:
- Uses `nginx:alpine` base image (lightweight ~5MB)
- Copies custom `nginx.conf` configuration
- Copies frontend build from `mockapiFrontend/dist/`
- Runs as non-root user for security
- Exposes port 80

**Build:**
```
bash
cd nginx
docker build -t mockapi-nginx .
```

**Run:**
```
bash
docker run -p 80:80 mockapi-nginx
```

### 2. Nginx Configuration (`nginx/nginx.conf`)

**Location:** `nginx/nginx.conf`

Features:
- Wildcard subdomain support: `mydomain.com` and `*.mydomain.com`
- Serves frontend static files from `/usr/share/nginx/html`
- SPA routing with `try_files $uri $uri/ /index.html`
- Proxies `/api/*` to backend service `http://mockapi-backend:8080/api/`
- Forwards all necessary headers:
  - `Host` - Original host
  - `X-Real-IP` - Client IP
  - `X-Forwarded-For` - Original client IP chain
  - `X-Forwarded-Proto` - Original protocol (http/https)
  - `X-Forwarded-Host` - Original host
  - `X-Subdomain` - Extracted subdomain (for backend detection)
- Gzip compression enabled
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Static asset caching

### 3. Frontend Changes

**File:** `mockapiFrontend/src/api/apiClient.ts`

**Before:**
```
typescript
export const BASE_URL = 'http://localhost:8080';
```

**After:**
```
typescript
export const BASE_URL = ''; // Relative path - Nginx handles routing
```

**Impact:**
- All API calls now use relative paths (e.g., `/api/auth/login`)
- Requests go to the same origin (Nginx)
- No CORS issues since frontend and API are on the same domain

### 4. Backend Configuration

**File:** `mockapi/src/main/resources/application.properties`

Added:
```
properties
# Reverse Proxy Headers Configuration
server.use-forward-headers=true
```

This tells Spring Boot to respect `X-Forwarded-*` headers from Nginx.

**File:** `mockapi/src/main/java/com/mockapiproject/mockapi/Config/CorsConfig.java`

CORS is kept for:
- Development flexibility
- Health check endpoints
- Internal requests

With Nginx proxying, requests appear from the same origin, so CORS is not actually needed in production.

## Deployment Instructions

### Step 1: Build Frontend

```
bash
cd mockapiFrontend
npm run build
# Output will be in dist/ folder
```

### Step 2: Build Nginx Image

```
bash
cd nginx
docker build -t mockapi-nginx .
```

### Step 3: Deploy to Render

1. **Backend Service (Private):**
   - Deploy Spring Boot as private service
   - Name: `mockapi-backend`
   - Port: 8080

2. **Nginx Service (Public):**
   - Deploy Nginx container
   - Name: `mockapi-nginx`
   - Port: 80
   - Environment variables for backend URL

3. **Configure DNS (Mắt Bão):**
   - Add A record: `mydomain.com` → Render Nginx IP
   - Add CNAME: `*.mydomain.com` → mydomain.com

### Step 4: Environment Variables (Render)

For Nginx container:
```
env
BACKEND_URL=http://mockapi-backend:8080
```

## Subdomain Detection (Backend)

The backend can detect subdomains using the `Host` header:

```
java
@GetMapping("/")
public String getCurrentSubdomain(HttpServletRequest request) {
    String host = request.getHeader("Host");
    // host = "abc.mydomain.com" or "mydomain.com"
    // Extract subdomain from host
}
```

Or use the custom `X-Subdomain` header forwarded by Nginx.

## Benefits of This Architecture

1. **No CORS Issues**
   - Frontend and API on same domain
   - No cross-origin requests

2. **Wildcard Subdomain Support**
   - `abc.mydomain.com`
   - `dev.mydomain.com`
   - `staging.mydomain.com`

3. **Single Entry Point**
   - One URL for both frontend and API
   - Simplified deployment

4. **Security**
   - Backend can be private (not exposed directly)
   - Nginx handles SSL termination (when configured)

5. **Performance**
   - Static files served by Nginx
   - Gzip compression
   - Browser caching for assets

6. **Scalability**
   - Easy to add more backends behind Nginx
   - Load balancing support

## Troubleshooting

### Check Nginx Logs
```
bash
docker logs mockapi-nginx
```

### Check Backend Logs
```
bash
docker logs mockapi-backend
```

### Test Health Endpoint
```
bash
curl http://localhost/health
```

### Test API Proxy
```
bash
curl http://localhost/api/subdomains/{accountId}
```

### Verify Headers
```
bash
curl -I http://localhost/api/subdomains/{accountId}
# Should show X-Forwarded-* headers
```

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Backend URL | `http://localhost:8080` | `http://mockapi-backend:8080` |
| Frontend | Vite dev server | Nginx static files |
| CORS | Enabled | Not needed |
| Subdomain | Localhost | Wildcard DNS |

## Files Modified

1. `nginx/Dockerfile` - New file
2. `nginx/nginx.conf` - New file
3. `mockapiFrontend/src/api/apiClient.ts` - Modified BASE_URL
4. `mockapi/src/main/resources/application.properties` - Added forward headers config
5. `mockapi/src/main/java/com/mockapiproject/mockapi/Config/CorsConfig.java` - Updated comments

## Business Logic Preserved

- All controllers remain unchanged
- All services remain unchanged
- All entities remain unchanged
- All DTOs remain unchanged
- Database schema unchanged
- API endpoints unchanged

---

# DATABASE UI FEATURE - MICROSERVICES SUPPORT

## Overview

This document describes the new Database UI feature that allows users to connect to external databases and manage them through a web interface, similar to phpMyAdmin or DBeaver.

This feature is designed to support microservices architecture where each service may have its own database.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE UI ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ACCOUNT (User)                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  DatabaseMode:                                                     │  │
│  │  - SHARED: All subdomains use the same database                  │  │
│  │  - PER_SUBDOMAIN: Each subdomain has its own database            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                    │
│                    ┌───────────────┼───────────────┐                   │
│                    ▼               ▼               ▼                    │
│           ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│           │ Subdomain 1│    │ Subdomain 2│    │ Subdomain N│           │
│           │  (API)     │    │  (API)     │    │  (API)     │           │
│           └────────────┘    └────────────┘    └────────────┘           │
│                    │               │               │                    │
│                    ▼               ▼               ▼                    │
│           ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│           │ Database 1 │    │ Database 2 │    │ Database N │           │
│           │ (if PER)   │    │ (if PER)   │    │ (if PER)   │           │
│           └────────────┘    └────────────┘    └────────────┘           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPPORTED DATABASES                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐     ┌──────────────────┐
  │   PostgreSQL     │     │      MySQL       │
  │                  │     │                  │
  │  - Neon          │     │  - MySQL         │
  │  - Self-hosted   │     │  - MariaDB       │
  │  - AWS RDS       │     │  - AWS RDS       │
  └──────────────────┘     └──────────────────┘
```

## Database Modes

### 1. SHARED Mode
- All subdomains under an account share a single database
- Suitable for monolithic applications
- Cost-effective for small projects

### 2. PER_SUBDOMAIN Mode
- Each subdomain has its own dedicated database
- Suitable for microservices architecture
- Better isolation and scalability
- Each service can have independent database schema

## Use Cases

### Microservices Architecture
```
Account: mycompany.com

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  auth.api       │     │  order.api      │     │  product.api    │
│  (auth.)        │     │  (orders.)      │     │  (products.)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  auth_db        │     │  order_db       │     │  product_db     │
│  (PostgreSQL)   │     │  (MySQL)        │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Features

### 1. Database Connection Management
- Add/Edit/Delete database connections
- Support PostgreSQL and MySQL
- Store connection details (host, port, database name, credentials)
- Test connection before saving

### 2. Table Management
- View all tables in a database
- Create new tables
- Drop (delete) tables
- View table metadata

### 3. Column Management
- View all columns in a table
- Add new columns
- Modify column properties (name, type, constraints)
- Drop columns

### 4. Row Management (Basic)
- View rows in a table
- Add new rows
- Edit existing rows
- Delete rows
- Note: Full SQL query support for advanced users

## API Endpoints

### Connection Management
```
POST   /api/databases              - Create new database connection
GET    /api/databases              - List all connections for account
GET    /api/databases/{id}         - Get connection details
PUT    /api/databases/{id}         - Update connection
DELETE /api/databases/{id}         - Delete connection
POST   /api/databases/{id}/test    - Test connection
```

### Table Operations
```
GET    /api/databases/{id}/tables              - List all tables
POST   /api/databases/{id}/tables              - Create new table
DELETE /api/databases/{id}/tables/{name}        - Drop table
```

### Column Operations
```
GET    /api/databases/{id}/tables/{name}/columns           - List columns
POST   /api/databases/{id}/tables/{name}/columns           - Add column
PUT    /api/databases/{id}/tables/{name}/columns/{colName}  - Update column
DELETE /api/databases/{id}/tables/{name}/columns/{colName}  - Drop column
```

### Row Operations
```
GET    /api/databases/{id}/tables/{name}/rows            - Get rows
POST   /api/databases/{id}/tables/{name}/rows             - Insert row
PUT    /api/databases/{id}/tables/{name}/rows/{id}        - Update row
DELETE /api/databases/{id}/tables/{name}/rows/{id}         - Delete row
```

## Database Schema

### DatabaseConnectionEntity
```java
@Entity
@Table(name = "database_connection")
public class DatabaseConnectionEntity {
    @Id
    @GeneratedValue
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "account_id")
    private AccountEntity account;
    
    private String name;                    // Display name
    
    @Enumerated(EnumType.STRING)
    private DatabaseType databaseType;     // POSTGRESQL, MYSQL
    
    private String host;
    private Integer port;
    private String databaseName;
    private String username;
    private String password;                // Encrypted
    
    @Enumerated(EnumType.STRING)
    private DatabaseMode mode;              // SHARED, PER_SUBDOMAIN
    
    private Boolean isActive;
}
```

### DatabaseType Enum
```java
public enum DatabaseType {
    POSTGRESQL,
    MYSQL
}
```

### DatabaseMode Enum
```java
public enum DatabaseMode {
    SHARED,           // All subdomains use same database
    PER_SUBDOMAIN    // Each subdomain has own database
}
```

## Implementation Plan

### Phase 1: Backend - Entities & DTOs
- [x] Create DatabaseType enum
- [x] Create DatabaseMode enum
- [x] Create DatabaseConnectionEntity
- [x] Create DatabaseConnectionDTO
- [x] Update SubdomainEntity to reference DatabaseConnection
- [x] Create DatabaseConnectionRepository

### Phase 2: Backend - Services
- [x] Create DatabaseConnectionService
- [x] Create DatabaseQueryService (JDBC operations)
- [x] Create DatabaseMetadataService (tables, columns info)
- [x] Create TableManagementService
- [x] Create ColumnManagementService
- [x] Create RowManagementService

### Phase 3: Backend - Controllers
- [x] Create DatabaseController with all endpoints

### Phase 4: Frontend - UI Components
- [x] Update types.ts with Database types
- [x] Create databaseApi.ts
- [x] Create DatabasePage.tsx
- [x] Create ConnectionForm.tsx (integrated in DatabasePage)
- [x] Create DatabaseBrowser.tsx (integrated in DatabasePage)
- [x] Create TableViewer.tsx (integrated in DatabasePage)
- [x] Update App.tsx with routes
- [x] Update Layout.tsx with navigation

## Technical Details

### JDBC Connection Management
- Use HikariCP for connection pooling
- Dynamic connection configuration based on database type
- Connection validation before queries

### Security (For Production)
- Encrypt database passwords using AES-256
- Never log sensitive credentials
- Use environment variables for secrets in production

### Dependencies
```xml
<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>

<!-- HikariCP (included in spring-boot-starter-jdbc) -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
</dependency>
```

## Current Project Structure

```
mockapi/
├── mockapi/                          # Spring Boot Backend
│   ├── src/main/java/.../
│   │   ├── Controller/               # REST Controllers
│   │   ├── Service/                  # Business Logic
│   │   ├── Entity/                   # JPA Entities
│   │   ├── DTO/                      # Data Transfer Objects
│   │   └── Repository/               # JPA Repositories
│   └── pom.xml                       # Maven dependencies
│
├── mockapiFrontend/                  # React Frontend
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   ├── components/               # Reusable components
│   │   ├── api/                      # API clients
│   │   └── types.ts                  # TypeScript types
│   └── package.json                  # NPM dependencies
│
└── nginx/                             # Nginx Reverse Proxy
    ├── nginx.conf                    # Configuration
    └── Dockerfile                     # Container build
```

## Files to be Created/Modified

### Backend New Files
- `mockapi/src/main/java/com/mockapiproject/mockapi/Entity/DatabaseConnectionEntity.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Enum/DatabaseType.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Enum/DatabaseMode.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/DTO/DatabaseConnectionDTO.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/DTO/TableDTO.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/DTO/ColumnDTO.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/DTO/RowDTO.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Repository/DatabaseConnectionRepository.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Service/DatabaseConnectionService.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Service/DatabaseQueryService.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Service/DatabaseMetadataService.java`
- `mockapi/src/main/java/com/mockapiproject/mockapi/Controller/DatabaseController.java`

### Backend Modified Files
- `mockapi/pom.xml` - Add MySQL dependency
- `mockapi/src/main/java/com/mockapiproject/mockapi/Entity/SubdomainEntity.java` - Add FK to DatabaseConnection
- `mockapi/src/main/java/com/mockapiproject/mockapi/Entity/AccountEntity.java` - Add database mode field

### Frontend New Files
- `mockapiFrontend/src/api/databaseApi.ts`
- `mockapiFrontend/src/pages/DatabasePage.tsx`
- `mockapiFrontend/src/components/ConnectionForm.tsx`
- `mockapiFrontend/src/components/DatabaseBrowser.tsx`
- `mockapiFrontend/src/components/TableViewer.tsx`

### Frontend Modified Files
- `mockapiFrontend/src/types.ts` - Add Database types
- `mockapiFrontend/src/App.tsx` - Add routes
- `mockapiFrontend/src/components/Layout.tsx` - Add navigation

## Development Notes

### Testing
- Test with local PostgreSQL and MySQL instances
- Verify connection pooling works correctly
- Test edge cases (invalid credentials, network failures)

### Performance Considerations
- Connection pooling prevents resource exhaustion
- Lazy loading for large tables
- Pagination for tables with many rows

### Future Enhancements
- SQL query editor for advanced users
- Import/Export functionality
- Database backup/restore
- Support for more database types (MongoDB, SQL Server, Oracle)
- Real-time data synchronization
