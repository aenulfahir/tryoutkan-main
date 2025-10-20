# Multi-stage Dockerfile for building and serving the Vite app
#
# Stage 1: Build with Node
FROM node:18-alpine AS builder
WORKDIR /app
# Ensure devDependencies are installed for the build step
ENV NODE_ENV=development

# Install dependencies (include devDependencies so build tools like Vite are available)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund --include=dev

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built site from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Generate nginx config at container start using BACKEND_HOST if provided.
# We add a small script into /docker-entrypoint.d which the nginx image will run before start.
RUN cat > /docker-entrypoint.d/99-generate-nginx-conf.sh << 'SH'
#!/bin/sh
set -eu

# If BACKEND_HOST is not set or empty, generate a static config without API proxy
if [ -z "${BACKEND_HOST:-}" ]; then
cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
listen 80;
server_name _;
root /usr/share/nginx/html;
index index.html;

location / {
try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2)$ {
try_files $uri =404;
expires 30d;
add_header Cache-Control "public, max-age=2592000, immutable";
}
}
EOF
else
# Use BACKEND_HOST for proxying API requests
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
listen 80;
server_name _;
root /usr/share/nginx/html;
index index.html;

location / {
try_files \$uri \$uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2)$ {
try_files \$uri =404;
expires 30d;
add_header Cache-Control "public, max-age=2592000, immutable";
}

# Proxy /api to backend host provided by BACKEND_HOST env var
location /api/ {
proxy_pass http://${BACKEND_HOST};
proxy_set_header Host \$host;
proxy_set_header X-Real-IP \$remote_addr;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto \$scheme;
}
}
EOF
fi

# Keep script from printing sensitive env
exec "$@"
SH
RUN chmod +x /docker-entrypoint.d/99-generate-nginx-conf.sh

# Create a cache dir (optional)
RUN mkdir -p /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]