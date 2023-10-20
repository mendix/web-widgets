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
            if (event.code === "Space") {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        onKeyUp(event, item) {
            if (shouldCleanup && (isPrefixKey(event) || event.code === "KeyA")) {
                onSelectAllEnd();
            }
            if (isSelectTrigger(event)) {
                primaryProps.onSelect(item, false);
            }

            if (event.code === "Space") {
                event.preventDefault();
                event.stopPropagation();
            }
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
