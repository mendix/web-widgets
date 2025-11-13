import { computed, observable } from "mobx";
import { ReactNode } from "react";
import { EmptyPlaceholderViewModel } from "../EmptyPlaceholder.viewModel";

describe("EmptyPlaceholderViewModel", () => {
    describe("style getter", () => {
        it("reacts to changes in visible columns count", () => {
            const mockWidgets = computed(() => "Empty message" as ReactNode);
            const columnCount = observable.box(3);
            const config = { checkboxColumnEnabled: false, selectorColumnEnabled: false };

            const viewModel = new EmptyPlaceholderViewModel(mockWidgets, columnCount, config);

            expect(viewModel.style).toEqual({ gridColumn: "span 3" });

            columnCount.set(5);
            expect(viewModel.style).toEqual({ gridColumn: "span 5" });

            columnCount.set(0);
            expect(viewModel.style).toEqual({ gridColumn: "span 1" });
        });

        it("reacts to changes in visible columns count with config flags enabled", () => {
            const mockWidgets = computed(() => "Empty message" as ReactNode);
            const columnCount = observable.box(3);
            const config = { checkboxColumnEnabled: true, selectorColumnEnabled: true };

            const viewModel = new EmptyPlaceholderViewModel(mockWidgets, columnCount, config);

            expect(viewModel.style).toEqual({ gridColumn: "span 5" });

            columnCount.set(5);
            expect(viewModel.style).toEqual({ gridColumn: "span 7" });

            columnCount.set(0);
            expect(viewModel.style).toEqual({ gridColumn: "span 2" });
        });
    });

    describe("content getter", () => {
        it("returns widgets from atom", () => {
            const message = "Empty message";
            const atom = computed(() => message);
            const columnCount = observable.box(3);
            const config = { checkboxColumnEnabled: false, selectorColumnEnabled: false };

            const viewModel = new EmptyPlaceholderViewModel(atom, columnCount, config);

            expect(viewModel.content).toBe(message);
        });
    });
});
