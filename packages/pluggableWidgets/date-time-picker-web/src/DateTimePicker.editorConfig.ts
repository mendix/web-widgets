import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    ContainerProps,
    rowLayout,
    structurePreviewPalette,
    StructurePreviewProps,
    svgImage
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DateTimePickerPreviewProps } from "../typings/DateTimePickerProps";
import IconSVG from "./assets/close.svg";
const IconSVGDark = IconSVG.replace('fill="#000000"', 'fill="#FFFFFF"');

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

    if (values.validationType !== "custom") {
        hidePropertiesIn(defaultProperties, values, ["customValidation"]);
    }

    return defaultProperties;
}

export function getPreview(values: DateTimePickerPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    const structurePreviewChildren: StructurePreviewProps[] = [];
    // let dropdownPreviewChildren: StructurePreviewProps[] = [];
    let readOnly = values.readOnly;

    if (structurePreviewChildren.length === 0) {
        structurePreviewChildren.push({
            type: "Text",
            content: values.dateAttribute ? `[${values.dateAttribute}]` : "[Date time picker]",
            fontColor: palette.text.data
        });
    }

    return container()(
        rowLayout({
            columnSize: "grow",
            borders: true,
            borderWidth: 1,
            borderRadius: 2,
            backgroundColor: readOnly ? palette.background.containerDisabled : palette.background.container
        })(
            container({
                grow: 1,
                padding: 4
            })(...structurePreviewChildren),
            getIconPreview(isDarkMode)
        )
    );
}

function getIconPreview(isDarkMode: boolean): ContainerProps {
    return container({
        grow: 0,
        padding: 4
    })(
        ...[
            container({ padding: 1 })(),
            svgImage({ width: 16, height: 16 })(
                decodeURIComponent((isDarkMode ? IconSVGDark : IconSVG).replace("data:image/svg+xml,", ""))
            )
        ]
    );
}
