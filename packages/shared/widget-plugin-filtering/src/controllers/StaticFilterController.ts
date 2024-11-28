import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { action, autorun, computed, makeObservable, observable, reaction } from "mobx";
import { OptionsSerializer } from "../stores/OptionsSerializer";
import { Option, OptionListFilterInterface } from "../typings/OptionListFilterInterface";

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
            customOptions: computed,
            updateProps: action,
            handleResetValue: action,
            handleSetValue: action
        });
    }

    get inputValue(): string {
        return this.store.options.flatMap(opt => (opt.selected ? [opt.caption] : [])).join(",");
    }

    get options(): Option[] {
        return [...this.store.options];
    }

    get searchValue(): string {
        return this.store.searchBuffer;
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

        if (this.store.setup) {
            disposers.push(this.store.setup());
        }

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

    onSearch = (search: string): void => {
        this.store.setSearch(search);
    };

    handleResetValue = (useDefaultValue: boolean): void => {
        if (useDefaultValue) {
            this.store.reset();
            return;
        }

        this.store.clear();
    };

    handleSetValue = (useDefaultValue: boolean, params: { operators: any; stringValue: string }): void => {
        if (useDefaultValue) {
            this.store.reset();
            return;
        }
        let value = this.serializer.fromStorableValue(params.stringValue) ?? [];
        if (!this.multiselect) {
            value = value.slice(0, 1);
        }
        if (params.operators) {
            this._filterOptions = params.operators;
        }
        this.store.replace(value);
    };
}
