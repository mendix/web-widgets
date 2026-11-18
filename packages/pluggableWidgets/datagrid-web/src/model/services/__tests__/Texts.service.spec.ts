import { mockContainerProps, mockTexts } from "../../../utils/test-utils";
import { createDatagridContainer } from "../../containers/createDatagridContainer";
import { CORE_TOKENS as CORE, SA_TOKENS } from "../../tokens";

describe("TextsService", () => {
    it("reads aria labels from system texts", () => {
        const [container] = createDatagridContainer(mockContainerProps());
        const texts = container.get(CORE.texts);

        expect(texts.headerAriaLabel).toBe("Filters");
        expect(texts.exportDialogLabel).toBe("Export progress");
        expect(texts.cancelExportLabel).toBe("Cancel data export");
        expect(texts.selectRowLabel).toBe("Select row");
        expect(texts.selectAllRowsLabel).toBe("Select all rows");
        expect(texts.singleSelectionColumnLabel).toBe("Select single row");
        expect(texts.selectingAllLabel).toBe("Selecting all items...");
        expect(texts.cancelSelectionLabel).toBe("Cancel selection");
    });

    it("passes the system text key to translate", () => {
        const texts = mockTexts();
        const translate = jest.spyOn(texts, "translate");
        const [container] = createDatagridContainer(mockContainerProps({ texts }));

        expect(container.get(CORE.texts).headerAriaLabel).toBe("Filters");
        expect(translate).toHaveBeenCalledWith("filterSectionTitle");
    });

    it("returns translated texts, including widget level overrides", () => {
        const [container] = createDatagridContainer(
            mockContainerProps({ texts: mockTexts({ selectRowLabel: "Rij selecteren" }) })
        );

        expect(container.get(CORE.texts).selectRowLabel).toBe("Rij selecteren");
    });
});

describe("SelectionProgressDialogViewModel", () => {
    it("uses the 'selecting all' text for the dialog label", () => {
        const [, selectAllModule] = createDatagridContainer(
            mockContainerProps({
                texts: mockTexts({ selectingAllLabel: "Alle items selecteren...", selectAllRowsLabel: "Select all" })
            })
        );
        const vm = selectAllModule.get(SA_TOKENS.selectionDialogVM);

        expect(vm.selectingAllLabel).toBe("Alle items selecteren...");
        expect(vm.cancelSelectionLabel).toBe("Cancel selection");
    });
});
