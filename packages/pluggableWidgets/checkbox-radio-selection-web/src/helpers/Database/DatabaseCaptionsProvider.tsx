import { Big } from "big.js";
import { DynamicValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode } from "react";
import { OptionsSourceCustomContentTypeEnum } from "../../../typings/CheckboxRadioSelectionProps";
import { CaptionsProvider } from "../types";

interface DatabaseCaptionsProviderProps {
    emptyOptionText?: DynamicValue<string>;
    formattingAttributeOrExpression?: ListAttributeValue<string> | ListExpressionValue<string>;
    customContent?: ListWidgetValue;
    customContentType: OptionsSourceCustomContentTypeEnum;
    attribute?: ListAttributeValue<string | Big>;
    caption?: string;
}

export class DatabaseCaptionsProvider implements CaptionsProvider {
    emptyCaption = "";
    formatter?: ListAttributeValue<string> | ListExpressionValue<string>;
    private _objectsMap: Map<string, ObjectItem>;
    private customContent?: ListWidgetValue;
    private customContentType: OptionsSourceCustomContentTypeEnum = "no";

    constructor(objectsMap: Map<string, ObjectItem>) {
        this._objectsMap = objectsMap;
    }

    updateProps(props: DatabaseCaptionsProviderProps): void {
        if (!props.emptyOptionText || props.emptyOptionText.status === "unavailable") {
            this.emptyCaption = "";
        } else {
            this.emptyCaption = props.emptyOptionText.value!;
        }
        this.formatter = props.formattingAttributeOrExpression;
        this.customContent = props.customContent;
        this.customContentType = props.customContentType;
    }

    get(value: string | null): string {
        if (value === null) {
            return this.emptyCaption;
        }

        const item = this._objectsMap.get(value);
        if (!item || !this.formatter) {
            return "";
        }

        return this.formatter.get(item).value || "";
    }

    getCustomContent(value: string | null): ReactNode | null {
        if (value === null) {
            return null;
        }
        const item = this._objectsMap.get(value);
        if (!item) {
            return null;
        }

        return this.customContent?.get(item);
    }

    render(value: string | null): ReactNode {
        if (this.customContentType === "yes" && this.customContent) {
            return this.getCustomContent(value);
        }
        return this.get(value);
    }
}
