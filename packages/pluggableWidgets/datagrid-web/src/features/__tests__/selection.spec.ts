import { SelectionProps, selectionSettings } from "../../features/selection";
import {
    SelectionSingleValueBuilder as SingleBuilder,
    SelectionMultiValueBuilder as MultiBuilder
} from "@mendix/pluggable-test-utils";
import { MultiSelectionHelper, SelectionHelper } from "@mendix/pluggable-widgets-commons";

describe("features/selection", () => {
    function props(
        x: SelectionProps["itemSelection"],
        y: SelectionProps["itemSelectionMethod"],
        z: SelectionProps["showSelectAllToggle"] = true
    ): SelectionProps {
        return { itemSelection: x, itemSelectionMethod: y, showSelectAllToggle: z };
    }

    describe("selection method", () => {
        it("is none, when selection is off", () => {
            const helper = undefined;

            expect(selectionSettings(props(undefined, "checkbox"), helper).selectionMethod).toBe("none");
            expect(selectionSettings(props("None", "checkbox"), helper).selectionMethod).toBe("none");
        });

        it("depends on the value of itemSelectionMethod prop", () => {
            const helper = undefined;

            expect(selectionSettings(props(new SingleBuilder().build(), "checkbox"), helper).selectionMethod).toBe(
                "checkbox"
            );

            expect(selectionSettings(props("Single", "checkbox"), helper).selectionMethod).toBe("checkbox");

            expect(selectionSettings(props(new SingleBuilder().build(), "rowClick"), helper).selectionMethod).toBe(
                "rowClick"
            );

            expect(selectionSettings(props("Single", "rowClick"), helper).selectionMethod).toBe("rowClick");

            expect(selectionSettings(props(new MultiBuilder().build(), "checkbox"), helper).selectionMethod).toBe(
                "checkbox"
            );

            expect(selectionSettings(props("Multi", "checkbox"), helper).selectionMethod).toBe("checkbox");

            expect(selectionSettings(props(new MultiBuilder().build(), "rowClick"), helper).selectionMethod).toBe(
                "rowClick"
            );

            expect(selectionSettings(props("Multi", "rowClick"), helper).selectionMethod).toBe("rowClick");
        });
    });

    describe("selection status", () => {
        it("should be undefined when selection off or selection mode is single", () => {
            const helperSingle = { type: "Single" } as SelectionHelper;

            expect(selectionSettings(props(undefined, "checkbox"), helperSingle).selectionStatus).toBeUndefined();

            expect(selectionSettings(props("None", "checkbox"), helperSingle).selectionStatus).toBeUndefined();

            expect(
                selectionSettings(props(new SingleBuilder().build(), "checkbox"), helperSingle).selectionStatus
            ).toBeUndefined();

            expect(selectionSettings(props("Single", "checkbox"), helperSingle).selectionStatus).toBeUndefined();
            expect(selectionSettings(props("Single", "checkbox"), helperSingle).selectionStatus).toBeUndefined();
        });

        describe("when selection type Multi", () => {
            it("should be undefined when showSelectAllToggle is false", () => {
                const helperMulti = { type: "Multi", selectionStatus: "none" } as SelectionHelper;

                expect(
                    selectionSettings(props(new MultiBuilder().build(), "checkbox", false), helperMulti).selectionStatus
                ).toBeUndefined();

                expect(
                    selectionSettings(props("Multi", "checkbox", false), helperMulti).selectionStatus
                ).toBeUndefined();
            });

            it("should be undefined when selection method is rowClick", () => {
                const helperMulti = { type: "Multi", selectionStatus: "some" } as SelectionHelper;

                expect(
                    selectionSettings(props(new MultiBuilder().build(), "rowClick"), helperMulti).selectionStatus
                ).toBeUndefined();

                expect(selectionSettings(props("Multi", "rowClick"), helperMulti).selectionStatus).toBeUndefined();
            });

            it("should be same as in helper at runtime", () => {
                expect(
                    selectionSettings(props(new MultiBuilder().build(), "checkbox"), {
                        type: "Multi",
                        selectionStatus: "some"
                    } as MultiSelectionHelper).selectionStatus
                ).toBe("some");

                expect(
                    selectionSettings(props(new MultiBuilder().build(), "checkbox"), {
                        type: "Multi",
                        selectionStatus: "none"
                    } as MultiSelectionHelper).selectionStatus
                ).toBe("none");

                expect(
                    selectionSettings(props(new MultiBuilder().build(), "checkbox"), {
                        type: "Multi",
                        selectionStatus: "all"
                    } as MultiSelectionHelper).selectionStatus
                ).toBe("all");
            });

            it("should be always none at design mode", () => {
                expect(
                    selectionSettings(props("Multi", "checkbox"), {
                        type: "Multi",
                        selectionStatus: "some"
                    } as MultiSelectionHelper).selectionStatus
                ).toBe("none");

                expect(
                    selectionSettings(props("Multi", "checkbox"), {
                        type: "Multi",
                        selectionStatus: "none"
                    } as MultiSelectionHelper).selectionStatus
                ).toBe("none");

                expect(
                    selectionSettings(props("Multi", "checkbox"), {
                        type: "Multi",
                        selectionStatus: "all"
                    } as MultiSelectionHelper).selectionStatus
                ).toBe("none");
            });
        });
    });
});
