import { hideNestedPropertiesIn, hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { DatagridPreviewProps } from "../typings/DatagridProps";

export function setFilteringProps(values: DatagridPreviewProps, props: Properties): void {
    if (values.enableFilterGroups === false) {
        hidePropertiesIn(props, values, ["groupList", "groupAttrs"]);
    } else {
        hidePropertiesIn(props, values, ["filterList"]);
    }

    setGroupProps(values, props);
}

function setGroupProps(values: DatagridPreviewProps, props: Properties): void {
    values.groupList.forEach((group, index) => {
        if (group.type === "attrs") {
            hideNestedPropertiesIn(props, values, "groupList", index, ["ref", "refOptions", "caption"]);
        }
    });
}
