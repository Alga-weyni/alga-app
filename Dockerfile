# 🏗️ Multi-stage Dockerfile for Alga
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (frontend + backend)
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy necessary runtime files
COPY server ./server
COPY shared ./shared
COPY drizzle.config.ts ./

# Create uploads directory
RUN mkdir -p uploads/properties

# Set environment to production
ENV NODE_ENV=production

# Expose port 5000 (Alga's standard port)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
