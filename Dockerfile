# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- Deps ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat

# hanya package manifests dulu (maksimalkan cache)
COPY package.json package-lock.json* ./

# Jika ada package-lock.json -> npm ci, jika tidak -> npm install
RUN if [ -f package-lock.json ]; then \
    npm ci --ignore-scripts; \
    else \
    npm install --no-audit --no-fund --ignore-scripts; \
    fi

# ---------- Builder (Vite build) ----------
FROM base AS builder

# Build args (diisi dari panel saat build)
ARG VITE_CLIENT_TARGET
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_N8N_CREATE_PACKAGE_URL
ARG VITE_N8N_ADD_QUESTIONS_URL
ARG VITE_AI_API_KEY
ARG VITE_OPENAI_API_KEY

# Jadikan ENV supaya Vite bisa baca pada build time
ENV NODE_ENV=production \
    VITE_CLIENT_TARGET=${VITE_CLIENT_TARGET} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_N8N_WEBHOOK_URL=${VITE_N8N_WEBHOOK_URL} \
    VITE_N8N_CREATE_PACKAGE_URL=${VITE_N8N_CREATE_PACKAGE_URL} \
    VITE_N8N_ADD_QUESTIONS_URL=${VITE_N8N_ADD_QUESTIONS_URL} \
    VITE_AI_API_KEY=${VITE_AI_API_KEY} \
    VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}

# bawa node_modules dari tahap deps
COPY --from=deps /app/node_modules ./node_modules
# lalu bawa seluruh source
COPY . .

# Build Vite
RUN npm run build

# ---------- Runtime (Nginx) ----------
FROM nginx:alpine AS runner
# konfigurasi nginx terpisah
COPY nginx.conf /etc/nginx/nginx.conf
# hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
