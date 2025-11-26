import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    ContainerProps,
    dropzone,
    structurePreviewPalette,
    StructurePreviewProps
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DateTimePickerPreviewProps } from "../typings/DateTimePickerProps";

export function getProperties(values: DateTimePickerPreviewProps, defaultProperties: Properties): Properties {
    if (values.type !== "date" && values.type !== "range") {
        hidePropertiesIn(defaultProperties, values, ["dateFormat"]);
    }

    if (values.type !== "time") {
        hidePropertiesIn(defaultProperties, values, ["timeFormat"]);
    }

    if (values.type !== "datetime") {
        hidePropertiesIn(defaultProperties, values, ["dateTimeFormat"]);
    }

    if (values.type !== "range") {
        hidePropertiesIn(defaultProperties, values, ["endDateAttribute"]);
    }

    if (values.showLabel === false) {
        hidePropertiesIn(defaultProperties, values, ["label"]);
    }

    if (values.editable !== "conditionally") {
        hidePropertiesIn(defaultProperties, values, ["editabilityCondition"]);
    }

    if (values.validationType !== "custom") {
        hidePropertiesIn(defaultProperties, values, ["customValidation"]);
    }

    return defaultProperties;
}

export function getPreview(values: DateTimePickerPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const structurePreviewChildren: StructurePreviewProps[] = [];
    let dropdownPreviewChildren: StructurePreviewProps[] = [];
    let readOnly = values.readOnly;

    if (structurePreviewChildren.length === 0) {
        structurePreviewChildren.push({
            type: "Text",
            content: values.dateAttribute ? `[${values.dateAttribute}]` : "[Date time picker]",
            fontColor: palette.text.data
        });
    }

    return {
        type: "Container",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                borders: true,
                borderWidth: 1,
                borderRadius: 2,
                backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.container,
                children: [
                    {
                        type: "Container",
                        grow: 1,
                        padding: 4,
                        children: structurePreviewChildren
                    },
                    container({ grow: 0, padding: 4 })()
                ]
            },
            ...dropdownPreviewChildren
        ]
    };
}
