import { OptionsSourceStaticDataSourceType } from "../../../typings/SelectionControlsProps";
import { BaseOptionsProvider } from "../BaseOptionsProvider";
import { CaptionsProvider } from "../types";

export class StaticOptionsProvider extends BaseOptionsProvider<
    OptionsSourceStaticDataSourceType | undefined,
    { ds: OptionsSourceStaticDataSourceType[] }
> {
    constructor(
        caption: CaptionsProvider,
        private _objectsMap: Map<string, OptionsSourceStaticDataSourceType>
    ) {
        super(caption);
    }

    _updateProps(props: { ds: OptionsSourceStaticDataSourceType[] }): void {
        this._objectsMap.clear();
        this.options = [];

        props.ds.forEach((item, index) => {
            const key = index.toString();
            this._objectsMap.set(key, item);
            this.options.push(key);
        });
    }

    _optionToValue(option: string | null): OptionsSourceStaticDataSourceType | undefined {
        return this._objectsMap.get(option || "");
    }

    _valueToOption(value: OptionsSourceStaticDataSourceType | undefined): string | null {
        if (!value) return null;

        for (const [key, item] of this._objectsMap.entries()) {
            if (item === value) {
                return key;
            }
        }
        return null;
    }
}
