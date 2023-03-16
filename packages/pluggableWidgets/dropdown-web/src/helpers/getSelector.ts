import { DropdownContainerProps } from "../../typings/DropdownProps";
import { AssociationSingleSelector } from "./Association/AssociationSingleSelector";
import { EnumBooleanSingleSelector } from "./EnumBool/EnumBoolSingleSelector";
import { SingleSelector } from "./types";

export function getSelector(props: DropdownContainerProps): SingleSelector {
    if (props.optionsSourceType === "enumerationOrBoolean") {
        return new EnumBooleanSingleSelector();
    } else if (props.optionsSourceType === "association") {
        return new AssociationSingleSelector();
    } else {
        throw new Error(`'optionsSourceType' of type '${props.optionsSourceType}' is not supported`);
    }
}
