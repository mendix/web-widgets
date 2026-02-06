import { Pagination as PagingButtons } from "@mendix/widget-plugin-grid/components/Pagination";
import classNames from "classnames";
import { createContext, createElement, PropsWithChildren, ReactElement, ReactNode, useContext } from "react";
import { GalleryPreviewProps } from "../typings/GalleryProps";
import { LoadMoreButton } from "./components/LoadMore";
import "./ui/GalleryPreview.scss";

const PropsCtx = createContext<GalleryPreviewProps>({} as GalleryPreviewProps);

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
            pagination="buttons"
        />
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
            <button className="widget-gallery-btn-link">{props.clearSelectionButtonLabel}</button>
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
    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-start">{useTopCounter() ? <SelectionCounter /> : null}</div>
            <div className="widget-gallery-tb-end">{usePagingTop() ? <Pagination /> : null}</div>
        </div>
    );
};

const Header = (): ReactNode => {
    const props = useProps();

    return (
        <section className="widget-gallery-header widget-gallery-filter">
            <props.filtersPlaceholder.renderer>
                <div />
            </props.filtersPlaceholder.renderer>
        </section>
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
                <Item key="selectable_DO_NOE_REMOVE!_ALWAYS_RENDER!" />
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
    return (
        <div className="widget-gallery-footer">
            <div className="widget-gallery-footer-controls">
                <div className="widget-gallery-fc-start">{useBottomCounter() ? <SelectionCounter /> : null}</div>
                <div className="widget-gallery-fc-middle">
                    {props.pagination === "loadMore" ? (
                        <LoadMoreButton>{props.loadMoreButtonCaption}</LoadMoreButton>
                    ) : null}
                </div>
                <div className="widget-gallery-fc-end">{usePagingBot() ? <Pagination /> : null}</div>
            </div>
        </div>
    );
};

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
    return props.pagination === "buttons" && props.pagingPosition !== "bottom";
}

function usePagingBot(): boolean {
    const props = useProps();
    return props.pagination === "buttons" && props.pagingPosition !== "top";
}
