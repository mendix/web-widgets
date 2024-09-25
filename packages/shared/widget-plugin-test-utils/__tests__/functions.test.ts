import { listAttr, obj, ref, refSet } from "../src/functions";

describe("API mock functions", () => {
    describe("listAttr", () => {
        it("returns ListAttributeValue", () => {
            const t: Date = new Date("2024-09-01T00:00:00.000Z");
            const attr = listAttr(() => new Date(t));
            expect(attr.get(obj()).value!).toEqual(t);
        });
    });

    describe("obj", () => {
        it("returns plain js object with id", () => {
            expect(obj("0")).toMatchObject({ id: "obj_0" });
        });
    });

    describe("ref", () => {
        it("returns ReferenceValue with undefined value", () => {
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
        it("returns ReferenceSetValue with undefined value", () => {
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
});
