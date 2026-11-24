import type { InputRecord, Schema } from "../../src/main";

export const peopleSchema: Schema = {
    Person: {
        attributes: {
            firstName: "String",
            lastName: "String",
            age: "Integer",
            active: "Boolean",
            color: { type: "Enum", values: { red: "Red", green: "Green", blue: "Blue" } }
        }
    }
};

const firstNames = ["Loretta", "Chad", "Ada", "Brian", "Cleo", "Dmitri", "Elena", "Farah", "Gus", "Hana"];
const lastNames = ["Moss", "Kent", "Lovelace", "Okafor", "Novak"];
const colors = ["red", "green", "blue"];

/** 30 people; ids "p01".."p30"; ages 20..49 in a shuffled but fixed order. */
export const people: InputRecord[] = Array.from({ length: 30 }, (_, i) => ({
    id: `p${String(i + 1).padStart(2, "0")}`,
    firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length],
    age: 20 + ((i * 7) % 30),
    active: i % 2 === 0,
    color: colors[i % colors.length]
}));
