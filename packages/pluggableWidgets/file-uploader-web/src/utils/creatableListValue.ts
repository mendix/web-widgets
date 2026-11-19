import { ListValue, ObjectItem } from "mendix";

/**
 * Object creation on list datasources, added to the Pluggable Widgets API in Studio Pro 11.17 (beta, WTF-2690).
 * Only available when the datasource property declares `allowCreate="true"`.
 *
 * TODO: remove once the `mendix` typings include these members.
 */
export type CreatableListValue = ListValue & {
    /** Whether the current user may create objects of the datasource entity. */
    readonly canCreate: "available" | "unavailable";
    /** Objects created through `create()` that are not part of `items`. */
    readonly createdItems: ObjectItem[];
    /** Creates a new, uncommitted object of the datasource entity. */
    create(): Promise<ObjectItem>;
};

export function isCreatable(ds: ListValue | undefined): ds is CreatableListValue {
    return !!ds && typeof (ds as Partial<CreatableListValue>).create === "function";
}

export function canCreate(ds: ListValue | undefined): boolean {
    return isCreatable(ds) && ds.canCreate === "available";
}
