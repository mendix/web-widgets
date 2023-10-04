import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { SelectionType } from "./types";
import { PrimarySelectionProps } from "./usePrimarySelectionProps";
import { removeAllRanges } from "./utils";

export type KeyboardTargetProps = {
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>, item: ObjectItem) => void;
};

function isSelectKeyBiding<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.shiftKey;
}

function isSelectAllKyeBiding<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "KeyA" && (event.metaKey || event.ctrlKey);
}

// One timerId for all Grids.
let timerId: ReturnType<typeof setTimeout> | undefined;

function removeTimer(): void {
    if (timerId !== undefined) {
        clearTimeout(timerId);
    }
}

function createKeyboardHandlers(
    selectionType: SelectionType,
    primaryProps: PrimarySelectionProps
): KeyboardTargetProps {
    if (selectionType === "None") {
        return {};
    }

    function onSelectAllEnd(): void {
        removeTimer();
        removeAllRanges();
        document.body.style.userSelect = "";
    }
    function onSelectAllStart(): void {
        removeTimer();
        timerId = setTimeout(onSelectAllEnd, 100);
        document.body.style.userSelect = "none";
    }

    const props: KeyboardTargetProps = {
        onKeyDown(event) {
            if (isSelectAllKyeBiding(event)) {
                onSelectAllStart();
            }
        },
        onKeyUp(event, item) {
            if (isSelectAllKyeBiding(event)) {
                primaryProps.onSelectAll("selectAll");
                event.preventDefault();
                return;
            }

            if (isSelectKeyBiding(event)) {
                primaryProps.onSelect(item, false);
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
