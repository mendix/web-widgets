import { useEffect, useState } from "react";
import { StringFilterController, Params } from "../controllers/StringFilterController";
import { ArgumentInterface } from "../typings/ArgumentInterface";
import { AllFunctions } from "../typings/FilterFunctions";
import { FilterFn, InputFilterBaseInterface } from "../typings/InputFilterInterface";

export function useStringFilterController<
    F extends InputFilterBaseInterface<A, Fn>,
    A extends ArgumentInterface,
    Fn extends AllFunctions = FilterFn<F>
>(params: Params): StringFilterController {
    const [ctrl] = useState(() => new StringFilterController(params));

    useEffect(() => ctrl.setup(), [ctrl]);

    return ctrl;
}
