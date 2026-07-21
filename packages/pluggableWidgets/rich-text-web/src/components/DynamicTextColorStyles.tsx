import { useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { isSafeCssColor } from "../utils/helpers";

export interface DynamicTextColorStylesProps {
    editor: Editor | null;
}

export function DynamicTextColorStyles({ editor }: DynamicTextColorStylesProps): null {
    const styleElementRef = useRef<HTMLStyleElement | null>(null);
    const processedColorsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!editor) return;
        const currentRichTextScope = editor.view.dom;

        // Create style element if it doesn't exist
        if (!styleElementRef.current) {
            styleElementRef.current = currentRichTextScope.ownerDocument.createElement("style");
            styleElementRef.current.setAttribute("data-tiptap-text-color-styles", "");
            currentRichTextScope.ownerDocument.head.appendChild(styleElementRef.current);
        }

        const updateStyles = (): void => {
            if (!styleElementRef.current) return;

            // Find all elements with data-text-color attribute
            const elements = currentRichTextScope.ownerDocument.querySelectorAll<HTMLElement>("[data-text-color]");
            const colorsInUse = new Set<string>();

            elements.forEach(element => {
                const color = element.getAttribute("data-text-color");
                if (color && isSafeCssColor(color)) {
                    colorsInUse.add(color);
                    // Add color-specific class to element
                    const sanitizedColor = color.replace(/[^a-zA-Z0-9]/g, "");
                    const colorClass = `text-color-${sanitizedColor}`;

                    if (!element.classList.contains(colorClass)) {
                        element.classList.add(colorClass);
                    }
                }
            });

            // Generate CSS rules only for colors that are actually in use
            const cssRules: string[] = [];
            colorsInUse.forEach(color => {
                const sanitizedColor = color.replace(/[^a-zA-Z0-9]/g, "");
                cssRules.push(`.text-color-${sanitizedColor} { color: ${color} !important; }`);
            });

            // Update style element
            styleElementRef.current.textContent = cssRules.join("\n");

            // Update processed colors reference
            processedColorsRef.current = colorsInUse;
        };

        // Update styles on editor update
        editor.on("update", updateStyles);
        editor.on("selectionUpdate", updateStyles);

        // Initial update
        updateStyles();

        // Cleanup
        return () => {
            editor.off("update", updateStyles);
            editor.off("selectionUpdate", updateStyles);
        };
    }, [editor]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (styleElementRef.current && styleElementRef.current.parentNode) {
                styleElementRef.current.parentNode.removeChild(styleElementRef.current);
            }
        };
    }, []);

    return null;
}
