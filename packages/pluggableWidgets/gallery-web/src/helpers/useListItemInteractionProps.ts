import { SelectionType } from "@mendix/widget-plugin-grid/selection";
import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";
import { removeAllRanges } from "@mendix/widget-plugin-grid/selection/utils";
import { ObjectItem } from "mendix";
import { useMemo } from "react";

type ListItemRole = "option" | "listitem";

export function getRole(selectionType: SelectionType): ListItemRole {
    if (selectionType === "Single" || selectionType === "Multi") {
        return "option";
    }

    return "listitem";
}

export function getAriaSelected(selectionType: SelectionType, selected: boolean): boolean | undefined {
    if (selectionType === "Single" || selectionType === "Multi") {
        return selected;
    }

    return undefined;
}

type ListItemHandlers = {
    onClick?: React.MouseEventHandler;
    onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
};

function optionProps(item: ObjectItem, selectionProps: ListOptionSelectionProps): ListItemHandlers {
    if (selectionProps.selectionType === "None") {
        return {};
    }

    return {
        onClick(event) {
            if (event.shiftKey) {
                removeAllRanges();
            }
            selectionProps.onSelect(item, event.shiftKey);
        },
        onKeyDown: selectionProps.onKeyDown,
        onKeyUp(event) {
            selectionProps.onKeyUp?.(event, item);
        }
    };
}

export function useListItemInteractionProps(
    item: ObjectItem,
    selectionProps: ListOptionSelectionProps
): ListItemHandlers {
    return useMemo(() => optionProps(item, selectionProps), [item, selectionProps]);
}
