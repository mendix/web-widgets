import type { InputRecord, Schema } from "../../src/main";

/**
 * Mirrors the Person data of the datagrid-web test project (mendix/testProjects,
 * branch datagrid-web/data-widgets-3.0-atlas4), so behavior specs expect the same values on both targets.
 */
export const testProjectSchema: Schema = {
    "MyFirstModule.Person": {
        attributes: {
            PersonId: "AutoNumber",
            FirstName: "String",
            LastName: "String",
            Age: "Integer",
            Birthday: "DateTime",
            CustomConfig: "String"
        }
    }
};

export const testProjectData: Record<string, InputRecord[]> = {
    "MyFirstModule.Person": [
        { PersonId: 1, FirstName: "test", LastName: "test", Age: 10, Birthday: new Date(1604587803000) },
        { PersonId: 2, FirstName: "test2", LastName: "test2", Age: 11, Birthday: new Date(1606301403000) },
        { PersonId: 3, FirstName: "test3", LastName: "test3", Age: 12, Birthday: new Date(1601898603000) }
    ]
};
