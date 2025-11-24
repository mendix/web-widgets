#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

IMAGE_NAME="mendix-pluggable-mcp"
IMAGE_TAG="latest"

echo "Building Docker image for Mendix Widgets MCP Server..."
echo "Repository root: ${REPO_ROOT}"

# Clean up any orphaned containers
echo "Cleaning up orphaned containers..."
docker ps -a --filter "ancestor=${IMAGE_NAME}:${IMAGE_TAG}" -q | xargs -r docker rm -f 2>/dev/null || true

cd "${REPO_ROOT}"

# Build the Docker image
docker build \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  -f mcp/Dockerfile \
  .

echo ""
echo "Docker image built successfully!"
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To run the container:"
echo "  docker run -i ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "To run with volume mount for workspace:"
echo "  docker run -i -v \"\$(pwd):/workspace\" -e CWD=/workspace ${IMAGE_NAME}:${IMAGE_TAG}"
