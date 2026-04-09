# SkipLink Widget - AI Skill Document

## Overview

The SkipLink widget is a Mendix accessibility widget that provides keyboard users with the ability to skip directly to main content areas on a page, bypassing repetitive navigation elements. This is a critical WCAG 2.1 Level A accessibility requirement (Success Criterion 2.4.1 - Bypass Blocks).

## Core Functionality

### Purpose

- Allows keyboard users to bypass repetitive content (headers, navigation menus, etc.)
- Improves accessibility for screen reader users
- Provides quick navigation to important page sections
- Supports WCAG 2.1 AA compliance

### Behavior

1. **Hidden by default**: Skip links are positioned off-screen using CSS transforms
2. **Visible on focus**: When a user tabs to a skip link, the entire container slides into view
3. **Multiple targets**: Supports one main skip target plus multiple additional targets via a list
4. **Focus management**: Programmatically sets focus to the target element and ensures it's keyboard-accessible

## Architecture

### Component Structure

```
SkipLink.tsx (Container Component)
└── SkipLinkComponent.tsx (Presentation Component)
    ├── Portal Rendering (inserted as first child of #root)
    ├── Container Div (.widget-skip-link-container)
    │   ├── Main Skip Link (primary link)
    │   └── Additional Skip Links (from listContentId array)
```

**Separation of Concerns:**
- `SkipLink.tsx`: Container component, handles prop destructuring and passes to presentation component
- `SkipLinkComponent.tsx`: Presentation component, handles DOM manipulation, rendering, and user interactions

### Key Files

- **SkipLink.tsx**: Container component (default export)
- **components/SkipLinkComponent.tsx**: Presentation component with portal logic
- **SkipLink.xml**: Widget configuration (properties schema)
- **SkipLink.scss**: Styling with show/hide behavior
- **SkipLink.editorPreview.tsx**: Studio Pro preview rendering
- **SkipLinkProps.d.ts**: Generated TypeScript types from XML

## Configuration Properties

### XML Schema Properties

**Property Groups:**

- **Main skip link**: Configuration for the primary skip link
- **Additional skip links**: List of additional navigation targets
- **Customization**: Global settings like prefix text

**Individual Properties:**

1. **linkText** (string, default: "main content")
    - Text displayed for the main skip link (without prefix)
    - Combined with `skipToPrefix` to form complete link text
    - Example: "main content" becomes "Skip to main content"
    - User-configurable and translatable

2. **mainContentId** (string, optional)
    - ID of the main content element to jump to
    - If empty, widget searches for `<main>` tag
    - Fallback behavior ensures accessibility

3. **listContentId** (array of objects, optional)
    - List of additional skip link targets
    - Each item contains:
        - `LinkTextInList`: Custom text for the skip link (without prefix)
        - `contentIdInList`: Expression returning element ID (DynamicValue<string>)
    - All list items are rendered below the main skip link

4. **skipToPrefix** (string, default: "Skip to")
    - Prefix text used for ALL skip links (main + list items)
    - Allows translation/customization for internationalization
    - Applied to both main link and additional links
    - Example: Change to "Ga naar" for Dutch translation

### TypeScript Props Interface

```typescript
export interface SkipLinkContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    linkText: string;
    mainContentId: string;
    listContentId: ListContentIdType[];
    skipToPrefix: string;
}

export interface ListContentIdType {
    contentIdInList: DynamicValue<string>;
    LinkTextInList: string;
}
```

## Implementation Details

### Container Component Pattern

**SkipLink.tsx** (Container):
```typescript
export default function SkipLink(props: SkipLinkContainerProps): ReactElement {
    const { linkText, mainContentId, listContentId, skipToPrefix, class: className, tabIndex, name } = props;
    
    return (
        <SkipLinkComponent
            linkText={linkText}
            mainContentId={mainContentId}
            listContentId={listContentId}
            skipToPrefix={skipToPrefix}
            class={className}
            tabIndex={tabIndex}
            name={name}
        />
    );
}
```

**Benefits:**
- Clean separation of concerns
- Easier to test presentation logic
- Follows repository patterns (PopupMenu, TreeNode, LanguageSelector)

### Portal Rendering Strategy

**Why portals?**

- Skip links must be the **first focusable element** on the page
- React portals allow rendering outside the widget's natural DOM position
- Inserted as first child of `#root` element during useEffect

**Implementation:**
```typescript
const [linkRoot] = useState(() => document.createElement("div"));

useEffect(() => {
    const root = document.getElementById("root");
    if (root && root.firstElementChild) {
        root.insertBefore(linkRoot, root.firstElementChild);
    } else if (root) {
        root.appendChild(linkRoot);
    } else {
        console.error("No root element found on page");
    }
    
    return () => {
        linkRoot.remove(); // Cleanup on unmount
    };
}, [linkRoot]);
```

**Key improvements:**
- DOM manipulation in `useEffect` (not state initializer) prevents side effects during render
- Cleanup function removes portal element on unmount (prevents memory leaks)
- Error handling for missing root element

### Focus Management

**Target element focus logic:**

1. Find target element by ID (or `<main>` tag if no ID provided)
2. Store original `tabindex` attribute value
3. Temporarily set `tabindex="-1"` to make element focusable
4. Call `.focus()` on the element
5. Clean up temporary `tabindex` on blur event (if it wasn't originally present)

```typescript
function handleClick(event: MouseEvent, contentId?: string): void {
    event.preventDefault();
    const targetId = contentId || props.mainContentId;

    // Find element by ID or fallback to <main>
    let main: HTMLElement;
    if (targetId !== "") {
        const mainByID = document.getElementById(targetId);
        if (mainByID !== null) {
            main = mainByID;
        } else {
            console.error(`Element with id: ${targetId} not found on page`);
            return;
        }
    } else {
        main = document.getElementsByTagName("main")[0];
    }

    if (main) {
        // Store previous tabindex
        const prevTabIndex = main.getAttribute("tabindex");
        // Ensure main is focusable
        if (!main.hasAttribute("tabindex")) {
            main.setAttribute("tabindex", "-1");
        }
        main.focus();
        
        // Cleanup on blur if tabindex wasn't originally present
        if (prevTabIndex === null) {
            main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
        }
    } else {
        console.error("Could not find a main element on page and no mainContentId specified in widget properties.");
    }
}
```

### Performance Optimizations

**useMemo for Computed Strings:**
```typescript
// Main link text is memoized to prevent unnecessary recalculations
const mainLinkText = useMemo(
    () => `${skipToPrefix} ${linkText}`,
    [skipToPrefix, linkText]
);

// List item text computed inline (lightweight operation)
{listContentId
    .filter(item => item.contentIdInList.status === ValueStatus.Available && item.contentIdInList.value)
    .map((item, index) => {
        const contentId = item.contentIdInList.value!;
        const linkText = `${skipToPrefix} ${item.LinkTextInList}`;
        // ...
    })
}
```

**Key points:**
- Main link text uses `useMemo` as it's referenced in every render
- List items compute text inline (only rendered once per item)
- Filter before map to skip unavailable items early
```

### CSS Show/Hide Mechanism

**Key CSS properties:**

- **Container**: `transform: translateY(-120%)` hides off-screen
- **Focus trigger**: `:focus-within` pseudo-class shows entire container
- **Visual structure**: Flexbox column with border separators
- **Focus indicator**: `outline` with background highlight for keyboard accessibility

```scss
.widget-skip-link-container {
    transform: translateY(-120%); // Hidden by default
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
}

.widget-skip-link-container:focus-within {
    transform: translateY(0); // Visible when any link focused
}

.widget-skip-link {
    border-bottom: 1px solid $grey; // Separator lines
    text-decoration: none;
    
    &:last-child {
        border-bottom: none; // No border on last item
    }
}

.widget-skip-link:focus {
    outline: 2px solid var(--brand-secondary-light, $skp-brand-secondary-light); // Focus ring
    outline-offset: -2px; // Inside element bounds
    background-color: rgba(45, 186, 252, 0.1); // Subtle highlight
}
```

### List Item Rendering

**Filter-then-map pattern:**
```typescript
{listContentId
    .filter(
        item =>
            item.contentIdInList.status === ValueStatus.Available &&
            item.contentIdInList.value
    )
    .map((item, index) => {
        const contentId = item.contentIdInList.value!;
        const linkText = `${skipToPrefix} ${item.LinkTextInList}`;
        
        return (
            <a
                key={`${contentId}_${index}`}
                className={`widget-skip-link ${className}`}
                href={`#${contentId}`}
                tabIndex={tabIndex}
                onClick={e => handleClick(e, contentId)}
            >
                {linkText}
            </a>
        );
    })
}
```

**Key implementation notes:**
- Main link text: `${props.skipToPrefix} ${props.linkText}`
- List link text: `${props.skipToPrefix} ${item.LinkTextInList}`
- All links use the same prefix for consistency
- Filter validates `ValueStatus.Available` and truthy value before rendering
- Non-null assertion (`!`) safe after filter check

## Editor Preview
        !item.contentIdInList.value) {
        return null;
    }

    const contentId = item.contentIdInList.value;
    // Always use prefix + LinkTextInList (no fallback to contentId)
    const linkText = `${props.skipToPrefix} ${item.LinkTextInList}`;

    return (
        <a key={`${contentId}_${index}`} onClick={e => handleClick(e, contentId)}>
            {linkText}
        </a>
    );
})}
```

**Key implementation notes:**

- Main link text: `${props.skipToPrefix} ${props.linkText}`
- List link text: `${props.skipToPrefix} ${item.LinkTextInList}`
- All links use the same prefix for consistency
- No fallback to contentId - LinkTextInList should always be provided

## Editor Preview

### Preview Rendering Strategy

**Differences from runtime widget:**

- **Always visible**: `transform: "none"` and `position: "relative"`
- **Uses actual CSS classes**: `.widget-skip-link` (not `.widget-skip-link-preview`)
- **Shows all configured links**: Main + all list items
- **Displays prefix + text**: Shows how links will appear to users

```typescript
export const preview = (props: SkipLinkPreviewProps): ReactElement => {
    return (
        <div className="widget-skip-link-container"
             style={{ position: "relative", transform: "none" }}>
            <a className="widget-skip-link">
                {`${props.skipToPrefix} ${props.linkText}`}
            </a>
            {props.listContentId.map((item, index) => (
                <a key={index} className="widget-skip-link">
                    {`${props.skipToPrefix} ${item.LinkTextInList || item.contentIdInList}`}
                </a>
            ))}
        </div>
    );
};
```

## Accessibility Considerations

### WCAG Compliance

- **2.4.1 Bypass Blocks (Level A)**: Primary purpose of this widget
- **2.1.1 Keyboard (Level A)**: Fully keyboard accessible
- **2.4.3 Focus Order (Level A)**: Inserted as first focusable element
- **2.4.7 Focus Visible (Level AA)**: Clear focus indicator with outline

### Best Practices Implemented

1. **First in tab order**: Portal ensures skip link is first
2. **Visible on focus**: Clear visual indicator when focused
3. **Descriptive text**: User-configurable link text
4. **Multiple targets**: Supports complex page structures
5. **Fallback behavior**: Searches for `<main>` if no ID specified

## Common Use Cases

### Single Main Content Skip

```xml
<property key="skipToPrefix" value="Skip to" />
<property key="linkText" value="main content" />
<property key="mainContentId" value="main-content" />
<!-- Results in: "Skip to main content" -->
```

### Multiple Skip Targets

```xml
<property key="skipToPrefix" value="Skip to" />
<property key="linkText" value="main content" />
<property key="mainContentId" value="main-content" />
<property key="listContentId">
    <item>
        <LinkTextInList>navigation</LinkTextInList>
        <contentIdInList>{NavigationId}</contentIdInList>
    </item>
    <item>
        <LinkTextInList>search</LinkTextInList>
        <contentIdInList>{SearchId}</contentIdInList>
    </item>
</property>
<!-- Results in:
     "Skip to main content"
     "Skip to navigation"
     "Skip to search"
-->
```

### Translated Content (Dutch Example)

```xml
<property key="skipToPrefix" value="Ga naar" />
<property key="linkText" value="hoofdinhoud" />
<property key="listContentId">
    <item>
        <LinkTextInList>navigatie</LinkTextInList>
        <contentIdInList>{NavigationId}</contentIdInList>
    </item>
</property>
<!-- Results in:
     "Ga naar hoofdinhoud"
     "Ga naar navigatie"
-->
```

## Technical Constraints

### Mendix Platform Integration

- **DynamicValue handling**: Must check `ValueStatus.Available` before using expression values
- **Portal limitations**: Requires `#root` element to exist (standard in Mendix apps)
- **CSS scoping**: Uses BEM-style naming to avoid conflicts

### Browser Compatibility

- **Modern browsers**: Requires CSS transforms and flexbox (IE11+)
- **Focus management**: Uses standard DOM focus API
- **Event listeners**: Uses `{ once: true }` option for cleanup (modern browsers)

## Development Patterns

### Adding New Properties

1. Update `SkipLink.xml` with new property definition
2. Build widget to regenerate `SkipLinkProps.d.ts`
3. Use property in `SkipLink.tsx` component
4. Update `SkipLink.editorPreview.tsx` for Studio Pro preview
5. Add corresponding preview property handling

### Testing Considerations

- **Unit tests**: Mock Mendix `DynamicValue` and `ValueStatus`
- **Focus testing**: Use `waitFor` with RTL for async focus changes
- **Portal testing**: Query by text or role, not by container
- **Component separation**: Test container and presentation component separately
- **E2E tests**: Verify keyboard navigation and focus management

### Component Architecture Best Practices

**Why separate container and presentation:**
1. **Testability**: Presentation component can be tested in isolation
2. **Reusability**: Component logic separated from Mendix props
3. **Maintainability**: Clear separation of concerns
4. **Pattern consistency**: Follows repo standards (PopupMenu, TreeNode, LanguageSelector)

**Container responsibilities:**
- Prop destructuring
- Passing props to presentation component
- Default export for widget loader

**Presentation component responsibilities:**
- DOM manipulation (portal creation)
- User interactions (click handlers, focus management)
- Rendering logic
- Performance optimizations (useMemo, useCallback)

## Error Handling

### Graceful Degradation

1. **Element not found**: Logs console error, does not crash
2. **No main element**: Logs helpful error message
3. **Missing root**: Logs error but continues initialization
4. **Unavailable expressions**: Skips rendering that list item

### Console Errors

```typescript
// Element ID not found
console.error(`Element with id: ${targetId} not found on page`);

// No main element found
console.error("Could not find a main element on page and no mainContentId specified");

// No root element
console.error("No root element found on page");
```

## Future Enhancement Considerations

### Potential Improvements

1. **ARIA live regions**: Announce skip link activation to screen readers
2. **Configurable position**: Allow customizing skip link placement
3. **Animation options**: User-configurable slide-in animation
4. **Multiple instances**: Handle multiple skip link widgets on same page
5. **Landmark detection**: Auto-discover landmarks (nav, aside, footer)

### Extension Points

- Custom styling via `class` prop
- Custom positioning via `style` prop
- Event handlers for skip link activation (future feature)

## Summary for AI Agents

**What this widget does:**
Provides accessible skip navigation for keyboard users by rendering hidden links that become visible on focus and programmatically move focus to specified page sections.

**Key implementation details:**

- **Container/Presentation pattern**: Clean separation following repo standards
- Uses React portals to render as first DOM element
- DOM manipulation in `useEffect` with proper cleanup
- CSS transforms hide/show links on focus (`:focus-within` container)
- Supports multiple skip targets via dynamic list
- Handles focus management with temporary tabindex modification
- All skip links use configurable prefix + link text pattern
- Performance optimized with `useMemo` for computed values
- Fully translatable and customizable text
- Handles focus management with temporary tabindex modification
- All skip links use configurable prefix + link text pattern
- Fully translatable and customizable text

**When to use:**
Every Mendix page should have at least one skip link pointing to main content. Add additional skip links for complex pages with multiple content sections.

**Configuration pattern:**

- `skipToPrefix`: Global prefix for all links (e.g., "Skip to", "Ga naar")
- Main link: `prefix + linkText` (e.g., "Skip to" + "main content")
- List links: `prefix + LinkTextInList` (e.g., "Skip to" + "navigation")

**Common modifications:**

- Translating all text by changing `skipToPrefix` (e.g., "Ga naar" for Dutch)
- Adding more skip targets via `listContentId` array
- Changing individual link text via `linkText` and `LinkTextInList`
- Customizing styling (class, style props)
