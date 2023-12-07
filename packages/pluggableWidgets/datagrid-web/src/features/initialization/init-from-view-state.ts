import { ListValue } from "mendix";
import { ComputedInitState, InitState } from "./base";

export function initFromViewState(_props: {
    setInitState: React.Dispatch<InitState>;
    ds: ListValue;
}): ComputedInitState | undefined {
    return undefined;
}
