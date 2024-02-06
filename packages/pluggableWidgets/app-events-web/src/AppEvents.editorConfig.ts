import { Properties } from "@mendix/pluggable-widgets-tools";
import { AppEventsPreviewProps } from "../typings/AppEventsProps";
import {
    StructurePreviewProps,
    structurePreviewPalette
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";

export function getProperties(
    _values: AppEventsPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.
    /* Example
    if (values.myProperty === "custom") {
        delete defaultProperties.properties.myOtherProperty;
    }
    */
    return defaultProperties;
}

// export function check(_values: NewWidgetTestPreviewProps): Problem[] {
//     const errors: Problem[] = [];
//     // Add errors to the above array to throw errors in Studio and Studio Pro.
//     /* Example
//     if (values.myProperty !== "custom") {
//         errors.push({
//             property: `myProperty`,
//             message: `The value of 'myProperty' is different of 'custom'.`,
//             url: "https://github.com/myrepo/mywidget"
//         });
//     }
//     */
//     return errors;
// }

export function getPreview(_values: AppEventsPreviewProps, isDarkMode: boolean): StructurePreviewProps {
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];
    return {
        type: "Container",
        children: [
            {
                type: "Text",
                content: "App events",
                fontColor: palette.text.data
            }
        ]
    };
}

// export function getCustomCaption(values: NewWidgetTestPreviewProps, platform: Platform): string {
//     return "NewWidgetTest";
// }
