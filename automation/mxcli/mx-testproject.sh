#!/usr/bin/env bash
# Helper for running mxcli against a widget's local test project (.mpr file).
#
# Usage:
#   bash automation/mxcli/mx-testproject.sh <subcommand> <widget-name> [args...]
#
# Subcommands:
#   inspect    <widget>                Show modules, pages, entities, and navigation
#   list-pages <widget> [ModuleName]   List pages for a module (auto-detected if omitted)
#   exec       <widget> "<MDL>"        Execute an arbitrary MDL statement
#   search     <widget> "<keyword>"    Full-text search across all project strings
#   lint       <widget>                Run built-in lint rules on the test project
#   report     <widget>                Print a scored best-practices report
#   diff       <widget> <mdl-file>     Preview MDL changes as a diff (no writes)
#   check      <widget> <mdl-file>     Validate MDL syntax and references
#   callers    <widget> "<Module.MF>"  Show what calls a microflow
#   refs       <widget> "<Module.El>"  Show all references to an element
#   shell      <widget>                Open an interactive mxcli REPL
#
# Examples:
#   bash automation/mxcli/mx-testproject.sh inspect datagrid-web
#   bash automation/mxcli/mx-testproject.sh list-pages datagrid-web
#   bash automation/mxcli/mx-testproject.sh exec datagrid-web "SHOW PAGES IN DataGrid"
#   bash automation/mxcli/mx-testproject.sh search datagrid-web "columnHeader"
#   bash automation/mxcli/mx-testproject.sh lint datagrid-web
#   bash automation/mxcli/mx-testproject.sh report datagrid-web
#   bash automation/mxcli/mx-testproject.sh diff datagrid-web changes.mdl
#   bash automation/mxcli/mx-testproject.sh check datagrid-web changes.mdl
#   bash automation/mxcli/mx-testproject.sh callers datagrid-web "DataGrid.ACT_Refresh"
#   bash automation/mxcli/mx-testproject.sh refs datagrid-web "DataGrid.GridEntity"
#   bash automation/mxcli/mx-testproject.sh shell datagrid-web

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MXCLI="${REPO_ROOT}/automation/tools/mxcli"

if [[ ! -x "$MXCLI" ]]; then
    echo "mxcli not found at ${MXCLI}. Running setup..." >&2
    bash "$(dirname "${BASH_SOURCE[0]}")/setup.sh" || exit 1
fi

SUBCOMMAND="${1:-}"
WIDGET="${2:-}"

if [[ -z "$SUBCOMMAND" || -z "$WIDGET" ]]; then
    sed -n '/^# Usage/,/^[^#]/p' "$0" | grep -v '^[^#]' | sed 's/^# \?//'
    exit 1
fi

# Resolve .mpr path — skip backup copies
MPR="$(ls "${REPO_ROOT}/packages/pluggableWidgets/${WIDGET}/tests/testProject/"*.mpr 2>/dev/null \
    | grep -v backup \
    | head -1 || true)"

if [[ -z "$MPR" ]]; then
    echo "No .mpr file found for widget '${WIDGET}'." >&2
    echo "Expected: packages/pluggableWidgets/${WIDGET}/tests/testProject/*.mpr" >&2
    echo "Run 'pnpm --filter @mendix/${WIDGET} run e2edev --setup-project' to download it." >&2
    exit 1
fi

echo "Using project: ${MPR}"

run_mdl() {
    "$MXCLI" -p "$MPR" -c "$1"
}

# Extract the first non-System/non-Atlas module name from SHOW MODULES output
detect_module() {
    run_mdl "SHOW MODULES" 2>&1 \
        | grep '^|' | grep -v '| Module ' | grep -v '^|---' \
        | grep -v '| System ' | grep -v '| Atlas_' \
        | awk -F'|' 'NR==1{gsub(/ /,"",$2); print $2}' || true
}

case "$SUBCOMMAND" in
    inspect)
        echo "=== Modules ==="
        MODULES_OUT="$(run_mdl "SHOW MODULES" 2>&1)"
        echo "$MODULES_OUT"
        echo ""
        MODULE="$(echo "$MODULES_OUT" \
            | grep '^|' | grep -v '| Module ' | grep -v '^|---' \
            | grep -v '| System ' | grep -v '| Atlas_' \
            | awk -F'|' 'NR==1{gsub(/ /,"",$2); print $2}' || true)"
        if [[ -z "$MODULE" ]]; then
            echo "Warning: could not auto-detect a non-System/non-Atlas module." >&2
            echo "Run: bash automation/mxcli/mx-testproject.sh exec ${WIDGET} \"SHOW MODULES\"" >&2
        else
            echo "=== Pages in ${MODULE} ==="
            run_mdl "SHOW PAGES IN ${MODULE}"
            echo ""
            echo "=== Entities in ${MODULE} ==="
            run_mdl "SHOW ENTITIES IN ${MODULE}"
            echo ""
            echo "=== Navigation (Responsive) ==="
            run_mdl "DESCRIBE NAVIGATION Responsive"
        fi
        ;;
    list-pages)
        MODULE="${3:-}"
        if [[ -z "$MODULE" ]]; then
            MODULE="$(detect_module)"
        fi
        if [[ -z "$MODULE" ]]; then
            echo "Could not auto-detect module name. Pass it explicitly: list-pages <widget> <ModuleName>" >&2
            exit 1
        fi
        run_mdl "SHOW PAGES IN ${MODULE}"
        ;;
    exec)
        MDL="${3:-}"
        if [[ -z "$MDL" ]]; then
            echo "Usage: exec <widget> \"<MDL statement>\"" >&2
            exit 1
        fi
        echo "⚠️  Applying MDL directly — no diff preview. Use 'diff' subcommand first for mutating statements." >&2
        run_mdl "$MDL"
        ;;
    search)
        KEYWORD="${3:-}"
        if [[ -z "$KEYWORD" ]]; then
            echo "Usage: search <widget> \"<keyword>\"" >&2
            exit 1
        fi
        run_mdl "SEARCH \"${KEYWORD}\""
        ;;
    lint)
        "$MXCLI" lint -p "$MPR"
        ;;
    report)
        "$MXCLI" report -p "$MPR"
        ;;
    diff)
        MDL_FILE="${3:-}"
        if [[ -z "$MDL_FILE" ]]; then
            echo "Usage: diff <widget> <mdl-file>" >&2
            exit 1
        fi
        "$MXCLI" diff -p "$MPR" "$MDL_FILE"
        ;;
    check)
        MDL_FILE="${3:-}"
        if [[ -z "$MDL_FILE" ]]; then
            echo "Usage: check <widget> <mdl-file>" >&2
            exit 1
        fi
        "$MXCLI" check "$MDL_FILE" -p "$MPR" --references
        ;;
    callers)
        ELEMENT="${3:-}"
        if [[ -z "$ELEMENT" ]]; then
            echo "Usage: callers <widget> \"<Module.MicroflowName>\"" >&2
            exit 1
        fi
        "$MXCLI" callers -p "$MPR" "$ELEMENT"
        ;;
    refs)
        ELEMENT="${3:-}"
        if [[ -z "$ELEMENT" ]]; then
            echo "Usage: refs <widget> \"<Module.ElementName>\"" >&2
            exit 1
        fi
        "$MXCLI" refs -p "$MPR" "$ELEMENT"
        ;;
    shell)
        echo "Opening mxcli REPL for ${MPR}. Type 'exit' or Ctrl-D to quit."
        "$MXCLI" -p "$MPR"
        ;;
    *)
        echo "Unknown subcommand: ${SUBCOMMAND}" >&2
        echo "Valid subcommands: inspect, list-pages, exec, search, lint, report, diff, check, callers, refs, shell" >&2
        exit 1
        ;;
esac
