---
description:
globs:
alwaysApply: true
---

# Web Widgets Repository – Product Requirements

## Purpose and Background

The Mendix Web Widgets repository is the home of all Mendix platform-supported pluggable web widgets and related modules. Its primary purpose is to provide a unified collection of reusable UI components that Mendix app developers can drop into their apps, ensuring consistency and high quality across projects. These widgets are built with Mendix's Pluggable Widgets API (introduced in Mendix 8 and enhanced in Mendix 9) and use modern web technologies (React, TypeScript, SASS) under the hood. Mendix pluggable widgets are essentially custom React components that integrate seamlessly into Mendix Studio Pro as if they were native widgets. By open-sourcing this repository, Mendix enables developers to learn from real examples and even contribute enhancements.

## Goals and Objectives

- **Comprehensive Widget Library:** Offer a broad range of common UI elements (grids, inputs, charts, etc.) as pluggable widgets so developers rarely need to build widgets from scratch. Each widget addresses a specific need (e.g., data grid for tabular data, color picker for color selection) with Mendix best practices in mind.
- **Consistency and Quality:** Ensure all widgets follow a consistent design language (Atlas UI design system) and coding standards. This makes the AI assistant's suggestions consistent with how a Mendix team member would implement features. Widgets adhere to Mendix's style and UX conventions, leading to a uniform experience across apps.
- **Ease of Use:** Simplify the usage of custom widgets in Mendix Studio Pro. Widgets appear in Studio Pro's toolbox with proper categorization (e.g., "Buttons", "Containers") and have intuitive properties editors defined via XML. Mendix developers can drag & drop these widgets and configure properties without writing code.
- **Reusability and Extensibility:** Provide widgets that are generic yet flexible. Many widgets offer customization via properties or design "appearance" options (often powered by Atlas classes or helper classes). For example, the Badge Button widget can be styled via preset classes (primary, info, warning, etc.) rather than creating new widgets for each style.
- **Maintainability:** As part of the platform, these widgets are maintained alongside Mendix updates. The repository is structured to facilitate testing (unit tests, E2E tests) and continuous integration. This ensures widgets remain compatible with new Mendix versions and quality regressions are caught early.

## Target Users

- **Primary:** Mendix application developers (both citizen and professional developers) using Mendix Studio Pro. They benefit from a rich set of ready-made widgets that can be configured visually.
- **Secondary:** Mendix R&D and community contributors. Mendix's engineering team maintains official widgets, and community developers can reference the code to learn conventions or contribute improvements. In this context, the AI assistant "learns" from these docs to help developers.

## Scope and Widget Coverage

This repository covers pluggable web widgets for Mendix (not native mobile widgets). The scope includes:

- **Form and Input Widgets:** E.g., Combo Box, Checkbox Set Selector, Date Picker – enhancing Mendix's default input components.
- **Display and Formatting Widgets:** E.g., Badge/Badge Button, Format String, Image Viewer – presenting data in formatted ways.
- **Containers and Layout Widgets:** E.g., Fieldset, Accordion, Tab widgets – for grouping and layout.
- **Data Display Widgets:** Most notably, Data Grid 2 for displaying records in a table with features like sorting and filtering.
- **Navigation/Actions Widgets:** E.g., Action Button and Events widget – connecting UI interactions to Mendix logic.
- **Integration & Utility Widgets:** E.g., HTML/JavaScript Snippet, Google Maps, Charts – extending Mendix with external integrations.

## Design System Alignment

All widgets align with Atlas UI, Mendix's design system. They use Atlas styling conventions (spacing, colors, fonts) and support design properties for easy styling changes. Widgets automatically adopt custom Atlas-based themes through standard class names and variables.

## Conclusion

The Web Widgets repository is critical to the Mendix ecosystem—bridging low-code ease with pro-code flexibility. It empowers developers with ready components while ensuring consistency and quality. For Cursor's AI assistant, these guidelines and conventions provide the necessary context to generate answers and code that align with Mendix widget development.
