import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { ListActionValue, ListExpressionValue, ListWidgetValue, ObjectItem } from "mendix";
import { makeAutoObservable } from "mobx";
import { ReactNode } from "react";

export class GalleryItemViewModel {
    constructor(
        private gate: DerivedPropsGate<{
            itemClass?: ListExpressionValue<string>;
            content?: ListWidgetValue;
            onClick?: ListActionValue;
            ariaLabelItem?: ListExpressionValue<string>;
        }>
    ) {
        makeAutoObservable(this);
    }

    private get classValue(): ListExpressionValue<string> | undefined {
        return this.gate.props.itemClass;
    }

    private get contentValue(): ListWidgetValue | undefined {
        return this.gate.props.content;
    }

    private get clickValue(): ListActionValue | undefined {
        return this.gate.props.onClick;
    }

    private get labelValue(): ListExpressionValue<string> | undefined {
        return this.gate.props.ariaLabelItem;
    }

    class(item: ObjectItem): string | undefined {
        return this.classValue?.get(item).value;
    }

    content(item: ObjectItem): ReactNode {
        return this.contentValue?.get(item);
    }

    label(item: ObjectItem): string | undefined {
        return this.labelValue?.get(item).value;
    }

    hasOnClick(item: ObjectItem): boolean {
        return !!this.clickValue?.get(item);
    }
}
