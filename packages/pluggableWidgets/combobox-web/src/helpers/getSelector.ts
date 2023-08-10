import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { AssociationSingleSelector } from "./Association/AssociationSingleSelector";
import { AssociationMultiSelector } from "./Association/AssociationMultiSelector";
import { EnumBooleanSingleSelector } from "./EnumBool/EnumBoolSingleSelector";
import { SingleSelector, MultiSelector } from "./types";

export function getSelector(props: ComboboxContainerProps): SingleSelector | MultiSelector {
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
