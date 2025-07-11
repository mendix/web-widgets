import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";
import {
    SelectionControlsContainerProps,
    OptionsSourceCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/SelectionControlsProps";
import { SingleSelector, Status } from "../types";
import { StaticOptionsProvider } from "./StaticOptionsProvider";
import { StaticCaptionsProvider } from "./StaticCaptionsProvider";
import { extractStaticProps } from "./utils";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { _valuesIsEqual } from "../utils";

export class StaticSingleSelector implements SingleSelector {
    type = "single" as const;
    attributeType: "string" | "big" | "boolean" | "date" = "string";
    selectorType: "context" | "database" | "static" = "static";
    status: Status = "unavailable";
    options: StaticOptionsProvider;
    caption: StaticCaptionsProvider;
    clearable = false;
    currentId: string | null = null;
    readOnly = false;
    customContentType: OptionsSourceCustomContentTypeEnum = "no";
    validation?: string = undefined;
    onEnterEvent?: () => void;
    onLeaveEvent?: () => void;
    protected _attr: EditableValue<string | Big | boolean | Date> | undefined;
    private onChangeEvent?: ActionValue;
    private _objectsMap: Map<string, OptionsSourceStaticDataSourceType> = new Map();

    constructor() {
        this.caption = new StaticCaptionsProvider(this._objectsMap);
        this.options = new StaticOptionsProvider(this.caption, this._objectsMap);
    }

    updateProps(props: SelectionControlsContainerProps): void {
        const [attr, ds, emptyOption, clearable, onChangeEvent, customContentType] = extractStaticProps(props);
        this._attr = attr;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            customContentType,
            caption: this._attr.displayValue
        });

        this.options._updateProps({
            ds
        });

        if (
            !attr ||
            attr.status === "unavailable" ||
            !ds ||
            ds[0].staticDataSourceValue.status === "unavailable" ||
            ds[0].staticDataSourceCaption.status === "unavailable" ||
            !emptyOption ||
            emptyOption.status === "unavailable"
        ) {
            this.status = "unavailable";
            this.currentId = null;
            this.clearable = false;
            return;
        }
        if (ds.length > 0 && ds[0].staticDataSourceValue.status === "available" && attr.value !== "") {
            const index = ds.findIndex(option => _valuesIsEqual(option.staticDataSourceValue.value, attr.value));
            if (index !== -1) {
                this.currentId = index.toString();
            }
        }
        this.clearable = clearable;
        this.status = attr.status;
        this.readOnly = attr.readOnly;
        this.onChangeEvent = onChangeEvent;
        this.onEnterEvent = props.onEnterEvent ? () => executeAction(props.onEnterEvent) : undefined;
        this.onLeaveEvent = props.onLeaveEvent ? () => executeAction(props.onLeaveEvent) : undefined;
        this.customContentType = customContentType;
        this.validation = attr.validation;
        this.attributeType =
            typeof attr.universe?.[0] === "boolean"
                ? "boolean"
                : attr.formatter?.type === "datetime"
                  ? "date"
                  : "string";
    }

    setValue(key: string | null): void {
        const value = this._objectsMap.get(key || "");
        this._attr?.setValue(value?.staticDataSourceValue.value);
        this.currentId = key;
        executeAction(this.onChangeEvent);
    }
}
