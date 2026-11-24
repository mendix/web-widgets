import type { Big } from "big.js";
import type { GUID } from "mendix";

export type PrimitiveAttributeType =
    "String" | "HashString" | "Integer" | "Long" | "Decimal" | "AutoNumber" | "Boolean" | "DateTime";

export type AttributeDef = PrimitiveAttributeType | { type: "Enum"; values: Record<string, string> };

export interface AssociationDef {
    type: "Reference" | "ReferenceSet";
    target: string;
}

export interface EntitySchema {
    attributes: Record<string, AttributeDef>;
    associations?: Record<string, AssociationDef>;
}

export type Schema = Record<string, EntitySchema>;

export type StoredValue = string | boolean | Date | Big | GUID | GUID[] | undefined;

export interface EntityObject {
    readonly id: GUID;
    readonly entity: string;
    readonly values: Readonly<Record<string, StoredValue>>;
}

export type MemberKind = "attribute" | "Reference" | "ReferenceSet";

export function attributeType(def: AttributeDef): PrimitiveAttributeType | "Enum" {
    return typeof def === "string" ? def : def.type;
}

export function isNumeric(type: string): boolean {
    return type === "Integer" || type === "Long" || type === "Decimal" || type === "AutoNumber";
}
