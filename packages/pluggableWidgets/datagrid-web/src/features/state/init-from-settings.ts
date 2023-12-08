import { ListValue, EditableValue } from "mendix";
import { GridColumn } from "../../typings/GridColumn";
import { ComputedInitState } from "./base";
import { initGridState } from "./utils";
import { AttrStorage } from "./AttrStorage";
import { computeFromSettings } from "./setting-utils";

export function initFromSettings(props: {
    columns: GridColumn[];
    ds: ListValue;
    settings: EditableValue<string>;
}): ComputedInitState | undefined {
    if (props.settings.status === "loading") {
        return;
    }

    const initState = initGridState(props.columns, props.ds.filter);
    const settings = new AttrStorage(props.settings).load();

    if (settings === undefined) {
        return [initState];
    }

    return computeFromSettings(initState, settings, props.ds);
}
