import { ListExpressionValue, ListWidgetValue, ListActionValue } from "mendix";
import { listExp, listWidget } from "@mendix/widget-plugin-test-utils";
import { ItemHelper } from "../helpers/ItemHelper";

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

    build(): ItemHelper {
        return new ItemHelper(this.class, this.content, this.action);
    }

    static sample(patch?: (builder: WidgetItemBuilder) => void): ItemHelper {
        const builder = new WidgetItemBuilder()
            .withItemClass(listExp(() => "item-class"))
            .withContent(listWidget(() => "Item content"));

        if (patch) {
            patch(builder);
        }

        return builder.build();
    }
}
