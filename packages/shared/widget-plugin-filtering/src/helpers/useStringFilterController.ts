import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { Params, StringFilterController } from "../controllers/input/StringInputController";

export function useStringFilterController(params: Params): StringFilterController {
    const ctrl = useSetup(() => new StringFilterController(params));

    return ctrl;
}
