import { ActionValue, EditableValue } from "mendix";
import {
    ComboboxContainerProps,
    OptionsSourceAssociationCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/ComboboxProps";
import { OptionsStaticProvider, SingleSelector, Status } from "../types";
import { StaticOptionsProvider } from "./StaticOptionsProvider";
import { StaticCaptionsProvider } from "./StaticCaptionsProvider";
import { extractStaticProps } from "./utils";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";

export class StaticSingleSelector implements SingleSelector {
    type = "single" as const;
    attributeType: "string" | "big" | "boolean" | "date" = "string";
    status: Status = "unavailable";
    options: OptionsStaticProvider;
    caption: StaticCaptionsProvider;
    clearable = false;
    currentId: string | null = null;
    readOnly = false;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    validation?: string = undefined;
    protected _attr: EditableValue<string | Big | boolean | Date> | undefined;
    private onChangeEvent?: ActionValue;
    private _objectsMap: Map<string, OptionsSourceStaticDataSourceType> = new Map();

    constructor() {
        this.caption = new StaticCaptionsProvider(this._objectsMap);
        this.options = new StaticOptionsProvider(this.caption, this._objectsMap);
    }

    updateProps(props: ComboboxContainerProps): void {
        const [attr, ds, emptyOption, clearable, filterType, onChangeEvent, customContent, customContentType] =
            extractStaticProps(props);
        this._attr = attr;
        this.caption.updateProps({
            emptyOptionText: emptyOption,
            customContent,
            customContentType,
            caption: this._attr.displayValue
        });

        this.options._updateProps({
            ds,
            filterType
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
        this.clearable = clearable;
        this.status = attr.status;
        this.readOnly = attr.readOnly;
        this.onChangeEvent = onChangeEvent;
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
        if (this.attributeType === "boolean") {
            const booleanValue = value?.staticDataSourceValue.value === "true";
            this._attr?.setValue(booleanValue);
        } else if (this.attributeType === "date") {
            this._attr?.setValue(new Date(this._attr.formatter.format(value?.staticDataSourceValue.value)));
        } else {
            this._attr?.setValue(value?.staticDataSourceValue.value);
        }
        this.currentId = key;
        executeAction(this.onChangeEvent);
    }
}
