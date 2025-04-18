import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { NumberFilterController, Params } from "../controllers/input/NumberInputController";

export function useNumberFilterController(params: Params): NumberFilterController {
    const ctrl = useSetup(() => new NumberFilterController(params));
    return ctrl;
}
