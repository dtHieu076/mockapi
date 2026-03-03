# ===================================================================
# Production-ready Nginx Dockerfile
# ===================================================================
# This Dockerfile builds the frontend and serves it via Nginx
# ===================================================================

# ===================================================================
# Stage 1: Build Frontend
# ===================================================================
FROM node:20-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY mockapiFrontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY mockapiFrontend/ ./

# Build the frontend
RUN npm run build

# ===================================================================
# Stage 2: Nginx Production
# ===================================================================
FROM nginx:alpine

# ===================================================================
# Labels for container metadata
# ===================================================================
LABEL maintainer="your-email@example.com"
LABEL description="Nginx reverse proxy for MockAPI - serves frontend and proxies API"

# ===================================================================
# Copy custom nginx configuration
# ===================================================================
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ===================================================================
# Copy frontend build from builder stage
# ===================================================================
COPY --from=frontend-builder /app/dist /usr/share/nginx/html/

# ===================================================================
# Create non-root user for security
# ===================================================================
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# ===================================================================
# Expose HTTP port
# ===================================================================
EXPOSE 80

# ===================================================================
# Start Nginx
# ===================================================================
USER appuser
CMD ["nginx", "-g", "daemon off;"]
