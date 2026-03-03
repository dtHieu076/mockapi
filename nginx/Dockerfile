# ===================================================================
# Stage 1: Build Frontend
# ===================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# CHỈNH SỬA 1: Đường dẫn tính từ gốc Repo khi deploy lên Render
# Render sẽ đứng ở gốc repo để chạy lệnh build
COPY mockapiFrontend/package*.json ./

RUN npm install

# CHỈNH SỬA 2: Copy toàn bộ source code frontend
COPY mockapiFrontend/ ./

RUN npm run build

# ===================================================================
# Stage 2: Nginx Production
# ===================================================================
FROM nginx:alpine

LABEL maintainer="your-email@example.com"
LABEL description="Nginx reverse proxy for MockAPI"

# CHỈNH SỬA 3: File nginx.conf nằm cùng thư mục với Dockerfile (trong thư mục nginx/)
# Nhưng vì Build Context ở gốc, ta phải trỏ vào thư mục nginx/
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output từ stage 1 (giữ nguyên)
COPY --from=frontend-builder /app/dist /usr/share/nginx/html/

# ===================================================================
# Bảo mật & Phân quyền (Giữ nguyên phần này rất tốt)
# ===================================================================
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

EXPOSE 80

USER appuser
CMD ["nginx", "-g", "daemon off;"]