/**
 * TSX Generator for Mendix Widget Components.
 *
 * Transforms a WidgetDefinition into valid TSX component code.
 * Uses pattern detection to select appropriate templates.
 */

import type { PropertyDefinition } from "./types";

/**
 * Widget patterns that determine TSX structure.
 */
export type WidgetPattern = "display" | "button" | "input" | "container" | "dataList";

/**
 * Result of TSX generation.
 */
export interface TsxGeneratorResult {
    /** Whether generation succeeded */
    success: boolean;

    /** Generated main component content (src/[Widget].tsx) */
    mainComponent?: string;

    /** Detected or specified widget pattern */
    pattern?: WidgetPattern;

    /** Error message (if failed) */
    error?: string;
}

/**
 * Detects the most appropriate widget pattern based on property types.
 *
 * Detection priority:
 * 1. Has datasource + widgets with dataSource ref → dataList
 * 2. Has widgets type → container
 * 3. Has attribute type → input
 * 4. Has only action + display props → button
 * 5. Otherwise → display
 */
export function detectWidgetPattern(properties: PropertyDefinition[]): WidgetPattern {
    const hasWidgets = properties.some(p => p.type === "widgets");
    const hasDatasource = properties.some(p => p.type === "datasource");
    const hasAttribute = properties.some(p => p.type === "attribute");
    const hasAction = properties.some(p => p.type === "action");

    // Check for dataList pattern (datasource + widgets that reference it)
    if (hasDatasource && hasWidgets) {
        const widgetProps = properties.filter(p => p.type === "widgets");
        const hasDataSourceRef = widgetProps.some(p => p.dataSource);
        if (hasDataSourceRef) {
            return "dataList";
        }
    }

    // Container pattern (has widgets but no datasource ref)
    if (hasWidgets) {
        return "container";
    }

    // Input pattern (has attribute for data binding)
    if (hasAttribute) {
        return "input";
    }

    // Button pattern (has action but no attribute binding)
    if (hasAction && !hasAttribute) {
        // Check if it's primarily action-focused (caption + action)
        const displayProps = properties.filter(
            p => p.type === "textTemplate" || p.type === "string" || p.type === "icon"
        );
        if (displayProps.length <= 2) {
            return "button";
        }
    }

    // Default to display pattern
    return "display";
}

/**
 * Generates the required imports based on property types.
 */
function generateImports(widgetName: string, properties: PropertyDefinition[], pattern: WidgetPattern): string {
    const imports: string[] = [];

    // Always need React with createElement (required for JSX in Mendix widgets)
    const reactImports = new Set<string>(["ReactElement", "createElement"]);

    // Check what hooks we need
    const hasAction = properties.some(p => p.type === "action");
    const hasAttribute = properties.some(p => p.type === "attribute");
    const hasDatasource = properties.some(p => p.type === "datasource");
    const hasIntegerAttribute = properties.some(
        p => p.type === "attribute" && p.attributeTypes?.some(t => ["Integer", "Long", "Decimal"].includes(t))
    );

    if (hasAction || hasAttribute) {
        reactImports.add("useCallback");
    }
    if (pattern === "container") {
        reactImports.add("useState");
    }

    imports.push(`import { ${Array.from(reactImports).sort().join(", ")} } from "react";`);

    // Mendix imports
    if (hasAction) {
        imports.push('import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";');
    }
    if (hasDatasource) {
        imports.push('import { ValueStatus } from "mendix";');
    }

    // Big.js for numeric attributes (Integer, Long, Decimal use Big internally)
    if (hasIntegerAttribute) {
        imports.push('import Big from "big.js";');
    }

    // Generated types import
    imports.push(`import { ${widgetName}ContainerProps } from "../typings/${widgetName}Props";`);

    // Styles import
    imports.push(`import "./ui/${widgetName}.css";`);

    return imports.join("\n");
}

/**
 * Generates value extraction code for a property.
 */
function generateValueExtraction(prop: PropertyDefinition): string {
    const key = prop.key;

    switch (prop.type) {
        case "textTemplate":
        case "expression":
            return `const ${key}Value = ${key}?.value ?? "";`;
        case "integer":
        case "decimal":
            return `const ${key}Value = ${key} ?? ${prop.defaultValue ?? 0};`;
        case "string":
            return `const ${key}Value = ${key} ?? "${prop.defaultValue ?? ""}";`;
        case "boolean":
            return `const ${key}Value = ${key} ?? ${prop.defaultValue ?? false};`;
        case "attribute":
            return `const ${key}Value = ${key}?.value;
    const ${key}ReadOnly = ${key}?.readOnly ?? false;`;
        case "datasource":
            return `const ${key}Items = ${key}?.items ?? [];
    const ${key}Loading = ${key}?.status !== ValueStatus.Available;`;
        default:
            return "";
    }
}

/**
 * Generates action handler code.
 */
function generateActionHandler(prop: PropertyDefinition): string {
    const key = prop.key;
    const handlerName = `handle${key.charAt(0).toUpperCase() + key.slice(1)}`;

    return `const ${handlerName} = useCallback(() => {
        executeAction(${key});
    }, [${key}]);

    const ${key}CanExecute = ${key}?.canExecute ?? false;`;
}

/**
 * Generates the Display pattern component.
 */
function generateDisplayPattern(widgetName: string, properties: PropertyDefinition[]): string {
    const imports = generateImports(widgetName, properties, "display");

    // Find relevant properties
    const valueProps = properties.filter(
        p => p.type === "textTemplate" || p.type === "string" || p.type === "expression"
    );
    const actionProps = properties.filter(p => p.type === "action");
    const enumProps = properties.filter(p => p.type === "enumeration");

    // Generate destructuring
    const allProps = [...valueProps, ...actionProps, ...enumProps];
    const propsToDestructure = ["class: className", "style", "tabIndex", ...allProps.map(p => p.key)];

    // Generate value extractions
    const valueExtractions = valueProps.map(generateValueExtraction).filter(Boolean);

    // Generate action handlers
    const actionHandlers = actionProps.map(generateActionHandler);

    // Determine main display value
    const mainValueProp = valueProps[0];
    const mainValue = mainValueProp ? `${mainValueProp.key}Value` : '""';

    // Determine if clickable
    const clickAction = actionProps.find(p => p.key.toLowerCase().includes("click") || p.key === "onClick");
    const isClickable = clickAction ? `${clickAction.key}CanExecute` : "false";
    const clickHandler = clickAction
        ? `handle${clickAction.key.charAt(0).toUpperCase() + clickAction.key.slice(1)}`
        : "undefined";

    return `${imports}

export default function ${widgetName}(props: ${widgetName}ContainerProps): ReactElement {
    const { ${propsToDestructure.join(", ")} } = props;

    ${valueExtractions.join("\n    ")}

    ${actionHandlers.join("\n\n    ")}

    const isClickable = ${isClickable};

    return (
        <div
            className={\`widget-${widgetName.toLowerCase()} \${className}\`}
            style={style}
            onClick={isClickable ? ${clickHandler} : undefined}
            tabIndex={isClickable ? tabIndex : undefined}
            role={isClickable ? "button" : undefined}
        >
            {${mainValue}}
        </div>
    );
}
`;
}

/**
 * Generates the Button pattern component.
 */
function generateButtonPattern(widgetName: string, properties: PropertyDefinition[]): string {
    const imports = generateImports(widgetName, properties, "button");

    // Find relevant properties
    const captionProp = properties.find(p => p.key === "caption" || p.key === "label" || p.type === "textTemplate");
    const actionProps = properties.filter(p => p.type === "action");
    const enumProps = properties.filter(p => p.type === "enumeration");

    // Generate destructuring
    const allProps = [captionProp, ...actionProps, ...enumProps].filter(Boolean) as PropertyDefinition[];
    const propsToDestructure = ["class: className", "style", "tabIndex", ...allProps.map(p => p.key)];

    // Generate action handlers
    const actionHandlers = actionProps.map(generateActionHandler);

    // Main action (onClick or first action)
    const mainAction = actionProps.find(p => p.key.toLowerCase().includes("click")) || actionProps[0];
    const mainHandler = mainAction
        ? `handle${mainAction.key.charAt(0).toUpperCase() + mainAction.key.slice(1)}`
        : "undefined";
    const isDisabled = mainAction ? `!${mainAction.key}CanExecute` : "true";

    // Caption
    const captionValue = captionProp ? `${captionProp.key}?.value ?? ""` : '""';

    return `${imports}

export default function ${widgetName}(props: ${widgetName}ContainerProps): ReactElement {
    const { ${propsToDestructure.join(", ")} } = props;

    ${actionHandlers.join("\n\n    ")}

    const isDisabled = ${isDisabled};

    return (
        <button
            className={\`widget-${widgetName.toLowerCase()} \${className}\`}
            style={style}
            onClick={${mainHandler}}
            tabIndex={tabIndex}
            disabled={isDisabled}
            type="button"
        >
            {${captionValue}}
        </button>
    );
}
`;
}

/**
 * Generates the Input pattern component.
 */
function generateInputPattern(widgetName: string, properties: PropertyDefinition[]): string {
    const imports = generateImports(widgetName, properties, "input");

    // Find relevant properties
    const attributeProps = properties.filter(p => p.type === "attribute");
    const mainAttribute = attributeProps[0];
    const actionProps = properties.filter(p => p.type === "action");
    const textProps = properties.filter(p => p.type === "textTemplate" || p.type === "string");

    // Generate destructuring
    const allProps = [...attributeProps, ...actionProps, ...textProps];
    const propsToDestructure = ["class: className", "style", "tabIndex", ...allProps.map(p => p.key)];

    // Determine input type based on attribute type
    const attrType = mainAttribute?.attributeTypes?.[0] ?? "String";
    let inputType = "text";
    if (attrType === "Integer" || attrType === "Long" || attrType === "Decimal") {
        inputType = "number";
    } else if (attrType === "Boolean") {
        inputType = "checkbox";
    }

    const mainKey = mainAttribute?.key ?? "value";

    // Find change action
    const changeAction = actionProps.find(p => p.key.toLowerCase().includes("change"));
    const changeHandler = changeAction ? true : false;

    // Determine if we need Big conversion for numeric attributes
    const usesBig = inputType === "number";
    const valueExtraction = usesBig ? `${mainKey}?.value?.toNumber() ?? 0` : `${mainKey}?.value ?? ""`;
    const valueConversion = usesBig ? `new Big(Number(event.target.value))` : `event.target.value`;

    return `${imports}

export default function ${widgetName}(props: ${widgetName}ContainerProps): ReactElement {
    const { ${propsToDestructure.join(", ")} } = props;

    const currentValue = ${valueExtraction};
    const isReadOnly = ${mainKey}?.readOnly ?? false;

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (${mainKey}?.status === "available" && !${mainKey}.readOnly) {
            ${mainKey}.setValue(${valueConversion});
        }${changeHandler ? `\n        executeAction(${changeAction?.key});` : ""}
    }, [${mainKey}${changeHandler ? `, ${changeAction?.key}` : ""}]);

    return (
        <input
            className={\`widget-${widgetName.toLowerCase()} \${className}\`}
            style={style}
            type="${inputType}"
            value={currentValue}
            onChange={handleInputChange}
            readOnly={isReadOnly}
            tabIndex={tabIndex}
        />
    );
}
`;
}

/**
 * Generates the Container pattern component.
 */
function generateContainerPattern(widgetName: string, properties: PropertyDefinition[]): string {
    const imports = generateImports(widgetName, properties, "container");

    // Find relevant properties
    const widgetProps = properties.filter(p => p.type === "widgets");
    const mainContent = widgetProps[0];
    const textProps = properties.filter(p => p.type === "textTemplate" || p.type === "string");
    const headerProp = textProps.find(p => p.key === "header" || p.key === "title") || textProps[0];
    const boolProps = properties.filter(p => p.type === "boolean");
    const collapsibleProp = boolProps.find(p => p.key === "collapsible");

    // Generate destructuring
    const allProps = [...widgetProps, ...textProps, ...boolProps];
    const propsToDestructure = ["class: className", "style", "tabIndex", ...allProps.map(p => p.key)];

    const contentKey = mainContent?.key ?? "content";
    const headerValue = headerProp ? `${headerProp.key}?.value` : "undefined";
    const isCollapsible = collapsibleProp?.key ?? "false";

    return `${imports}

export default function ${widgetName}(props: ${widgetName}ContainerProps): ReactElement {
    const { ${propsToDestructure.join(", ")} } = props;

    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = useCallback(() => {
        if (${isCollapsible}) {
            setIsOpen(prev => !prev);
        }
    }, [${isCollapsible}]);

    const headerValue = ${headerValue};

    return (
        <div className={\`widget-${widgetName.toLowerCase()} \${className}\`} style={style}>
            {headerValue && (
                <div
                    className="widget-${widgetName.toLowerCase()}-header"
                    onClick={handleToggle}
                    tabIndex={${isCollapsible} ? tabIndex : undefined}
                    role={${isCollapsible} ? "button" : undefined}
                    aria-expanded={${isCollapsible} ? isOpen : undefined}
                >
                    {headerValue}
                    {${isCollapsible} && <span className={\`widget-${widgetName.toLowerCase()}-toggle \${isOpen ? "open" : ""}\`}>▼</span>}
                </div>
            )}
            {isOpen && <div className="widget-${widgetName.toLowerCase()}-content">{${contentKey}}</div>}
        </div>
    );
}
`;
}

/**
 * Generates the Data List pattern component.
 */
function generateDataListPattern(widgetName: string, properties: PropertyDefinition[]): string {
    const imports = generateImports(widgetName, properties, "dataList");

    // Find relevant properties
    const datasourceProp = properties.find(p => p.type === "datasource");
    const widgetProps = properties.filter(p => p.type === "widgets");
    const contentProp = widgetProps.find(p => p.dataSource) || widgetProps[0];
    const textProps = properties.filter(p => p.type === "textTemplate" || p.type === "string");
    const emptyMessageProp = textProps.find(p => p.key.toLowerCase().includes("empty"));
    const actionProps = properties.filter(p => p.type === "action");
    const itemClickAction = actionProps.find(p => p.key.toLowerCase().includes("item"));

    // Generate destructuring
    const allProps = [datasourceProp, contentProp, emptyMessageProp, itemClickAction].filter(
        Boolean
    ) as PropertyDefinition[];
    const propsToDestructure = ["class: className", "style", ...allProps.map(p => p.key)];

    // Generate action handlers
    const actionHandlers = itemClickAction ? [generateActionHandler(itemClickAction)] : [];

    const dsKey = datasourceProp?.key ?? "dataSource";
    const contentKey = contentProp?.key ?? "content";
    const emptyMessage = emptyMessageProp ? `${emptyMessageProp.key}?.value ?? "No items"` : '"No items"';
    const itemHandler = itemClickAction
        ? `handle${itemClickAction.key.charAt(0).toUpperCase() + itemClickAction.key.slice(1)}`
        : "undefined";

    return `${imports}
import { ObjectItem } from "mendix";

export default function ${widgetName}(props: ${widgetName}ContainerProps): ReactElement {
    const { ${propsToDestructure.join(", ")} } = props;

    ${actionHandlers.join("\n\n    ")}

    // Loading state
    if (${dsKey}?.status !== ValueStatus.Available) {
        return (
            <div className={\`widget-${widgetName.toLowerCase()} widget-${widgetName.toLowerCase()}-loading \${className}\`} style={style}>
                Loading...
            </div>
        );
    }

    const items = ${dsKey}?.items ?? [];

    // Empty state
    if (items.length === 0) {
        return (
            <div className={\`widget-${widgetName.toLowerCase()} widget-${widgetName.toLowerCase()}-empty \${className}\`} style={style}>
                {${emptyMessage}}
            </div>
        );
    }

    return (
        <div className={\`widget-${widgetName.toLowerCase()} \${className}\`} style={style}>
            {items.map((item: ObjectItem) => (
                <div
                    key={item.id}
                    className="widget-${widgetName.toLowerCase()}-item"
                    onClick={${itemHandler}}
                >
                    {${contentKey}?.get(item)}
                </div>
            ))}
        </div>
    );
}
`;
}

/**
 * Generates the complete widget TSX from a widget definition.
 */
export function generateWidgetTsx(
    widgetName: string,
    properties: PropertyDefinition[],
    pattern?: WidgetPattern
): TsxGeneratorResult {
    try {
        // Detect pattern if not specified
        const detectedPattern = pattern ?? detectWidgetPattern(properties);

        let mainComponent: string;

        switch (detectedPattern) {
            case "display":
                mainComponent = generateDisplayPattern(widgetName, properties);
                break;
            case "button":
                mainComponent = generateButtonPattern(widgetName, properties);
                break;
            case "input":
                mainComponent = generateInputPattern(widgetName, properties);
                break;
            case "container":
                mainComponent = generateContainerPattern(widgetName, properties);
                break;
            case "dataList":
                mainComponent = generateDataListPattern(widgetName, properties);
                break;
            default:
                mainComponent = generateDisplayPattern(widgetName, properties);
        }

        return {
            success: true,
            mainComponent,
            pattern: detectedPattern
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
