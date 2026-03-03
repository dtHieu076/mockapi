# ===================================================================
# Production-ready Nginx Dockerfile
# ===================================================================
# Base image: nginx:alpine (lightweight, production-ready)
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
# Copy frontend build files
# ===================================================================
# Assuming the frontend build outputs to /dist (Vite default)
COPY mockapiFrontend/dist/ /usr/share/nginx/html/

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
# Run as non-root user
USER appuser

# Start nginx with daemon off for container orchestration
CMD ["nginx", "-g", "daemon off;"]
