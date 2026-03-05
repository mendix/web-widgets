import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { useCustomPagination, usePaginationConfig } from "../model/hooks/injection-hooks";
import { LoadMore } from "./LoadMore";
import { Pagination } from "./Pagination";

export const GalleryFooterControls = observer(function GalleryFooterControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const pgConfig = usePaginationConfig();
    const customPagination = useCustomPagination();
    const loadMoreButtonCaption = "Load more";

    return (
        <div className="widget-gallery-footer-controls">
            <div className="widget-gallery-fc-start">
                <If condition={counterVM.isBottomCounterVisible}>
                    <SelectionCounter />
                </If>
            </div>
            <div className="widget-gallery-fc-middle">
                <If condition={pgConfig.pagination === "loadMore"}>
                    <LoadMore>{loadMoreButtonCaption}</LoadMore>
                </If>
            </div>
            <div className="widget-gallery-fc-end">
                <If condition={pgConfig.pagingPosition !== "top"}>
                    <Pagination />
                </If>
                <If condition={pgConfig.customPaginationEnabled}>{customPagination.get()}</If>
            </div>
        </div>
    );
});
