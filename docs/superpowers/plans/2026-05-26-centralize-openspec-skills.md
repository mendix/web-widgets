# Centralize OpenSpec Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move duplicate OpenSpec skills to `.agent/skills/` and replace with symlinks in agent-specific directories.

**Architecture:** Create centralized `.agent/skills/` directory, move OpenSpec skills from `.claude/skills/`, delete duplicates from `.pi/skills/` and `.github/skills/`, then create symlinks in all three agent directories pointing to the canonical location.

**Tech Stack:** Git, bash, symlinks

---

## File Structure

**Directories to create:**

- `.agent/skills/` — New centralized location for shared skills

**Directories to move (11 total):**

- `.claude/skills/openspec-apply-change/` → `.agent/skills/openspec-apply-change/`
- `.claude/skills/openspec-archive-change/` → `.agent/skills/openspec-archive-change/`
- `.claude/skills/openspec-bulk-archive-change/` → `.agent/skills/openspec-bulk-archive-change/`
- `.claude/skills/openspec-continue-change/` → `.agent/skills/openspec-continue-change/`
- `.claude/skills/openspec-explore/` → `.agent/skills/openspec-explore/`
- `.claude/skills/openspec-ff-change/` → `.agent/skills/openspec-ff-change/`
- `.claude/skills/openspec-new-change/` → `.agent/skills/openspec-new-change/`
- `.claude/skills/openspec-onboard/` → `.agent/skills/openspec-onboard/`
- `.claude/skills/openspec-propose/` → `.agent/skills/openspec-propose/`
- `.claude/skills/openspec-sync-specs/` → `.agent/skills/openspec-sync-specs/`
- `.claude/skills/openspec-verify-change/` → `.agent/skills/openspec-verify-change/`

**Directories to delete (22 total):**

- `.pi/skills/openspec-*` (11 directories)
- `.github/skills/openspec-*` (11 directories)

**Symlinks to create (33 total):**

- `.claude/skills/openspec-*` → `../../.agent/skills/openspec-*` (11 symlinks)
- `.pi/skills/openspec-*` → `../../.agent/skills/openspec-*` (11 symlinks)
- `.github/skills/openspec-*` → `../../.agent/skills/openspec-*` (11 symlinks)

---

## Task 1: Pre-Migration Verification

**Files:**

- Check: All directories in `.claude/skills/`, `.pi/skills/`, `.github/skills/`

- [ ] **Step 1: Verify git status is clean**

Run:

```bash
cd /Users/illia.obukhau/code/web-widgets
git status
```

Expected: `nothing to commit, working tree clean` or only the design doc commit

- [ ] **Step 2: Verify OpenSpec skills are identical**

Run:

```bash
diff -r .claude/skills/openspec-apply-change .pi/skills/openspec-apply-change
```

Expected: No output (identical)

Run:

```bash
diff -r .claude/skills/openspec-apply-change .github/skills/openspec-apply-change
```

Expected: No output (identical)

- [ ] **Step 3: Count OpenSpec skills in each directory**

Run:

```bash
ls -1d .claude/skills/openspec-* | wc -l
ls -1d .pi/skills/openspec-* | wc -l
ls -1d .github/skills/openspec-* | wc -l
```

Expected: Each command outputs `11`

---

## Task 2: Create Centralized Directory

**Files:**

- Create: `.agent/skills/` directory

- [ ] **Step 1: Create .agent/skills directory**

Run:

```bash
mkdir -p .agent/skills
```

Expected: Directory created, no output

- [ ] **Step 2: Verify directory exists**

Run:

```bash
ls -ld .agent/skills
```

Expected: `drwxr-xr-x ... .agent/skills`

---

## Task 3: Move OpenSpec Skills from .claude to .agent

**Files:**

- Move: `.claude/skills/openspec-*` → `.agent/skills/openspec-*`

- [ ] **Step 1: Move openspec-apply-change**

Run:

```bash
git mv .claude/skills/openspec-apply-change .agent/skills/openspec-apply-change
```

Expected: No output, files staged for rename

- [ ] **Step 2: Move openspec-archive-change**

Run:

```bash
git mv .claude/skills/openspec-archive-change .agent/skills/openspec-archive-change
```

Expected: No output, files staged for rename

- [ ] **Step 3: Move openspec-bulk-archive-change**

Run:

```bash
git mv .claude/skills/openspec-bulk-archive-change .agent/skills/openspec-bulk-archive-change
```

Expected: No output, files staged for rename

- [ ] **Step 4: Move openspec-continue-change**

Run:

```bash
git mv .claude/skills/openspec-continue-change .agent/skills/openspec-continue-change
```

Expected: No output, files staged for rename

- [ ] **Step 5: Move openspec-explore**

Run:

```bash
git mv .claude/skills/openspec-explore .agent/skills/openspec-explore
```

Expected: No output, files staged for rename

- [ ] **Step 6: Move openspec-ff-change**

Run:

```bash
git mv .claude/skills/openspec-ff-change .agent/skills/openspec-ff-change
```

Expected: No output, files staged for rename

- [ ] **Step 7: Move openspec-new-change**

Run:

```bash
git mv .claude/skills/openspec-new-change .agent/skills/openspec-new-change
```

Expected: No output, files staged for rename

- [ ] **Step 8: Move openspec-onboard**

Run:

```bash
git mv .claude/skills/openspec-onboard .agent/skills/openspec-onboard
```

Expected: No output, files staged for rename

- [ ] **Step 9: Move openspec-propose**

Run:

```bash
git mv .claude/skills/openspec-propose .agent/skills/openspec-propose
```

Expected: No output, files staged for rename

- [ ] **Step 10: Move openspec-sync-specs**

Run:

```bash
git mv .claude/skills/openspec-sync-specs .agent/skills/openspec-sync-specs
```

Expected: No output, files staged for rename

- [ ] **Step 11: Move openspec-verify-change**

Run:

```bash
git mv .claude/skills/openspec-verify-change .agent/skills/openspec-verify-change
```

Expected: No output, files staged for rename

- [ ] **Step 12: Verify all skills moved**

Run:

```bash
ls -1d .agent/skills/openspec-* | wc -l
```

Expected: `11`

- [ ] **Step 13: Verify .claude/skills no longer has OpenSpec directories**

Run:

```bash
ls -1d .claude/skills/openspec-* 2>&1
```

Expected: `ls: .claude/skills/openspec-*: No such file or directory`

---

## Task 4: Delete Duplicate Skills from .pi

**Files:**

- Delete: `.pi/skills/openspec-*` (11 directories)

- [ ] **Step 1: Remove openspec-apply-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-apply-change
```

Expected: `rm '.pi/skills/openspec-apply-change/...'` messages

- [ ] **Step 2: Remove openspec-archive-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-archive-change
```

Expected: `rm '.pi/skills/openspec-archive-change/...'` messages

- [ ] **Step 3: Remove openspec-bulk-archive-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-bulk-archive-change
```

Expected: `rm '.pi/skills/openspec-bulk-archive-change/...'` messages

- [ ] **Step 4: Remove openspec-continue-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-continue-change
```

Expected: `rm '.pi/skills/openspec-continue-change/...'` messages

- [ ] **Step 5: Remove openspec-explore from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-explore
```

Expected: `rm '.pi/skills/openspec-explore/...'` messages

- [ ] **Step 6: Remove openspec-ff-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-ff-change
```

Expected: `rm '.pi/skills/openspec-ff-change/...'` messages

- [ ] **Step 7: Remove openspec-new-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-new-change
```

Expected: `rm '.pi/skills/openspec-new-change/...'` messages

- [ ] **Step 8: Remove openspec-onboard from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-onboard
```

Expected: `rm '.pi/skills/openspec-onboard/...'` messages

- [ ] **Step 9: Remove openspec-propose from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-propose
```

Expected: `rm '.pi/skills/openspec-propose/...'` messages

- [ ] **Step 10: Remove openspec-sync-specs from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-sync-specs
```

Expected: `rm '.pi/skills/openspec-sync-specs/...'` messages

- [ ] **Step 11: Remove openspec-verify-change from .pi**

Run:

```bash
git rm -r .pi/skills/openspec-verify-change
```

Expected: `rm '.pi/skills/openspec-verify-change/...'` messages

- [ ] **Step 12: Verify .pi/skills is now empty**

Run:

```bash
ls -1 .pi/skills/
```

Expected: No output (directory empty)

---

## Task 5: Delete Duplicate Skills from .github

**Files:**

- Delete: `.github/skills/openspec-*` (11 directories)

- [ ] **Step 1: Remove openspec-apply-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-apply-change
```

Expected: `rm '.github/skills/openspec-apply-change/...'` messages

- [ ] **Step 2: Remove openspec-archive-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-archive-change
```

Expected: `rm '.github/skills/openspec-archive-change/...'` messages

- [ ] **Step 3: Remove openspec-bulk-archive-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-bulk-archive-change
```

Expected: `rm '.github/skills/openspec-bulk-archive-change/...'` messages

- [ ] **Step 4: Remove openspec-continue-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-continue-change
```

Expected: `rm '.github/skills/openspec-continue-change/...'` messages

- [ ] **Step 5: Remove openspec-explore from .github**

Run:

```bash
git rm -r .github/skills/openspec-explore
```

Expected: `rm '.github/skills/openspec-explore/...'` messages

- [ ] **Step 6: Remove openspec-ff-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-ff-change
```

Expected: `rm '.github/skills/openspec-ff-change/...'` messages

- [ ] **Step 7: Remove openspec-new-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-new-change
```

Expected: `rm '.github/skills/openspec-new-change/...'` messages

- [ ] **Step 8: Remove openspec-onboard from .github**

Run:

```bash
git rm -r .github/skills/openspec-onboard
```

Expected: `rm '.github/skills/openspec-onboard/...'` messages

- [ ] **Step 9: Remove openspec-propose from .github**

Run:

```bash
git rm -r .github/skills/openspec-propose
```

Expected: `rm '.github/skills/openspec-propose/...'` messages

- [ ] **Step 10: Remove openspec-sync-specs from .github**

Run:

```bash
git rm -r .github/skills/openspec-sync-specs
```

Expected: `rm '.github/skills/openspec-sync-specs/...'` messages

- [ ] **Step 11: Remove openspec-verify-change from .github**

Run:

```bash
git rm -r .github/skills/openspec-verify-change
```

Expected: `rm '.github/skills/openspec-verify-change/...'` messages

- [ ] **Step 12: Verify .github/skills is now empty**

Run:

```bash
ls -1 .github/skills/
```

Expected: No output (directory empty)

---

## Task 6: Create Symlinks in .claude/skills

**Files:**

- Create: `.claude/skills/openspec-*` symlinks → `../../.agent/skills/openspec-*`

- [ ] **Step 1: Create symlink for openspec-apply-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-apply-change openspec-apply-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 2: Create symlink for openspec-archive-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-archive-change openspec-archive-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 3: Create symlink for openspec-bulk-archive-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-bulk-archive-change openspec-bulk-archive-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 4: Create symlink for openspec-continue-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-continue-change openspec-continue-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 5: Create symlink for openspec-explore**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-explore openspec-explore && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 6: Create symlink for openspec-ff-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-ff-change openspec-ff-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 7: Create symlink for openspec-new-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-new-change openspec-new-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 8: Create symlink for openspec-onboard**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-onboard openspec-onboard && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 9: Create symlink for openspec-propose**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-propose openspec-propose && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 10: Create symlink for openspec-sync-specs**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-sync-specs openspec-sync-specs && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 11: Create symlink for openspec-verify-change**

Run:

```bash
cd .claude/skills && ln -s ../../.agent/skills/openspec-verify-change openspec-verify-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 12: Verify symlinks created**

Run:

```bash
ls -la .claude/skills/openspec-* | head -5
```

Expected: Lines showing `lrwxr-xr-x ... openspec-* -> ../../.agent/skills/openspec-*`

- [ ] **Step 13: Stage symlinks for git**

Run:

```bash
git add .claude/skills/openspec-*
```

Expected: No output, symlinks staged

---

## Task 7: Create Symlinks in .pi/skills

**Files:**

- Create: `.pi/skills/openspec-*` symlinks → `../../.agent/skills/openspec-*`

- [ ] **Step 1: Create symlink for openspec-apply-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-apply-change openspec-apply-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 2: Create symlink for openspec-archive-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-archive-change openspec-archive-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 3: Create symlink for openspec-bulk-archive-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-bulk-archive-change openspec-bulk-archive-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 4: Create symlink for openspec-continue-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-continue-change openspec-continue-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 5: Create symlink for openspec-explore**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-explore openspec-explore && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 6: Create symlink for openspec-ff-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-ff-change openspec-ff-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 7: Create symlink for openspec-new-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-new-change openspec-new-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 8: Create symlink for openspec-onboard**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-onboard openspec-onboard && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 9: Create symlink for openspec-propose**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-propose openspec-propose && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 10: Create symlink for openspec-sync-specs**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-sync-specs openspec-sync-specs && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 11: Create symlink for openspec-verify-change**

Run:

```bash
cd .pi/skills && ln -s ../../.agent/skills/openspec-verify-change openspec-verify-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 12: Verify symlinks created**

Run:

```bash
ls -la .pi/skills/openspec-* | head -5
```

Expected: Lines showing `lrwxr-xr-x ... openspec-* -> ../../.agent/skills/openspec-*`

- [ ] **Step 13: Stage symlinks for git**

Run:

```bash
git add .pi/skills/openspec-*
```

Expected: No output, symlinks staged

---

## Task 8: Create Symlinks in .github/skills

**Files:**

- Create: `.github/skills/openspec-*` symlinks → `../../.agent/skills/openspec-*`

- [ ] **Step 1: Create symlink for openspec-apply-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-apply-change openspec-apply-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 2: Create symlink for openspec-archive-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-archive-change openspec-archive-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 3: Create symlink for openspec-bulk-archive-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-bulk-archive-change openspec-bulk-archive-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 4: Create symlink for openspec-continue-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-continue-change openspec-continue-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 5: Create symlink for openspec-explore**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-explore openspec-explore && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 6: Create symlink for openspec-ff-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-ff-change openspec-ff-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 7: Create symlink for openspec-new-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-new-change openspec-new-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 8: Create symlink for openspec-onboard**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-onboard openspec-onboard && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 9: Create symlink for openspec-propose**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-propose openspec-propose && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 10: Create symlink for openspec-sync-specs**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-sync-specs openspec-sync-specs && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 11: Create symlink for openspec-verify-change**

Run:

```bash
cd .github/skills && ln -s ../../.agent/skills/openspec-verify-change openspec-verify-change && cd ../..
```

Expected: No output, symlink created

- [ ] **Step 12: Verify symlinks created**

Run:

```bash
ls -la .github/skills/openspec-* | head -5
```

Expected: Lines showing `lrwxr-xr-x ... openspec-* -> ../../.agent/skills/openspec-*`

- [ ] **Step 13: Stage symlinks for git**

Run:

```bash
git add .github/skills/openspec-*
```

Expected: No output, symlinks staged

---

## Task 9: Post-Migration Verification

**Files:**

- Verify: All symlinks resolve correctly and git tracks them

- [ ] **Step 1: Test symlink resolution in .claude**

Run:

```bash
ls -la .claude/skills/openspec-new-change/
```

Expected: Directory listing showing skill files (proves symlink works)

- [ ] **Step 2: Test file access through .claude symlink**

Run:

```bash
head -5 .claude/skills/openspec-new-change/skill.md
```

Expected: First 5 lines of skill.md content

- [ ] **Step 3: Test symlink resolution in .pi**

Run:

```bash
ls -la .pi/skills/openspec-new-change/
```

Expected: Directory listing showing skill files (proves symlink works)

- [ ] **Step 4: Test file access through .pi symlink**

Run:

```bash
head -5 .pi/skills/openspec-new-change/skill.md
```

Expected: First 5 lines of skill.md content

- [ ] **Step 5: Test symlink resolution in .github**

Run:

```bash
ls -la .github/skills/openspec-new-change/
```

Expected: Directory listing showing skill files (proves symlink works)

- [ ] **Step 6: Test file access through .github symlink**

Run:

```bash
head -5 .github/skills/openspec-new-change/skill.md
```

Expected: First 5 lines of skill.md content

- [ ] **Step 7: Verify git tracks symlinks**

Run:

```bash
git status --short | grep -E "skills/openspec-" | head -10
```

Expected: Lines showing renamed files and new symlinks (e.g., `R .claude/skills/openspec-apply-change -> .agent/skills/openspec-apply-change`)

- [ ] **Step 8: Count total staged changes**

Run:

```bash
git status --short | wc -l
```

Expected: Approximately 55 lines (11 renames + 11 deletions in .pi + 11 deletions in .github + 11 symlinks in .claude + 11 in .pi + 11 in .github - note: actual count may vary based on git's staging representation)

---

## Task 10: Commit Changes

**Files:**

- Commit all changes to git

- [ ] **Step 1: Review staged changes**

Run:

```bash
git status
```

Expected: Summary showing renamed directories, deleted directories, and new symlinks

- [ ] **Step 2: Create commit**

Run:

```bash
git commit -m "$(cat <<'EOF'
refactor: centralize OpenSpec skills under .agent/skills with symlinks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

Expected: Commit created with success message showing files changed

- [ ] **Step 3: Verify commit was created**

Run:

```bash
git log -1 --oneline
```

Expected: Latest commit shows "refactor: centralize OpenSpec skills under .agent/skills with symlinks"

- [ ] **Step 4: Verify working tree is clean**

Run:

```bash
git status
```

Expected: `nothing to commit, working tree clean`

---

## Task 11: Final Validation

**Files:**

- Validate: Complete migration success

- [ ] **Step 1: Count skills in .agent**

Run:

```bash
ls -1d .agent/skills/openspec-* | wc -l
```

Expected: `11`

- [ ] **Step 2: Count symlinks in .claude**

Run:

```bash
ls -1d .claude/skills/openspec-* | wc -l
```

Expected: `11`

- [ ] **Step 3: Count symlinks in .pi**

Run:

```bash
ls -1d .pi/skills/openspec-* | wc -l
```

Expected: `11`

- [ ] **Step 4: Count symlinks in .github**

Run:

```bash
ls -1d .github/skills/openspec-* | wc -l
```

Expected: `11`

- [ ] **Step 5: Verify .claude non-OpenSpec skills preserved**

Run:

```bash
ls -1d .claude/skills/* | grep -v openspec
```

Expected: Lists `code-review` and `debug-widget` directories

- [ ] **Step 6: Verify total file count reduced**

Run:

```bash
find . -path "*/.git" -prune -o -type f -path "*/skills/openspec-*" -print | wc -l
```

Expected: Approximately 1/3 of original count (only one copy in `.agent/skills/` instead of three copies)

- [ ] **Step 7: Document completion**

Success! OpenSpec skills are now centralized in `.agent/skills/` with symlinks from all agent-specific directories. The repository has a single source of truth for shared skills, and all agent tools can still access them from their expected locations.
