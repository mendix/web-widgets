import { ListExpressionValue, ListWidgetValue, ListActionValue } from "mendix";
import { listExp, listWidget } from "@mendix/widget-plugin-test-utils";
import { WidgetItem } from "../helpers/WidgetItem";

export class WidgetItemBuilder {
    private class: ListExpressionValue<string> | undefined = undefined;
    private content: ListWidgetValue | undefined = undefined;
    private action: ListActionValue | undefined = undefined;

    withItemClass(itemClass: ListExpressionValue<string>): WidgetItemBuilder {
        this.class = itemClass;
        return this;
    }

    withContent(val: ListWidgetValue): WidgetItemBuilder {
        this.content = val;
        return this;
    }

    withAction(val: ListActionValue): WidgetItemBuilder {
        this.action = val;
        return this;
    }

    build(): WidgetItem {
        return new WidgetItem(this.class, this.content, this.action);
    }

    static sample(patch?: (builder: WidgetItemBuilder) => void): WidgetItem {
        const builder = new WidgetItemBuilder()
            .withItemClass(listExp(() => "item-class"))
            .withContent(listWidget(() => "Item content"));

        if (patch) {
            patch(builder);
        }

        return builder.build();
    }
}
