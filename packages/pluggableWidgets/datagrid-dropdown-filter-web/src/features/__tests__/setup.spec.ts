import { EMPTY_OPTION_VALUE, finalizeOptions, parseInitValues } from "../setup";

describe("setup", () => {
    describe("parseSelected", () => {
        it("convert string to array of values", () => {
            expect(parseInitValues("")).toStrictEqual([]);
            expect(parseInitValues("foo")).toStrictEqual(["foo"]);
            expect(parseInitValues("foo,bar,baz,22,12")).toStrictEqual(["foo", "bar", "baz", "22", "12"]);
        });
    });

    describe("finalizeOptions", () => {
        it("add 'empty' option at the beginning of the options array", () => {
            expect(finalizeOptions([], { multiSelect: false })).toStrictEqual([
                { caption: "", value: EMPTY_OPTION_VALUE }
            ]);
            expect(finalizeOptions([{ caption: "A", value: "1" }], { multiSelect: false })).toStrictEqual([
                { caption: "", value: EMPTY_OPTION_VALUE },
                { caption: "A", value: "1" }
            ]);
        });

        it("set 'empty' option caption, if provided", () => {
            expect(
                finalizeOptions([{ caption: "A", value: "1" }], { multiSelect: false, emptyOptionCaption: "None" })
            ).toStrictEqual([
                { caption: "None", value: EMPTY_OPTION_VALUE },
                { caption: "A", value: "1" }
            ]);
        });

        it("return it's argument, if multiSelect true", () => {
            const options = [{ value: "Foo", caption: "Foo" }];
            expect(finalizeOptions(options, { multiSelect: true, emptyOptionCaption: "None" })).toBe(options);
        });
    });
});
