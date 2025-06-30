import { useMemo } from "react";

type Params = {
    inputRef: React.RefObject<HTMLInputElement>;
    defaultValue: string | undefined;
};

export function useAccessibilityValues({ inputRef, defaultValue }: Params): {
    screenReaderInputCaption: string;
} {
    const screenReaderInputCaption = useMemo(() => {
        if (defaultValue && defaultValue.length > 0) {
            return defaultValue;
        }
        if (inputRef.current) {
            const headerColumnNode = inputRef.current?.closest("[role='columnheader']");
            if (headerColumnNode) {
                const headerColumnTitle = headerColumnNode.getAttribute("title");
                if (headerColumnTitle) {
                    return `Search ${headerColumnTitle}`;
                }
            }
        }
        return "";
    }, [defaultValue, inputRef, inputRef.current]);

    return {
        screenReaderInputCaption
    };
}
