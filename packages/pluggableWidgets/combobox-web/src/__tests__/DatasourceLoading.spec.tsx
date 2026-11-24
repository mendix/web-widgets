import "@testing-library/jest-dom";
jest.mock("../hooks/useFloatingMenu");
import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import { resetIdCounter } from "downshift";
import { ListValue } from "mendix";
import {
    EditableValueBuilder,
    list,
    ListValueBuilder,
    setupIntersectionObserverStub
} from "@mendix/widget-plugin-test-utils";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import Combobox from "../Combobox";
import {
    allItems,
    associationSingleProps,
    captionExpression,
    databaseSingleProps,
    itemA
} from "../helpers/__tests__/fixtures";

function boundTo(value: string | undefined): ComboboxContainerProps["databaseAttributeString"] {
    return new EditableValueBuilder<string>()
        .withValue(value)
        .build() as ComboboxContainerProps["databaseAttributeString"];
}

function currentFilter(ds: ListValue): ListValue["filter"] | "never set" {
    const calls = (ds.setFilter as jest.Mock).mock.calls;
    return calls.length === 0 ? "never set" : calls[calls.length - 1][0];
}

// Any filter matches only itemA, which is what a lookup of the bound value "v_a" returns.
class FakeServer {
    filter: ListValue["filter"] = undefined;
    limit = 0;

    view(): ListValue {
        const items = this.filter ? [itemA] : allItems.slice(0, this.limit);
        const ds = new ListValueBuilder()
            .withItems(items)
            .withLimit(this.limit)
            .withHasMore(!this.filter && this.limit < allItems.length)
            .build();
        (ds.setFilter as jest.Mock).mockImplementation(filter => (this.filter = filter));
        (ds.setLimit as jest.Mock).mockImplementation(limit => (this.limit = limit));
        return { ...ds, filter: this.filter };
    }
}

function settle(component: RenderResult, props: () => ComboboxContainerProps): void {
    for (let round = 0; round < 5; round++) {
        act(() => jest.runAllTimers());
        component.rerender(<Combobox {...props()} />);
    }
}

function input(component: RenderResult): HTMLInputElement {
    return component.getByRole("combobox") as HTMLInputElement;
}

function shownCaption(component: RenderResult): string | null {
    return component.container.querySelector(".widget-combobox-placeholder-text")?.textContent ?? null;
}

describe("Combo box datasource loading", () => {
    beforeAll(() => setupIntersectionObserverStub());
    beforeEach(() => resetIdCounter());

    describe("database, single selection", () => {
        it("shows the placeholder, not the bound value, while the datasource loads for the first time", () => {
            const component = render(
                <Combobox {...databaseSingleProps({ ds: list.loading(), databaseAttributeString: boundTo("v_a") })} />
            );

            expect(component.container.querySelector(".widget-combobox-placeholder")).toBeInTheDocument();
            expect(component.queryByRole("combobox")).not.toBeInTheDocument();
        });

        it("shows the caption of the bound value once the first load ends", () => {
            const component = render(
                <Combobox {...databaseSingleProps({ ds: list.loading(), databaseAttributeString: boundTo("v_a") })} />
            );

            component.rerender(
                <Combobox {...databaseSingleProps({ ds: list(allItems), databaseAttributeString: boundTo("v_a") })} />
            );

            expect(component.container.querySelector(".widget-combobox-placeholder")).not.toBeInTheDocument();
            expect(shownCaption(component)).toBe("Apple");
        });

        it("keeps the caption and the loaded options while the datasource reloads", () => {
            const loaded = databaseSingleProps({ ds: list(allItems), databaseAttributeString: boundTo("v_a") });
            const component = render(<Combobox {...loaded} />);

            component.rerender(
                <Combobox {...databaseSingleProps({ ds: list.loading(), databaseAttributeString: boundTo("v_a") })} />
            );

            expect(shownCaption(component)).toBe("Apple");
            fireEvent.click(input(component));
            expect(component.getAllByRole("option").map(option => option.textContent)).toEqual([
                "Apple",
                "Banana",
                "Cherry",
                "Date"
            ]);
        });
    });

    describe("database, single selection with lazy loading", () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it("shows the looked-up bound value, then the full page when the menu opens", () => {
            const server = new FakeServer();
            const props = (): ComboboxContainerProps =>
                databaseSingleProps({ ds: server.view(), lazyLoading: true, databaseAttributeString: boundTo("v_a") });
            const component = render(<Combobox {...props()} />);
            settle(component, props);

            expect(shownCaption(component)).toBe("Apple");

            fireEvent.click(input(component));
            settle(component, props);

            expect(component.getAllByRole("option").map(option => option.textContent)).toEqual([
                "Apple",
                "Banana",
                "Cherry",
                "Date"
            ]);
        });
    });

    describe("association, single selection", () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it("filters the loaded options in the browser when the caption is an expression, even with lazy loading", () => {
            const ds = new ListValueBuilder().withItems(allItems).build();
            const component = render(
                <Combobox
                    {...associationSingleProps({
                        ds,
                        lazyLoading: true,
                        captionType: "expression",
                        optionsSourceAssociationCaptionExpression: captionExpression()
                    })}
                />
            );

            fireEvent.click(input(component));
            fireEvent.change(input(component), { target: { value: "Ban" } });
            act(() => jest.runAllTimers());

            expect(component.getAllByRole("option").map(option => option.textContent)).toEqual(["expr:Banana"]);
            // An expression cannot be filtered on the server, so the datasource is never narrowed.
            expect(["never set", undefined]).toContain(currentFilter(ds));
        });

        it("keeps the selected caption while the options datasource reloads", () => {
            const component = render(<Combobox {...associationSingleProps({ ds: list(allItems) })} />);
            expect(shownCaption(component)).toBe("Apple");

            component.rerender(<Combobox {...associationSingleProps({ ds: list.loading() })} />);

            expect(shownCaption(component)).toBe("Apple");
        });
    });
});
