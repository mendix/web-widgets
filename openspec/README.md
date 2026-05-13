# OpenSpec in This Repository

Spec-driven development for Mendix pluggable widgets. We use
[OpenSpec](https://github.com/Fission-AI/OpenSpec) to align on what to build
before any code is written.

## Quick Start

```bash
# Install the CLI (one-time)
npm install -g @fission-ai/openspec@latest

# Navigate to a widget you want to change
cd packages/pluggableWidgets/<widget-name>-web

# Propose a change
/opsx:propose "<what-you-want-to-build>"

# Implement the generated tasks
/opsx:apply

# Archive when done (merges delta specs into source of truth)
/opsx:archive
```

## Structure

```
openspec/                                  # Monorepo-level
├── specs/
│   └── conventions/spec.md               # Shared widget dev conventions (source of truth)
├── schemas/
│   └── mendix-widget/                    # Custom schema for widget development
│       ├── schema.yaml                   # Artifact definitions + instructions
│       └── templates/                    # AI generation templates
│           ├── proposal.md
│           ├── spec.md
│           ├── design.md
│           └── tasks.md
└── config.yaml                           # Monorepo context + default schema

packages/pluggableWidgets/<name>-web/     # Per-widget (opt-in)
└── openspec/
    ├── specs/spec.md                     # Widget behavior source of truth
    ├── changes/                          # Active proposals (one folder per change)
    │   └── <change-name>/
    │       ├── proposal.md
    │       ├── specs/spec.md             # Delta spec (ADDED/MODIFIED/REMOVED)
    │       ├── design.md
    │       └── tasks.md
    └── config.yaml                       # Widget-specific context

.agents/rules/                            # Tool-agnostic coding rules
├── mendix-widget.md                      # Mendix API guards, versioning, styling
└── react-patterns.md                     # React hooks, MobX, accessibility
```

## Pilot Widgets

These widgets have OpenSpec initialized and baseline specs:

| Widget         | Spec                                                                                       | Status   |
| -------------- | ------------------------------------------------------------------------------------------ | -------- |
| `datagrid-web` | [openspec/specs/spec.md](../packages/pluggableWidgets/datagrid-web/openspec/specs/spec.md) | baseline |
| `combobox-web` | [openspec/specs/spec.md](../packages/pluggableWidgets/combobox-web/openspec/specs/spec.md) | baseline |
| `gallery-web`  | [openspec/specs/spec.md](../packages/pluggableWidgets/gallery-web/openspec/specs/spec.md)  | baseline |

## Initializing a New Widget

```bash
cd packages/pluggableWidgets/<widget>-web
openspec init
```

Then edit `openspec/config.yaml` to add widget-specific context (architecture,
key XML properties, data dependencies). Use the pilot widgets as reference.

## When to Use OpenSpec

| Situation                           | Use OpenSpec?               |
| ----------------------------------- | --------------------------- |
| New feature or behavior change      | Yes — `/opsx:propose` first |
| XML property added/modified/removed | Yes — `/opsx:propose` first |
| Bug fix                             | No                          |
| Refactor (no behavior change)       | No                          |
| Test-only change                    | No                          |
| Docs update                         | No                          |

## The `mendix-widget` Schema

The custom schema (`openspec/schemas/mendix-widget/`) generates four artifacts:

1. **`proposal.md`** — Intent, Mendix XML impact, scope, release checklist
2. **`specs/<domain>/spec.md`** — Delta specs (ADDED/MODIFIED/REMOVED) in Given/When/Then
3. **`design.md`** — Mendix API usage, component hierarchy, file changes
4. **`tasks.md`** — Grouped checklist: XML/Types → Implementation → Tests → Versioning

Dependency order: `proposal → specs + design → tasks → implement`
