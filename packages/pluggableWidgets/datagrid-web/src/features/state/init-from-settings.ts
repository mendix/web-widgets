import { ListValue, EditableValue } from "mendix";
import { GridColumn } from "../../typings/GridColumn";
import { ComputedInitState } from "./base";
import { initGridState } from "./utils";
import { AttrStorage } from "../storage/AttrStorage";
import { computeFromSettings, restoreSettings } from "./setting-utils";

export function initFromSettings(props: {
    columns: GridColumn[];
    ds: ListValue;
    settings: EditableValue<string>;
}): ComputedInitState | undefined {
    if (props.settings.status === "loading") {
        return;
    }

    const [initState, settings] = [
        initGridState(props.columns, props.ds.filter),
        restoreSettings(props.columns, new AttrStorage(props.settings, "key"))
    ];

    return settings === undefined ? [initState] : computeFromSettings(initState, settings, props.ds);
}
