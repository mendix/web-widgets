import { hidePropertiesIn, Properties } from "@mendix/pluggable-widgets-tools";
import { SelectionHelperPreviewProps } from "../typings/SelectionHelperProps";

export function getProperties(
    values: SelectionHelperPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    if (values.renderStyle === "checkbox") {
        hidePropertiesIn(defaultProperties, values, ["customNoneSelected", "customSomeSelected", "customAllSelected"]);
    } else {
        hidePropertiesIn(defaultProperties, values, ["checkboxCaption"]);
    }

    return defaultProperties;
}

// export function check(_values: SelectionHelperPreviewProps): Problem[] {
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

// export function getPreview(values: SelectionHelperPreviewProps, isDarkMode: boolean, version: number[]): PreviewProps {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     }
// }

// export function getCustomCaption(values: SelectionHelperPreviewProps, platform: Platform): string {
//     return "SelectionHelper";
// }
