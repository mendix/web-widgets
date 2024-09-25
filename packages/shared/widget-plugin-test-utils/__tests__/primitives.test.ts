import { obj, attrId } from "../src/main";

describe("obj", () => {
    it("returns plain js object with id", () => {
        expect(obj("0")).toMatchObject({ id: "obj_0" });
    });
});

describe("attrId", () => {
    it("returns string that starts with 'attr_'", () => {
        expect(attrId()).toMatch(/attr_.+/);
    });
});
