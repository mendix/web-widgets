import { buildAdvancedToolbar, getFilteredToolbarGroups, getSecondaryToolbarGroups } from "../../ToolbarConfig";

describe("buildAdvancedToolbar", () => {
    it("maps the header item to the text format dropdown", () => {
        const groups = buildAdvancedToolbar([{ ctItemType: "header" }]);

        expect(groups).toHaveLength(1);
        expect(groups[0].buttons).toHaveLength(1);
        expect(groups[0].buttons[0].name).toBe("textFormat");
    });
});

describe("getSecondaryToolbarGroups", () => {
    it("includes the table operations for a preset that has the table group", () => {
        const groups = getSecondaryToolbarGroups(getFilteredToolbarGroups("full"));

        expect(groups.map(group => group.name)).toEqual(["table-operations"]);
    });

    it("includes the table operations for an advanced toolbar with the table item in any group", () => {
        const groups = getSecondaryToolbarGroups(
            buildAdvancedToolbar([{ ctItemType: "bold" }, { ctItemType: "separator" }, { ctItemType: "tableBetter" }])
        );

        expect(groups.map(group => group.name)).toEqual(["table-operations"]);
    });

    it("excludes the table operations when no group has the table button", () => {
        expect(getSecondaryToolbarGroups(getFilteredToolbarGroups("basic"))).toEqual([]);
        expect(getSecondaryToolbarGroups(buildAdvancedToolbar([{ ctItemType: "bold" }]))).toEqual([]);
    });
});
