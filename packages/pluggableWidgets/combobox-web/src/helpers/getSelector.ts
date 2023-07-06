import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { AssociationSingleSelector } from "./Association/AssociationSingleSelector";
import { AssociationMultiSelector } from "./Association/AssociationMultiSelector";
import { EnumBooleanSingleSelector } from "./EnumBool/EnumBoolSingleSelector";
import { SingleSelector, MultiSelector } from "./types";

export function getSelector(props: ComboboxContainerProps): SingleSelector {
    if (props.optionsSourceType === "enumeration" || props.optionsSourceType === "boolean") {
        return new EnumBooleanSingleSelector();
    } else if (props.optionsSourceType === "association") {
        return new AssociationSingleSelector();
    } else {
        throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
    }
}
export function getMultiSelector(props: ComboboxContainerProps): MultiSelector {
    if (props.attributeAssociation.type === "ReferenceSet") {
        return new AssociationMultiSelector();
    } else {
        throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
    }
}
