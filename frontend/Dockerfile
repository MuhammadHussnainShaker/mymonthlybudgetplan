# Build stage - build the React app with Vite
FROM oven/bun:latest as build

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the app - VITE_ env vars must be passed at build time
# These will be baked into the bundle
RUN bun run build

# Production stage - just static files for Caddy to serve
# Use nginx:alpine as a lightweight way to create a container with the dist files
# This container won't actually run nginx - it's just for holding the files
FROM alpine:3.18 AS production

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# This container doesn't run a server - Caddy will serve these files via volume mount
CMD ["echo", "Frontend build complete. Caddy will serve the dist files."]