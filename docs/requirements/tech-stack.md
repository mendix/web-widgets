---
description:
globs:
alwaysApply: true
---

# Technology Stack and Project Structure

The Mendix pluggable widgets ecosystem leverages a modern web development tech stack combined with Mendix-specific tools and configurations. This document outlines the key technologies and the project structure.

## Core Technologies Used

- **TypeScript:** All widgets are written in TypeScript (.tsx files).
- **React:** Widgets are implemented as React components.
- **SASS/SCSS:** Styling is done with SCSS, allowing use of variables, nesting, and integration with Atlas UI for theming.
- **Pluggable widgets tools:** compiles widget code, runs unit tests, creates resulting MPKs. Handles TypeScript, JSX, and SCSS under the hood.
- **pnpm:** for package management.
- **Jest + RTL(react-testing-library):** for unit testing widget logic and components.
- **ESLint and Prettier:** enforce code style consistency.

## Monorepo Structure and Packaging

- **Atlas Integration:** Widgets reference Atlas UI classes for a consistent design without duplicating styles.
- **Build Scripts:** Each widget package includes scripts for building, starting, and testing, using @mendix/pluggable-widgets-tools.
- **Testing Setup:** Unit tests reside in widget folders (e.g., `src/__tests__/`).

## Configuration and Code Standards

- **Naming Conventions:**
    - React component files use PascalCase.
    - Widget folders use lowercase with hyphens ending with "-web".
    - XML property keys use lowerCamelCase.
- **Atlas Styling Conventions:** Prefer Atlas UI classes over custom inline styles.
- **Versioning and Backward Compatibility:** Widgets follow semantic versioning and maintain compatibility with Mendix platform changes.
