#!/usr/bin/env bash
# validate-openspec-path.sh — Pre-execution hook (OpenSpec location guardrail)
#
# Claude Code invokes this hook before Bash / Write / Edit / MultiEdit tool calls.
# It enforces that OpenSpec specs and changes are created PER-PACKAGE, never at
# the monorepo root. OpenSpec resolves its `openspec/` directory relative to the
# current working directory, so the root `openspec/` must stay off-limits.
#
# Input:  JSON on stdin  {"tool_name":"...","tool_input":{...},"cwd":"..."}
# Output: exit 0 to allow, exit 2 with JSON {"error":"..."} to block.
#
# IMPORTANT: Do not modify, disable, or bypass this hook.

set -euo pipefail

INPUT="$(cat)"

field() {
  # $1 = dotted path into the JSON (e.g. tool_input.file_path)
  printf '%s' "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
cur = d
for k in '''$1'''.split('.'):
    if isinstance(cur, dict):
        cur = cur.get(k, '')
    else:
        cur = ''
print(cur if isinstance(cur, str) else '')
" 2>/dev/null || true
}

TOOL_NAME="$(field tool_name)"

# Resolve the repo root. Claude Code exports CLAUDE_PROJECT_DIR for hooks; fall
# back to the hook's reported cwd, then to the process cwd.
REPO_ROOT="${CLAUDE_PROJECT_DIR:-}"
if [[ -z "$REPO_ROOT" ]]; then
  REPO_ROOT="$(field cwd)"
fi
if [[ -z "$REPO_ROOT" ]]; then
  REPO_ROOT="$PWD"
fi
REPO_ROOT="${REPO_ROOT%/}"

ROOT_OPENSPEC="$REPO_ROOT/openspec"

block() {
  printf '{"error":"BLOCKED by OpenSpec guardrail: %s Specs/changes are per-package. cd into the target package (e.g. packages/pluggableWidgets/<widget>) and run openspec there — never at the monorepo root."}\n' "$1" >&2
  exit 2
}

case "$TOOL_NAME" in
  Write|Edit|MultiEdit)
    FILE_PATH="$(field tool_input.file_path)"
    [[ -z "$FILE_PATH" ]] && exit 0

    # Normalize relative paths against the repo root.
    case "$FILE_PATH" in
      /*) ABS="$FILE_PATH" ;;
      *)  ABS="$REPO_ROOT/$FILE_PATH" ;;
    esac

    # Block writes into the ROOT openspec changes/specs trees only.
    case "$ABS" in
      "$ROOT_OPENSPEC"/changes/*|"$ROOT_OPENSPEC"/specs/*)
        block "cannot write '$FILE_PATH' under the root openspec/ directory."
        ;;
    esac
    exit 0
    ;;

  Bash)
    COMMAND="$(field tool_input.command)"
    [[ -z "$COMMAND" ]] && exit 0

    CMD_LOWER="$(printf '%s' "$COMMAND" | tr '[:upper:]' '[:lower:]')"

    # Only care about spec-creating openspec subcommands.
    if [[ "$CMD_LOWER" == *"openspec new"* \
       || "$CMD_LOWER" == *"openspec init"* \
       || "$CMD_LOWER" == *"openspec archive"* ]]; then
      # Allow it only when the command first cd's into a package directory.
      if [[ "$CMD_LOWER" == *"cd "*"packages/"* ]]; then
        exit 0
      fi
      block "'openspec new/init/archive' must run inside a package."
    fi
    exit 0
    ;;

  *)
    exit 0
    ;;
esac
