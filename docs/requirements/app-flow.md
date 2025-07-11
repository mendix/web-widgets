---
description:
globs:
alwaysApply: true
---

# Pluggable Widget Lifecycle & Application Flow

Understanding how a pluggable widget moves from development to usage in Mendix Studio Pro is essential. This document breaks down the flow of creating, registering, configuring, building, and integrating a widget into Mendix Studio Pro.

## 1. Scaffold / Creation of a New Widget

Developers typically scaffold a new widget using the Mendix Pluggable Widget Generator. This generator creates:

- A package structure (e.g., `packages/pluggableWidgets/my-widget-web/`).
- Initial files: a TypeScript/TSX file for the React component, a corresponding XML configuration file, a README, and build configuration files.

Using the generator ensures correct conventions in folder layout, naming, and sample code.

## 2. Widget Registration via XML

Every widget has an XML file (e.g., `MyWidget.xml`) that:

- Defines a unique widget ID and name (following the namespace pattern).
- Specifies metadata for categorization in Studio Pro.
- Defines properties (inputs, outputs, events) including types and defaults.
- Includes system properties (e.g., Visibility, Tab index).

Studio Pro reads this XML to register the widget. Errors in the XML (such as duplicate IDs) prevent proper registration.

## 3. Development: Implementing and Configuring the Widget

After scaffolding and XML configuration:

- **Coding:** Implement the widget's functionality in a `.tsx` file using React. The component receives props corresponding to the XML-defined properties.
- **Styling:** Use appropriate CSS classes (preferably Atlas UI classes) rather than inline styles.
- **Configuration:** Test the widget by adding it to a page in Studio Pro and verifying that properties appear and function as defined.

Live reload is used during development to quickly reflect changes.

## 4. Build and Bundle

Using pnpm (or npm), developers:

- Run `pnpm install` to install dependencies.
- Set the `MX_PROJECT_PATH` to point to a Mendix test project.
- You can ask the name of the project, and then set `MX_PROJECT_PATH` dynamically, for example: `export MX_PROJECT_PATH="$HOME/Mendix/${PROJECT_NAME}"`. This way, whether you run `pnpm start` or `pnpm build`, the output is deployed to the correct Studio Pro project and we can immediately see the latest changes.
- Run `pnpm start` to build the widget using Rollup (compiling TypeScript and SCSS). The output is placed in the Mendix project's widget folder.

Rollup handles bundling into an optimized, single JavaScript file.

## 5. Integration into Mendix Studio Pro

Once built:

- **During Development:** The widget appears in Studio Pro's toolbox after synchronization. Developers can drag it onto pages and configure its properties.
- **Packaging:** For distribution, a production build generates an MPK (a ZIP package) that can be imported into any Mendix project.
- **At Runtime:** The Mendix Client instantiates the widget, passes the configured properties (as EditableValue, DynamicValue, ActionValue, etc.), and the widget renders its UI.

## 6. Summary of the Flow

1. **Design/Develop:** Write widget code and define properties in XML.
2. **Register:** XML registration makes the widget available in Studio Pro.
3. **Configure in App:** Drag the widget onto a page and set its properties.
4. **Build:** Compile using pnpm/Rollup.
5. **Run/Integrate:** Mendix client loads the widget with runtime data.
6. **Iteration:** Repeat as needed with live reload and synchronization.
