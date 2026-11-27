import { ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { SelectionMethodEnum } from "../../typings/ComboboxProps";

/** Row-click selection lists only the options that are not selected yet. */
export function menuOptions(options: string[], selected: string[] | null, method: SelectionMethodEnum): string[] {
    return method === "rowclick" ? options.filter(id => !selected?.includes(id)) : options;
}

/** The select-all state. An empty option list with nothing selected reads as "some". */
export function selectAllState(options: string[], selected: string[] | null): ThreeStateCheckBoxEnum {
    if (selected && selected.length > 0) {
        return options.every(id => selected.includes(id)) ? "all" : "some";
    }
    return options.length === 0 ? "some" : "none";
}
