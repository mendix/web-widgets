# Report template

Write this to `packages/<type>/<widget>/AUDIT.md`. Keep the exact headings and table columns — Phase 2 parses this file to resume.

```markdown
# Audit — <widget>

- **Package:** `@mendix/<widget>` v<version>
- **Audited:** <YYYY-MM-DD>
- **Min Mendix:** <marketplace.minimumMXVersion>
- **Coverage basis:** <"jest --coverage" | "structural (import analysis)">
- **mx-docs page:** `<path relative to mx-docs root>` | "not found" | "mx-docs repo unavailable"

## Categories

| Category                               | Status  | Findings | Critical | High | Medium | Low |
| -------------------------------------- | ------- | -------- | -------- | ---- | ------ | --- |
| Unit tests (`unit-tests`, UT)          | pending | 0        | 0        | 0    | 0      | 0   |
| E2E tests (`e2e-tests`, E2E)           | pending | 0        | 0        | 0    | 0      | 0   |
| Performance (`performance`, PERF)      | pending | 0        | 0        | 0    | 0      | 0   |
| Dependencies (`dependencies`, DEP)     | pending | 0        | 0        | 0    | 0      | 0   |
| Code smells (`smells`, SMELL)          | pending | 0        | 0        | 0    | 0      | 0   |
| Missing behaviours (`behaviours`, BEH) | pending | 0        | 0        | 0    | 0      | 0   |
| Public docs (`docs`, DOCS)             | pending | 0        | 0        | 0    | 0      | 0   |

Status values: `pending` · `in-progress` · `done` · `skipped`

## Summary

<3–6 sentences: overall health, the single biggest risk, and what to fix first. No filler.>

---

## Unit tests (UT)

| ID    | Severity | Finding        | Evidence      | Proposed fix                           | Status |
| ----- | -------- | -------------- | ------------- | -------------------------------------- | ------ |
| UT-01 | High     | <one sentence> | `src/…tsx:42` | <what test to add and what it asserts> | open   |

## E2E tests (E2E)

| ID     | Severity | Finding | Evidence | Proposed fix | Status |
| ------ | -------- | ------- | -------- | ------------ | ------ |
| E2E-01 | High     |         |          |              | open   |

## Performance (PERF)

| ID      | Severity | Finding | Trigger             | Evidence      | Proposed fix | Status |
| ------- | -------- | ------- | ------------------- | ------------- | ------------ | ------ |
| PERF-01 | High     |         | <"every keystroke"> | `src/…tsx:88` |              | open   |

## Dependencies (DEP)

| ID     | Package     | Current | Latest | Kind  | Risk                               | Status |
| ------ | ----------- | ------- | ------ | ----- | ---------------------------------- | ------ |
| DEP-01 | `downshift` | 7.6.2   | 9.4.0  | major | <breaking notes / React 18 compat> | open   |

Skipped (workspace or platform-pinned): <list>

## Code smells (SMELL)

| ID       | Severity | Finding | Evidence | Proposed fix | Status |
| -------- | -------- | ------- | -------- | ------------ | ------ |
| SMELL-01 | Medium   |         |          |              | open   |

## Missing behaviours (BEH)

| ID     | Severity | Finding | Contract source                   | Evidence | Proposed fix | Status |
| ------ | -------- | ------- | --------------------------------- | -------- | ------------ | ------ |
| BEH-01 | High     |         | <XML prop / openspec / a11y rule> |          |              | open   |

## Public docs (DOCS)

| ID      | Severity | Finding | Doc evidence               | Source of truth        | Proposed fix | Status |
| ------- | -------- | ------- | -------------------------- | ---------------------- | ------------ | ------ |
| DOCS-01 | High     |         | `…/widgets/combobox.md:62` | `src/Combobox.xml:118` |              | open   |

---

## Notes

- <shared-package concerns raised but out of scope>
- <checks that could not run, and why: no Docker, no mxcli, test project missing>

## Log

- <YYYY-MM-DD> — audit created (<N> findings)
```

## Field rules

- **Status per finding**: `open` → `fixed` | `skipped` | `stale`. Never delete a row; the history is the value.
- **Evidence** is a real `file:line` or a command name. Empty evidence means the finding should not exist.
- **Proposed fix** is one concrete action, not a discussion.
- Keep the counts in the Categories table in sync whenever you add, drop, or resolve a finding.
- Sort findings within a category by severity, Critical first.
