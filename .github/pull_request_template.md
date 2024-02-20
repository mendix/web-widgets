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
- Does your change require a new version of the widget/module?
    - If yes, run `pnpm -w changelog` or update the `CHANGELOG.md` and bump the version manually.
    - If no, ignore.
- Do you have related PRs in other Mendix repositories?
    - If yes, please link all related pull requests in the description.
    - If no, ignore.
- Does your change touch XML, or is it a new feature or behavior?
    - If yes, if necessary, please create a PR with updates in the documentation (https://github.com/mendix/docs).
    - If no, ignore.
 - Is your change a bug fix or a new feature?
      - If yes, please add a description (last section in the template) of what should be tested and what steps are needed to test it.
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

New feature (non-breaking change which adds functionality)

<!---->

<!-- Breaking change (fix or feature that would cause existing functionality to change)
<!---->

<!-- Test related change (New E2E test, test automation, etc.)
<!---->

---

<!---
Describe your changes in detail.
Try to explain WHAT and WHY you change, fix or refactor.
-->

### Description

Added Load More as 3rd pagination type because sometimes we need load more button instead of virtual scrolling as we have in List View widget
so i have changed xml to add this option, just rendering this button when this type is selected with appropiate conditions and i have tested with cases like with filters applied or when there is no result etc and have taken care no other functionality is affected by my changes.
and it can be simple tested by selecting it from widget itself.
-->

Testing could cover scenarios like behavious when filters applied or when there is no result found.
-->
