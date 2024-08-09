import { useEffect, useState } from "react";
import { EditableFilterController, Params } from "../controllers/EditableFilterController";
import { ArgumentInterface } from "../typings/ArgumentInterface";
import { AllFunctions } from "../typings/FilterFunctions";
import { FilterFn, InputFilterBaseInterface } from "../typings/InputFilterInterface";

export function useEditableFilterController<
    F extends InputFilterBaseInterface<A, Fn>,
    A extends ArgumentInterface,
    Fn extends AllFunctions = FilterFn<F>
>(params: Params<F, A, Fn>): EditableFilterController<F, A, Fn> {
    const [ctrl] = useState(() => new EditableFilterController<F, A, Fn>(params));

    useEffect(() => ctrl.setup(), [ctrl]);

    return ctrl;
}
