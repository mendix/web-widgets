import { readFileSync } from "fs";
import { join } from "path";

// The package carries a copy of the typings that combobox-web generates from Combobox.xml, as a
// .ts file so that the declarations are emitted. The copy and the generated file must not drift.
describe("ComboboxProps typings", () => {
    it("matches the typings generated from Combobox.xml in combobox-web", () => {
        const generated = join(__dirname, "../../../../../pluggableWidgets/combobox-web/typings/ComboboxProps.d.ts");
        expect(readFileSync(join(__dirname, "../ComboboxProps.ts"), "utf8")).toBe(readFileSync(generated, "utf8"));
    });
});
