import { AttributeMetaData, EditableValue } from "mendix";

type AttributeValue_2 = EditableValue["value"];

export interface FilterSpec<T extends AttributeValue_2> {
    attributes: Array<AttributeMetaData<T>>;
    dataKey: string;
}
