import { ReactNode, createElement } from "react";
import { DynamicValue, ListAttributeValue, ListExpressionValue, ObjectItem } from "mendix";
import { CaptionsProvider } from "../types";

interface Props {
    emptyOptionText?: DynamicValue<string>;
    formattingAttributeOrExpression: ListExpressionValue<string> | ListAttributeValue<string>;
}

export class AssociationSimpleCaptionsProvider implements CaptionsProvider {
    private unavailableCaption = "<...>";
    private formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
    emptyCaption = "";

    constructor(private optionsMap: Map<string, ObjectItem>) {}

    updateProps(props: Props): void {
        if (!props.emptyOptionText || props.emptyOptionText.status === "unavailable") {
            this.emptyCaption = "";
        } else {
            this.emptyCaption = props.emptyOptionText.value!;
        }

        this.formatter = props.formattingAttributeOrExpression;
    }

    get(value: string | null): string {
        if (value === null) {
            return this.emptyCaption;
        }
        if (!this.formatter) {
            throw new Error("AssociationSimpleCaptionRenderer: no formatter available.");
        }
        const item = this.optionsMap.get(value);
        if (!item) {
            return this.unavailableCaption;
        }
        const captionValue = this.formatter.get(item);
        if (captionValue.status === "unavailable") {
            return this.unavailableCaption;
        }

        return captionValue.value ?? "";
    }

    render(value: string | null): ReactNode {
        return <span>{this.get(value)}</span>;
    }
}
