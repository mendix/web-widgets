# Multi-stage build for mendix-pluggable-mcp
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# Set working directory
WORKDIR /app

# Stage 1: Install dependencies for the entire monorepo
FROM base AS deps

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy pnpm configuration files (required for lockfile validation)
COPY .pnpmfile.cjs .npmrc ./

# Copy patches directory (required by pnpm)
COPY patches ./patches/

# Copy automation-utils dependency (complete structure)
COPY automation/utils ./automation/utils/

# Copy MCP server package files
COPY mcp/package.json mcp/

# Install all dependencies (ignore scripts to skip postinstall)
RUN pnpm install --frozen-lockfile --filter @mendix/mendix-pluggable-mcp... --ignore-scripts

# Stage 2: Build the MCP server
FROM deps AS builder

# Copy entire automation directory
COPY automation ./automation/

# Copy docs and packages directories (needed by MCP server at runtime)
COPY docs ./docs/
COPY packages ./packages/

# Build the MCP server
WORKDIR /app/mcp
RUN pnpm build

# Stage 3: Production image
FROM base AS runner

# Copy root configuration files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/.pnpmfile.cjs /app/.npmrc /app/

# Copy monorepo directories that MCP server needs to access
COPY --from=builder /app/patches /app/patches/
COPY --from=builder /app/automation /app/automation/
COPY --from=builder /app/docs /app/docs/
COPY --from=builder /app/packages /app/packages/

# Install only production dependencies (ignore scripts to skip postinstall)
WORKDIR /app
RUN pnpm install --frozen-lockfile --filter @mendix/mendix-pluggable-mcp... --prod --ignore-scripts

# Environment variables
ENV NODE_ENV=production
ENV MX_PROJECT_PATH=""
ENV REPO_ROOT=/app

# Set working directory to app root
# When running with volume mounts, REPO_ROOT will be overridden to /workspace
WORKDIR /app

# Run the MCP server
# The server binary is at /app/mcp/build/index.js
# It will access repository files from REPO_ROOT (either /app or /workspace)
CMD ["node", "/app/mcp/build/index.js"]
