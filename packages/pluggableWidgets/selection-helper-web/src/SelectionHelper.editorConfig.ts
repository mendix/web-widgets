import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { SelectionHelperPreviewProps } from "../typings/SelectionHelperProps";
import {
    container,
    dropzone,
    rowLayout,
    StructurePreviewProps,
    svgImage,
    text
} from "@mendix/pluggable-widgets-commons";

import CheckBoxIndeterminateSVG from "./assets/CheckBoxIndeterminate.light.svg";

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
            rowLayout({ columnSize: "grow" })(
                container({ grow: 1 })(
                    svgImage(decodeURIComponent(CheckBoxIndeterminateSVG.replace("data:image/svg+xml,", "")), 24, 24)
                ),
                container({ grow: 100, padding: 3 })(text({ fontSize: 10 })(values.checkboxCaption))
            )
        );
    }

    return container()(
        container({ borders: true })(dropzone()(values.customNoneSelected)),
        container({ borders: true })(dropzone()(values.customSomeSelected)),
        container({ borders: true })(dropzone()(values.customAllSelected))
    );
}
