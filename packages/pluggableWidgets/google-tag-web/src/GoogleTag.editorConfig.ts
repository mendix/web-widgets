import { GoogleTagPreviewProps } from "../typings/GoogleTagProps";
import { hidePropertiesIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";

export function getProperties(values: GoogleTagPreviewProps, defaultProperties: Properties): Properties {
    if (values.widgetMode === "basic") {
        hidePropertiesIn(defaultProperties, values, ["eventName", "command", "sendEventsOn"]);
    } else {
        switch (values.command) {
            case "config": {
                hidePropertiesIn(defaultProperties, values, ["eventName"]);
                break;
            }
            case "event": {
                hidePropertiesIn(defaultProperties, values, ["targetId"]);
                break;
            }
        }
    }

    return defaultProperties;
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
