import { StructurePreviewProps } from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { hidePropertiesIn, hidePropertyIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";

import { ProgressBarPreviewProps, TypeEnum } from "../typings/ProgressBarProps";
import StructurePreviewSvg from "./assets/structure-preview.svg";
import StructurePreviewSvgDark from "./assets/structure-preview-dark.svg";

type PreviewPropsKey = keyof ProgressBarPreviewProps;
const propKeys: { [Type in TypeEnum]: PreviewPropsKey[] } = {
    static: ["staticCurrentValue", "staticMaxValue", "staticMinValue"],
    dynamic: ["dynamicCurrentValue", "dynamicMaxValue", "dynamicMinValue"],
    expression: ["expressionCurrentValue", "expressionMaxValue", "expressionMinValue"]
};

export function getProperties(values: ProgressBarPreviewProps, defaultProperties: Properties): Properties {
    switch (values.type) {
        case "dynamic":
            hidePropertiesIn(defaultProperties, values, [...propKeys.static, ...propKeys.expression]);
            break;
        case "static":
            hidePropertiesIn(defaultProperties, values, [...propKeys.dynamic, ...propKeys.expression]);
            break;
        case "expression":
            hidePropertiesIn(defaultProperties, values, [...propKeys.static, ...propKeys.dynamic]);
            break;
        default:
            break;
    }

    if (values.showLabel) {
        if (values.labelType !== "custom") {
            hidePropertyIn(defaultProperties, values, "customLabel");
        }
        if (values.labelType !== "text") {
            hidePropertyIn(defaultProperties, values, "labelText");
        }
    } else {
        hidePropertiesIn(defaultProperties, values, ["customLabel", "labelText", "labelType"]);
    }

    return defaultProperties;
}

function checkValue(key: PreviewPropsKey, values: ProgressBarPreviewProps): Problem | null {
    if (!values[key]) {
        let message;
        if (key.endsWith("CurrentValue")) {
            message = "The current value property is required";
        } else if (key.endsWith("MaxValue")) {
            message = "The maximum value property is required";
        } else if (key.endsWith("MinValue")) {
            message = "The minimum value property is required";
        }

        if (message) {
            return {
                property: key,
                message
            };
        }
    }
    return null;
}

export function check(values: ProgressBarPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.type === "dynamic" || values.type === "expression") {
        propKeys[values.type].forEach(key => {
            const error = checkValue(key, values);
            if (error) {
                errors.push(error);
            }
        });
    }

    if (values.type === "static") {
        if (
            values.staticCurrentValue !== null &&
            values.staticMinValue !== null &&
            values.staticCurrentValue < values.staticMinValue
        ) {
            errors.push({
                property: "staticCurrentValue",
                message: "The current value should be higher than or equal to the minimum value."
            });
        }
        if (
            values.staticCurrentValue !== null &&
            values.staticMaxValue !== null &&
            values.staticCurrentValue > values.staticMaxValue
        ) {
            errors.push({
                property: "staticCurrentValue",
                message: "The current value should be lower than or equal to the maximum value."
            });
        }
    }

    return errors;
}

export function getPreview(values: ProgressBarPreviewProps, isDarkMode: boolean): StructurePreviewProps | null {
    if (values.labelType === "custom") {
        return null;
    }
    return {
        type: "Image",
        document: decodeURIComponent(
            (isDarkMode ? StructurePreviewSvgDark : StructurePreviewSvg).replace("data:image/svg+xml,", "")
        ),
        height: 16,
        width: 300
    };
}

export function getCustomCaption(values: ProgressBarPreviewProps, _platform = "desktop"): string {
    return values.type && values[`${values.type}CurrentValue`] != null
        ? `[${values.type}, ${values[`${values.type}CurrentValue`]}]`
        : "Progress Bar";
}
