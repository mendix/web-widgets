import { EditableValueBuilder } from "../src/builders/EditableValueBuilder.js";
import { ReferenceSetValueBuilder } from "../src/builders/ReferenceSetValueBuilder.js";
import { ReferenceValueBuilder } from "../src/builders/ReferenceValueBuilder.js";
import { SelectionMultiValueBuilder } from "../src/builders/SelectionMultiValueBuilder.js";
import { SelectionSingleValueBuilder } from "../src/builders/SelectionSingleValueBuilder.js";
import { obj } from "../src/primitives/obj.js";

describe("value builders model the Mendix client", () => {
    describe("EditableValueBuilder", () => {
        it("keeps the built value unchanged on setValue and builds a new one with the new value", () => {
            const builder = new EditableValueBuilder<string>().withValue("old");
            const current = builder.build();

            current.setValue("new");

            expect(current.value).toBe("old");
            expect(current.setValue).toHaveBeenCalledWith("new");
            const next = builder.build();
            expect(next).not.toBe(current);
            expect(next.value).toBe("new");
            expect(next.displayValue).toBe("Formatted new");
        });

        it("keeps a built value unchanged when the builder changes afterwards", () => {
            const builder = new EditableValueBuilder<string>().withValue("old");
            const current = builder.build();

            builder.withValue("new").isReadOnly();

            expect(current.value).toBe("old");
            expect(current.readOnly).toBe(false);
        });
    });

    describe("ReferenceValueBuilder", () => {
        it("keeps the built value unchanged on setValue and builds a new one with the new value", () => {
            const [a, b] = [obj("a"), obj("b")];
            const builder = new ReferenceValueBuilder().withValue(a);
            const current = builder.build();

            current.setValue(b);

            expect(current.value).toBe(a);
            expect(current.setValue).toHaveBeenCalledWith(b);
            expect(builder.build().value).toBe(b);
        });
    });

    describe("ReferenceSetValueBuilder", () => {
        it("keeps the built value unchanged on setValue and builds a new one with the new value", () => {
            const [a, b] = [obj("a"), obj("b")];
            const builder = new ReferenceSetValueBuilder().withValue([a]);
            const current = builder.build();

            current.setValue([a, b]);

            expect(current.value).toEqual([a]);
            expect(current.setValue).toHaveBeenCalledWith([a, b]);
            expect(builder.build().value).toEqual([a, b]);
        });

        it("builds a new object even when the value is set to an equal one", () => {
            const builder = new ReferenceSetValueBuilder().withValue([]);
            const current = builder.build();

            current.setValue([]);

            expect(builder.build()).not.toBe(current);
        });
    });

    describe("SelectionSingleValueBuilder", () => {
        it("keeps the built value unchanged on setSelection and builds a new one with the new selection", () => {
            const [a, b] = [obj("a"), obj("b")];
            const builder = new SelectionSingleValueBuilder().withSelected(a);
            const current = builder.build();

            current.setSelection(b);

            expect(current.selection).toBe(a);
            expect(current.setSelection).toHaveBeenCalledWith(b);
            expect(builder.build().selection).toBe(b);
        });
    });

    describe("SelectionMultiValueBuilder", () => {
        it("keeps the built value unchanged on setSelection and builds a new one with the new selection", () => {
            const [a, b] = [obj("a"), obj("b")];
            const builder = new SelectionMultiValueBuilder().withSelected([a]);
            const current = builder.build();

            current.setSelection([a, b]);

            expect(current.selection).toEqual([a]);
            expect(current.setSelection).toHaveBeenCalledWith([a, b]);
            expect(builder.build().selection).toEqual([a, b]);
        });
    });
});
