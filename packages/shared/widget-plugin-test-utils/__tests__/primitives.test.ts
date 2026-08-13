import { Status } from "../src/constants";
import { obj, objArray, attrId, dynamic } from "../src/main";

describe("obj", () => {
    it("returns plain js object with id", () => {
        expect(obj("0")).toMatchObject({ id: "obj_0" });
    });
    it("generate random id by default", () => {
        expect(obj().id).not.toEqual(obj().id);
    });
});

describe("objArray", () => {
    it("returns array of obj", () => {
        expect(objArray(2)).toMatchObject([
            {
                id: expect.any(String)
            },
            {
                id: expect.any(String)
            }
        ]);
    });
});

describe("attrId", () => {
    it("returns string that starts with 'attr_'", () => {
        expect(attrId()).toMatch(/attr_.+/);
    });
});

describe("dynamic", () => {
    describe("dynamic.available", () => {
        it("returns dynamic value mock", () => {
            expect(dynamic.available("someString")).toMatchObject({
                status: Status.Available,
                value: "someString"
            });
        });
    });

    describe("dynamic.loading", () => {
        it("returns loading status with a value", () => {
            expect(dynamic.loading("someString")).toMatchObject({
                status: Status.Loading,
                value: "someString"
            });
        });

        it("returns loading status without a value", () => {
            expect(dynamic.loading()).toMatchObject({
                status: Status.Loading,
                value: undefined
            });
        });
    });

    describe("dynamic.unavailable", () => {
        it("returns unavailable status", () => {
            expect(dynamic.unavailable()).toMatchObject({
                status: Status.Unavailable,
                value: undefined
            });
        });
    });
});
