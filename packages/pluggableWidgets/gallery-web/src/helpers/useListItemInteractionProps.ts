import { ListOptionSelectionProps } from "@mendix/widget-plugin-grid/selection/useListOptionSelectionProps";
import { removeAllRanges } from "@mendix/widget-plugin-grid/selection/utils";
import { ObjectItem } from "mendix";
import { useMemo } from "react";

type ListItemRole = "option" | "listitem";

type ListItemAriaProps = {
    role: ListItemRole;
    "aria-selected": boolean | undefined;
    tabIndex: number | undefined;
};

type ListItemHandlers = {
    onClick?: React.MouseEventHandler;
    onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
};

type ListItemInteractionProps = ListItemHandlers & ListItemAriaProps;

export function getAriaProps(
    item: ObjectItem,
    { selectionType, isSelected }: ListOptionSelectionProps
): ListItemAriaProps {
    if (selectionType === "Single" || selectionType === "Multi") {
        return {
            role: "option",
            "aria-selected": isSelected(item),
            tabIndex: 0
        };
    }

    return {
        role: "listitem",
        "aria-selected": undefined,
        tabIndex: undefined
    };
}

function getHandlers(item: ObjectItem, selectionProps: ListOptionSelectionProps): ListItemHandlers {
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
        onKeyDown(event) {
            selectionProps.onKeyDown?.(event, item);
        },
        onKeyUp(event) {
            selectionProps.onKeyUp?.(event, item);
        }
    };
}

export function useListItemInteractionProps(
    item: ObjectItem,
    selectionProps: ListOptionSelectionProps
): ListItemInteractionProps {
    return {
        ...useMemo(() => getHandlers(item, selectionProps), [item, selectionProps]),
        ...getAriaProps(item, selectionProps)
    };
}
