import Big from "big.js";
import { EditableValue } from "mendix";
import { dynamic, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { getReadonly } from "../utils";

describe("getReadonly", () => {
    describe("when targetAttribute is readOnly", () => {
        it("is read-only regardless of customEditability 'default'", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").isReadOnly().build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "default",
                dynamic.available(true)
            );

            expect(result).toBe(true);
        });

        it("is read-only regardless of customEditability 'never'", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").isReadOnly().build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "never",
                dynamic.available(true)
            );

            expect(result).toBe(true);
        });

        it("is read-only regardless of customEditability 'conditionally' with expression true", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").isReadOnly().build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "conditionally",
                dynamic.available(true)
            );

            expect(result).toBe(true);
        });
    });

    describe("when targetAttribute is editable", () => {
        it("is editable when customEditability is 'default'", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "default",
                dynamic.available(true)
            );

            expect(result).toBe(false);
        });

        it("is read-only when customEditability is 'never'", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "never",
                dynamic.available(true)
            );

            expect(result).toBe(true);
        });

        it("is read-only when customEditability is 'conditionally' and expression value is false", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "conditionally",
                dynamic.available(false)
            );

            expect(result).toBe(true);
        });

        it("is editable when customEditability is 'conditionally' and expression value is true", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "conditionally",
                dynamic.available(true)
            );

            expect(result).toBe(false);
        });

        it("is read-only when customEditability is 'conditionally' and expression is loading", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "conditionally",
                dynamic.loading()
            );

            expect(result).toBe(true);
        });

        it("is read-only when customEditability is 'conditionally' and expression is unavailable", () => {
            const targetAttribute = new EditableValueBuilder<string>().withValue("value").build();

            const result = getReadonly(
                targetAttribute as unknown as EditableValue<string | Big>,
                "conditionally",
                dynamic.unavailable()
            );

            expect(result).toBe(true);
        });
    });

    describe("when targetAttribute is undefined", () => {
        it("is read-only when customEditability is 'never'", () => {
            const result = getReadonly(undefined, "never", dynamic.available(true));

            expect(result).toBe(true);
        });

        it("is editable when customEditability is 'default'", () => {
            const result = getReadonly(undefined, "default", dynamic.available(false));

            expect(result).toBe(false);
        });

        it("is read-only when customEditability is 'conditionally' and expression value is false", () => {
            const result = getReadonly(undefined, "conditionally", dynamic.available(false));

            expect(result).toBe(true);
        });

        it("is editable when customEditability is 'conditionally' and expression value is true", () => {
            const result = getReadonly(undefined, "conditionally", dynamic.available(true));

            expect(result).toBe(false);
        });

        it("is read-only when customEditability is 'conditionally' and expression is loading", () => {
            const result = getReadonly(undefined, "conditionally", dynamic.loading());

            expect(result).toBe(true);
        });

        it("is read-only when customEditability is 'conditionally' and expression is unavailable", () => {
            const result = getReadonly(undefined, "conditionally", dynamic.unavailable());

            expect(result).toBe(true);
        });
    });
});
