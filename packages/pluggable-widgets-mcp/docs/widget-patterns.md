# Mendix Widget Patterns

This document provides reusable patterns for common widget types. Use these as templates when implementing widget components.

---

## Pattern: Display Widget

Display widgets show read-only data. Examples: Badge, Progress Bar, Label.

### Typical Properties

```json
{
  "properties": [
    { "key": "value", "type": "textTemplate", "caption": "Value" },
    { "key": "type", "type": "enumeration", "caption": "Style", "enumValues": [...] },
    { "key": "onClick", "type": "action", "caption": "On click", "required": false }
  ],
  "systemProperties": ["Name", "TabIndex", "Visibility"]
}
```

### TSX Structure

```tsx
import { ReactNode, useCallback } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { MyWidgetContainerProps } from "../typings/MyWidgetProps";
import "./ui/MyWidget.scss";

export default function MyWidget(props: MyWidgetContainerProps): ReactNode {
    const { value, type, onClick, tabIndex, class: className, style } = props;

    const handleClick = useCallback(() => {
        executeAction(onClick);
    }, [onClick]);

    const isClickable = onClick?.canExecute;

    return (
        <div
            className={`widget-mywidget widget-mywidget-${type} ${className}`}
            style={style}
            onClick={isClickable ? handleClick : undefined}
            tabIndex={isClickable ? tabIndex : undefined}
            role={isClickable ? "button" : undefined}
        >
            {value?.value ?? ""}
        </div>
    );
}
```

### SCSS Structure

```scss
.widget-mywidget {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;

    &-primary {
        background-color: var(--brand-primary);
        color: white;
    }

    &-secondary {
        background-color: var(--brand-secondary);
        color: white;
    }
}
```

---

## Pattern: Button Widget

Button widgets trigger actions on click. May include icons, loading states.

### Typical Properties

```json
{
    "properties": [
        { "key": "caption", "type": "textTemplate", "caption": "Caption" },
        { "key": "icon", "type": "icon", "caption": "Icon", "required": false },
        {
            "key": "buttonStyle",
            "type": "enumeration",
            "caption": "Style",
            "defaultValue": "primary",
            "enumValues": [
                { "key": "primary", "caption": "Primary" },
                { "key": "secondary", "caption": "Secondary" },
                { "key": "danger", "caption": "Danger" }
            ]
        },
        { "key": "onClick", "type": "action", "caption": "On click" }
    ],
    "systemProperties": ["Name", "TabIndex", "Visibility"]
}
```

### TSX Structure

```tsx
import { ReactNode, useCallback, KeyboardEvent } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { MyButtonContainerProps } from "../typings/MyButtonProps";
import "./ui/MyButton.scss";

export default function MyButton(props: MyButtonContainerProps): ReactNode {
    const { caption, icon, buttonStyle, onClick, tabIndex, class: className, style } = props;

    const handleClick = useCallback(() => {
        executeAction(onClick);
    }, [onClick]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
            }
        },
        [handleClick]
    );

    const isDisabled = !onClick?.canExecute;

    return (
        <button
            className={`widget-mybutton widget-mybutton-${buttonStyle} ${className}`}
            style={style}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={tabIndex}
            disabled={isDisabled}
            type="button"
        >
            {icon && <span className="widget-mybutton-icon">{/* render icon */}</span>}
            <span className="widget-mybutton-caption">{caption?.value ?? ""}</span>
        </button>
    );
}
```

### SCSS Structure

```scss
.widget-mybutton {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &-primary {
        background-color: var(--brand-primary);
        color: white;
    }

    &-secondary {
        background-color: transparent;
        border: 1px solid var(--brand-primary);
        color: var(--brand-primary);
    }

    &-danger {
        background-color: var(--brand-danger);
        color: white;
    }
}
```

---

## Pattern: Input Widget

Input widgets bind to entity attributes for data entry.

### Typical Properties

```json
{
    "properties": [
        {
            "key": "value",
            "type": "attribute",
            "caption": "Value",
            "attributeTypes": ["String"],
            "required": true
        },
        { "key": "placeholder", "type": "textTemplate", "caption": "Placeholder", "required": false },
        { "key": "readOnly", "type": "boolean", "caption": "Read-only", "defaultValue": false },
        { "key": "onChange", "type": "action", "caption": "On change", "required": false },
        { "key": "onEnter", "type": "action", "caption": "On enter", "required": false }
    ],
    "systemProperties": ["Name", "TabIndex", "Visibility"]
}
```

### TSX Structure

```tsx
import { ReactNode, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { MyInputContainerProps } from "../typings/MyInputProps";
import "./ui/MyInput.scss";

export default function MyInput(props: MyInputContainerProps): ReactNode {
    const { value, placeholder, readOnly, onChange, onEnter, tabIndex, class: className, style } = props;

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (value?.status === "available" && !value.readOnly) {
                value.setValue(event.target.value);
                executeAction(onChange);
            }
        },
        [value, onChange]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                executeAction(onEnter);
            }
        },
        [onEnter]
    );

    const isReadOnly = readOnly || value?.readOnly;

    return (
        <input
            className={`widget-myinput ${className}`}
            style={style}
            type="text"
            value={value?.value ?? ""}
            placeholder={placeholder?.value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            readOnly={isReadOnly}
            tabIndex={tabIndex}
        />
    );
}
```

### SCSS Structure

```scss
.widget-myinput {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: var(--brand-primary);
        box-shadow: 0 0 0 2px rgba(var(--brand-primary-rgb), 0.2);
    }

    &:read-only {
        background-color: var(--bg-color-secondary);
    }
}
```

---

## Pattern: Container Widget

Container widgets hold child widgets. Examples: Fieldset, Card, Accordion.

### Typical Properties

```json
{
    "properties": [
        { "key": "content", "type": "widgets", "caption": "Content" },
        { "key": "header", "type": "textTemplate", "caption": "Header", "required": false },
        { "key": "collapsible", "type": "boolean", "caption": "Collapsible", "defaultValue": false }
    ],
    "systemProperties": ["Name", "TabIndex", "Visibility"]
}
```

### TSX Structure

```tsx
import { ReactNode, useState, useCallback } from "react";
import { MyContainerContainerProps } from "../typings/MyContainerProps";
import "./ui/MyContainer.scss";

export default function MyContainer(props: MyContainerContainerProps): ReactNode {
    const { content, header, collapsible, tabIndex, class: className, style } = props;
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = useCallback(() => {
        if (collapsible) {
            setIsOpen(prev => !prev);
        }
    }, [collapsible]);

    return (
        <div className={`widget-mycontainer ${className}`} style={style}>
            {header?.value && (
                <div
                    className="widget-mycontainer-header"
                    onClick={handleToggle}
                    tabIndex={collapsible ? tabIndex : undefined}
                    role={collapsible ? "button" : undefined}
                    aria-expanded={collapsible ? isOpen : undefined}
                >
                    {header.value}
                    {collapsible && <span className={`widget-mycontainer-toggle ${isOpen ? "open" : ""}`}>▼</span>}
                </div>
            )}
            {isOpen && <div className="widget-mycontainer-content">{content}</div>}
        </div>
    );
}
```

### SCSS Structure

```scss
.widget-mycontainer {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: hidden;

    &-header {
        padding: 12px 16px;
        background-color: var(--bg-color-secondary);
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &[role="button"] {
            cursor: pointer;
        }
    }

    &-toggle {
        transition: transform 0.2s;

        &.open {
            transform: rotate(180deg);
        }
    }

    &-content {
        padding: 16px;
    }
}
```

---

## Pattern: Data List Widget

Data list widgets display items from a datasource.

### Typical Properties

```json
{
    "properties": [
        { "key": "dataSource", "type": "datasource", "caption": "Data source", "isList": true },
        { "key": "content", "type": "widgets", "caption": "Content", "dataSource": "dataSource" },
        { "key": "emptyMessage", "type": "textTemplate", "caption": "Empty message", "required": false },
        { "key": "onItemClick", "type": "action", "caption": "On item click", "required": false }
    ],
    "systemProperties": ["Name", "Visibility"]
}
```

### TSX Structure

```tsx
import { ReactNode, useCallback } from "react";
import { ValueStatus, ObjectItem } from "mendix";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { MyListContainerProps } from "../typings/MyListProps";
import "./ui/MyList.scss";

export default function MyList(props: MyListContainerProps): ReactNode {
    const { dataSource, content, emptyMessage, onItemClick, class: className, style } = props;

    // Loading state
    if (dataSource?.status !== ValueStatus.Available) {
        return (
            <div className={`widget-mylist widget-mylist-loading ${className}`} style={style}>
                Loading...
            </div>
        );
    }

    const items = dataSource?.items ?? [];

    // Empty state
    if (items.length === 0) {
        return (
            <div className={`widget-mylist widget-mylist-empty ${className}`} style={style}>
                {emptyMessage?.value ?? "No items"}
            </div>
        );
    }

    return (
        <div className={`widget-mylist ${className}`} style={style}>
            {items.map((item: ObjectItem) => (
                <div key={item.id} className="widget-mylist-item" onClick={() => executeAction(onItemClick)}>
                    {content?.get(item)}
                </div>
            ))}
        </div>
    );
}
```

### SCSS Structure

```scss
.widget-mylist {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-loading,
    &-empty {
        padding: 16px;
        text-align: center;
        color: var(--text-color-secondary);
    }

    &-item {
        padding: 12px;
        border: 1px solid var(--border-color);
        border-radius: 4px;

        &:hover {
            background-color: var(--bg-color-hover);
        }
    }
}
```

---

## Common Imports

Every widget typically needs these imports:

```tsx
// React
import { ReactNode, useCallback, useState } from "react";

// Mendix helpers
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ValueStatus } from "mendix";

// Generated types (from XML via pwt build)
import { MyWidgetContainerProps } from "../typings/MyWidgetProps";

// Styles
import "./ui/MyWidget.scss";
```

---

## Key Patterns

### Action Execution

Always use `executeAction` from the platform helpers:

```tsx
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

const handleClick = useCallback(() => {
    executeAction(props.onClick);
}, [props.onClick]);

// Check if action can execute
const isClickable = props.onClick?.canExecute;
```

### Attribute Value Handling

Check status before reading/writing:

```tsx
// Reading
const displayValue = props.value?.value ?? "";

// Writing
if (props.value?.status === "available" && !props.value.readOnly) {
    props.value.setValue(newValue);
}
```

### Loading States

Handle datasource loading:

```tsx
if (props.dataSource?.status !== ValueStatus.Available) {
    return <div>Loading...</div>;
}
```

### Accessibility

Always include proper accessibility attributes:

```tsx
<button
    tabIndex={props.tabIndex}
    aria-label={props.ariaLabel?.value}
    aria-pressed={isActive}
    role="button"
>
```

---

## File Structure

Standard widget file structure:

```
src/
├── MyWidget.tsx              # Main widget (entry point)
├── MyWidget.xml              # Property definitions
├── MyWidget.editorPreview.tsx # Studio Pro preview
├── components/
│   └── MyWidgetInner.tsx     # Reusable component (optional)
└── ui/
    └── MyWidget.scss         # Styles
```
