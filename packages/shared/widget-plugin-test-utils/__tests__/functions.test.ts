import {
    listAttribute,
    obj,
    reference,
    referenceSet,
    list,
    listAction,
    listReference,
    listReferenceSet,
    objArray,
    cases
} from "../src/main";

describe("prop mocking functions", () => {
    describe("list", () => {
        it("returns ListValue mock with n items", () => {
            const prop = list(4);
            expect(prop.status).toBe("available");
            expect(prop.items).toHaveLength(4);
        });

        it("returns ListValue mock with no items when n is 0", () => {
            expect(list(0).items).toHaveLength(0);
        });

        it("returns ListValue mock with provided items", () => {
            const arr = [obj(), obj(), obj()];
            expect(list(arr).items).toBe(arr);
        });
    });

    describe("listAction", () => {
        it("returns ListActionValue mock with get method", () => {
            const prop = listAction();
            expect(prop.get(obj()).isExecuting).toBe(false);
            expect(jest.isMockFunction(prop.get(obj()).execute)).toBe(true);
        });
    });

    describe("listAttribute", () => {
        it("returns ListAttributeValue mock", () => {
            const t: Date = new Date("2024-09-01T00:00:00.000Z");
            const attr = listAttribute(() => new Date(t));
            expect(attr.get(obj()).value!).toEqual(t);
        });
    });

    describe("listExpression", () => {
        it.todo("returns ListExpressionValue mock");
    });

    describe("listWidget", () => {
        it.todo("returns ListWidgetValue mock");
    });

    describe("ref", () => {
        it("returns ReferenceValue mock with undefined value", () => {
            const ref1 = reference();
            expect(ref1).toMatchObject({
                readOnly: false,
                status: "available",
                type: "Reference",
                validation: undefined,
                value: undefined
            });
            expect(jest.isMockFunction(ref1.setValidator)).toBe(true);
            expect(jest.isMockFunction(ref1.setValidator)).toBe(true);
        });

        it("take factory as first argument", () => {
            const ref1 = reference(builder => builder.withValue(obj("0")).isLoading().build());
            expect(ref1).toMatchObject({
                readOnly: true,
                status: "loading",
                type: "Reference",
                validation: undefined,
                value: { id: "obj_0" }
            });
        });
    });

    describe("refSet", () => {
        it("returns ReferenceSetValue mock with undefined value", () => {
            const ref1 = referenceSet();
            expect(ref1).toMatchObject({
                readOnly: false,
                status: "available",
                type: "ReferenceSet",
                validation: undefined,
                value: undefined
            });
            expect(jest.isMockFunction(ref1.setValidator)).toBe(true);
            expect(jest.isMockFunction(ref1.setValidator)).toBe(true);
        });

        it("take factory as first argument", () => {
            const ref1 = referenceSet(builder =>
                builder
                    .withValue([obj("0")])
                    .isLoading()
                    .build()
            );
            expect(ref1).toMatchObject({
                readOnly: true,
                status: "loading",
                type: "ReferenceSet",
                validation: undefined,
                value: [{ id: "obj_0" }]
            });
        });

        it("returns mock with working setValue", () => {
            const ref1 = referenceSet();
            ref1.setValue([obj("007")]);
            expect(ref1.value).toEqual([obj("007")]);
            ref1.setValue([obj("939")]);
            expect(ref1.value).toEqual([obj("939")]);
        });
    });

    describe("listReference", () => {
        it("returns ListReferenceValue mock", () => {
            const prop = listReference();
            expect(prop).toMatchObject({
                type: "Reference",
                filterable: true,
                id: expect.stringMatching(/listRef_.+/),
                get: expect.any(Function)
            });
            expect(jest.isMockFunction(prop.get)).toBe(true);
            expect(prop.get(obj())).toMatchObject({
                status: expect.any(String),
                value: {
                    id: expect.stringMatching(/obj_.+/)
                }
            });
        });
    });

    describe("listReferenceSet", () => {
        it("returns ListReferenceSetValue mock", () => {
            const prop = listReferenceSet();
            expect(prop).toMatchObject({
                type: "ReferenceSet",
                filterable: true,
                id: expect.stringMatching(/listRefSet_.+/),
                get: expect.any(Function)
            });
            expect(jest.isMockFunction(prop.get)).toBe(true);
            expect(prop.get(obj())).toMatchObject({
                status: expect.any(String),
                value: [
                    {
                        id: expect.stringMatching(/obj_.+/)
                    }
                ]
            });
        });
    });

    describe("cases", () => {
        it("throw if there is no default case", () => {
            expect(() => {
                cases([obj(), ""]);
            }).toThrow();
        });

        it("returns mapper that takes obj and returns value from the case", () => {
            const item = obj();
            const mapFn = cases([item, "item value"], [undefined, "None"]);
            expect(mapFn(item)).toBe("item value");
        });

        it("use default case if item not found", () => {
            const mapFn = cases([obj(), "item value"], [undefined, "None"]);
            expect(mapFn(obj())).toBe("None");
        });

        it("can work with listAttr", () => {
            const items = objArray(5);
            const [a, b, c] = items;
            const mapFn = cases([a, "Alice"], [b, "Bob"], [c, "Chuck"], [undefined, "None"]);
            const props = {
                datasource: list(items),
                name: listAttribute(mapFn)
            };

            expect(props.datasource.items?.map(item => props.name.get(item).value)).toEqual([
                "Alice",
                "Bob",
                "Chuck",
                "None",
                "None"
            ]);
        });
    });
});
