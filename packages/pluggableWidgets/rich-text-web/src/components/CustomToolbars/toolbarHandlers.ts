import Quill from "quill";
import { MutableRefObject } from "react";

/**
 * give custom indent handler to use our custom "indent-left" and "indent-right" formats
 */
export function getIndentHandler(ref: MutableRefObject<Quill | null>): (value: any) => void {
    const customIndentHandler = (value: any): void => {
        const range = ref.current?.getSelection();
        // @ts-expect-error type error expected
        const formats = ref.current?.getFormat(range);
        if (formats) {
            const indent = parseInt((formats.indent as string) || "0", 10);
            if (value === "+1" || value === "-1") {
                let modifier = value === "+1" ? 1 : -1;
                if (formats.direction === "rtl") {
                    modifier *= -1;
                    ref.current?.format("indent-right", indent + modifier, Quill.sources.USER);
                } else {
                    ref.current?.format("indent-left", indent + modifier, Quill.sources.USER);
                }
            }
        }
    };

    return customIndentHandler;
}
