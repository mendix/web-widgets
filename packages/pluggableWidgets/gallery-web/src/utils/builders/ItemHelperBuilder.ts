import { ListExpressionValue, ListWidgetValue, ListActionValue } from "mendix";
import { listExp, listWidget } from "@mendix/widget-plugin-test-utils";
import { ItemHelper } from "../../helpers/ItemHelper";

export class ItemHelperBuilder {
    private class: ListExpressionValue<string> | undefined = undefined;
    private content: ListWidgetValue | undefined = undefined;
    private action: ListActionValue | undefined = undefined;

    withItemClass(itemClass: ListExpressionValue<string>): ItemHelperBuilder {
        this.class = itemClass;
        return this;
    }

    withContent(val: ListWidgetValue): ItemHelperBuilder {
        this.content = val;
        return this;
    }

    withAction(val: ListActionValue): ItemHelperBuilder {
        this.action = val;
        return this;
    }

    build(): ItemHelper {
        return new ItemHelper(this.class, this.content, this.action);
    }

    static sample(patch?: (builder: ItemHelperBuilder) => void): ItemHelper {
        const builder = new ItemHelperBuilder()
            .withItemClass(listExp(() => "item-class"))
            .withContent(listWidget(() => "Item content"));

        if (patch) {
            patch(builder);
        }

        return builder.build();
    }
}
