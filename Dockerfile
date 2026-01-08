# =============================================================================
# VAUNTICO SERVER-V2 DOCKERFILE (Railway Deployment)
# =============================================================================
# Based on standardized backend template
# Service: server-v2 (Trust Score Backend)
# Health Check: /health

FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S vauntico && \
    adduser -S vauntico -u 1001 -G vauntico

# Set working directory
WORKDIR /app

# Copy package files
COPY server-v2/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code
COPY server-v2 .

# Build the application
RUN npm run build

# Change ownership to non-root user
RUN chown -R vauntico:vauntico /app
USER vauntico

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HEALTHCHECK_PATH=/health

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
