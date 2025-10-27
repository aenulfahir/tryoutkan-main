# Use Node.js 18 as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Build args for all VITE_* vars (do NOT hardcode secrets here) ---
ARG VITE_CLIENT_TARGET
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_N8N_CREATE_PACKAGE_URL
ARG VITE_N8N_ADD_QUESTIONS_URL
ARG VITE_AI_API_KEY
ARG VITE_OPENAI_API_KEY

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

# Make them available to Vite during build
ENV VITE_CLIENT_TARGET=${VITE_CLIENT_TARGET} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_N8N_WEBHOOK_URL=${VITE_N8N_WEBHOOK_URL} \
    VITE_N8N_CREATE_PACKAGE_URL=${VITE_N8N_CREATE_PACKAGE_URL} \
    VITE_N8N_ADD_QUESTIONS_URL=${VITE_N8N_ADD_QUESTIONS_URL} \
    VITE_AI_API_KEY=${VITE_AI_API_KEY} \
    VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM nginx:alpine AS runner
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]