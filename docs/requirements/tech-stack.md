---
description:
globs:
alwaysApply: true
---

# Technology Stack and Project Structure

The Mendix pluggable widgets ecosystem leverages a modern web development tech stack combined with Mendix-specific tools and configurations. This document outlines the key technologies and the project structure.

## Core Technologies Used

- **TypeScript:** All widgets are written in TypeScript (.tsx files) to enforce type safety and improve maintainability.
- **React:** Widgets are implemented as React components, enabling a declarative UI model and rich state management.
- **SASS/SCSS:** Styling is done with SCSS, allowing use of variables, nesting, and integration with Atlas UI for theming.
- **Rollup:** The bundler used to compile widget code into a single optimized file. Rollup handles TypeScript, JSX, and SCSS while performing tree-shaking.
- **NPM (pnpm):** pnpm is used for package management, ensuring efficient dependency handling and consistent build environments.
- **Jest:** Used for unit testing widget logic and components.
- **RTL(react-testing-library):** Used for unit testing widget logic and components.
- **Linting/Formatting:** ESLint and Prettier enforce code style consistency.
- **Terminal:** The terminal should use powershell because the current OS is windows.

## Monorepo Structure and Packaging

- **Packages Folder:** All widget code resides under `packages/`, typically in `packages/pluggableWidgets/` with each widget in its own folder (e.g., `badge-button-web`, `datagrid-web`).
- **Shared Modules:** Common code and assets are stored in `packages/shared/`.
- **Modules and Actions:** Additional Mendix modules and JavaScript actions are organized in separate folders.
- **Atlas Integration:** Widgets reference Atlas UI classes for a consistent design without duplicating styles.
- **Configuration Files:** Root-level configuration files (e.g., lerna.json, package.json, .nvmrc) ensure consistent tooling.
- **Build Scripts:** Each widget package includes scripts for building, starting, and testing, using @mendix/pluggable-widgets-tools.
- **Testing Setup:** Unit tests reside in widget folders (e.g., `src/__tests__/`) and can be run collectively via pnpm test.

## Configuration and Code Standards

- **ESLint and Prettier:** Enforce code quality and style consistency.
- **Naming Conventions:**
    - React component files use PascalCase.
    - Widget folders use lowercase with hyphens ending with “-web”.
    - XML property keys use lowerCamelCase.
- **Atlas Styling Conventions:** Prefer Atlas UI classes over custom inline styles.
- **Versioning and Backward Compatibility:** Widgets follow semantic versioning and maintain compatibility with Mendix platform changes.
