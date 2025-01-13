import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { action, autorun, computed, makeObservable, observable, reaction } from "mobx";
import { OptionsSerializer } from "../stores/picker/OptionsSerializer";
import { StaticSelectFilterStore } from "../stores/picker/StaticSelectFilterStore";
import { OptionWithState } from "../typings/OptionWithState";

interface CustomOption<T> {
    caption: T;
    value: T;
}

interface Props {
    filterStore: StaticSelectFilterStore;
    multiselect: boolean;
    defaultValue?: string;
    valueAttribute?: EditableValue<string>;
    filterOptions: Array<CustomOption<DynamicValue<string>>>;
    onChange?: ActionValue;
    emptyCaption?: string;
}

export class StaticFilterController {
    private store: StaticSelectFilterStore;
    private onChange?: ActionValue;
    private savedValueAttribute?: EditableValue<string>;
    private serializer: OptionsSerializer;
    readonly empty: OptionWithState;
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
            updateProps: action
        });
    }

    get inputValue(): string {
        return this.store.options.flatMap(opt => (opt.selected ? [opt.caption] : [])).join(",");
    }

    get options(): OptionWithState[] {
        return [...this.store.options];
    }

    get searchValue(): string {
        return "";
    }

    get customOptions(): Array<CustomOption<string>> {
        return this._filterOptions.map(opt => ({
            caption: `${opt.caption?.value}`,
            value: `${opt.value?.value}`
        }));
    }

    setup(): () => void {
        const disposers: Array<() => void> = [];

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

    onSelect = (_: string | null): void => {
        // if (value === this.empty.value || value === null) {
        //     this.store.replace([]);
        //     this.store.setSearch("");
        // } else if (this.multiselect) {
        //     this.store.toggle(value);
        // } else {
        //     this.store.replace([value]);
        // }
    };

    onSearch = (_: string): void => {
        // this.store.setSearch(search);
    };
}
