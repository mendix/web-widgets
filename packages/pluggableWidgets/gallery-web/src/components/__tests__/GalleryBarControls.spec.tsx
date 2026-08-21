import { render, RenderResult } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { ReactElement } from "react";
import { dynamic, ListValueBuilder } from "@mendix/widget-plugin-test-utils";
import { GalleryContainerProps } from "../../../typings/GalleryProps";
import { createGalleryContainer } from "../../model/containers/createGalleryContainer";
import { mockContainerProps } from "../../utils/mock-container-props";
import { GalleryFooterControls } from "../GalleryFooterControls";
import { GalleryTopBarControls } from "../GalleryTopBarControls";

const SLOTS = {
    footer: { start: "widget-gallery-fc-start", middle: "widget-gallery-fc-middle", end: "widget-gallery-fc-end" },
    topBar: { start: "widget-gallery-tb-start", middle: "widget-gallery-tb-middle", end: "widget-gallery-tb-end" }
} as const;

function renderBar(bar: "footer" | "topBar", props: Partial<GalleryContainerProps>): RenderResult {
    const [container] = createGalleryContainer({ ...mockContainerProps(), ...props });
    const ui: ReactElement = bar === "footer" ? <GalleryFooterControls /> : <GalleryTopBarControls />;

    return render(
        <ContainerProvider container={container} isolated>
            {ui}
        </ContainerProvider>
    );
}

/** Which slot of the rendered bar holds the pagination bar, or `null` when it is absent. */
function paginationSlot(view: RenderResult, bar: "footer" | "topBar"): "start" | "middle" | "end" | null {
    const slots = SLOTS[bar];
    for (const slot of ["start", "middle", "end"] as const) {
        if (view.container.querySelector(`.${slots[slot]} .pagination-bar`)) {
            return slot;
        }
    }

    return null;
}

function customPaginationSlot(view: RenderResult, bar: "footer" | "topBar"): "start" | "middle" | "end" | null {
    const slots = SLOTS[bar];
    for (const slot of ["start", "middle", "end"] as const) {
        if (view.container.querySelector(`.${slots[slot]} [data-custom-pagination]`)) {
            return slot;
        }
    }

    return null;
}

const customPagination: GalleryContainerProps["customPagination"] = <div data-custom-pagination />;

describe("Gallery bar controls", () => {
    describe("pagination alignment", () => {
        it.each([
            ["widget-gallery-pagination-left", "start"],
            ["widget-gallery-pagination-center", "middle"],
            ["widget-gallery-pagination-right", "end"],
            ["gallery-test-class", "end"]
        ] as const)("renders pagination in the %s slot of the footer for class %s", (className, slot) => {
            const view = renderBar("footer", { class: className, showPagingButtons: "always" });

            expect(paginationSlot(view, "footer")).toBe(slot);
        });

        it.each([
            ["widget-gallery-pagination-left", "start"],
            ["widget-gallery-pagination-center", "middle"],
            ["widget-gallery-pagination-right", "end"]
        ] as const)("renders pagination in the %s slot of the top bar for class %s", (className, slot) => {
            const view = renderBar("topBar", {
                class: className,
                pagingPosition: "top",
                showPagingButtons: "always"
            });

            expect(paginationSlot(view, "topBar")).toBe(slot);
        });

        it("provides a middle slot in the top bar so center is expressible", () => {
            const view = renderBar("topBar", { pagingPosition: "top", showPagingButtons: "always" });

            expect(view.container.querySelector(`.${SLOTS.topBar.middle}`)).not.toBeNull();
        });
    });

    describe("custom pagination position", () => {
        it("renders custom pagination in the top bar when position is top", () => {
            const top = renderBar("topBar", { useCustomPagination: true, pagingPosition: "top", customPagination });
            const footer = renderBar("footer", { useCustomPagination: true, pagingPosition: "top", customPagination });

            expect(customPaginationSlot(top, "topBar")).toBe("end");
            expect(customPaginationSlot(footer, "footer")).toBeNull();
        });

        it("renders custom pagination in the footer when position is bottom", () => {
            const top = renderBar("topBar", { useCustomPagination: true, pagingPosition: "bottom", customPagination });
            const footer = renderBar("footer", {
                useCustomPagination: true,
                pagingPosition: "bottom",
                customPagination
            });

            expect(customPaginationSlot(top, "topBar")).toBeNull();
            expect(customPaginationSlot(footer, "footer")).toBe("end");
        });

        it("renders custom pagination once, in the footer, when position is both", () => {
            const top = renderBar("topBar", { useCustomPagination: true, pagingPosition: "both", customPagination });
            const footer = renderBar("footer", { useCustomPagination: true, pagingPosition: "both", customPagination });

            expect(customPaginationSlot(top, "topBar")).toBeNull();
            expect(customPaginationSlot(footer, "footer")).toBe("end");
        });

        it("follows the pagination alignment", () => {
            const view = renderBar("footer", {
                class: "widget-gallery-pagination-center",
                useCustomPagination: true,
                pagingPosition: "bottom",
                customPagination
            });

            expect(customPaginationSlot(view, "footer")).toBe("middle");
            expect(paginationSlot(view, "footer")).toBeNull();
        });
    });

    describe("load more", () => {
        it("keeps the load more button in the middle slot when pagination is left aligned", () => {
            const view = renderBar("footer", {
                class: "widget-gallery-pagination-left",
                pagination: "loadMore",
                showTotalCount: true,
                datasource: new ListValueBuilder().withSize(10).withHasMore(true).build(),
                loadMoreButtonCaption: dynamic.available("Load more")
            });

            expect(
                view.container.querySelector(`.${SLOTS.footer.middle} .widget-gallery-load-more-btn`)
            ).not.toBeNull();
            expect(paginationSlot(view, "footer")).toBe("start");
        });

        it("displaces the load more button to the end slot when pagination is centered", () => {
            const view = renderBar("footer", {
                class: "widget-gallery-pagination-center",
                pagination: "loadMore",
                showTotalCount: true,
                datasource: new ListValueBuilder().withSize(10).withHasMore(true).build(),
                loadMoreButtonCaption: dynamic.available("Load more")
            });

            expect(view.container.querySelector(`.${SLOTS.footer.end} .widget-gallery-load-more-btn`)).not.toBeNull();
            expect(paginationSlot(view, "footer")).toBe("middle");
        });
    });
});
