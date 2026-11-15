<!--
IMPORTANT: Please read and follow instructions below on how to
open and submit your pull request.

REQUIRED STEPS:
1. Specify correct pull request type.
2. Write meaningful description.
3. Run `pnpm lint` and `pnpm test` in packages you changed and make sure they have no errors.
4. Add new tests (if needed) to cover new functionality.
5. Read checklist below.

CHECKLIST:
- Do you have a JIRA story for your pull request?
    - If yes, please format the PR title to match the `[XX-000]: description` pattern.
    - If no, please write your PR title using conventional commit rules.
- Does your change require mentioning in changelogs?
    - If yes, run `pnpm -w changelog` or update the `CHANGELOG.md` manually.
    - If no, ignore.
- Does your change touch XML, or is it a new feature or behavior?
    - If yes, if necessary, please create a PR with updates in the documentation (https://github.com/mendix/docs).
    - If no, ignore.
 - Is your change a bug fix or a new feature?
    - If yes, please describe in the Verification section what should be tested and what steps are needed to test it.
    - If no, ignore.
-->

<!--
What type of changes does your PR introduce?
Uncomment relevant sections below by removing `<!--` at the beginning of the line.
-->

### Pull request type

<!-- No code changes (changes to documentation, CI, metadata, etc.)
<!---->

<!-- Dependency changes (any modification to dependencies in `package.json`)
<!---->

<!-- Refactoring (e.g. file rename, variable rename, etc.)
<!---->

<!-- Bug fix (non-breaking change which fixes an issue)
<!---->

<!-- New feature (non-breaking change which adds functionality)
<!---->

<!-- Breaking change (fix or feature that would cause existing functionality to change)
<!---->

<!-- Test related change (New E2E test, test automation, etc.)
<!---->

---

<!--
A one-minute briefing for the reviewer, under ~40 lines. Delete sections that don't apply.
-->

### Why

<!-- The problem or goal, from the app developer's or user's point of view. Link the issue or JIRA story. -->

### What changed

<!-- The behavior change, not a file list. Name the key symbol, XML property or class when one carries the change. -->

### Scope

<!-- The packages touched, and anything deliberately left out of this PR. -->

### Tradeoffs

<!-- Only the alternatives you rejected that a reviewer would otherwise ask about. -->

### Blast radius

<!--
What else this could affect, and why it's safe: consuming widgets of a changed shared package,
XML contract for existing apps, CSS classes used by themes, modules bundling the widget.
Write "None outside <package>" when that's true.
-->

### Verification

<!--
What you ran (unit tests, e2e, manual check in a Mendix project) and what it showed.
For bug fixes and features: what QA should test, with steps.
-->
