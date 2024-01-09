import { ObjectItem } from "mendix";
import { ItemSelectHelper } from "../../helpers/ItemSelectHelper";

type ListItemRole = "option" | "listitem";

type ListItemAriaProps = {
    role: ListItemRole;
    "aria-selected": boolean | undefined;
    tabIndex: number | undefined;
};

export function getAriaProps(item: ObjectItem, helper: ItemSelectHelper): ListItemAriaProps {
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
