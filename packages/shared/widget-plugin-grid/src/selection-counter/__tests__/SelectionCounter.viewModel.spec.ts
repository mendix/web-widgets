import { computed, observable } from "mobx";
import { SelectionCounterViewModel } from "../SelectionCounter.viewModel-atoms";

describe("SelectionCounterViewModel", () => {
    describe("selectedCount", () => {
        it("returns value from selected atom", () => {
            const selected = computed(() => 5);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "5 items selected" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "top" });

            expect(viewModel.selectedCount).toBe(5);
        });

        it("updates reactively when atom changes", () => {
            const selectedBox = observable.box(3);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selectedBox, texts, { position: "top" });

            expect(viewModel.selectedCount).toBe(3);

            selectedBox.set(10);
            expect(viewModel.selectedCount).toBe(10);
        });
    });

    describe("selectedCountText", () => {
        it("returns value from texts object", () => {
            const selected = computed(() => 5);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "5 items selected" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "top" });

            expect(viewModel.selectedCountText).toBe("5 items selected");
        });
    });

    describe("clearButtonLabel", () => {
        it("returns value from texts object", () => {
            const selected = computed(() => 0);
            const texts = { clearSelectionButtonLabel: "Clear selection", selectedCountText: "" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "top" });

            expect(viewModel.clearButtonLabel).toBe("Clear selection");
        });
    });

    describe("isTopCounterVisible", () => {
        it("returns true when position is top and selectedCount > 0", () => {
            const selected = computed(() => 5);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "top" });

            expect(viewModel.isTopCounterVisible).toBe(true);
        });

        it("returns false when position is top but selectedCount is 0", () => {
            const selected = computed(() => 0);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "top" });

            expect(viewModel.isTopCounterVisible).toBe(false);
        });

        it("returns false when position is not top", () => {
            const selected = computed(() => 5);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "bottom" });

            expect(viewModel.isTopCounterVisible).toBe(false);
        });
    });

    describe("isBottomCounterVisible", () => {
        it("returns true when position is bottom and selectedCount > 0", () => {
            const selected = computed(() => 5);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "bottom" });

            expect(viewModel.isBottomCounterVisible).toBe(true);
        });

        it("returns false when position is bottom but selectedCount is 0", () => {
            const selected = computed(() => 0);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "bottom" });

            expect(viewModel.isBottomCounterVisible).toBe(false);
        });

        it("returns false when position is not bottom", () => {
            const selected = computed(() => 5);
            const texts = { clearSelectionButtonLabel: "Clear", selectedCountText: "text" };
            const viewModel = new SelectionCounterViewModel(selected, texts, { position: "top" });

            expect(viewModel.isBottomCounterVisible).toBe(false);
        });
    });
});
