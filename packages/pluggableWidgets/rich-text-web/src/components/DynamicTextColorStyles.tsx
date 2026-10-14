import { Editor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { isSafeCssColor } from "../utils/helpers";

export interface DynamicTextColorStylesProps {
    editor: Editor | null;
}

export function DynamicTextColorStyles({ editor }: DynamicTextColorStylesProps): null {
    const processedColorsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!editor) return;
        const currentRichTextScope = editor.view.dom;

        const updateStyles = (): void => {
            // if (!styleElementRef.current) return;

            // Find all elements with data-text-color attribute
            const elements = currentRichTextScope.querySelectorAll<HTMLElement>("[data-text-color]");
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

    return null;
}
