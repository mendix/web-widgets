import { SelectionControlsContainerProps } from "../../typings/SelectionControlsProps";
import { DatabaseMultiSelectionSelector } from "./Database/DatabaseMultiSelectionSelector";
import { DatabaseSingleSelectionSelector } from "./Database/DatabaseSingleSelectionSelector";
import { Selector } from "./types";

export function getSelector(props: SelectionControlsContainerProps): Selector {
    // if (props.source === "context") {
    //     if (["enumeration", "boolean"].includes(props.optionsSourceType)) {
    //         return new EnumBooleanSingleSelector();
    //     } else if (props.optionsSourceType === "association") {
    //         return props.attributeAssociation.type === "Reference"
    //             ? new AssociationSingleSelector()
    //             : new AssociationMultiSelector();
    //     } else {
    //         throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
    //     }
    // } else if (props.source === "database") {
    if (props.optionsSourceDatabaseItemSelection?.type === "Multi") {
        return new DatabaseMultiSelectionSelector();
    } else {
        return new DatabaseSingleSelectionSelector();
    }
    // } else if (props.source === "static") {
    //     return new StaticSingleSelector();
    // }

    // throw new Error(`Source of type '${props.source}' is not supported`);
}
