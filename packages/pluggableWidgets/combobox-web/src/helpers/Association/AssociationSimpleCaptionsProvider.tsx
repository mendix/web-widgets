import { DynamicValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { ReactNode, createElement, MouseEvent, PropsWithChildren, ReactElement } from "react";
import { OptionsSourceAssociationCustomContentTypeEnum } from "../../../typings/ComboboxProps";
import { CaptionPlacement, CaptionsProvider } from "../types";

interface Props {
    emptyOptionText?: DynamicValue<string>;
    formattingAttributeOrExpression: ListExpressionValue<string> | ListAttributeValue<string>;
    customContent?: ListWidgetValue | undefined;
    customContentType: OptionsSourceAssociationCustomContentTypeEnum;
}

interface CaptionContentProps extends PropsWithChildren {
    htmlFor?: string;
}

export function CaptionContent(props: CaptionContentProps): ReactElement {
    const { htmlFor, children } = props;
    return createElement(htmlFor == null ? "span" : "label", {
        children,
        className: "widget-combobox-caption-text",
        htmlFor,
        onClick: htmlFor
            ? (e: MouseEvent) => {
                  e.preventDefault();
              }
            : undefined
    });
}

export class AssociationSimpleCaptionsProvider implements CaptionsProvider {
    private unavailableCaption = "<...>";
    private formatter?: ListExpressionValue<string> | ListAttributeValue<string>;
    protected customContent?: ListWidgetValue;
    protected customContentType: OptionsSourceAssociationCustomContentTypeEnum = "no";
    emptyCaption = "";

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
