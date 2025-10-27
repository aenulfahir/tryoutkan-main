# Fix Environment Variables Issue in EasyPanel

## Problem
Error: "Missing Supabase environment variables" muncul di browser setelah deployment berhasil.

## Cause
Environment variables tidak ter-inject ke dalam build time karena Vite membaca environment variables saat build, bukan saat runtime.

## Solutions

### Solution 1: Update EasyPanel Environment Variables

1. **Buka EasyPanel Dashboard**
2. **Pilih Website** → **Settings**
3. **Tambahkan Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://vhgwcljzzsudyzzicmcc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3djbGp6enN1ZHl6emljbWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzg4NjgsImV4cCI6MjA3NDk1NDg2OH0.TVhAlv1Gvb_IwcCzK0KugnNlHenZzEJgAuEkn59cCR0
   VITE_CLIENT_TARGET=https://your-domain.com
   VITE_AI_API_KEY=sk-CFNtHF6DUwTkpXNbm1WY3A
   VITE_OPENAI_API_KEY=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
   VITE_N8N_WEBHOOK_URL=https://n8n-byzh91ql.n8x.biz.id/webhook/topup-balance
   VITE_N8N_CREATE_PACKAGE_URL=https://n8n-byzh91ql.n8x.biz.id/webhook/create_tryout_packages
   VITE_N8N_ADD_QUESTIONS_URL=https://n8n-byzh91ql.n8x.biz.id/webhook/add-questions
   ```

4. **Rebuild Application** di EasyPanel

### Solution 2: Update Dockerfile untuk Build dengan Environment Variables

```dockerfile
# Di Dockerfile, tambahkan ARG sebelum build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_CLIENT_TARGET
ARG VITE_AI_API_KEY
ARG VITE_OPENAI_API_KEY
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_N8N_CREATE_PACKAGE_URL
ARG VITE_N8N_ADD_QUESTIONS_URL

# Di builder stage, set environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_CLIENT_TARGET=$VITE_CLIENT_TARGET
ENV VITE_AI_API_KEY=$VITE_AI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV VITE_N8N_WEBHOOK_URL=$VITE_N8N_WEBHOOK_URL
ENV VITE_N8N_CREATE_PACKAGE_URL=$VITE_N8N_CREATE_PACKAGE_URL
ENV VITE_N8N_ADD_QUESTIONS_URL=$VITE_N8N_ADD_QUESTIONS_URL
```

### Solution 3: Create .env.production di Container

Update Dockerfile untuk copy .env.production:

```dockerfile
# Di builder stage, copy .env.production
COPY .env.production ./.env.production

# Build dengan environment variables
RUN npm run build
```

### Solution 4: Quick Fix (Recommended)

1. **Edit Dockerfile**:
```dockerfile
# Use Node.js 18 as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy environment file
COPY .env.production ./

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM nginx:alpine AS runner
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

2. **Update .env.production** dengan nilai yang benar
3. **Rebuild** di EasyPanel

## Verification Steps

1. **Check Build Logs** di EasyPanel untuk memastikan environment variables terbaca
2. **Inspect Built Files**:
   ```bash
   # Masuk ke container
   docker exec -it <container-name> /bin/sh
   
   # Check file yang di-build
   ls -la /usr/share/nginx/html
   
   # Check jika ada error di console
   # Buka website di browser dan check developer console
   ```

3. **Test Environment Variables**:
   - Buka browser → Developer Tools → Console
   - Cari error environment variables
   - Refresh halaman setelah rebuild

## Common Issues

### Issue 1: Environment Variables Not Available in Build
**Symptom**: Error muncul di browser console
**Fix**: Gunakan Solution 1 atau Solution 4

### Issue 2: CORS Error
**Symptom**: Network error saat connect ke Supabase
**Fix**: Update VITE_CLIENT_TARGET dengan domain yang benar

### Issue 3: Invalid Supabase URL
**Symptom**: Error format URL
**Fix**: Pastikan URL Supabase benar dan ada https://

## Emergency Fix

Jika perlu fix segera:

1. **Hardcode values** sementara di lib/supabase.ts:
```typescript
const supabaseUrl = "https://vhgwcljzzsudyzzicmcc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3djbGp6enN1ZHl6emljbWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzg4NjgsImV4cCI6MjA3NDk1NDg2OH0.TVhAlv1Gvb_IwcCzK0KugnNlHenZzEJgAuEkn59cCR0";
```

2. **Rebuild** aplikasi
3. **Fix proper environment variables** kemudian

---

**Recommended**: Gunakan Solution 1 (EasyPanel Environment Variables) untuk fix yang paling clean dan maintainable.