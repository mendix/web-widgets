import { DynamicValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode, createElement } from "react";
import { OptionsSourceCustomContentTypeEnum } from "../../../typings/SelectionControlsProps";
import { CaptionsProvider } from "../types";

interface AssociationSimpleCaptionsProviderProps {
    emptyOptionText?: DynamicValue<string>;
    formattingAttributeOrExpression?: ListAttributeValue<string> | ListExpressionValue<string>;
    customContent?: ListWidgetValue;
    customContentType: OptionsSourceCustomContentTypeEnum;
}

export class AssociationSimpleCaptionsProvider implements CaptionsProvider {
    emptyCaption = "";
    formatter?: ListAttributeValue<string> | ListExpressionValue<string>;
    private _objectsMap: Map<string, ObjectItem>;
    private customContent?: ListWidgetValue;
    private customContentType: OptionsSourceCustomContentTypeEnum = "no";

    constructor(objectsMap: Map<string, ObjectItem>) {
        this._objectsMap = objectsMap;
    }

    updateProps(props: AssociationSimpleCaptionsProviderProps): void {
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

    render(value: string | null, _placement?: "label" | "options", _htmlFor?: string): ReactNode {
        if (value === null) {
            return <span className="widget-selection-controls-caption-text">{this.emptyCaption}</span>;
        }

        const item = this._objectsMap.get(value);
        if (!item) {
            return <span className="widget-selection-controls-caption-text"></span>;
        }

        if (this.customContentType === "yes" && this.customContent) {
            return this.customContent.get(item);
        }

        const caption = this.formatter?.get(item).value || "";
        return <span className="widget-selection-controls-caption-text">{caption}</span>;
    }
}
