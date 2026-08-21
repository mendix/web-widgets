import classNames from "classnames";
import { createContext, createElement, PropsWithChildren, ReactElement, ReactNode, useContext, useState } from "react";
import { Pagination as PagingButtons } from "@mendix/widget-plugin-grid/components/Pagination";
import { getGlobalSortContext, SortAPI } from "@mendix/widget-plugin-sorting/react/context";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import { LoadMoreButton } from "./components/LoadMore";
import { parsePagingAlignment } from "./helpers/pagingAlignment";
import { BarElement, resolveSlots } from "./helpers/resolveSlots";
import "./ui/GalleryPreview.scss";

const PropsCtx = createContext<GalleryPreviewProps>({} as GalleryPreviewProps);
const SortAPI = getGlobalSortContext({ isPreview: true });

function useProps(): GalleryPreviewProps {
    return useContext(PropsCtx);
}

function Preview(props: GalleryPreviewProps): ReactElement {
    return (
        <PropsCtx.Provider value={props}>
            <Root>
                <div className="widget-gallery-top-bar">
                    <TopControls />
                    <Header />
                    <Content />
                    <Footer />
                </div>
            </Root>
        </PropsCtx.Provider>
    );
}

const Pagination = (): ReactNode => {
    const props = useProps();
    return (
        <PagingButtons
            canNextPage
            canPreviousPage
            gotoPage={() => {}}
            nextPage={() => {}}
            numberOfItems={props.pageSize ?? 20}
            page={0}
            pageSize={props.pageSize ?? 10}
            showPagingButtons={"always"}
            previousPage={() => {}}
            pagination={props.pagination}
        />
    );
};

const CustomPagination = (): ReactNode => {
    const { customPagination } = useProps();
    return (
        <customPagination.renderer caption="Custom pagination: Place widgets here">
            <div style={{ flexGrow: 1 }} />
        </customPagination.renderer>
    );
};

const SelectionCounter = (): ReactNode => {
    const props = useProps();
    return (
        <div className="widget-gallery-selection-counter">
            <span className="widget-gallery-selection-counter-text" aria-live="polite" aria-atomic="true">
                {props.selectedCountTemplateSingular}
            </span>
            &nbsp;|&nbsp;
            <button className="widget-gallery-clear-selection">{props.clearSelectionButtonLabel}</button>
        </div>
    );
};

const Root = ({ children }: PropsWithChildren): ReactNode => {
    const props = useProps();
    return (
        <div className={classNames("widget-gallery", props.className)} style={props.styleObject}>
            {children}
        </div>
    );
};

const TopControls = (): ReactNode => {
    const props = useProps();
    const showCustomPagination = useCustomPagination("top");
    const slots = resolveSlots({
        alignment: parsePagingAlignment(props.className),
        hasCounter: useTopCounter(),
        hasLoadMore: false,
        hasPagination: usePagingTop() || showCustomPagination
    });

    const elements: Record<BarElement, ReactNode> = {
        pagination: showCustomPagination ? <CustomPagination /> : <Pagination />,
        counter: <SelectionCounter />,
        loadMore: null
    };

    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-start">{getElementForSlot(slots.start, elements)}</div>
            <div className="widget-gallery-tb-middle">{getElementForSlot(slots.middle, elements)}</div>
            <div className="widget-gallery-tb-end">{getElementForSlot(slots.end, elements)}</div>
        </div>
    );
};

const Header = (): ReactNode => {
    const props = useProps();
    const sortAPI = useProvideSortAPI();

    return (
        <SortAPI.Provider value={sortAPI}>
            <section className="widget-gallery-header widget-gallery-filter">
                <props.filtersPlaceholder.renderer>
                    <div />
                </props.filtersPlaceholder.renderer>
            </section>
        </SortAPI.Provider>
    );
};

const Item = ({ className }: { className?: string }): ReactNode => {
    const props = useProps();
    return (
        <props.content.renderer>
            <div className={classNames("widget-gallery-item", className)} />
        </props.content.renderer>
    );
};

const Content = (): ReactNode => {
    const props = useProps();
    const { desktopItems: lg, tabletItems: md, phoneItems: sm } = props;
    const rows = 3;
    const lgCount = (lg ?? 0) * rows - 1;
    const mdCount = (md ?? 0) * rows - 1;
    const smCount = (sm ?? 0) * rows - 1;

    return (
        <div className="widget-gallery-content">
            <div
                className={classNames("widget-gallery-items", {
                    [`widget-gallery-sm-${sm}`]: sm,
                    [`widget-gallery-md-${md}`]: md,
                    [`widget-gallery-lg-${lg}`]: lg
                })}
            >
                <Item key="selectable_DO_NOT_REMOVE!_ALWAYS_RENDER!" />
                {Array.from({ length: lgCount }).map((_, index) => (
                    <Item key={index} className="visible-md visible-lg" />
                ))}
                {Array.from({ length: mdCount }).map((_, index) => (
                    <Item key={index} className="visible-sm" />
                ))}
                {Array.from({ length: smCount }).map((_, index) => (
                    <Item key={index} className="visible-xs" />
                ))}
            </div>
        </div>
    );
};

const Footer = (): ReactNode => {
    const props = useProps();
    const showCustomPagination = useCustomPagination("bottom");
    const slots = resolveSlots({
        alignment: parsePagingAlignment(props.className),
        hasCounter: useBottomCounter(),
        hasLoadMore: props.pagination === "loadMore",
        hasPagination: usePagingBot() || showCustomPagination
    });

    const elements: Record<BarElement, ReactNode> = {
        pagination: showCustomPagination ? <CustomPagination /> : <Pagination />,
        counter: <SelectionCounter />,
        loadMore: <LoadMoreButton>{props.loadMoreButtonCaption}</LoadMoreButton>
    };

    return (
        <div className="widget-gallery-footer">
            <div className="widget-gallery-footer-controls">
                <div className="widget-gallery-fc-start">{getElementForSlot(slots.start, elements)}</div>
                <div className="widget-gallery-fc-middle">{getElementForSlot(slots.middle, elements)}</div>
                <div className="widget-gallery-fc-end">{getElementForSlot(slots.end, elements)}</div>
            </div>
        </div>
    );
};

function getElementForSlot(element: BarElement | null, elements: Record<BarElement, ReactNode>): ReactNode {
    return element ? elements[element] : null;
}

export function preview(props: GalleryPreviewProps): ReactElement {
    return createElement(Preview, props);
}

function useTopCounter(): boolean {
    const { itemSelection, selectionCountPosition } = useProps();
    return itemSelection === "Multi" && selectionCountPosition === "top";
}

function useBottomCounter(): boolean {
    const { itemSelection, selectionCountPosition } = useProps();
    return itemSelection === "Multi" && selectionCountPosition === "bottom";
}

function usePagingTop(): boolean {
    const props = useProps();
    const visible = (props.showTotalCount || props.pagination === "buttons") && !props.useCustomPagination;
    return visible && props.pagingPosition !== "bottom";
}

function usePagingBot(): boolean {
    const props = useProps();
    const visible = (props.showTotalCount || props.pagination === "buttons") && !props.useCustomPagination;
    return visible && props.pagingPosition !== "top";
}

/**
 * Mirrors runtime placement: custom pagination renders in the top bar only for "top", and once in
 * the footer for "bottom" and "both" -- the placeholder holds real widget instances, so it is never
 * rendered in both bars.
 */
function useCustomPagination(location: "top" | "bottom"): boolean {
    const props = useProps();
    if (!props.useCustomPagination) {
        return false;
    }

    return location === "top" ? props.pagingPosition === "top" : props.pagingPosition !== "top";
}
function useProvideSortAPI(): SortAPI {
    const [sortAPI] = useState({
        version: 1,
        host: new SortStoreHost()
    } as SortAPI);

    return sortAPI;
}

class SortStoreHost {
    usedBy: string | null = null;

    get sortOrder(): any[] {
        return [];
    }

    observe(_: any): void {}

    unobserve(): void {}

    lock(id: string): () => void {
        this.usedBy = id;
        return () => (this.usedBy = null);
    }
}
