FROM oven/bun:latest as build

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

# artifact stage contains /app/dist for extraction in CI
FROM alpine:3.18 AS artifact
WORKDIR /app
COPY --from=build /app/dist ./dist