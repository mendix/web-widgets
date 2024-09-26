import { listAttr, obj, ref, refSet, list, listAction, listRef } from "../src/main";

describe("prop mocking functions", () => {
    describe("list", () => {
        it("returns ListValue mock with n items", () => {
            const prop = list(4);
            expect(prop.status).toBe("available");
            expect(prop.items).toHaveLength(4);
        });
    });

    describe("listAction", () => {
        it("returns ListActionValue mock with get method", () => {
            const prop = listAction();
            expect(prop.get(obj()).isExecuting).toBe(false);
            expect(jest.isMockFunction(prop.get(obj()).execute)).toBe(true);
        });
    });

    describe("listAttr", () => {
        it("returns ListAttributeValue mock", () => {
            const t: Date = new Date("2024-09-01T00:00:00.000Z");
            const attr = listAttr(() => new Date(t));
            expect(attr.get(obj()).value!).toEqual(t);
        });
    });

    describe("listExp", () => {
        it.todo("returns ListExpressionValue mock");
    });

    describe("listWidget", () => {
        it.todo("returns ListWidgetValue mock");
    });

    describe("ref", () => {
        it("returns ReferenceValue mock with undefined value", () => {
            const ref1 = ref();
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
            const ref1 = ref(builder => builder.withValue(obj("0")).isLoading().build());
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
            const ref1 = refSet();
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
            const ref1 = refSet(builder =>
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
            const ref1 = refSet();
            ref1.setValue([obj("007")]);
            expect(ref1.value).toEqual([obj("007")]);
            ref1.setValue([obj("939")]);
            expect(ref1.value).toEqual([obj("939")]);
        });
    });

    describe("listRef", () => {
        it("returns ListReferenceValue mock", () => {
            const prop = listRef();
            expect(prop).toMatchObject({
                filterable: true,
                id: expect.stringMatching(/listRef_.+/),
                get: expect.any(jest.fn.constructor)
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

    describe("listRefSet", () => {
        it.todo("returns ListReferenceSetValue mock");
    });
});
