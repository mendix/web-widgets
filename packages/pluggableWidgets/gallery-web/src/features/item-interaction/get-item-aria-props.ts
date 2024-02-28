import { ObjectItem } from "mendix";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";

type ListItemRole = "option" | "listitem";

type ListItemAriaProps = {
    role: ListItemRole;
    "aria-selected": boolean | undefined;
    tabIndex: number | undefined;
};

export function getAriaProps(item: ObjectItem, helper: SelectActionHelper): ListItemAriaProps {
    if (helper.selectionType === "Single" || helper.selectionType === "Multi") {
        return {
            role: "option",
            "aria-selected": helper.isSelected(item),
            tabIndex: 0
        };
    }

    return {
        role: "listitem",
        "aria-selected": undefined,
        tabIndex: undefined
    };
}
