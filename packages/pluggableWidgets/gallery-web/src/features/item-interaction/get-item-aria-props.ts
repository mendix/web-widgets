import { ObjectItem } from "mendix";
import { SelectActionHandler } from "@mendix/widget-plugin-grid/selection";

type ListItemRole = "option" | "listitem";

type ListItemAriaProps = {
    role: ListItemRole;
    "aria-selected": boolean | undefined;
    tabIndex: number | undefined;
    "aria-label": string | undefined;
};

export function getAriaProps(item: ObjectItem, helper: SelectActionHandler, label?: string): ListItemAriaProps {
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
