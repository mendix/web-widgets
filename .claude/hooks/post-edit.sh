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

# Parse file path - handles both Claude Code and Copilot input formats
FILE_PATH=$(cat | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    try {
      const j=JSON.parse(d);
      if (j.tool_input?.file_path) { console.log(j.tool_input.file_path); return; }
      if (j.toolArgs) { const a=JSON.parse(j.toolArgs); if (a.path) console.log(a.path); }
    } catch {}
  })
")

# Skip if no file path or file doesn't exist
[[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]] && exit 0

# Auto-format with prettier using the project's installed version
npx prettier --write "$FILE_PATH" 2>/dev/null

# Find the nearest package directory with eslint config
SEARCH_DIR=$(dirname "$FILE_PATH")
PACKAGE_DIR=""
while [[ "$SEARCH_DIR" != "/" ]]; do
    if [[ -f "$SEARCH_DIR/eslint.config.mjs" ]]; then
        PACKAGE_DIR="$SEARCH_DIR"
        break
    fi
    SEARCH_DIR=$(dirname "$SEARCH_DIR")
done

# Run lint from the package directory using the project's lint setup
if [[ -n "$PACKAGE_DIR" ]]; then
    LINT_OUTPUT=$(cd "$PACKAGE_DIR" && npm run lint 2>&1)
    if [[ $? -ne 0 ]]; then
        echo "$LINT_OUTPUT" >&2
        exit 2
    fi
fi

exit 0
