import { DynamicValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode, createElement } from "react";
import { OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { CaptionPlacement, CaptionsProvider } from "../types";
import { CaptionContent } from "../utils";

interface Props {
    emptyOptionText?: DynamicValue<string>;
    formattingAttributeOrExpression: ListExpressionValue<string> | ListAttributeValue<string> | undefined;
    customContent?: ListWidgetValue | undefined;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
    attribute: ListAttributeValue<string | Big> | undefined;
    caption?: string;
}

export class DatabaseCaptionsProvider implements CaptionsProvider {
    private unavailableCaption = "<...>";
    formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
    protected customContent?: ListWidgetValue;
    protected customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    attribute?: ListAttributeValue<string | Big>;
    emptyCaption = "";
    overrideCaption: string | null | undefined = undefined;

    constructor(private optionsMap: Map<string, ObjectItem>) {}

    updateProps(props: Props): void {
        if (!props.emptyOptionText || props.emptyOptionText.status === "unavailable") {
            this.emptyCaption = "";
        } else {
            this.emptyCaption = props.emptyOptionText.value!;
        }

        this.formatter = props.formattingAttributeOrExpression;
        this.customContent = props.customContent;
        this.customContentType = props.customContentType;
        this.attribute = props.attribute;
        this.overrideCaption = props.caption;
    }

    get(id: string | null): string {
        if (id === null) {
            if (this.overrideCaption) {
                return this.overrideCaption;
            }
            return this.emptyCaption;
        }
        if (!this.formatter && this.attribute) {
            const item = this.optionsMap.get(id);
            if (item) {
                return this.attribute.get(item).displayValue;
            }
        }
        const item = this.optionsMap.get(id);
        if (!item) {
            return this.unavailableCaption;
        }
        const captionValue = this.formatter?.get(item);
        if (!captionValue || captionValue.status === "unavailable") {
            return this.unavailableCaption;
        }

        return captionValue?.value ?? "";
    }

    getCustomContent(value: string | null): ReactNode | null {
        if (value === null) {
            return null;
        }
        const item = this.optionsMap.get(value);
        if (!item) {
            return null;
        }
        return this.customContent?.get(item);
    }

    render(value: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        const { customContentType } = this;

        return customContentType === "no" ||
            (placement === "label" && customContentType === "listItem") ||
            value === null ? (
            <CaptionContent htmlFor={htmlFor}>{this.get(value)}</CaptionContent>
        ) : (
            <div className="widget-combobox-caption-custom">{this.getCustomContent(value)}</div>
        );
    }
}
