import { Big } from "big.js";
import { DynamicValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { computed, makeObservable } from "mobx";
import { ReactNode } from "react";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { CaptionPlacement, CaptionsProvider } from "./types";
import { CaptionContent } from "./utils";
import { OptionsSourceAssociationCustomContentTypeEnum } from "../../typings/ComboboxProps";

/** What a datasource-backed selector exposes to its captions provider. */
export interface CaptionSource {
    formatter?: ListAttributeValue<string> | ListExpressionValue<string>;
    customContent?: ListWidgetValue;
    emptyOptionText?: DynamicValue<string>;
    /** Database: the value attribute captions an item when there is no caption attribute or expression. */
    valueAttribute?: ListAttributeValue<string | Big>;
    /** Database: the bound attribute's display value takes over as the empty caption. */
    displayValue?: string;
}

const UNAVAILABLE_CAPTION = "<...>";

/** Captions and custom content for items of a `ListValue`, resolved through the options provider. */
export class DatasourceCaptionsProvider implements CaptionsProvider {
    constructor(
        private readonly source: DerivedPropsGate<CaptionSource>,
        private readonly items: { item(id: string | null): ObjectItem | undefined },
        protected readonly customContentType: OptionsSourceAssociationCustomContentTypeEnum
    ) {
        makeObservable(this, { emptyCaption: computed });
    }

    get emptyCaption(): string {
        const text = this.source.props.emptyOptionText;
        return !text || text.status === "unavailable" ? "" : (text.value ?? "");
    }

    get(id: string | null): string {
        const { formatter, valueAttribute, displayValue } = this.source.props;
        if (id === null) {
            return displayValue || this.emptyCaption;
        }
        const item = this.items.item(id);
        if (!item) {
            return UNAVAILABLE_CAPTION;
        }
        if (!formatter) {
            return valueAttribute ? valueAttribute.get(item).displayValue : UNAVAILABLE_CAPTION;
        }
        const caption = formatter.get(item);
        return !caption || caption.status === "unavailable" ? UNAVAILABLE_CAPTION : (caption.value ?? "");
    }

    getCustomContent(id: string | null): ReactNode {
        const item = this.items.item(id);
        return item ? this.source.props.customContent?.get(item) : null;
    }

    render(id: string | null, placement: CaptionPlacement, htmlFor?: string): ReactNode {
        const { customContentType } = this;
        const plain = customContentType === "no" || (placement === "label" && customContentType === "listItem");
        return plain || id === null ? (
            <CaptionContent htmlFor={htmlFor}>{this.get(id)}</CaptionContent>
        ) : (
            <div className="widget-combobox-caption-custom">{this.getCustomContent(id)}</div>
        );
    }
}
