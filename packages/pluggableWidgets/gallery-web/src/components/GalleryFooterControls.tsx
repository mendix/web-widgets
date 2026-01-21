import { If } from "@mendix/widget-plugin-component-kit/If";
import { ReactElement } from "react";
import { LoadMore } from "./LoadMore";
import { Pagination } from "./Pagination";

export function GalleryFooterControls(): ReactElement {
    const showBottomSelectionCounter = false;
    const selectionCounter = null;
    const showBottomPagination = false;
    const loadMoreButtonCaption = "Load more";

    return (
        <div className="widget-gallery-footer-controls">
            <div className="widget-gallery-fc-start">
                <If condition={showBottomSelectionCounter}>{selectionCounter}</If>
            </div>
            <div className="widget-gallery-fc-middle">
                <LoadMore>{loadMoreButtonCaption}</LoadMore>
            </div>
            <div className="widget-gallery-fc-end">
                <If condition={showBottomPagination}>
                    <Pagination />
                </If>
            </div>
        </div>
    );
}
