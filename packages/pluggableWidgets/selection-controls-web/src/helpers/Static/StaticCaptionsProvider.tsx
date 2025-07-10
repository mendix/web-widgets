import { DynamicValue } from "mendix";
import { ReactNode, createElement } from "react";
import {
    StaticDataSourceCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/SelectionControlsProps";
import { CaptionsProvider } from "../types";

interface StaticCaptionsProviderProps {
    emptyOptionText?: DynamicValue<string>;
    customContentType: StaticDataSourceCustomContentTypeEnum;
    caption?: string;
}

export class StaticCaptionsProvider implements CaptionsProvider {
    emptyCaption = "";
    formatter?: undefined;
    private _objectsMap: Map<string, OptionsSourceStaticDataSourceType>;
    private customContentType: StaticDataSourceCustomContentTypeEnum = "no";

    constructor(objectsMap: Map<string, OptionsSourceStaticDataSourceType>) {
        this._objectsMap = objectsMap;
    }

    updateProps(props: StaticCaptionsProviderProps): void {
        if (!props.emptyOptionText || props.emptyOptionText.status === "unavailable") {
            this.emptyCaption = "";
        } else {
            this.emptyCaption = props.emptyOptionText.value!;
        }
        this.customContentType = props.customContentType;
    }

    get(value: string | null): string {
        if (value === null) {
            return this.emptyCaption;
        }

        const item = this._objectsMap.get(value);
        if (!item) {
            return "";
        }

        return item.staticDataSourceCaption.value || "";
    }

    render(value: string | null, _placement?: "label" | "options", _htmlFor?: string): ReactNode {
        if (value === null) {
            return <span className="widget-selection-controls-caption-text">{this.emptyCaption}</span>;
        }

        const item = this._objectsMap.get(value);
        if (!item) {
            return <span className="widget-selection-controls-caption-text"></span>;
        }

        if (this.customContentType === "yes" && item.staticDataSourceCustomContent) {
            return item.staticDataSourceCustomContent;
        }

        const caption = item.staticDataSourceCaption.value || "";
        return <span className="widget-selection-controls-caption-text">{caption}</span>;
    }
}
