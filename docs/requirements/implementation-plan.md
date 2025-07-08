---
description:
globs:
alwaysApply: true
---

# Implementation Plan for a New Pluggable Widget

This document outlines a step-by-step plan to design, build, test, and integrate a new pluggable widget in Mendix.

## 1. Planning and Requirements

- **Define the Widget's Purpose:** Clearly state what the widget does, its name (e.g., "ProgressCircle"), its category, target data, and required properties (e.g., value, maximum, showLabel, onClick).
- **Check Existing Patterns:** Review similar widgets for best practices and to avoid duplicating functionality.

## 2. Environment Setup

- **Prerequisites:** Install Node.js (using the version specified in the repository), Mendix Studio Pro.
- **Folder Structure:** Create a new package under `packages/pluggableWidgets/` in the monorepo or use a standalone directory.

4. Define Widget Properties in XML
   Edit the generated XML file (e.g., ProgressCircle.xml) to define properties and property groups.

Ensure property keys match the TypeScript props.

Do not change the widget's unique ID unless necessary.

5. Implement the React Component
   Modify the generated .tsx file to match the XML-defined properties.

Use Mendix API types (e.g., EditableValue, DynamicValue, ActionValue) correctly.

Implement basic rendering and add error/loading states.

Import SCSS for styling and use Atlas UI classes.

6. Build and Run in Studio Pro
   Set the MX_PROJECT_PATH environment variable to your test project's directory, you can ask what the project name running in Studio Pro is so that we can se the MX_PROJECT_PATH. The path is: /Users/rahman.unver/Mendix/ProjectName, this path is always same for the macOS version of Studio Pro. For Windows version, our path is /Volumes/[C] Windows11/Users/Rahman.Unver/Documents/ProjectName. example setting:
   Windows:

- export MX_PROJECT_PATH=/Volumes/[C] Windows11/Users/Rahman.Unver/Documents/DocumentViewerWidget
- export MX_PROJECT_PATH=/Users/rahman.unver/Mendix/RichTextTest

Run pnpm start (or npm start) to build and watch for changes.

In Studio Pro, synchronize the app directory to load the widget.

Place the widget on a test page and configure properties.

7. Iterative Development
   Develop and test iteratively.

Use browser developer tools for debugging.

Adjust XML and TS code as needed when adding new properties or handling edge cases.

8. Testing and Validation
   Write unit tests for critical logic using Jest, React Testing Library mainly.

Perform UI/functional testing within a Mendix project.

Test responsiveness, performance, and edge cases.

9. Documentation and Metadata
   Update the widget's README with usage instructions and limitations.

Ensure XML descriptions and property captions are clear.

Optionally, add an icon for the widget.

10. Packaging and Sharing
    Run npm run build to produce an MPK file.

Test the MPK in a fresh Mendix project.

Update version numbers and changelogs before distribution.

Common Gotchas:

Ensure XML and TypeScript props match exactly.

Install all third-party dependencies.

Maintain case sensitivity in IDs and keys.

Clean up event listeners to avoid memory leaks.

Ensure compatibility with the target Mendix version.

### Github PR Template

<!------STARTS HERE----->
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

<!-- New feature (non-breaking change which adds functionality)
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

<!--
Please uncomment and fill in the following section
to describe which part of the package needs to be tested
and how it can be tested.
-->
<!--
### What should be covered while testing?
-->

<!------ENDS HERE----->

Keep this template in mind if I ever ask you to open a PR through command console, Github CLI or similar.
