jest.mock("mendix/filters/builders");
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ListAttributeValue } from "mendix";
import { configure } from "mobx";
import { attrId, listAttribute } from "@mendix/widget-plugin-test-utils";
import { DynamicFilterBuilder, DynamicFilterBuilderTexts } from "../dynamic/DynamicFilterBuilder";
import { DynamicFilterSet } from "../dynamic/DynamicFilterSet";

configure({ enforceActions: "never" });

function attr(id: string, type: ListAttributeValue["type"], universe?: unknown[]): ListAttributeValue {
    const a = listAttribute(() => "") as unknown as ListAttributeValue;
    a.id = attrId(id);
    (a as { type: string }).type = type;
    (a as { universe?: unknown[] }).universe = universe;
    (a as { formatter: unknown }).formatter = {
        format: (v: unknown) => (v == null ? "" : String(v)),
        parse: (v: string) => ({ valid: true, value: v })
    };
    return a;
}

const texts: DynamicFilterBuilderTexts = {
    addFilter: "Add filter",
    clearAll: "Clear all",
    removeFilter: "Remove filter",
    fieldPicker: "Filter field"
};

function makeSet(): DynamicFilterSet {
    return new DynamicFilterSet([
        { key: "name", attribute: attr("name", "String"), label: "Name" },
        { key: "status", attribute: attr("status", "Enum", ["open", "closed"]), label: "Status" }
    ]);
}

function renderBuilder(set: DynamicFilterSet, t = texts): ReturnType<typeof render> {
    return render(<DynamicFilterBuilder filterSet={set} texts={t} name="grid" />);
}

function withRows(keys: string[]): DynamicFilterSet {
    const set = makeSet();
    for (const key of keys) {
        const row = set.addRow();
        set.setField(row.id, key);
    }
    return set;
}

const removeButtons = (): HTMLElement[] => screen.getAllByRole("button", { name: /^Remove filter/ });

describe("DynamicFilterBuilder", () => {
    it("renders each row as a list item that starts with its remove button", () => {
        const { container } = renderBuilder(withRows(["name", "status"]));
        const items = container.querySelectorAll("ul.dynamic-filters-list > li.dynamic-filters-row");
        expect(items).toHaveLength(2);
        items.forEach(li => {
            expect(li.firstElementChild).toHaveClass("dynamic-filters-remove");
            expect(li.children[1]).toHaveClass("dynamic-filters-field");
            expect(li.children[2]).toHaveClass("dynamic-filters-value");
        });
        expect(container.firstElementChild).toHaveClass("widget-dynamic-filters");
    });

    it("renders no operator control for enumeration rows", () => {
        const { container } = renderBuilder(withRows(["name", "status"]));
        const [textRow, enumRow] = Array.from(container.querySelectorAll(".dynamic-filters-value"));
        expect(textRow.querySelector(".filter-selector")).not.toBeNull();
        expect(enumRow.querySelector(".filter-selector")).toBeNull();
    });

    it("shows only Add filter when the Filter Set is empty", () => {
        renderBuilder(makeSet());
        expect(screen.getByRole("button", { name: "Add filter" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
        expect(screen.queryByRole("list")).toBeNull();
    });

    it("adds a blank row, shows Clear all and focuses the field picker", () => {
        const { container } = renderBuilder(makeSet());
        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
        });
        expect(container.querySelectorAll(".dynamic-filters-row")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Clear all" })).toHaveClass(
            "btn",
            "btn-link",
            "dynamic-filters-clear"
        );
        expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Filter field" }));
    });

    it("uses captions from texts", () => {
        renderBuilder(withRows(["name"]), {
            addFilter: "Filter toevoegen",
            clearAll: "Alles wissen",
            removeFilter: "Filter verwijderen",
            fieldPicker: "Veld"
        });
        expect(screen.getByRole("button", { name: "Filter toevoegen" })).toHaveClass("btn", "btn-secondary");
        expect(screen.getByRole("button", { name: "Alles wissen" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Filter verwijderen Name" })).toBeInTheDocument();
    });

    it("names remove buttons with the field label", () => {
        renderBuilder(withRows(["status"]));
        expect(screen.getByRole("button", { name: "Remove filter Status" })).toBeInTheDocument();
    });

    it("moves focus to the row that took the removed row's place", () => {
        const set = withRows(["name", "status", "name"]);
        renderBuilder(set);
        const thirdRowId = set.rows[2].id;
        act(() => {
            fireEvent.click(removeButtons()[1]);
        });
        expect(set.rows.map(r => r.id)).toContain(thirdRowId);
        expect(document.activeElement).toBe(removeButtons()[1]);
    });

    it("moves focus to the new last row when the last row is removed", () => {
        renderBuilder(withRows(["name", "status"]));
        act(() => {
            fireEvent.click(removeButtons()[1]);
        });
        expect(document.activeElement).toBe(removeButtons()[0]);
    });

    it("moves focus to Add filter when the only row is removed", () => {
        renderBuilder(withRows(["name"]));
        act(() => {
            fireEvent.click(removeButtons()[0]);
        });
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add filter" }));
    });

    it("clears all rows and focuses Add filter", () => {
        const set = withRows(["name", "status"]);
        renderBuilder(set);
        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
        });
        expect(set.rows).toHaveLength(0);
        expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add filter" }));
    });
});
