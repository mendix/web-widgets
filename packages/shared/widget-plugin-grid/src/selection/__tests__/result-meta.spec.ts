import { value, error } from "../result-meta.js";

describe("result-meta", () => {
    describe("value", () => {
        it("return correct wrapper", () => {
            const data = {};
            const output = value(data);
            expect(output.hasError).toEqual(false);
            expect(output.value).toEqual(data);
        });
    });
    describe("error", () => {
        it("return correct wrapper", () => {
            const err = new Error();
            const output = error(err);
            expect(output.hasError).toEqual(true);
            expect(output.error).toEqual(err);
        });
    });
});
