import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";
import { eventSwitch } from "@mendix/widget-plugin-grid/event-switch/event-switch";
import { SelectFx } from "@mendix/widget-plugin-grid/selection";
import { ObjectItem } from "mendix";
import { useMemo } from "react";
import { SelectActionHelper } from "../../helpers/SelectActionHelper";
import { CheckboxContext } from "./base";
import { checkboxHandlers } from "./checkbox-handlers";

export class CheckboxEventsController {
    constructor(private contextFactory: (item: ObjectItem) => CheckboxContext, private selectFx: SelectFx) {}

    getProps = (item: ObjectItem): ElementProps<HTMLInputElement> =>
        eventSwitch<CheckboxContext, HTMLInputElement>(
            () => this.contextFactory(item),
            checkboxHandlers(this.selectFx)
        );
}

export function useCheckboxEventsController(selectHelper: SelectActionHelper): CheckboxEventsController {
    return useMemo(() => {
        const contextFactory = (item: ObjectItem): CheckboxContext => ({
            item,
            selectionMethod: selectHelper.selectionMethod
        });
        return new CheckboxEventsController(contextFactory, selectHelper.onSelect);
    }, [selectHelper]);
}
