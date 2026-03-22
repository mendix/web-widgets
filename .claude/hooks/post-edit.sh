#!/bin/bash
# Auto-format and lint after file edits.
# Works with both Claude Code (PostToolUse) and GitHub Copilot (postToolUse) hooks.
#
# Input formats:
#   Claude Code: {"tool_input": {"file_path": "/path/to/file"}}
#   Copilot:     {"toolName": "edit", "toolArgs": "{\"path\": \"/path/to/file\"}"}
#
# Exit codes:
#   0 = success (formatting applied silently)
#   2 = lint errors found (fed back to Claude as feedback; ignored by Copilot)

# Parse file path - optimized with synchronous read
FILE_PATH=$(node -e "
  const d=require('fs').readFileSync(0,'utf8');
  try {
    const j=JSON.parse(d);
    console.log(j.tool_input?.file_path||JSON.parse(j.toolArgs||'{}').path||'');
  } catch {}
")

# Skip if no file path or file doesn't exist
[[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]] && exit 0

# Skip if not a lintable file (early exit for performance)
case "$FILE_PATH" in
    *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs) ;;
    *) exit 0 ;;
esac

# Find workspace root and package directory in single pass
SEARCH_DIR=$(dirname "$FILE_PATH")
WORKSPACE_ROOT=""
PACKAGE_DIR=""

while [[ "$SEARCH_DIR" != "/" ]]; do
    # Check for both markers in parallel
    [[ -z "$PACKAGE_DIR" && -f "$SEARCH_DIR/eslint.config.mjs" ]] && PACKAGE_DIR="$SEARCH_DIR"
    if [[ -f "$SEARCH_DIR/pnpm-workspace.yaml" ]]; then
        WORKSPACE_ROOT="$SEARCH_DIR"
        break
    fi
    SEARCH_DIR=$(dirname "$SEARCH_DIR")
done

# Skip if no workspace found
[[ -z "$WORKSPACE_ROOT" ]] && exit 0

# Auto-format with prettier (capture output to check if file changed)
PRETTIER_OUT=$(cd "$WORKSPACE_ROOT" && pnpm exec prettier --write "$FILE_PATH" 2>&1)
PRETTIER_EXIT=$?

# Skip linting if prettier failed
[[ $PRETTIER_EXIT -ne 0 ]] && exit 0

# Lint from package directory with cache enabled
if [[ -n "$PACKAGE_DIR" ]]; then
    LINT_OUTPUT=$(cd "$PACKAGE_DIR" && pnpm exec eslint --cache --cache-location .eslintcache "$FILE_PATH" 2>&1)
    if [[ $? -ne 0 ]]; then
        echo "$LINT_OUTPUT" >&2
        exit 2
    fi
fi

exit 0
