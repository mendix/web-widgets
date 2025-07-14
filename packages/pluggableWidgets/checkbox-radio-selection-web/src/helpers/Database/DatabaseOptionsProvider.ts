import { ListValue, ObjectItem } from "mendix";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { CaptionsProvider } from "../types";

export class DatabaseOptionsProvider extends BaseOptionsProvider<ObjectItem | undefined, { ds: ListValue }> {
    constructor(
        caption: CaptionsProvider,
        private _objectsMap: Map<string, ObjectItem>
    ) {
        super(caption);
    }

    _updateProps(props: { ds: ListValue }): void {
        this._objectsMap.clear();
        this.options = [];

        if (props.ds && props.ds.status === "available") {
            props.ds.items?.forEach(item => {
                const key = item.id;
                this._objectsMap.set(key, item);
                this.options.push(key);
            });
        }
    }

    _optionToValue(option: string | null): ObjectItem | undefined {
        return this._objectsMap.get(option || "");
    }

    _valueToOption(value: ObjectItem | undefined): string | null {
        return value?.id ?? null;
    }
}
