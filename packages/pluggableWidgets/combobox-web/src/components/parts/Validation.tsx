import { ReactElement } from "react";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { ComboboxViewModel } from "../../core/ComboboxViewModel";
import { getValidationErrorId } from "../../helpers/utils";

export interface ValidationProps {
    vm: ComboboxViewModel;
}

/** The validation message below the input container. Atlas markup from component-kit, so no class key. */
export function Validation({ vm }: ValidationProps): ReactElement | null {
    return vm.validation ? <ValidationAlert id={getValidationErrorId(vm.id)}>{vm.validation}</ValidationAlert> : null;
}
