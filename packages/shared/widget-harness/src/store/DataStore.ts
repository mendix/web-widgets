import { Big } from "big.js";
import type { GUID, ObjectItem } from "mendix";
import { Emitter } from "./Emitter.js";
import { attributeType, EntityObject, EntitySchema, isNumeric, MemberKind, Schema, StoredValue } from "./schema.js";

export type InputValue = StoredValue | number | string[] | null;
export type InputRecord = Record<string, InputValue> & { id?: string };

/**
 * In-memory object store. Holds plain entity objects, hands out stable `ObjectItem`s
 * and notifies subscribers after every mutation.
 */
export class DataStore {
    private readonly objects = new Map<GUID, EntityObject>();
    private readonly items = new Map<GUID, ObjectItem>();
    private readonly emitter = new Emitter();
    private nextId = 1;
    private _version = 0;

    constructor(
        public readonly schema: Schema,
        data: Record<string, InputRecord[]> = {}
    ) {
        for (const [entity, records] of Object.entries(data)) {
            for (const record of records) {
                this.put(entity, record);
            }
        }
    }

    get version(): number {
        return this._version;
    }

    subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

    entity(name: string): EntitySchema {
        const entity = this.schema[name];
        if (!entity) {
            throw new Error(`Unknown entity "${name}"`);
        }
        return entity;
    }

    memberKind(entity: string, member: string): MemberKind {
        const schema = this.entity(entity);
        if (member in schema.attributes) {
            return "attribute";
        }
        const association = schema.associations?.[member];
        if (association) {
            return association.type;
        }
        throw new Error(`Entity "${entity}" has no member "${member}"`);
    }

    all(entity: string): EntityObject[] {
        return [...this.objects.values()].filter(obj => obj.entity === entity);
    }

    get(id: GUID): EntityObject | undefined {
        return this.objects.get(id);
    }

    require(id: GUID): EntityObject {
        const obj = this.objects.get(id);
        if (!obj) {
            throw new Error(`Object "${id}" does not exist`);
        }
        return obj;
    }

    item(id: GUID): ObjectItem {
        let item = this.items.get(id);
        if (!item) {
            item = Object.freeze({ id });
            this.items.set(id, item);
        }
        return item;
    }

    insert(entity: string, record: InputRecord): GUID {
        const id = this.put(entity, record);
        this.changed();
        return id;
    }

    update(id: GUID, patch: Record<string, InputValue>): void {
        const obj = this.require(id);
        this.objects.set(id, { ...obj, values: { ...obj.values, ...this.normalize(obj.entity, patch) } });
        this.changed();
    }

    remove(id: GUID): void {
        if (this.objects.delete(id)) {
            this.changed();
        }
    }

    private put(entity: string, record: InputRecord): GUID {
        const { id: inputId, ...values } = record;
        const id = (inputId ?? this.generateId()) as GUID;
        if (this.objects.has(id)) {
            throw new Error(`Duplicate object id "${id}"`);
        }
        this.objects.set(id, { id, entity, values: this.normalize(entity, values) });
        return id;
    }

    private generateId(): string {
        return String(this.nextId++).padStart(12, "0");
    }

    private normalize(entity: string, values: Record<string, InputValue>): Record<string, StoredValue> {
        const schema = this.entity(entity);
        const result: Record<string, StoredValue> = {};
        for (const [key, value] of Object.entries(values)) {
            const kind = this.memberKind(entity, key);
            if (value === null || value === undefined) {
                result[key] = kind === "ReferenceSet" ? [] : undefined;
            } else if (kind === "attribute") {
                const type = attributeType(schema.attributes[key]);
                if (isNumeric(type)) {
                    result[key] = new Big(value as number | string | Big);
                } else if (type === "DateTime") {
                    result[key] = value instanceof Date ? value : new Date(value as string);
                } else {
                    result[key] = value as StoredValue;
                }
            } else {
                result[key] = value as GUID | GUID[];
            }
        }
        return result;
    }

    private changed(): void {
        this._version++;
        this.emitter.emit();
    }
}
