import { throttle } from "@mendix/widget-plugin-platform/utils/throttle";
import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { SelectionType } from "./types";
import { PrimarySelectionProps } from "./usePrimarySelectionProps";
import { removeAllRanges } from "./utils";

export type KeyboardTargetProps = {
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>, item: ObjectItem) => void;
};

const prefixSet = new Set(["MetaLeft", "MetaRight", "ControlLeft", "ControlRight"]);

function isPrefixKey<T>(event: React.KeyboardEvent<T>): boolean {
    return prefixSet.has(event.code);
}

function isSelectAllTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "KeyA" && (event.metaKey || event.ctrlKey);
}

function isSelectTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.shiftKey;
}

function isDirectChild(row: Element, cell: Element): boolean {
    return Array.from(row.children).includes(cell);
}

function preventScroll<T extends Element = Element>(event: React.KeyboardEvent<T>): void {
    if (event.code === "Space") {
        if (isDirectChild(event.currentTarget, event.target as Element) || event.target === event.currentTarget) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
}

function createKeyboardHandlers(
    selectionType: SelectionType,
    primaryProps: PrimarySelectionProps
): KeyboardTargetProps {
    if (selectionType === "None") {
        return {};
    }

    let shouldCleanup = false;

    function onSelectAllStart(): void {
        shouldCleanup = true;
        document.body.style.userSelect = "none";
        primaryProps.onSelectAll("selectAll");
    }

    function onSelectAllEnd(): void {
        abortSelectAll();
        shouldCleanup = false;
        setTimeout(() => {
            removeAllRanges();
            document.body.style.userSelect = "";
        }, 250);
    }

    const [runSelectAll, abortSelectAll] = throttle(onSelectAllStart, 500);

    const props: KeyboardTargetProps = {
        onKeyDown(event) {
            if (event.shiftKey) {
                removeAllRanges();
            }
            if (isSelectAllTrigger(event)) {
                runSelectAll();
            }
            // Prevent scroll on space.
            preventScroll(event);
        },
        onKeyUp(event, item) {
            if (shouldCleanup && (isPrefixKey(event) || event.code === "KeyA")) {
                onSelectAllEnd();
            }
            if (isSelectTrigger(event)) {
                primaryProps.onSelect(item, false);
            }

            // Prevent scroll on space.
            preventScroll(event);
        }
    };

    return props;
}
export function useKeyboardHandlers(
    selectionType: SelectionType,
    primaryProps: PrimarySelectionProps
): KeyboardTargetProps {
    return useMemo(() => createKeyboardHandlers(selectionType, primaryProps), [selectionType, primaryProps]);
}
