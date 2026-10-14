import { Editor } from "@tiptap/react";
import { useEffect } from "react";
import { isSafeCssColor } from "../utils/helpers";

export interface DynamicTableStylesProps {
    editor: Editor | null;
}

export function DynamicTableStyles({ editor }: DynamicTableStylesProps): null {
    useEffect(() => {
        if (!editor) return;
        const currentRichTextScope = editor.view.dom;

        const updateStyles = (): void => {
            // Find all elements with data-background-color attribute
            const elements = currentRichTextScope.querySelectorAll<HTMLElement>("[data-background-color]");
            const colorsInUse = new Set<string>();

            elements.forEach(element => {
                const color = element.getAttribute("data-background-color");
                if (color && isSafeCssColor(color)) {
                    colorsInUse.add(color);
                    // Add color-specific class to element
                    const sanitizedColor = color.replace(/[^a-zA-Z0-9]/g, "");
                    const colorClass = `bg-color-${sanitizedColor}`;

                    if (!element.classList.contains(colorClass)) {
                        element.classList.add(colorClass);
                    }
                }
            });
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

    return null;
}
