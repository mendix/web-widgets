import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { makeObservable, computed, autorun, observable, reaction } from "mobx";
import { OptionListFilterInterface, Option } from "../typings/OptionListFilterInterface";
import { OptionsSerializer } from "../stores/OptionsSerializer";

interface CustomOption<T> {
    caption: T;
    value: T;
}

interface Props {
    filterStore: OptionListFilterInterface;
    multiselect: boolean;
    defaultValue?: string;
    valueAttribute?: EditableValue<string>;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    onChange?: ActionValue;
    emptyCaption?: string;
}

export class StaticFilterController {
    private store: OptionListFilterInterface;
    private onChange?: ActionValue;
    private savedValueAttribute?: EditableValue<string>;
    private serializer: OptionsSerializer;
    readonly empty: Option;
    readonly initValue: string | undefined;
    multiselect = false;
    _filterOptions: Array<CustomOption<DynamicValue<string>>>;

    constructor(props: Props) {
        this.store = props.filterStore;
        this.multiselect = props.multiselect;
        this._filterOptions = props.filterOptions;
        this.empty = {
            value: "__EMPTY__",
            caption: props.emptyCaption ?? "",
            selected: false
        };
        this.initValue = props.defaultValue;
        this.onChange = props.onChange;
        this.savedValueAttribute = props.valueAttribute;
        this.serializer = new OptionsSerializer({ store: this.store });

        makeObservable(this, {
            inputValue: computed,
            _filterOptions: observable.struct,
            customOptions: computed
        });
    }

    get inputValue(): string {
        return this.serializer.value ?? "";
    }

    get options(): Option[] {
        return [...this.store.options];
    }

    get customOptions(): Array<CustomOption<string>> {
        return this._filterOptions.map(opt => ({
            caption: `${opt.caption?.value}`,
            value: `${opt.value?.value}`
        }));
    }

    setup(): () => void {
        const disposers: Array<() => void> = [];

        this.store.UNSAFE_setDefaults(this.serializer.fromStorableValue(this.initValue));

        disposers.push(
            autorun(() => {
                if (this.customOptions.length > 0) {
                    this.store.setCustomOptions(this.customOptions);
                }
            })
        );

        disposers.push(
            reaction(
                () => this.serializer.value,
                storableValue => {
                    if (this.savedValueAttribute) {
                        this.savedValueAttribute.setValue(storableValue);
                    }
                    executeAction(this.onChange);
                }
            )
        );

        return () => disposers.forEach(unsub => unsub());
    }

    updateProps(props: Props): void {
        this._filterOptions = props.filterOptions;
        this.onChange = props.onChange;
        this.savedValueAttribute = props.valueAttribute;
    }

    onSelect = (value: string): void => {
        if (value === this.empty.value) {
            this.store.replace([]);
        } else if (this.multiselect) {
            this.store.toggle(value);
        } else {
            this.store.replace([value]);
        }
    };
}
