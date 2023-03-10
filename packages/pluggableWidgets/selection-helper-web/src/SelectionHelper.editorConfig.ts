import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { SelectionHelperPreviewProps } from "../typings/SelectionHelperProps";
import { container, dropzone, rowLayout, StructurePreviewProps, text } from "@mendix/pluggable-widgets-commons";

export function getProperties(values: SelectionHelperPreviewProps, defaultProperties: Properties): Properties {
    if (values.renderStyle === "checkbox") {
        hidePropertiesIn(defaultProperties, values, ["customNoneSelected", "customSomeSelected", "customAllSelected"]);
    } else {
        hidePropertiesIn(defaultProperties, values, ["checkboxCaption"]);
    }

    return defaultProperties;
}

export function getPreview(
    values: SelectionHelperPreviewProps,
    _isDarkMode: boolean,
    _version: number[]
): StructurePreviewProps {
    if (values.renderStyle === "checkbox") {
        return container()(
            rowLayout()(
                container({ grow: 1, padding: 3 })(
                    container({
                        grow: 0,
                        borderWidth: 1,
                        borderRadius: 3,
                        backgroundColor: "#264ae5",
                        borders: true
                    })(text({ fontColor: "#ffffff", fontSize: 18 })(" "))
                ),
                container({ grow: 11 })(text()(values.checkboxCaption))
            )
        );
    }

    return container()(
        container()(dropzone()(values.customNoneSelected)),
        container()(dropzone()(values.customSomeSelected)),
        container()(dropzone()(values.customAllSelected))
    );
}
