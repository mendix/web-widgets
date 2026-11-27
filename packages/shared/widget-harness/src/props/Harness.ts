import type {
    ActionValue,
    DynamicValue,
    EditableValue,
    GUID,
    ListActionValue,
    ListAttributeValue,
    ListExpressionValue,
    ListWidgetValue,
    ObjectItem,
    SelectionMultiValue,
    SelectionSingleValue,
    SimpleFormatter,
    ValueStatus
} from "mendix";
import { formatterFor } from "./formatters.js";
import { DataStore, InputRecord } from "../store/DataStore.js";
import { Emitter } from "../store/Emitter.js";
import { LiveList, LiveListOptions } from "../store/LiveList.js";
import { attributeType, EntityObject, Schema, StoredValue } from "../store/schema.js";

const Available = "available" as ValueStatus.Available;

export type AttributeValue = NonNullable<EditableValue["value"]>;

export interface ActionCall {
    name: string;
    item?: GUID;
    args?: unknown;
}

export interface ActionOptions {
    canExecute?: boolean;
    /** Milliseconds `isExecuting` stays true after `execute`. */
    duration?: number;
    run?: (harness: Harness, item?: ObjectItem, args?: unknown) => void;
}

export interface EditableOptions<T> {
    value?: T;
    readOnly?: boolean;
    formatter?: SimpleFormatter<T>;
    universe?: T[];
}

export function dynamic<T>(value: T): DynamicValue<T> {
    return { status: Available, value };
}

/**
 * Owns the store and every stateful live prop. `version` changes whenever anything a widget can
 * observe changes, so a host re-runs its props factory and passes the widget fresh props.
 */
export class Harness {
    readonly store: DataStore;
    readonly calls: ActionCall[] = [];
    private readonly executing = new Set<string>();
    private readonly emitter = new Emitter();
    private readonly attributeCache = new Map<string, { version: number; value: ListAttributeValue<any> }>();
    private _version = 0;

    constructor(schema: Schema, data: Record<string, InputRecord[]> = {}) {
        this.store = new DataStore(schema, data);
        this.store.subscribe(() => this.bump());
    }

    get version(): number {
        return this._version;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    bump(): void {
        this._version++;
        this.emitter.emit();
    }

    list(options: LiveListOptions): LiveList {
        const list = new LiveList(this.store, options);
        list.subscribe(() => this.bump());
        return list;
    }

    listAttribute<T extends AttributeValue = any>(
        entity: string,
        attr: string,
        options: { readOnly?: boolean } = {}
    ): ListAttributeValue<T> {
        // Values of a list attribute are read-only in the Mendix client.
        const readOnly = options.readOnly ?? true;
        const key = `${entity}.${attr}.${readOnly}`;
        const cached = this.attributeCache.get(key);
        if (cached && cached.version === this.store.version) {
            return cached.value;
        }
        const def = this.store.entity(entity).attributes[attr];
        if (!def) {
            throw new Error(`Entity "${entity}" has no attribute "${attr}"`);
        }
        const formatter = formatterFor(def);
        const type = attributeType(def);
        const values = new Map<GUID, EditableValue<any>>();
        const value = {
            id: attr,
            type,
            sortable: true,
            filterable: true,
            isList: false,
            formatter,
            universe:
                typeof def === "object" ? Object.keys(def.values) : type === "Boolean" ? [true, false] : undefined,
            get: (item: ObjectItem) => {
                let editable = values.get(item.id);
                if (!editable) {
                    editable = this.objectAttribute(this.store.require(item.id), attr, formatter, readOnly);
                    values.set(item.id, editable);
                }
                return editable;
            }
        } as unknown as ListAttributeValue<T>;
        this.attributeCache.set(key, { version: this.store.version, value });
        return value;
    }

    listExpression<T extends AttributeValue>(fn: (obj: EntityObject, harness: Harness) => T): ListExpressionValue<T> {
        return { get: (item: ObjectItem) => dynamic(fn(this.store.require(item.id), this)) } as ListExpressionValue<T>;
    }

    listWidget(fn: (obj: EntityObject, harness: Harness) => unknown): ListWidgetValue {
        return { get: (item: ObjectItem) => fn(this.store.require(item.id), this) } as ListWidgetValue;
    }

    /** A live action. Read `.value` when building props; it changes while the action executes. */
    action(name: string, options: ActionOptions = {}): LiveAction {
        return new LiveAction(this, name, options);
    }

    /** Call while building props; each `get(item)` reflects whether that item's action is executing. */
    listAction(name: string, options: ActionOptions = {}): ListActionValue {
        return {
            get: (item: ObjectItem) =>
                this.actionValue(`${name}:${item.id}`, options, () => {
                    this.calls.push({ name, item: item.id });
                    options.run?.(this, item);
                })
        } as ListActionValue;
    }

    /** @internal */
    actionValue(key: string, options: ActionOptions, run: (args?: unknown) => void): ActionValue {
        return {
            canExecute: options.canExecute ?? true,
            isExecuting: this.executing.has(key),
            execute: (args?: unknown) => {
                if (options.canExecute === false) {
                    return;
                }
                // Like the client: the next props report isExecuting, and a later update clears it.
                this.executing.add(key);
                run(args);
                this.bump();
                setTimeout(() => {
                    this.executing.delete(key);
                    this.bump();
                }, options.duration ?? 0);
            }
        } as ActionValue;
    }

    editable<T extends AttributeValue>(options: EditableOptions<T> = {}): LiveEditable<T> {
        const editable = new LiveEditable<T>(options);
        editable.subscribe(() => this.bump());
        return editable;
    }

    selectionSingle(list: LiveList): LiveSelection<SelectionSingleValue> {
        const selection = new LiveSelection<SelectionSingleValue>("Single", list);
        selection.subscribe(() => this.bump());
        return selection;
    }

    selectionMulti(list: LiveList): LiveSelection<SelectionMultiValue> {
        const selection = new LiveSelection<SelectionMultiValue>("Multi", list);
        selection.subscribe(() => this.bump());
        return selection;
    }

    dynamicValue<T>(value: T): LiveDynamic<T> {
        const live = new LiveDynamic(value);
        live.subscribe(() => this.bump());
        return live;
    }

    private objectAttribute(
        obj: EntityObject,
        attr: string,
        formatter: SimpleFormatter<any>,
        readOnly = false
    ): EditableValue<any> {
        const value = obj.values[attr];
        return {
            status: Available,
            value,
            displayValue: formatter.format(value),
            validation: undefined,
            readOnly,
            formatter,
            isList: false,
            setFormatter: () => undefined,
            setValidator: () => undefined,
            setValue: (next: StoredValue) => {
                if (!readOnly) {
                    this.store.update(obj.id, { [attr]: next });
                }
            },
            setTextValue: (text: string) => {
                const parsed = formatter.parse(text);
                if (!readOnly && parsed.valid) {
                    this.store.update(obj.id, { [attr]: parsed.value });
                }
            }
        } as unknown as EditableValue<any>;
    }
}

export class LiveEditable<T extends AttributeValue> {
    private readonly emitter = new Emitter();
    private validator: ((value: T | undefined) => string | undefined) | undefined;
    private formatter: SimpleFormatter<T>;
    private current: T | undefined;
    private validation: string | undefined;
    private snapshot!: EditableValue<T>;
    readonly history: Array<T | undefined> = [];

    constructor(private readonly options: EditableOptions<T>) {
        this.current = options.value;
        this.formatter = options.formatter ?? {
            format: v => (v === undefined ? "" : String(v)),
            parse: text => ({ valid: true, value: text as T })
        };
        this.publish();
    }

    get value(): EditableValue<T> {
        return this.snapshot;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    set(value: T | undefined): void {
        this.current = value;
        this.history.push(value);
        this.validation = this.validator?.(value);
        this.publish();
    }

    private publish(): void {
        this.snapshot = {
            status: Available,
            value: this.current,
            displayValue: this.formatter.format(this.current),
            validation: this.validation,
            readOnly: this.options.readOnly ?? false,
            formatter: this.formatter,
            universe: this.options.universe,
            isList: false,
            setValue: (value: T | undefined) => {
                if (!this.options.readOnly) {
                    this.set(value);
                }
            },
            setTextValue: (text: string) => {
                const parsed = this.formatter.parse(text);
                if (parsed.valid) {
                    this.snapshot.setValue(parsed.value);
                } else {
                    this.validation = `Invalid value "${text}"`;
                    this.publish();
                }
            },
            setValidator: validator => {
                this.validator = validator;
            },
            setFormatter: formatter => {
                this.formatter = formatter ?? this.formatter;
                this.publish();
            }
        } as EditableValue<T>;
        this.emitter.emit();
    }
}

export class LiveAction {
    constructor(
        private readonly harness: Harness,
        private readonly name: string,
        private readonly options: ActionOptions
    ) {}

    get value(): ActionValue {
        return this.harness.actionValue(this.name, this.options, args => {
            this.harness.calls.push({ name: this.name, args });
            this.options.run?.(this.harness, undefined, args);
        });
    }
}

export class LiveDynamic<T> {
    private readonly emitter = new Emitter();
    private snapshot: DynamicValue<T>;

    constructor(value: T) {
        this.snapshot = dynamic(value);
    }

    get value(): DynamicValue<T> {
        return this.snapshot;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    set(value: T): void {
        this.snapshot = dynamic(value);
        this.emitter.emit();
    }
}

type SelectionOf<V> = V extends SelectionMultiValue ? ObjectItem[] : ObjectItem | undefined;

/**
 * Selection over a list. As in the Mendix client: selecting objects that are not loaded in the
 * list throws, an equal selection is ignored, and every load drops selected objects the list no
 * longer holds unless the `setKeepSelection` predicate keeps them.
 */
export class LiveSelection<V extends SelectionSingleValue | SelectionMultiValue> {
    private readonly emitter = new Emitter();
    private snapshot!: V;
    private current: ObjectItem[] = [];
    private keep: ((item: ObjectItem) => boolean) | undefined;

    constructor(
        private readonly type: "Single" | "Multi",
        private readonly list: LiveList
    ) {
        list.onLoad(items => {
            const ids = new Set(items.map(item => item.id));
            const kept = this.current.filter(item => ids.has(item.id) || this.keep?.(item) === true);
            if (kept.length !== this.current.length) {
                this.current = kept;
                this.publish();
            }
        });
        this.publish();
    }

    get value(): V {
        return this.snapshot;
    }

    get selection(): SelectionOf<V> {
        return (this.type === "Multi" ? this.current : this.current[0]) as SelectionOf<V>;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    private set(value: ObjectItem[] | ObjectItem | undefined): void {
        const next = value === undefined ? [] : Array.isArray(value) ? value : [value];
        const loaded = new Set((this.list.value.items ?? []).map(item => item.id));
        for (const item of next) {
            if (!loaded.has(item.id)) {
                throw new Error(`Value ${String(item)} is not assignable to selection of type ${this.type}.`);
            }
        }
        const same =
            next.length === this.current.length && next.every(item => this.current.some(c => c.id === item.id));
        if (same) {
            return;
        }
        this.current = next;
        this.publish();
    }

    private publish(): void {
        this.snapshot = {
            type: this.type,
            selection: this.selection,
            setSelection: (value: ObjectItem[] | ObjectItem | undefined) => this.set(value),
            setKeepSelection: (predicate: ((item: ObjectItem) => boolean) | undefined) => {
                this.keep = predicate;
            }
        } as unknown as V;
        this.emitter.emit();
    }
}
