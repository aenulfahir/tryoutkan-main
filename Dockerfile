# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- Deps (install node_modules) ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ---------- Builder (build Vite with env) ----------
FROM base AS builder
# Build args diterima di stage ini (bukan di deps)
ARG VITE_CLIENT_TARGET
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_N8N_CREATE_PACKAGE_URL
ARG VITE_N8N_ADD_QUESTIONS_URL
ARG VITE_AI_API_KEY
ARG VITE_OPENAI_API_KEY

# Expose as ENV supaya Vite bisa baca saat build
ENV NODE_ENV=production \
    VITE_CLIENT_TARGET=${VITE_CLIENT_TARGET} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_N8N_WEBHOOK_URL=${VITE_N8N_WEBHOOK_URL} \
    VITE_N8N_CREATE_PACKAGE_URL=${VITE_N8N_CREATE_PACKAGE_URL} \
    VITE_N8N_ADD_QUESTIONS_URL=${VITE_N8N_ADD_QUESTIONS_URL} \
    VITE_AI_API_KEY=${VITE_AI_API_KEY} \
    VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}

# Ambil node_modules dari stage deps
COPY --from=deps /app/node_modules ./node_modules
# Lalu salin source code
COPY . .

# Build Vite
RUN npm run build

# ---------- Runtime (Nginx) ----------
FROM nginx:alpine AS runner
# Salin konfigurasi nginx (file terpisah)
COPY nginx.conf /etc/nginx/nginx.conf
# Salin hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
