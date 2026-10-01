# ==============================================================================
# Multi-stage Dockerfile for Smart Event Crowd & Resource Management System
# Unified single-container deployment (Frontend + C++ Backend + SQLite) for Render
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite + React)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependencies first for Docker caching
COPY frontend/package*.json ./
RUN npm install

# Copy source and build static bundle
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Compile C++ Backend & SQLite
# ------------------------------------------------------------------------------
FROM gcc:13-bookworm AS backend-builder
WORKDIR /app/backend

COPY backend/ ./

# Compile SQLite amalgamation and link C++ server statically with libstdc++
RUN gcc -O2 -c third_party/sqlite/sqlite3.c -o sqlite3.o && \
    g++ -std=c++17 -Wall -O2 main.cpp database.cpp sqlite3.o -Ithird_party -pthread -ldl -static-libstdc++ -static-libgcc -o server

# ------------------------------------------------------------------------------
# Stage 3: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM debian:bookworm-slim AS runner
WORKDIR /app

# Install runtime dependencies for C++ standard library & SSL certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend binary and database schema
COPY --from=backend-builder /app/backend/server /app/server
COPY --from=backend-builder /app/backend/schema.sql /app/schema.sql

# Copy seed database if present (wildcard avoids build failure if not tracked)
COPY backend/schema.sql backend/event_system.db* /app/

# Copy built frontend assets into public/ directory
COPY --from=frontend-builder /app/frontend/dist /app/public

# Default environment configuration (Render automatically injects $PORT)
ENV PORT=8080 \
    WEB_DIR=/app/public \
    SCHEMA_PATH=/app/schema.sql \
    DATABASE_PATH=/app/event_system.db

EXPOSE 8080

# Start unified server
CMD ["/app/server"]
