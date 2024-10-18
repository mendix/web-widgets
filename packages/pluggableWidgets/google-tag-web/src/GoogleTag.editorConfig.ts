import { GoogleTagPreviewProps } from "../typings/GoogleTagProps";
import { hideNestedPropertiesIn, hidePropertiesIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";

export function getProperties(values: GoogleTagPreviewProps, defaultProperties: Properties): Properties {
    if (values.widgetMode === "basic") {
        hidePropertiesIn(defaultProperties, values, ["command", "eventName", "trackPageChanges"]);
        handleValueTypes(values, defaultProperties);
    } else {
        switch (values.command) {
            case "config": {
                // disable predefined properties for config command
                values.parameters.forEach((_p, index) =>
                    hideNestedPropertiesIn(defaultProperties, values, "parameters", index, [
                        "valueType",
                        "predefinedValue"
                    ])
                );

                hidePropertiesIn(defaultProperties, values, ["eventName", "trackPageChanges"]);
                break;
            }
            case "event": {
                hidePropertiesIn(defaultProperties, values, ["targetId", "sendUserID"]);
                handleValueTypes(values, defaultProperties);
                break;
            }
        }
    }

    return defaultProperties;
}

function handleValueTypes(values: GoogleTagPreviewProps, defaultProperties: Properties): void {
    values.parameters.forEach((p, index) => {
        if (p.valueType === "predefined") {
            hideNestedPropertiesIn(defaultProperties, values, "parameters", index, ["customValue"]);
        } else {
            hideNestedPropertiesIn(defaultProperties, values, "parameters", index, ["predefinedValue"]);
        }
    });
}

export function check(values: GoogleTagPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.widgetMode === "basic") {
        if (values.targetId === "") {
            errors.push({
                property: `targetId`,
                message: `Tag ID is required for Basic mode.`
            });
        }
    } else {
        if (values.command === "config") {
            if (values.targetId === "") {
                errors.push({
                    property: `targetId`,
                    message: `Tag ID is required for "config" command.`
                });
            }
        } else if (values.command === "event") {
            if (values.eventName === "") {
                errors.push({
                    property: `eventName`,
                    message: `Event Name is required for "event" command.`
                });
            }
        }
    }

    return errors;
}
