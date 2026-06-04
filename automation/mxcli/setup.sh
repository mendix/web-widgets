#!/usr/bin/env bash
# Downloads the mxcli binary into automation/tools/ for the current platform.
# Usage: bash automation/mxcli/setup.sh [--force]
set -euo pipefail

MXCLI_VERSION="${MXCLI_VERSION:-v0.11.0}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS_DIR="${REPO_ROOT}/automation/tools"
BINARY="${TOOLS_DIR}/mxcli"

if [[ -x "$BINARY" && "${1:-}" != "--force" ]]; then
    echo "mxcli already present at ${BINARY}. Use --force to re-download."
    exit 0
fi

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    arm64 | aarch64) ARCH="arm64" ;;
    *)
        echo "Unsupported architecture: $ARCH" >&2
        exit 1
        ;;
esac

if [[ "$OS" != "darwin" && "$OS" != "linux" ]]; then
    echo "Unsupported OS: $OS (Windows users: download mxcli-windows-${ARCH}.exe from https://github.com/mendixlabs/mxcli/releases)" >&2
    exit 1
fi

DOWNLOAD_URL="https://github.com/mendixlabs/mxcli/releases/download/${MXCLI_VERSION}/mxcli-${OS}-${ARCH}"

echo "Downloading mxcli ${MXCLI_VERSION} (${OS}/${ARCH})..."
curl -fsSL --output "$BINARY" "$DOWNLOAD_URL"
chmod +x "$BINARY"

echo "mxcli installed at ${BINARY}"
"$BINARY" --version || true
