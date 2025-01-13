import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";
import { attribute, equals, literal, or } from "mendix/filters/builders";
import { makeAutoObservable, observable } from "mobx";
import { selectedFromCond } from "../../condition-utils";
import { OptionWithState } from "../../typings/OptionWithState";
import { FilterData } from "../../typings/settings";
import { SearchStore } from "./SearchStore";
import { SelectedItemsStore } from "./SelectedItemsStore";

interface CustomOption {
    caption: string;
    value: string;
}

export class StaticSelectFilterStore {
    readonly disposers = [] as Array<() => void>;
    readonly storeType = "select";
    _attributes: ListAttributeValue[] = [];
    _customOptions: CustomOption[] = [];
    search: SearchStore;
    stateHasBeenSet = false;

    private selectState: SelectedItemsStore;

    constructor(attributes: ListAttributeValue[], initCond: FilterCondition | null) {
        this.search = new SearchStore();
        this.selectState = new SelectedItemsStore();
        this._attributes = attributes;

        makeAutoObservable(this, {
            _attributes: observable.struct,
            _customOptions: observable.struct
        });

        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    get allOptions(): OptionWithState[] {
        const selected = this.selectState.selected;

        if (this._customOptions.length > 0) {
            return this._customOptions.map(opt => ({ ...opt, selected: selected.has(opt.value) }));
        }

        const options = this._attributes.flatMap(attr =>
            Array.from(attr.universe ?? [], value => {
                const stringValue = `${value}`;
                return {
                    caption: attr.formatter.format(value),
                    value: stringValue,
                    selected: selected.has(stringValue)
                };
            })
        );

        return options;
    }

    get options(): OptionWithState[] {
        if (!this.search.value) {
            return this.allOptions;
        }

        return this.allOptions.filter(opt => opt.caption.toLowerCase().includes(this.search.value.toLowerCase()));
    }

    get universe(): Set<string> {
        return new Set(this._attributes.flatMap(attr => Array.from(attr.universe ?? [], value => `${value}`)));
    }

    get condition(): FilterCondition | undefined {
        const selected = this.selectState.selected;
        const conditions = this._attributes.flatMap(attr => {
            const cond = getFilterCondition(attr, selected);
            return cond ? [cond] : [];
        });
        return conditions.length > 1 ? or(...conditions) : conditions[0];
    }

    get selected(): Set<string> {
        return this.selectState.selected;
    }

    setup(): () => void {
        this.disposers.push(this.search.setup());
        return () => {
            this.disposers.forEach(dispose => dispose());
            this.disposers.length = 0;
        };
    }

    setDefaultSelected(defaultSelected?: Iterable<string>): void {
        if (!this.stateHasBeenSet && defaultSelected) {
            this.selectState.setDefaultSelected(defaultSelected);
            this.selectState.reset();
            this.stateHasBeenSet = true;
        }
    }

    setCustomOptions(options: CustomOption[]): void {
        this._customOptions = options;
    }

    clear = (): void => this.selectState.clear();

    reset = (): void => this.selectState.reset();

    toggle = (value: string): void => this.selectState.toggle(value);

    setSelected = (value: string[]): void => {
        this.selectState.setSelected(value);
    };

    updateProps(attributes: ListAttributeValue[]): void {
        this._attributes = attributes;
    }

    checkAttrs(): TypeError | null {
        const isValidAttr = (attr: ListAttributeValue): boolean => /Enum|Boolean/.test(attr.type);

        if (this._attributes.every(isValidAttr)) {
            return null;
        }

        return new TypeError("StaticSelectFilterStore: invalid attribute found. Check widget configuration.");
    }

    isValidValue(value: string): boolean {
        return this.universe.has(value);
    }

    toJSON(): string[] {
        return [...this.selectState.selected];
    }

    fromJSON(data: FilterData): void {
        if (Array.isArray(data) && data.every(item => typeof item === "string")) {
            this.selectState.setSelected(data as string[]);
        }
        this.stateHasBeenSet = true;
    }

    fromViewState(cond: FilterCondition): void {
        const val = (exp: LiteralExpression): string | undefined =>
            exp.valueType === "string"
                ? exp.value
                : exp.valueType === "boolean"
                ? exp.value
                    ? "true"
                    : "false"
                : undefined;

        const selected = selectedFromCond(cond, val);

        if (selected.length < 1) {
            return;
        }

        this.selectState.setSelected(selected);
        this.stateHasBeenSet = true;
    }
}

function getFilterCondition(
    listAttribute: ListAttributeValue | undefined,
    selected: Set<string>
): FilterCondition | undefined {
    if (!listAttribute || !listAttribute.filterable || selected.size === 0) {
        return undefined;
    }

    const { id, type } = listAttribute;
    const filterAttribute = attribute(id);

    const filters = [...selected]
        .filter(value => listAttribute.universe?.includes(universeValue(listAttribute.type, value)))
        .map(value => equals(filterAttribute, literal(universeValue(type, value))));

    if (filters.length > 1) {
        return or(...filters);
    }

    const [filterValue] = filters;
    return filterValue;
}

function universeValue(type: ListAttributeValue["type"], value: string): boolean | string {
    if (type === "Boolean") {
        if (value !== "true" && value !== "false") {
            return value;
        }
        return value === "true";
    }
    return value;
}
