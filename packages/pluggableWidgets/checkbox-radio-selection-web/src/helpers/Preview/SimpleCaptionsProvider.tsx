import { DynamicValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode, createElement } from "react";
import { OptionsSourceCustomContentTypeEnum } from "../../../typings/CheckboxRadioSelectionProps";
import { CaptionsProvider } from "../types";

interface Props {
    emptyOptionText?: DynamicValue<string>;
    formattingAttributeOrExpression: ListExpressionValue<string> | ListAttributeValue<string>;
    customContent?: ListWidgetValue | undefined;
    customContentType: OptionsSourceCustomContentTypeEnum;
}

export class SimpleCaptionsProvider implements CaptionsProvider {
    private unavailableCaption = "<...>";
    formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
    protected customContent?: ListWidgetValue;
    protected customContentType: OptionsSourceCustomContentTypeEnum = "no";
    emptyCaption = "";

    constructor(
        private optionsMap: Map<string, ObjectItem>,
        private dataSourcePlaceholder: string
    ) {}

    updateProps(props: Props): void {
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
        if (!this.formatter) {
            throw new Error("SimpleCaptionsProvider: no formatter available.");
        }
        const item = this.optionsMap.get(value);
        if (!item) {
            return this.unavailableCaption;
        }

        const captionValue = this.formatter.get(item);
        if (!captionValue || captionValue.status === "unavailable") {
            return this.unavailableCaption;
        }

        return captionValue.value ?? "";
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

    render(value: string | null): ReactNode {
        if (this.customContentType === "yes") {
            return this.getCustomContent(value);
        }
        return <div>{this.dataSourcePlaceholder}</div>;
        // return this.get(value);
    }
}
