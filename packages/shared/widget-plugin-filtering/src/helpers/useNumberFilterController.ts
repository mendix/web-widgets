import { useEffect, useState } from "react";
import { NumberFilterController, Params } from "../controllers/input/NumberInputController";
import { ArgumentInterface } from "../typings/ArgumentInterface";
import { AllFunctions } from "../typings/FilterFunctions";
import { FilterFn, InputFilterBaseInterface } from "../typings/InputFilterInterface";

export function useNumberFilterController<
    F extends InputFilterBaseInterface<A, Fn>,
    A extends ArgumentInterface,
    Fn extends AllFunctions = FilterFn<F>
>(params: Params): NumberFilterController {
    const [ctrl] = useState(() => new NumberFilterController(params));

    useEffect(() => ctrl.setup(), [ctrl]);

    return ctrl;
}
