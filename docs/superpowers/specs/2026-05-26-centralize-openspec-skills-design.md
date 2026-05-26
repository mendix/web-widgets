# Centralize OpenSpec Skills Design

**Date:** 2026-05-26  
**Status:** Approved

## Problem Statement

The repository contains 33 duplicate OpenSpec skill files distributed across three agent-specific directories:

- `.claude/skills/` (11 OpenSpec skills + 2 project-specific)
- `.pi/skills/` (11 OpenSpec skills only)
- `.github/skills/` (11 OpenSpec skills only)

All OpenSpec skills are byte-for-byte identical across locations, creating maintenance overhead and risk of divergence.

## Goals

1. **Single source of truth** — One canonical location for all OpenSpec skills
2. **Zero breaking changes** — Each agent tool continues to find skills in their expected location
3. **Easy maintenance** — Edit once, reflected everywhere automatically
4. **Clear ownership** — Distinguish between shared skills and agent-specific skills

## Proposed Architecture

### Directory Structure

```
.agent/
  skills/                       # New: centralized shared skills
    openspec-apply-change/
    openspec-archive-change/
    openspec-bulk-archive-change/
    openspec-continue-change/
    openspec-explore/
    openspec-ff-change/
    openspec-new-change/
    openspec-onboard/
    openspec-propose/
    openspec-sync-specs/
    openspec-verify-change/

.claude/
  skills/
    openspec-* -> ../../.agent/skills/openspec-*  # Symlinks to .agent
    code-review/                # Claude-specific (preserved)
    debug-widget/               # Claude-specific (preserved)

.pi/
  skills/
    openspec-* -> ../../.agent/skills/openspec-*  # Symlinks to .agent

.github/
  skills/
    openspec-* -> ../../.agent/skills/openspec-*  # Symlinks to .agent
```

### Why Symlinks?

- **Backwards compatible** — Agents don't need config changes
- **Git-native** — Symlinks are tracked by git
- **Atomic updates** — Change once, reflects everywhere immediately
- **Platform support** — Works on macOS/Linux natively; Windows via developer mode or WSL

### Migration Steps

1. **Create `.agent/skills/` directory**
2. **Move** OpenSpec skills from `.claude/skills/` to `.agent/skills/` (use `.claude` as source of truth)
3. **Delete** OpenSpec skills from `.pi/skills/` and `.github/skills/`
4. **Create symlinks** in all three agent directories pointing to `.agent/skills/`
5. **Verify** symlinks resolve correctly
6. **Commit** changes with clear message

### Agent-Specific Skills

Skills that remain agent-specific (not moved to `.agent/skills/`):

- `.claude/skills/code-review/` — Mendix widget review conventions
- `.claude/skills/debug-widget/` — Widget debugging workflows

These may be centralized later if other agents need them, but for now remain Claude-specific.

## Migration Safety

### Pre-migration Verification

- Confirm all three copies are identical (already verified via `diff -r`)
- Backup check: `git status` must be clean before starting

### Post-migration Verification

- Test symlink resolution: `ls -la .claude/skills/openspec-*`
- Verify file access: `cat .claude/skills/openspec-new-change/skill.md | head -5`
- Check git tracks symlinks: `git status` should show symlinks as changes

### Rollback Plan

If symlinks cause issues:

1. `git reset --hard HEAD` to restore original state
2. Consider Option B (sync script) or Option C (agent config updates)

## Success Criteria

- ✅ All OpenSpec skills accessible from original locations
- ✅ Only one copy exists in `.agent/skills/`
- ✅ Symlinks tracked in git
- ✅ No breaking changes to existing workflows
- ✅ Clear separation between shared and agent-specific skills

## Future Considerations

- Monitor if `.pi/` or `.github/` need agent-specific skills
- Consider centralizing `code-review` and `debug-widget` if other agents adopt them
- Document in repo README or AGENTS.md that `.agent/skills/` is the shared skills directory
