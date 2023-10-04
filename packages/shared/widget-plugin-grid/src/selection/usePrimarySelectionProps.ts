import { useMemo } from "react";
import type { ObjectItem } from "mendix";
import { SelectionHelper } from "./helpers";

export type onSelect = (item: ObjectItem, shiftKey: boolean) => void;

export type onSelectAll = (requestedState?: "selectAll" | "deselectAll") => void;

export type isSelected = (item: ObjectItem) => boolean;

export type PrimarySelectionProps = {
    onSelect: onSelect;
    onSelectAll: onSelectAll;
    isSelected: isSelected;
};

const defaultProps: PrimarySelectionProps = {
    onSelect: () => undefined,
    onSelectAll: () => undefined,
    isSelected: () => false
};

export function usePrimarySelectionProps(selectionHelper: SelectionHelper | undefined): PrimarySelectionProps {
    return useMemo(() => {
        if (selectionHelper === undefined) {
            return defaultProps;
        }

        return {
            onSelect: (item, shiftKey) => {
                if (selectionHelper.type === "Multi" && shiftKey) {
                    selectionHelper.selectUpTo(item);
                } else if (selectionHelper.isSelected(item)) {
                    selectionHelper.remove(item);
                } else {
                    selectionHelper.add(item);
                }
            },
            onSelectAll(requestedState) {
                if (selectionHelper.type === "Single") {
                    console.warn("Datagrid: calling onSelectAll in single selection mode have no effect");
                    return;
                }

                if (requestedState === "selectAll") {
                    selectionHelper.selectAll();
                    return;
                }

                if (selectionHelper.selectionStatus === "all") {
                    selectionHelper.selectNone();
                } else {
                    selectionHelper.selectAll();
                }
            },
            isSelected: item => selectionHelper.isSelected(item)
        };
    }, [selectionHelper]);
}

// export function selectionSettings(props: SelectionProps, helper: SelectionHelper | undefined): SelectionSettings {
//     const { itemSelection, itemSelectionMethod, showSelectAllToggle } = props;
//     const isDesignMode = typeof itemSelection === "string";
//     const selectionOn = itemSelection !== undefined && itemSelection !== "None";
//     const multiselectable = isDesignMode ? itemSelection === "Multi" : itemSelection?.type === "Multi";
//     const methodCheckbox = itemSelectionMethod === "checkbox";
//     const selectAllOn = multiselectable && methodCheckbox && showSelectAllToggle;
//     const status = isDesignMode ? "none" : helper?.type === "Multi" ? helper.selectionStatus : undefined;

//     return {
//         selectionStatus: selectAllOn ? status : undefined,
//         selectionMethod: selectionOn ? itemSelectionMethod : "none",
//         multiselectable,
//         ariaMultiselectable: selectionOn ? multiselectable : undefined
//     };
// }

// export function getAriaSelected(
//     method: SelectionMethod,
//     item: ObjectItem,
//     isSelected: isSelected
// ): boolean | undefined {
//     if (method === "none") {
//         return;
//     }

//     return isSelected(item);
// }

// type KeyboardTargetProps = {
//     onKeyDown: React.KeyboardEventHandler<HTMLDivElement> | undefined;
//     onKeyUp: React.KeyboardEventHandler<HTMLDivElement> | undefined;
// };

// function setupSelectAllCommand(selectionMethod: SelectionMethod, onSelectAll: onSelectAll): KeyboardTargetProps {
//     if (selectionMethod === "none") {
//         return {
//             onKeyDown: undefined,
//             onKeyUp: undefined
//         };
//     }

//     let timerId: ReturnType<typeof setTimeout> | undefined;

//     function isCommandKeysPressed<T>(event: React.KeyboardEvent<T>): boolean {
//         return event.code === "KeyA" && (event.metaKey || event.ctrlKey);
//     }

//     function blockUserSelection(): void {
//         timerId = setTimeout(unblockUserSelection, 100);
//     }

//     function unblockUserSelection(): void {
//         if (timerId !== undefined) {
//             clearTimeout(timerId);
//         }
//     }

//     const props: KeyboardTargetProps = {
//         onKeyDown(event) {
//             if (isCommandKeysPressed(event) === false) {
//                 return;
//             }

//             blockUserSelection();
//         },
//         onKeyUp(event) {
//             if (isCommandKeysPressed(event) === false) {
//                 return;
//             }
//             onSelectAll("selectAll");
//             unblockUserSelection();
//         }
//     };

//     return props;
// }
