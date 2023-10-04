// import { useMemo } from "react";
// import type { ObjectItem } from "mendix";
// import { MultiSelectionStatus, SelectionHelper } from "@mendix/widget-plugin-grid/selection";
// import { DatagridContainerProps, DatagridPreviewProps, ItemSelectionMethodEnum } from "../../typings/DatagridProps";

// export interface SelectionProps {
//     itemSelection?: (DatagridContainerProps | DatagridPreviewProps)["itemSelection"];
//     itemSelectionMethod: ItemSelectionMethodEnum;
//     showSelectAllToggle: boolean;
// }

// export type SelectionMethod = ItemSelectionMethodEnum | "none";

// export type onSelectAllReqState = "selectAll" | "deselectAll";

// export type onSelect = (item: ObjectItem, shiftKey: boolean) => void;

// export type onSelectAll = (requestedState?: onSelectAllReqState) => void;

// export type isSelected = (item: ObjectItem) => boolean;

// export type SelectActionProps = {
//     onSelect: onSelect;
//     onSelectAll: onSelectAll;
//     isSelected: isSelected;
// };

// export type SelectionSettings = {
//     selectionStatus: MultiSelectionStatus | undefined;
//     selectionMethod: SelectionMethod;
//     multiselectable: boolean;
//     ariaMultiselectable: boolean | undefined;
// };

// // SelectActionProps & SelectionSettings

// const defaultProps: SelectActionProps = {
//     onSelect: () => undefined,
//     onSelectAll: () => undefined,
//     isSelected: () => false
// };

// export function useOnSelectProps(selection: SelectionHelper | undefined): SelectActionProps {
//     return useMemo(() => {
//         if (!selection) {
//             return defaultProps;
//         }

//         return {
//             onSelect: (item, shiftKey) => {
//                 shiftKey = shiftKey ?? false;

//                 if (selection.type === "Multi" && shiftKey) {
//                     selection.selectUpTo(item);
//                 } else if (selection.isSelected(item)) {
//                     selection.remove(item);
//                 } else {
//                     selection.add(item);
//                 }
//             },
//             onSelectAll(requestedState) {
//                 if (selection.type === "Single") {
//                     console.warn("Datagrid: calling onSelectAll in single selection mode have no effect");
//                     return;
//                 }

//                 if (requestedState === "selectAll") {
//                     selection.selectAll();
//                     return;
//                 }

//                 if (selection.selectionStatus === "all") {
//                     selection.selectNone();
//                 } else {
//                     selection.selectAll();
//                 }
//             },
//             isSelected: item => selection.isSelected(item)
//         };
//     }, [selection]);
// }

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
