# ============================================
# Stage 1: Build & Test
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && mkdir -p node_modules

# Copy application code
COPY . .

# Run tests
RUN npm test

# ============================================
# Stage 2: Production Image
# ============================================
FROM node:20-alpine

# Add labels for metadata
LABEL maintainer="DevOps Demo"
LABEL version="1.0.0"
LABEL description="Jenkins Branch Demo App"

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy only production artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/test.js ./
COPY --from=builder /app/package.json ./

# Use non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_VERSION=1.0.0
ENV ENVIRONMENT=development
ENV GIT_BRANCH=prod

CMD ["node", "server.js"]
