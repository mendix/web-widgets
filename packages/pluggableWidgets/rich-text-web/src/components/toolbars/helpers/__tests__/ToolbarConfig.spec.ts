import { buildAdvancedToolbar } from "../../ToolbarConfig";

describe("buildAdvancedToolbar", () => {
    it("maps the header item to the text format dropdown", () => {
        const groups = buildAdvancedToolbar([{ ctItemType: "header" }]);

        expect(groups).toHaveLength(1);
        expect(groups[0].buttons).toHaveLength(1);
        expect(groups[0].buttons[0].name).toBe("textFormat");
    });
});
