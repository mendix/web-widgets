import { SelectionType } from "@mendix/widget-plugin-grid/selection";

type ListItemRole = "option" | "listitem";

type ListItemAriaProps = {
    role: ListItemRole;
    "aria-selected": boolean | undefined;
    tabIndex: number | undefined;
    "aria-label": string | undefined;
};

export function getAriaProps(selectionType: SelectionType, isSelected: boolean,  label?: string): ListItemAriaProps {
    if (selectionType === "Single" || selectionType === "Multi") {
        return {
            role: "option",
            "aria-selected": isSelected,
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
