# Mendix Web Widgets Repository - AI Agent Overview

This document provides a comprehensive overview of the Mendix Web Widgets repository structure and conventions for AI development assistants. This repository contains the official collection of pluggable web widgets for the Mendix low-code platform.

## Repository Overview

The **Mendix Web Widgets** repository is the official home of all Mendix platform-supported pluggable web widgets and related modules. These are reusable UI components built with modern web technologies (React, TypeScript, SCSS) that integrate seamlessly into Mendix Studio Pro applications.

### Key Characteristics
- **Monorepo structure** using pnpm workspaces and Turbo for build orchestration
- **Modern web stack**: TypeScript, React, SCSS, Jest, ESLint, Prettier
- **Mendix integration**: Built using Mendix Pluggable Widgets API
- **Atlas UI alignment**: Consistent with Mendix's design system
- **Comprehensive testing**: Unit tests (Jest/RTL), E2E tests (Playwright)

## Repository Structure

```
├── packages/
│   ├── pluggableWidgets/     # Main widget packages (*-web folders)
│   ├── modules/              # Mendix modules
│   ├── customWidgets/        # Custom widget implementations  
│   └── shared/               # Shared configurations and utilities
├── docs/
│   └── requirements/         # Detailed technical requirements (see below)
├── automation/               # Build and release automation
└── .github/                  # GitHub workflows and Copilot instructions
```

## Detailed Requirements Documentation

The `/docs/requirements/` folder contains comprehensive technical documentation for understanding and contributing to this repository. Each document covers specific aspects of the development process:

### Core Requirements and Guidelines

- **[Project Requirements Document](docs/requirements/project-requirements-document.md)** - High-level overview of repository purpose, goals, target users, and design system alignment
- **[Technology Stack and Project Structure](docs/requirements/tech-stack.md)** - Core technologies, monorepo structure, configuration standards, and development tools
- **[Frontend Guidelines](docs/requirements/frontend-guidelines.md)** - CSS/SCSS styling guidelines, naming conventions, component best practices, and Atlas UI integration

### Development Workflow and Integration

- **[Application Flow and Widget Lifecycle](docs/requirements/app-flow.md)** - Complete widget development lifecycle from scaffolding to Studio Pro integration
- **[Backend Structure and Data Flow](docs/requirements/backend-structure.md)** - Widget-to-Mendix runtime integration, data handling, and event management
- **[Implementation Plan](docs/requirements/implementation-plan.md)** - Step-by-step guide for creating new widgets, including PR templates and testing requirements

### Module Development

- **[Widget to Module Conversion](docs/requirements/widget-to-module.md)** - Guidelines for converting widgets to Mendix modules when appropriate

## Development Commands

Key commands for working with this repository:

- **`pnpm lint`** - Run linting across all packages
- **`pnpm test`** - Run unit tests across all packages  
- **`pnpm build`** - Build all packages
- **`pnpm -w changelog`** - Update changelogs
- **`pnpm -w version`** - Bump versions across packages

## AI Development Assistant Context

### For Code Reviews and PR Analysis
See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed PR review guidelines, including:
- Mendix-specific conventions and API usage
- React best practices and performance considerations
- Testing requirements (unit, component, E2E)
- Styling guidelines and Atlas UI integration
- Version management and changelog requirements

### For Code Development
When working on this repository, prioritize:

1. **Minimal changes** - Make surgical, precise modifications
2. **Mendix conventions** - Follow established patterns for XML configuration, TypeScript props, and data handling
3. **Testing coverage** - Ensure unit tests, component tests, and E2E tests as appropriate
4. **Atlas UI consistency** - Use Atlas classes and design tokens
5. **Performance** - Consider React render optimization and Mendix data efficiency

### Common Development Patterns

- **Widget Structure**: Each widget has XML configuration, TypeScript component, SCSS styling, and test files
- **Data Integration**: Use Mendix API objects (EditableValue, ActionValue, ListValue) correctly
- **Styling**: Prefer Atlas UI classes over custom styles; use SCSS for widget-specific styling
- **Testing**: Follow Jest + RTL for unit tests, Playwright for E2E testing

## Getting Started

1. **Prerequisites**: Node.js ≥22, pnpm 10.15.0
2. **Installation**: `pnpm install`
3. **Development**: Set `MX_PROJECT_PATH` environment variable to your Mendix project
4. **Building**: Use `pnpm build` or `pnpm start` for development builds
5. **Testing**: Use `pnpm test` for unit tests, `pnpm e2e` for E2E tests

For detailed implementation guidance, refer to the specific requirement documents linked above.