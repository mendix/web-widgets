# Skills Directory

This directory contains all Claude Code skills for the web-widgets repository.

## Structure

```
.agent/skills/
├── code-review/              # PR review skill for Mendix widget conventions
├── debug-widget/             # Debug Mendix pluggable widget runtime issues
├── openspec-apply-change/    # Implement tasks from OpenSpec change
├── openspec-archive-change/  # Archive completed OpenSpec change
├── openspec-bulk-archive-change/ # Archive multiple changes at once
├── openspec-continue-change/ # Continue OpenSpec change workflow
├── openspec-explore/         # OpenSpec explore mode
├── openspec-ff-change/       # Fast-forward OpenSpec artifact creation
├── openspec-new-change/      # Start new OpenSpec change
├── openspec-onboard/         # Guided OpenSpec onboarding
├── openspec-propose/         # Propose new change with all artifacts
├── openspec-sync-specs/      # Sync delta specs to main specs
└── openspec-verify-change/   # Verify implementation matches artifacts
```

## Usage

Skills are automatically loaded by Claude Code. Users can invoke them via slash commands:

- `/code-review` — Review current PR
- `/debug-widget` — Debug widget runtime issues
- `/openspec-*` or `/opsx:*` — OpenSpec workflow commands

## Skill Format

Each skill is a directory containing:

- `SKILL.md` — Main skill definition (required)
- Additional supporting documents (optional)

## Migration History

**2026-05-26**: Centralized all skills from `.claude/skills/`, `.pi/skills/`, and `.github/skills/` into `.agent/skills/` to establish a single source of truth.
