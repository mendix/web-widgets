# Mendix Widget Test Environment

A modern, interactive test environment for testing Mendix widgets independently without requiring a full Mendix runtime environment. Features a menu-driven interface with lazy loading and comprehensive mock implementations.

## Setup

1. **Navigate to the test environment directory:**

    ```bash
    cd packages/test/pluggableWidgets
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Start the development server:**

    ```bash
    pnpm start
    ```

4. **Open your browser:**
   The development server will automatically open your browser to `http://localhost:3001` where you can interact with the widget test environment.

## Features

### 📋 Interactive Menu Interface

- **Left Sidebar Menu**: Clean, intuitive widget selection
- **Dynamic Loading**: Widgets are lazy-loaded only when selected
- **Visual Feedback**: Selected state highlighting and hover effects

### 🎯 Supported Widgets

1. **Combobox Widget**: Multi-selection dropdown with association data source and filtering capabilities
2. **Checkbox Selection Widget**: Multi-selection checkbox group with association data source

### 🛠️ Comprehensive Mock System

- **Complete Mendix Type Mocks** (`src/mocks/mendix.ts`) - Full TypeScript interfaces matching Mendix platform types
- **Widget-Specific Mocks** (`src/mocks/combobox-props.ts`, `src/mocks/checkbox-radio-props.ts`) - Pre-configured widget properties
- **Mock Utilities** (`src/mocks/widget-tools.ts`) - Reusable mock creation functions
- **Filter Mocks** (`src/mocks/mendix-filters.ts`) - Mock implementations for Mendix filter builders

### ⚡ Key Features

- ✅ **Vite Development Server**: Fast development with HMR (Hot Module Replacement)
- ✅ **React Suspense**: Lazy loading with proper loading states
- ✅ **TypeScript Support**: Full type safety with proper Mendix type definitions
- ✅ **SCSS Styling**: Organized, maintainable styles with Atlas theme integration
- ✅ **Component Architecture**: Modular, reusable React components
- ✅ **Mock Data Handling**: Realistic widget behavior with comprehensive mock implementations

## Project Structure

```
packages/test/pluggableWidgets/
├── src/
│   ├── components/                 # React components
│   │   ├── WidgetDisplay.tsx       # Main widget display area
│   │   ├── WidgetMenu.tsx          # Left sidebar menu
│   │   ├── WidgetLoader.tsx        # Loading component
│   │   └── index.ts                # Component barrel exports
│   ├── config/
│   │   └── widgets.ts              # Widget configuration and types
│   ├── mocks/                      # Mock implementations
│   │   ├── mendix.ts               # Core Mendix type mocks
│   │   ├── mendix-filters.ts       # Filter builder mocks
│   │   ├── combobox-props.ts       # Combobox widget props
│   │   ├── checkbox-radio-props.ts # Checkbox selection props
│   │   └── widget-tools.ts         # Reusable mock utilities
│   ├── styles/                     # SCSS styling
│   │   ├── main-layout.scss        # Main app layout
│   │   ├── WidgetDisplay.scss      # Widget display styles
│   │   ├── WidgetMenu.scss         # Menu sidebar styles
│   │   ├── WidgetLoader.scss       # Loading component styles
│   │   └── theme.compiled.css      # Atlas theme styles
│   └── index.tsx                   # React app entry point
├── index.html                      # HTML template
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Available Scripts

- `pnpm start` - Start the Vite development server with hot module replacement
- `pnpm build` - Build the project for production using Vite
- `pnpm preview` - Preview the production build locally

## Adding New Widgets

To add new widgets to the test environment:

### 1. Add Widget Configuration

Edit `src/config/widgets.ts` to include your new widget:

```typescript
import { lazy } from "react";
import { mockMyWidgetProps } from "../mocks/my-widget-props";

const MyWidget = lazy(() => import("@mendix/my-widget-web/src/MyWidget"));

export const widgets: WidgetInfo[] = [
    // ... existing widgets
    {
        id: "mywidget",
        name: "My Custom Widget",
        description: "Description of my custom widget functionality.",
        component: MyWidget,
        props: mockMyWidgetProps
    }
];
```

### 2. Create Mock Props

Create a new file `src/mocks/my-widget-props.ts`:

```typescript
import { MyWidgetContainerProps } from "../../../pluggableWidgets/my-widget-web/typings/MyWidgetProps";
import { createDynamicValue, createMockObjectItems } from "./widget-tools";

export const mockMyWidgetProps: MyWidgetContainerProps = {
    name: "myWidget",
    id: "myWidget1"
    // ... configure all required properties using utility functions
};
```

## Mock Data Customization

The test environment provides utility functions for creating mock data in `src/mocks/widget-tools.ts`:

```typescript
// Create mock dynamic values
const title = createDynamicValue("My Widget Title");

// Create mock object items
const mockItems = createMockObjectItems(5, "item"); // Creates item1, item2, etc.

// Create mock editable values
const editableText = createEditableValue("Initial value");

// Create mock list values
const listData = createListValue(mockItems);

// Create mock reference values (single selection)
const singleRef = createReferenceValue(mockItems[0]);

// Create mock reference set values (multi-selection)
const multiRef = createReferenceSetValue([mockItems[0], mockItems[1]]);
```

## Development Experience

### 🔥 Hot Module Replacement (HMR)

- **Instant Updates**: Changes to React components update immediately without page refresh
- **State Preservation**: Component state is preserved during updates
- **Fast Iteration**: Rapid development cycle with sub-second rebuilds

### 🛠️ Debugging

- **Source Maps**: Debug original TypeScript source code in browser dev tools
- **React DevTools**: Full React component inspection support
- **Console Logging**: Comprehensive mock logging for understanding widget behavior

### 🎨 Styling

- **SCSS Support**: Organized, maintainable styling with proper nesting
- **Atlas Integration**: Uses compiled Atlas theme for authentic Mendix look and feel
- **Component-Scoped Styles**: Each component has its own dedicated stylesheet

## Technical Details

### Build System

- **Vite**: Ultra-fast build tool with native ES modules
- **TypeScript**: Full type safety with strict mode enabled
- **React 18**: Latest React features including Suspense and lazy loading

### Module Resolution

- **Custom Aliases**: Mendix modules are aliased to mock implementations
- **Workspace Support**: Resolves widgets from the monorepo structure
- **Dynamic Imports**: Lazy loading for optimal performance

### Mock Architecture

- **Type-Safe Mocks**: Full TypeScript interfaces matching Mendix APIs
- **Realistic Behavior**: Mocks simulate actual widget behavior patterns
- **Extensible Design**: Easy to add new mock implementations

## Troubleshooting

### Common Issues

1. **Module not found errors**

    - Ensure dependencies are installed: `pnpm install`
    - Check that widget packages exist in the monorepo

2. **TypeScript compilation errors**

    - Verify widget source code compiles: `pnpm build`
    - Check `tsconfig.json` for proper path mappings

3. **Styling issues**

    - Verify SCSS files are imported correctly
    - Check Atlas theme compilation in `styles/theme.compiled.css`

4. **Widget not rendering**

    - Check browser console for errors
    - Verify mock props are properly configured
    - Ensure lazy loading imports are correct

5. **Mock type errors**
    - Check that mock interfaces match actual widget prop types
    - Verify all required properties are provided in mock objects

### Port Conflicts

If port 3001 is already in use, change it in `vite.config.ts`:

```typescript
export default defineConfig({
    // ...
    server: {
        port: 3002, // Change to an available port
        open: true,
        host: true
    }
});
```

### Performance Issues

- Use `pnpm preview` to test production build performance
- Check browser dev tools for bundle size analysis
- Verify lazy loading is working correctly (check Network tab)
