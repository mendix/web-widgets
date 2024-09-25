import { ActionValue, ListActionValue } from "mendix";
import { actionValue } from "../primitives/action";

type ActionGetter = (actionFactory: typeof actionValue) => ActionValue;

export function listAction(getter?: ActionGetter): ListActionValue {
    getter ??= () => actionValue();
    return {
        get: () => getter!(actionValue)
    } as unknown as ListActionValue;
}
