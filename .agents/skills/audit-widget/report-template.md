# Report template

Write this to `packages/pluggableWidgets/<widget>/AUDIT.md`. Keep the headings and table columns, so reports from different runs and widgets can be compared.

```markdown
# Audit — <widget>

- **Package:** `@mendix/<widget>` v<version>
- **Audited:** <YYYY-MM-DD> at commit `<short sha>`
- **Min Mendix:** <marketplace.minimumMXVersion>
- **Coverage basis:** <"jest --coverage" | "structural (import analysis)">
- **mx-docs page:** `<path relative to mx-docs root>` | "not found" | "mx-docs repo unavailable"

## Categories

| Category                 | Findings | Critical | High | Medium | Low |
| ------------------------ | -------- | -------- | ---- | ------ | --- |
| Unit tests (UT)          | 0        | 0        | 0    | 0      | 0   |
| E2E tests (E2E)          | 0        | 0        | 0    | 0      | 0   |
| Performance (PERF)       | 0        | 0        | 0    | 0      | 0   |
| Dependencies (DEP)       | 0        | 0        | 0    | 0      | 0   |
| Security (SEC)           | 0        | 0        | 0    | 0      | 0   |
| Code smells (SMELL)      | 0        | 0        | 0    | 0      | 0   |
| Missing behaviours (BEH) | 0        | 0        | 0    | 0      | 0   |
| Public docs (DOCS)       | 0        | 0        | 0    | 0      | 0   |

## Summary

<3–6 sentences: overall health, the single biggest risk, and what to fix first. No filler.>

---

## Unit tests (UT)

| ID    | Severity | Finding        | Evidence      | Proposed fix                           |
| ----- | -------- | -------------- | ------------- | -------------------------------------- |
| UT-01 | High     | <one sentence> | `src/…tsx:42` | <what test to add and what it asserts> |

## E2E tests (E2E)

| ID     | Severity | Finding | Evidence | Proposed fix |
| ------ | -------- | ------- | -------- | ------------ |
| E2E-01 | High     |         |          |              |

## Performance (PERF)

| ID      | Severity | Finding | Trigger             | Evidence      | Proposed fix |
| ------- | -------- | ------- | ------------------- | ------------- | ------------ |
| PERF-01 | High     |         | <"every keystroke"> | `src/…tsx:88` |              |

## Dependencies (DEP)

| ID     | Severity | Package     | Current | Latest  | Kind     | Advisory                                 | Risk                                |
| ------ | -------- | ----------- | ------- | ------- | -------- | ---------------------------------------- | ----------------------------------- |
| DEP-01 | Low      | `downshift` | 7.6.2   | 9.4.0   | major    | —                                        | <breaking notes / React 18 compat>  |
| DEP-02 | High     | `<pkg>`     | <x.y.z> | <x.y.z> | advisory | `GHSA-xxxx-xxxx-xxxx` (fixed in <range>) | <is the vulnerable code reachable?> |

Skipped (workspace or platform-pinned): <list>

## Security (SEC)

| ID     | Severity | Finding | Source → sink                 | Exploit input                  | Evidence      | Proposed fix |
| ------ | -------- | ------- | ----------------------------- | ------------------------------ | ------------- | ------------ |
| SEC-01 | High     |         | <XML attribute → `innerHTML`> | `<img src=x onerror=alert(1)>` | `src/…tsx:31` |              |

## Code smells (SMELL)

| ID       | Severity | Finding | Evidence | Proposed fix |
| -------- | -------- | ------- | -------- | ------------ |
| SMELL-01 | Medium   |         |          |              |

## Missing behaviours (BEH)

| ID     | Severity | Finding | Contract source                   | Evidence | Proposed fix |
| ------ | -------- | ------- | --------------------------------- | -------- | ------------ |
| BEH-01 | High     |         | <XML prop / openspec / a11y rule> |          |              |

## Public docs (DOCS)

| ID      | Severity | Finding | Doc evidence               | Source of truth        | Proposed fix |
| ------- | -------- | ------- | -------------------------- | ---------------------- | ------------ |
| DOCS-01 | High     |         | `…/widgets/combobox.md:62` | `src/Combobox.xml:118` |              |

---

## Notes

- <shared-package concerns raised but out of scope>
- <checks that could not run, and why: no Docker, mxcli not installed, mx-docs missing>
```

## Field rules

- **Evidence** is a real `file:line` or a command name. Empty evidence means the finding should not exist.
- **Proposed fix** is one concrete action, not a discussion.
- Number IDs from `01` within each category, sorted by severity, Critical first.
- A category with no findings keeps its heading with the single line `No findings.`
- A category that could not run keeps its heading with `Skipped: <reason>.` and is listed in Notes.
- A High finding that may be Critical but has no proof gets _needs repro_ in its Finding cell.
- The counts in the Categories table must match the rows.
