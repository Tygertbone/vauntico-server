# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory to server-v2
WORKDIR /app

# Copy package.json and package-lock.json first
COPY server-v2/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application
COPY server-v2 .

# Build the application
RUN npm run build

# Expose port (Railway will set PORT)
EXPOSE 8080

# Set health check path for Railway
ENV HEALTHCHECK_PATH=/health

# Start the application
CMD ["node", "dist/index.js"]
