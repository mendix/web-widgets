import { EditableValue } from "mendix";
import { ComboboxGateProps } from "../../core/ComboboxGate";
import { required } from "../utils";

export type EnumerationGateProps = Pick<
    ComboboxGateProps,
    "attributeEnumeration" | "attributeBoolean" | "emptyOptionText"
>;

/** The enumeration attribute wins when both are configured. */
export function enumerationAttribute(props: EnumerationGateProps): EditableValue<string | boolean> {
    return required(props.attributeEnumeration ?? props.attributeBoolean, "attributeEnumeration");
}
