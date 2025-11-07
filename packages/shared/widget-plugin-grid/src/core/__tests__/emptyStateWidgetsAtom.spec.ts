import { DerivedGate, GateProvider } from "@mendix/widget-plugin-mobx-kit/main";
import { autorun, computed, observable } from "mobx";
import { ReactNode } from "react";
import "../../utils/mobx-test-setup.js";
import { emptyStateWidgetsAtom } from "../models/empty-state.model.js";

describe("emptyStateWidgetsAtom", () => {
    it("returns null when emptyPlaceholder is undefined", () => {
        const gate = new DerivedGate({ props: { emptyPlaceholder: undefined } });
        const itemsCount = computed(() => 0);
        const atom = emptyStateWidgetsAtom(gate, itemsCount);

        expect(atom.get()).toBe(null);
    });

    it("returns null when items count is greater than 0", () => {
        const gate = new DerivedGate({ props: { emptyPlaceholder: "Empty state message" } });
        const itemsCount = computed(() => 5);
        const atom = emptyStateWidgetsAtom(gate, itemsCount);

        expect(atom.get()).toBe(null);
    });

    it("returns null when items count is -1 (loading state)", () => {
        const gate = new DerivedGate({ props: { emptyPlaceholder: "Empty state message" } });
        const itemsCount = computed(() => -1);
        const atom = emptyStateWidgetsAtom(gate, itemsCount);

        expect(atom.get()).toBe(null);
    });

    it("returns emptyPlaceholder when both emptyPlaceholder is defined and itemsCount is exactly 0", () => {
        const message = "Empty state message";
        const gate = new DerivedGate({ props: { emptyPlaceholder: message } });
        const itemsCount = computed(() => 0);
        const atom = emptyStateWidgetsAtom(gate, itemsCount);

        expect(atom.get()).toBe(message);
    });

    describe("reactive behavior", () => {
        it("reacts to changes in both emptyPlaceholder and itemsCount", () => {
            const gateProvider = new GateProvider({
                emptyPlaceholder: undefined as ReactNode
            });
            const itemCountBox = observable.box(5);
            const atom = emptyStateWidgetsAtom(gateProvider.gate, itemCountBox);
            const values: ReactNode[] = [];

            const dispose = autorun(() => values.push(atom.get()));

            // Initial state: no placeholder, items > 0 → null
            expect(values.at(-1)).toBe(null);

            // Add placeholder but items count > 0 → still null
            gateProvider.setProps({ emptyPlaceholder: "Empty message" });
            expect(values.at(-1)).toBe(null);

            // Set items count to 0 → should show placeholder
            itemCountBox.set(0);
            expect(values.at(-1)).toBe("Empty message");

            // Remove placeholder while count is 0 → null
            gateProvider.setProps({ emptyPlaceholder: undefined });
            expect(values.at(-1)).toBe(null);

            // Add different placeholder back with count still 0 → show new placeholder
            gateProvider.setProps({ emptyPlaceholder: "No data available" });
            expect(values.at(-1)).toBe("No data available");

            // Increase count while placeholder exists → null
            itemCountBox.set(3);
            expect(values.at(-1)).toBe(null);

            expect(values).toEqual([null, "Empty message", null, "No data available", null]);

            dispose();
        });
    });
});
