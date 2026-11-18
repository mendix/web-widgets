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
   Set the MX_PROJECT_PATH environment variable to your test project's directory, you can ask what the project name running in Studio Pro is so that we can set the MX_PROJECT_PATH. The path is: /Users/<your-username>/Mendix/ProjectName, this path is always same for the macOS version of Studio Pro. For Windows version, the path is /Volumes/[C] Windows11/Users/<your-username>/Documents/ProjectName. example setting:
   Windows:

- export MX_PROJECT_PATH=/Volumes/[C] Windows11/Users/<your-username>/Documents/MyTestProject
- export MX_PROJECT_PATH=/Users/<your-username>/Mendix/MyTestProject

Run pnpm start to build and watch for changes.

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
    Run pnpm turbo build to produce an MPK file.

Test the MPK in a fresh Mendix project.

Update version numbers and changelogs before distribution.

Common Gotchas:

Ensure XML and TypeScript props match exactly.

Install all third-party dependencies.

Maintain case sensitivity in IDs and keys.

Clean up event listeners to avoid memory leaks.

Ensure compatibility with the target Mendix version.

### Github PR Template

When you open a PR (through `gh pr create` or similar), fill in `.github/pull_request_template.md`: the pull request type and the briefing sections (Why, What changed, Scope, Tradeoffs, Blast radius, Verification). Delete sections that don't apply and keep the body under ~40 lines. For the Blast radius section on non-trivial changes, use the `blast-radius` skill.
