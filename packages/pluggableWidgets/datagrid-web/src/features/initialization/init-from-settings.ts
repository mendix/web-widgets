import { ListValue, EditableValue } from "mendix";
import { InitState, ComputedInitState } from "./base";

export function initFromSettings(_props: {
    setInitState: React.Dispatch<InitState>;
    ds: ListValue;
    settings: EditableValue<string>;
}): ComputedInitState | undefined {
    return undefined;
}
