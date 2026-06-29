import { Problem } from "@mendix/pluggable-widgets-tools";

export type DeltaEditorConfigValues = {
    enableDelta?: boolean;
    deltaAttribute?: string;
};

export function checkDeltaPersistenceConfiguration(values: DeltaEditorConfigValues): Problem[] {
    if (values.enableDelta && !values.deltaAttribute) {
        return [
            {
                property: "deltaAttribute",
                message: "Select a string attribute for Delta persistence, or disable Delta persistence."
            }
        ];
    }

    return [];
}
