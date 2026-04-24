import { ClassAttributor, Scope } from "parchment";

/**
 * Custom Color ClassAttributor that supports hex colors via CSS classes
 * Converts hex colors like #ff5733 to class names like ql-color-ff5733
 */
class ColorClassAttributor extends ClassAttributor {
    add(node: HTMLElement, value: string): boolean {
        // Convert hex color to valid class name
        const sanitizedValue = this.sanitizeColorValue(value);

        // Dynamically inject CSS for this color if needed
        this.injectColorStyle(sanitizedValue, value);

        return super.add(node, sanitizedValue);
    }

    private sanitizeColorValue(color: string): string {
        // Remove # from hex colors and convert to lowercase
        return color.replace(/^#/, "").toLowerCase();
    }

    private injectColorStyle(className: string, color: string): void {
        // Check if style already exists
        const styleId = `rich-text-color-${className}`;
        if (document.getElementById(styleId)) return;

        // Only inject if it's a custom hex color (not in predefined palette)
        const predefinedColors = ["white", "red", "orange", "yellow", "green", "blue", "purple", "black"];
        if (predefinedColors.includes(className)) return;

        // Create CSS rule for custom color
        const cssRule = `.ql-color-${className} { color: ${color}; }`;

        // Inject style element
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = cssRule;
        document.head.appendChild(style);
    }
}

/**
 * Custom Background ClassAttributor that supports hex colors via CSS classes
 * Converts hex colors like #ff5733 to class names like ql-bg-ff5733
 */
class BackgroundClassAttributor extends ClassAttributor {
    add(node: HTMLElement, value: string): boolean {
        // Convert hex color to valid class name
        const sanitizedValue = this.sanitizeColorValue(value);

        // Dynamically inject CSS for this color if needed
        this.injectBackgroundStyle(sanitizedValue, value);

        return super.add(node, sanitizedValue);
    }

    private sanitizeColorValue(color: string): string {
        // Remove # from hex colors and convert to lowercase
        return color.replace(/^#/, "").toLowerCase();
    }

    private injectBackgroundStyle(className: string, color: string): void {
        // Check if style already exists
        const styleId = `rich-text-bg-${className}`;
        if (document.getElementById(styleId)) return;

        // Only inject if it's a custom hex color (not in predefined palette)
        const predefinedColors = ["white", "red", "orange", "yellow", "green", "blue", "purple", "black"];
        if (predefinedColors.includes(className)) return;

        // Create CSS rule for custom background color
        const cssRule = `.ql-bg-${className} { background-color: ${color}; }`;

        // Inject style element
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = cssRule;
        document.head.appendChild(style);
    }
}

export const ColorClass = new ColorClassAttributor("color", "ql-color", {
    scope: Scope.INLINE
});

export const BackgroundClass = new BackgroundClassAttributor("background", "ql-bg", {
    scope: Scope.INLINE
});
