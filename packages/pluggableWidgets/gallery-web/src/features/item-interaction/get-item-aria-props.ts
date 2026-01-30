import { SelectActionsService } from "@mendix/widget-plugin-grid/interfaces/SelectActionsService";
import { ObjectItem } from "mendix";

type ListItemRole = "option" | "listitem";

type ListItemAriaProps = {
    role: ListItemRole;
    "aria-selected": boolean | undefined;
    tabIndex: number | undefined;
    "aria-label": string | undefined;
};

export function getAriaProps(item: ObjectItem, helper: SelectActionsService, label?: string): ListItemAriaProps {
    if (helper.selectionType === "Single" || helper.selectionType === "Multi") {
        return {
            role: "option",
            "aria-selected": helper.isSelected(item),
            tabIndex: 0,
            "aria-label": label
        };
    }

    return {
        role: "listitem",
        "aria-selected": undefined,
        tabIndex: undefined,
        "aria-label": label
    };
}
