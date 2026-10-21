import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { action, computed, makeObservable, observable } from "mobx";
import { reduceArray, restoreArray } from "@mendix/filter-commons/condition-utils";
import { AllFunctions } from "@mendix/filter-commons/typings/FilterFunctions";
import { FilterData, PlainJs, Serializable } from "@mendix/filter-commons/typings/settings";
import { EnumFilterStore } from "@mendix/widget-plugin-dropdown-filter/stores/EnumFilterStore";
import {
    FilterFieldConfig,
    FilterFieldOption,
    FilterKind,
    KIND_DEFAULT_FUNCTION,
    KIND_FUNCTIONS,
    kindOf,
    PersistedDynamicFilter
} from "./typings";
import { attrgroupFilterStore, InputFilterStore } from "../stores/input/store-utils";
import { ConditionWithMeta } from "../typings/ConditionWithMeta";

export type RowStore = InputFilterStore | EnumFilterStore;

export class DynamicFilterRow {
    fieldKey: string | null = null;
    kind: FilterKind | null = null;
    store: RowStore | null = null;

    constructor(public readonly id: number) {
        makeObservable(this, {
            fieldKey: observable,
            kind: observable,
            store: observable.ref
        });
    }

    get condition(): FilterCondition | undefined {
        return this.store?.condition;
    }
}

interface RowMeta {
    rows: string;
    fields: Array<string | null>;
}

/** The Dynamic Filters applied to a list-style widget, combined with AND. */
export class DynamicFilterSet implements Serializable {
    readonly metaKey = "DynamicFilterSet";
    rows: DynamicFilterRow[] = [];
    private fieldList: FilterFieldConfig[] = [];
    private optionList: FilterFieldOption[] = [];
    private nextId = 1;
    private warned = new Set<string>();

    constructor(fields: FilterFieldConfig[] = [], options: FilterFieldOption[] = []) {
        this.fieldList = fields;
        this.optionList = options;

        makeObservable<this, "fieldList" | "optionList">(this, {
            rows: observable.shallow,
            fieldList: observable.ref,
            optionList: observable.ref,
            fields: computed,
            condWithMeta: computed,
            addRow: action,
            removeRow: action,
            clear: action,
            setField: action,
            updateConfig: action,
            fromJSON: action,
            hydrate: action
        });
    }

    /** Filter Fields that can be offered to end users. */
    get fields(): FilterFieldConfig[] {
        return this.fieldList.filter(field => {
            const ok = field.attribute.filterable && kindOf(field.attribute.type) !== null;
            if (!ok) {
                this.warnOnce(
                    `field:${field.key}`,
                    `Dynamic filters: the attribute of filter field "${field.key}" can't be filtered and is left out.`
                );
            }
            return ok;
        });
    }

    field(key: string | null): FilterFieldConfig | undefined {
        return key === null ? undefined : this.fields.find(f => f.key === key);
    }

    /** Replace the Filter Field config, for example after props update. */
    updateConfig(fields: FilterFieldConfig[], options: FilterFieldOption[]): void {
        this.fieldList = fields;
        this.optionList = options;
        this.rows = this.rows.filter(row => row.fieldKey === null || this.field(row.fieldKey) !== undefined);
        for (const row of this.rows) {
            const field = this.field(row.fieldKey);
            if (field && row.store) {
                updateStoreAttribute(row.store, field.attribute);
                this.applyOptions(row, field);
            }
        }
    }

    addRow(): DynamicFilterRow {
        const row = new DynamicFilterRow(this.nextId++);
        this.rows.push(row);
        return row;
    }

    removeRow(id: number): void {
        this.rows = this.rows.filter(row => row.id !== id);
    }

    clear(): void {
        this.rows = [];
    }

    setField(id: number, key: string): void {
        const row = this.rows.find(r => r.id === id);
        const field = this.field(key);
        if (!row || !field || row.fieldKey === key) {
            return;
        }
        const kind = kindOf(field.attribute.type);
        const store = this.createStore(field);
        if (!store || !kind) {
            return;
        }

        const prev = row.store;
        const carryOver = prev && row.kind === kind && kind !== "enum";
        if (carryOver) {
            store.fromJSON(prev.toJSON());
        }

        row.fieldKey = key;
        row.kind = kind;
        row.store = store;
        this.applyOptions(row, field);
    }

    get condWithMeta(): ConditionWithMeta {
        const [cond, rows] = reduceArray(this.rows.map(row => row.condition));
        const meta: RowMeta = { rows, fields: this.rows.map(row => row.fieldKey) };
        return { cond, meta: JSON.stringify(meta) };
    }

    /** Restore rows from the datasource view state (back navigation). */
    hydrate({ cond, meta }: ConditionWithMeta): void {
        let parsed: RowMeta;
        try {
            parsed = JSON.parse(meta) as RowMeta;
        } catch {
            return;
        }
        if (!parsed || !Array.isArray(parsed.fields) || typeof parsed.rows !== "string") {
            return;
        }
        const conditions = restoreArray(cond, parsed.rows);
        this.rows = [];
        parsed.fields.forEach((key, i) => {
            const row = this.addRow();
            if (key === null) {
                return;
            }
            this.setField(row.id, key);
            if (row.fieldKey === null) {
                this.removeRow(row.id);
                return;
            }
            const rowCond = conditions[i];
            if (rowCond) {
                row.store?.fromViewState(rowCond);
            }
        });
    }

    toJSON(): PlainJs {
        const data: PersistedDynamicFilter[] = this.rows.flatMap(row =>
            row.fieldKey && row.store ? [{ field: row.fieldKey, data: row.store.toJSON() ?? null }] : []
        );
        return data as unknown as PlainJs;
    }

    /** Restore rows from persisted data. Invalid rows are dropped silently. */
    fromJSON(data: PlainJs | undefined): void {
        this.rows = [];
        if (!Array.isArray(data)) {
            return;
        }
        for (const item of data) {
            if (!isPersistedRow(item)) {
                continue;
            }
            const field = this.field(item.field);
            const kind = field ? kindOf(field.attribute.type) : null;
            if (!field || !kind) {
                continue;
            }
            const restored = this.validData(kind, field, item.data);
            if (restored === undefined) {
                continue;
            }
            const row = this.addRow();
            this.setField(row.id, field.key);
            if (row.store === null) {
                this.removeRow(row.id);
                continue;
            }
            row.store.fromJSON(restored);
        }
    }

    private validData(kind: FilterKind, field: FilterFieldConfig, data: FilterData): FilterData | undefined {
        if (kind === "enum") {
            if (!Array.isArray(data) || data.some(v => typeof v !== "string")) {
                return undefined;
            }
            const values = data as string[];
            if (values.length === 0) {
                return [];
            }
            const allowed = this.allowedEnumValues(field);
            const kept = values.filter(v => allowed.has(v));
            return kept.length > 0 ? kept : undefined;
        }
        if (data === null || data === undefined) {
            return null;
        }
        if (!Array.isArray(data) || data.length !== 3 || !KIND_FUNCTIONS[kind].has(data[0] as AllFunctions)) {
            return undefined;
        }
        return data;
    }

    private allowedEnumValues(field: FilterFieldConfig): Set<string> {
        const options = this.optionsFor(field.key);
        if (options.length > 0) {
            return new Set(options.map(o => o.value));
        }
        return new Set(Array.from(field.attribute.universe ?? [], v => `${v}`));
    }

    private optionsFor(key: string): FilterFieldOption[] {
        return this.optionList.filter(o => o.fieldKey === key);
    }

    private createStore(field: FilterFieldConfig): RowStore | null {
        const result = attrgroupFilterStore(field.attribute.type, field.attribute, null);
        if (result.hasError) {
            return null;
        }
        const store = result.value;
        const kind = kindOf(field.attribute.type);
        if (store.storeType === "input" && kind && kind !== "enum") {
            store.UNSAFE_setDefaults([KIND_DEFAULT_FUNCTION[kind] as never], true);
        }
        return store;
    }

    private applyOptions(row: DynamicFilterRow, field: FilterFieldConfig): void {
        const options = this.optionsFor(field.key);
        if (options.length === 0) {
            return;
        }
        if (row.store instanceof EnumFilterStore) {
            row.store.setCustomOptions(options.map(({ caption, value }) => ({ caption, value })));
        } else {
            this.warnOnce(
                `options:${field.key}`,
                `Dynamic filters: enumeration options for "${field.key}" are ignored because it isn't an enumeration or Boolean field.`
            );
        }
    }

    private warnOnce(id: string, message: string): void {
        if (!this.warned.has(id)) {
            this.warned.add(id);
            console.warn(message);
        }
    }
}

function isPersistedRow(item: unknown): item is PersistedDynamicFilter {
    return typeof item === "object" && item !== null && typeof (item as { field?: unknown }).field === "string";
}

function updateStoreAttribute(store: RowStore, attribute: ListAttributeValue): void {
    if (store instanceof EnumFilterStore) {
        store._attributes = [attribute];
    } else {
        store.updateProps([attribute]);
    }
}
