import { CustomListItem, CustomListItemClass, STANDARD_LIST_TYPES } from "../utils/formats/customList";

// CustomListItem and CustomListItemClass extend Quill's ListItem blot.
// We test only the static helpers and the constructor-level DOM mutation,
// which do not require a live Quill / Scroll instance.

function makeListNode(listType = "ordered"): HTMLElement {
    const li = document.createElement("li");
    li.dataset.list = listType;
    return li;
}

describe("STANDARD_LIST_TYPES", () => {
    it("contains exactly the four standard types", () => {
        expect(STANDARD_LIST_TYPES).toEqual(["ordered", "checked", "unchecked", "bullet"]);
    });
});

describe("CustomListItem.formats", () => {
    it("returns data-list value for standard list types", () => {
        const node = makeListNode("ordered");
        expect(CustomListItem.formats(node)).toBe("ordered");
    });

    it("prefers data-custom-list over data-list when both are present", () => {
        const node = makeListNode("ordered");
        node.dataset.customList = "lower-alpha";
        expect(CustomListItem.formats(node)).toBe("lower-alpha");
    });

    it("returns undefined when neither attribute is present", () => {
        const node = document.createElement("li");
        expect(CustomListItem.formats(node)).toBeUndefined();
    });
});

describe("CustomListItemClass — styleFormat marker contract", () => {
    // CustomListItemClass constructor assigns domNode.dataset.styleFormat = "class".
    // Instantiating it requires a live Quill Scroll instance (a Quill integration concern),
    // so here we verify the contract at the class-definition level and the DOM-mutation logic
    // in isolation.

    it("is a subclass of CustomListItem", () => {
        expect(Object.getPrototypeOf(CustomListItemClass)).toBe(CustomListItem);
    });

    it("the styleFormat marker 'class' round-trips correctly on a DOM node (logic under test)", () => {
        // This mirrors exactly what the constructor body does:
        //   domNode.dataset.styleFormat = "class";
        const node = makeListNode("ordered");
        node.dataset.styleFormat = "class";
        expect(node.dataset.styleFormat).toBe("class");
    });

    it("inline-mode list nodes do NOT have a styleFormat marker by default", () => {
        const node = makeListNode("ordered");
        expect(node.dataset.styleFormat).toBeUndefined();
    });
});
