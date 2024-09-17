import { listAttr, obj } from "../src/functions";

describe("API mock functions", () => {
    describe("listAttr", () => {
        test("create ListAttributeValue", () => {
            const t: Date = new Date("2024-09-01T00:00:00.000Z");
            const attr = listAttr(() => new Date(t));
            expect(attr.get(obj()).value!).toEqual(t);
        });
    });
});
