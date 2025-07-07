import { hidePropertiesIn, hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import { chevronDownIcon, chevronDownIconDark } from "@mendix/widget-plugin-filtering/preview/editor-preview-icons";
import {
    ContainerProps,
    ImageProps,
    structurePreviewPalette,
    StructurePreviewProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { DatagridDropdownFilterPreviewProps } from "../typings/DatagridDropdownFilterProps";

export function getProperties(values: DatagridDropdownFilterPreviewProps, defaultProperties: Properties): Properties {
    const showSelectedItemsStyle = values.filterable && values.multiSelect;
    const showSelectionMethod = showSelectedItemsStyle && values.selectedItemsStyle === "boxes";

    if (values.baseType === "attr") {
        defaultProperties = attrGroupProperties(values, defaultProperties);
    } else {
        hidePropertiesIn(defaultProperties, values, ["attr", "attrChoice", "filterOptions", "auto"]);
    }

    if (values.filterable) {
        hidePropertyIn(defaultProperties, values, "clearable");
        hidePropertyIn(defaultProperties, values, "emptyOptionCaption");
    }

    if (!values.filterable) {
        hidePropertyIn(defaultProperties, values, "refSearchAttr");
    }

    if (values.refCaptionSource === "attr") {
        hidePropertiesIn(defaultProperties, values, ["refCaptionExp", "refSearchAttr"]);
    } else {
        hidePropertyIn(defaultProperties, values, "refCaption");
    }

    if (!showSelectedItemsStyle) {
        hidePropertyIn(defaultProperties, values, "selectedItemsStyle");
    }

    if (!showSelectionMethod) {
        hidePropertyIn(defaultProperties, values, "selectionMethod");
    }

    return defaultProperties;
}

function attrGroupProperties(values: DatagridDropdownFilterPreviewProps, defaultProperties: Properties): Properties {
    hidePropertiesIn(defaultProperties, values, [
        "fetchOptionsLazy",
        "refCaption",
        "refCaptionExp",
        "refCaptionSource",
        "refEntity",
        "refOptions",
        "refSearchAttr"
    ]);

    if (values.attrChoice === "auto") {
        hidePropertyIn(defaultProperties, {} as { linkedDs: unknown }, "linkedDs");
        hidePropertyIn(defaultProperties, values, "attr");
    }

    if (values.auto) {
        hidePropertyIn(defaultProperties, values, "filterOptions");
    }

    return defaultProperties;
}

export const getPreview = (values: DatagridDropdownFilterPreviewProps, isDarkMode: boolean): StructurePreviewProps => {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "RowLayout",
        borders: true,
        borderRadius: 5,
        borderWidth: 1,
        columnSize: "grow",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                backgroundColor: palette.background.container,
                children: [
                    {
                        type: "Container",
                        padding: 8,
                        children: [
                            text({
                                fontColor: palette.text.secondary,
                                italic: true
                            })(values.emptyOptionCaption || " ")
                        ],
                        grow: 1
                    } as ContainerProps,
                    {
                        type: "Container",
                        padding: 2,
                        grow: 0,
                        children: [
                            {
                                type: "Image",
                                document: isDarkMode ? chevronDownIconDark : chevronDownIcon
                            } as ImageProps
                        ]
                    } as ContainerProps
                ]
            }
        ]
    };
};

export function check(_props: DatagridDropdownFilterPreviewProps): Problem[] {
    const errors: Problem[] = [];

    return errors;
}
