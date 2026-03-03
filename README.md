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
