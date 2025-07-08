---
description:
globs:
alwaysApply: true
---

# Frontend Guidelines for Mendix Pluggable Widgets

This guide provides best practices for front-end development in Mendix pluggable widgets, focusing on styling, component structure, naming, and Atlas design system usage. The goal is to ensure consistent, maintainable widget development.

## CSS and SCSS Styling Guidelines

- **Use SCSS for Styles:** Write all widget styles in SCSS files to leverage variables, mixins, and integration with the overall theme.
- **No Inline Styles for Static Design:** Avoid using inline styles. Instead, assign CSS classes defined in SCSS or use Atlas classes.
- **Leverage Atlas UI Classes:** Utilize predefined Atlas classes (e.g., `btn`, `badge`) to ensure a consistent look.
- **Scoped vs Global Styles:** Prefix custom classes with the widget name (e.g., `.widget-combobox`) to avoid conflicts.
- **Responsive Design:** Use relative units and media queries to ensure the widget adapts gracefully to different screen sizes.
- **Avoid Deep Nesting:** Write clear, maintainable CSS without over-nesting or using `!important` unless absolutely necessary.
- **Design Properties and Conditional Classes:** Implement design properties via toggling classes based on user selections in Studio Pro.

## Naming Conventions (Files, Classes, and Components)

- **Component and File Names:** Use PascalCase for React component files (e.g., `ProgressBar.tsx`).
- **Widget Folder Naming:** Use lowercase names with hyphens ending with "web" (e.g., `badge-button-web`).
- **XML Keys and Attribute Names:** Use lowerCamelCase for XML property keys.
- **CSS Class Naming:** Follow a BEM-like convention for custom classes to maintain structure and clarity.

## Component Best Practices

- **Mendix Data API Usage:** Use Mendix API objects (EditableValue, ActionValue, etc.) correctly, checking conditions such as `canExecute` before calling actions.
- **State Management:** Use React state for UI-specific state and rely on Mendix props for persistent data. There are usages of Context and State management tools(mobx)
- **Performance Considerations:** Optimize renders, avoid heavy computations, and consider memoization.
- **Clean Up:** Ensure any event listeners or timers are cleaned up appropriately.
- **No Direct DOM Manipulation:** Use React's state and props to drive UI changes rather than direct DOM queries.
- **Accessibility:** Use semantic HTML, proper ARIA attributes, and ensure keyboard navigation is supported.

## Using Atlas UI and Theming

- **Consistent Look and Feel:** Ensure widgets integrate with Atlas UI by using default Atlas classes for common elements.
- **Custom Themes Support:** Build widgets so that they naturally adopt custom Atlas themes without hard-coded values.
- **Layout and Sizing:** Use flexible layouts (e.g., percentage widths, flexbox) that adapt to container sizes.
- **No Overriding Atlas Core Classes:** Do not override core Atlas classes; wrap widget elements if custom styling is needed.
- **Example – Consistent Button:** Use `<button class="btn btn-secondary" type="button">Click</button>` instead of custom-styled divs.
