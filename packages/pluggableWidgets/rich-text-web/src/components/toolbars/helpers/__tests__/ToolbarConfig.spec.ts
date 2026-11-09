import { buildAdvancedToolbar, getFilteredToolbarGroups, getSecondaryToolbarGroups } from "../../ToolbarConfig";

describe("buildAdvancedToolbar", () => {
    it("maps the header item to the text format dropdown", () => {
        const groups = buildAdvancedToolbar([{ ctItemType: "header" }]);

        expect(groups).toHaveLength(1);
        expect(groups[0].buttons).toHaveLength(1);
        expect(groups[0].buttons[0].name).toBe("textFormat");
    });

    it("shows an item only once when it is added to more than one group", () => {
        const groups = buildAdvancedToolbar([
            { ctItemType: "bold" },
            { ctItemType: "tableBetter" },
            { ctItemType: "separator" },
            { ctItemType: "tableBetter" },
            { ctItemType: "italic" }
        ]);

        expect(groups.map(group => group.buttons.map(button => button.name))).toEqual([
            ["bold", "insertTable"],
            ["italic"]
        ]);
    });

    it("drops a group whose items are all shown in an earlier group", () => {
        const groups = buildAdvancedToolbar([
            { ctItemType: "link" },
            { ctItemType: "separator" },
            { ctItemType: "link" }
        ]);

        expect(groups.map(group => group.buttons.map(button => button.name))).toEqual([["insertLink"]]);
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
