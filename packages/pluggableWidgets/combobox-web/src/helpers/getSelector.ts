import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { AssociationMultiSelector } from "./Association/AssociationMultiSelector";
import { AssociationSingleSelector } from "./Association/AssociationSingleSelector";
import { EnumBooleanSingleSelector } from "./EnumBool/EnumBoolSingleSelector";
import { Selector } from "./types";

export function getSelector(props: ComboboxContainerProps): Selector {
    if (["enumeration", "boolean"].includes(props.optionsSourceType)) {
        return new EnumBooleanSingleSelector();
    } else if (props.optionsSourceType === "association") {
        return props.attributeAssociation.type === "Reference"
            ? new AssociationSingleSelector()
            : new AssociationMultiSelector();
    } else {
        throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
    }
}
