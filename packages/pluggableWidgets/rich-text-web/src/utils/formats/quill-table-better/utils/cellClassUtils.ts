// @ts-nocheck
/**
 * Utility functions for managing CSS classes on table cells
 * instead of inline styles for CSP compliance
 */

import type { Props } from "../types";
import { COLORS } from "../config";

// Available border widths
const BORDER_WIDTHS = ["0px", "1px", "2px", "3px", "4px", "5px"];

// Available border styles
const BORDER_STYLES = ["none", "dashed", "dotted", "double", "groove", "inset", "outset", "ridge", "solid"];

// Available padding values
const PADDINGS = ["0px", "2px", "4px", "6px", "8px", "10px", "12px", "14px", "16px", "18px", "20px"];

/**
 * Convert hex color to class name format
 * #000000 -> "000000"
 */
function colorToClassName(color: string): string {
    if (!color) return "";
    return color.replace("#", "").toLowerCase();
}

/**
 * Remove all classes matching a prefix from an element
 */
function removeClassesWithPrefix(element: HTMLElement, prefix: string): void {
    const classes = Array.from(element.classList);
    classes.forEach(className => {
        if (className.startsWith(prefix)) {
            element.classList.remove(className);
        }
    });
}

/**
 * Apply background color class to cell
 */
export function setCellBackgroundClass(element: HTMLElement, color: string): void {
    removeClassesWithPrefix(element, "ql-cell-bg-");
    if (color) {
        const className = `ql-cell-bg-${colorToClassName(color)}`;
        element.classList.add(className);
        element.dataset.cellBg = color;
    } else {
        delete element.dataset.cellBg;
    }
}

/**
 * Apply border color class to cell
 */
export function setCellBorderColorClass(element: HTMLElement, color: string): void {
    removeClassesWithPrefix(element, "ql-cell-border-color-");
    if (color) {
        const className = `ql-cell-border-color-${colorToClassName(color)}`;
        element.classList.add(className);
        element.dataset.cellBorderColor = color;
    } else {
        delete element.dataset.cellBorderColor;
    }
}

/**
 * Apply border width class to cell
 */
export function setCellBorderWidthClass(element: HTMLElement, width: string): void {
    removeClassesWithPrefix(element, "ql-cell-border-width-");
    if (width && BORDER_WIDTHS.includes(width)) {
        const className = `ql-cell-border-width-${width}`;
        element.classList.add(className);
        element.dataset.cellBorderWidth = width;
    } else {
        delete element.dataset.cellBorderWidth;
    }
}

/**
 * Apply border style class to cell
 */
export function setCellBorderStyleClass(element: HTMLElement, style: string): void {
    removeClassesWithPrefix(element, "ql-cell-border-style-");
    if (style && BORDER_STYLES.includes(style)) {
        const className = `ql-cell-border-style-${style}`;
        element.classList.add(className);
        element.dataset.cellBorderStyle = style;
    } else {
        delete element.dataset.cellBorderStyle;
    }
}

/**
 * Apply padding class to cell
 */
export function setCellPaddingClass(element: HTMLElement, padding: string): void {
    removeClassesWithPrefix(element, "ql-cell-padding-");
    if (padding && PADDINGS.includes(padding)) {
        const className = `ql-cell-padding-${padding}`;
        element.classList.add(className);
        element.dataset.cellPadding = padding;
    } else {
        delete element.dataset.cellPadding;
    }
}

/**
 * Apply all cell style classes at once
 */
export function setCellStyleClasses(element: HTMLElement, attrs: Props, useClasses: boolean = true): void {
    if (!useClasses) {
        // Use inline styles (legacy behavior)
        if (attrs["background-color"]) {
            element.style.setProperty("background-color", attrs["background-color"]);
        }
        if (attrs["border-color"]) {
            element.style.setProperty("border-color", attrs["border-color"]);
        }
        if (attrs["border-width"]) {
            element.style.setProperty("border-width", attrs["border-width"]);
        }
        if (attrs["border-style"]) {
            element.style.setProperty("border-style", attrs["border-style"]);
        }
        if (attrs["padding"]) {
            element.style.setProperty("padding", attrs["padding"]);
        }
        return;
    }

    // Use CSS classes (new behavior for CSP compliance)
    if (attrs["background-color"]) {
        setCellBackgroundClass(element, attrs["background-color"]);
    }
    if (attrs["border-color"]) {
        setCellBorderColorClass(element, attrs["border-color"]);
    }
    if (attrs["border-width"]) {
        setCellBorderWidthClass(element, attrs["border-width"]);
    }
    if (attrs["border-style"]) {
        setCellBorderStyleClass(element, attrs["border-style"]);
    }
    if (attrs["padding"]) {
        setCellPaddingClass(element, attrs["padding"]);
    }
}

/**
 * Read cell style values from classes and data attributes or inline styles
 */
export function getCellStyleFromClasses(element: HTMLElement, useClasses: boolean = true): Props {
    if (!useClasses) {
        // Read from inline styles (legacy behavior)
        const style = element.style;
        return {
            "background-color": style.getPropertyValue("background-color") || "",
            "border-color": style.getPropertyValue("border-color") || "",
            "border-width": style.getPropertyValue("border-width") || "",
            "border-style": style.getPropertyValue("border-style") || "",
            padding: style.getPropertyValue("padding") || ""
        };
    }

    // Read from data attributes (new behavior)
    return {
        "background-color": element.dataset.cellBg || "",
        "border-color": element.dataset.cellBorderColor || "",
        "border-width": element.dataset.cellBorderWidth || "",
        "border-style": element.dataset.cellBorderStyle || "",
        padding: element.dataset.cellPadding || ""
    };
}

/**
 * Check if a color is in the predefined palette
 */
export function isValidPaletteColor(color: string): boolean {
    if (!color) return true;
    const normalized = color.toLowerCase();
    return COLORS.some(c => c.toLowerCase() === normalized);
}
