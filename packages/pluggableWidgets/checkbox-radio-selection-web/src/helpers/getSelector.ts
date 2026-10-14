import { AssociationMultiSelector } from "./Association/AssociationMultiSelector";
import { AssociationSingleSelector } from "./Association/AssociationSingleSelector";
import { DatabaseMultiSelector } from "./Database/DatabaseMultiSelector";
import { DatabaseSingleSelector } from "./Database/DatabaseSingleSelector";
import { EnumBooleanSingleSelector } from "./EnumBool/EnumBooleanSingleSelector";
import { StaticSingleSelector } from "./Static/StaticSingleSelector";
import { Selector } from "./types";
import { CheckboxRadioSelectionContainerProps } from "../../typings/CheckboxRadioSelectionProps";

export function getSelector(props: CheckboxRadioSelectionContainerProps): Selector {
    if (props.source === "context") {
        if (["enumeration", "boolean"].includes(props.optionsSourceType)) {
            return new EnumBooleanSingleSelector();
        } else if (props.optionsSourceType === "association") {
            return props.attributeAssociation.type === "Reference"
                ? new AssociationSingleSelector()
                : new AssociationMultiSelector();
        } else {
            throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
        }
    } else if (props.source === "database") {
        if (props.optionsSourceDatabaseItemSelection?.type === "Multi") {
            return new DatabaseMultiSelector();
        } else {
            return new DatabaseSingleSelector();
        }
    } else if (props.source === "static") {
        return new StaticSingleSelector();
    }

    throw new Error(`Source of type '${props.source}' is not supported`);
}
