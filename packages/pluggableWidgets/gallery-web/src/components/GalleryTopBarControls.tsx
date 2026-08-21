import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode } from "react";
import { Pagination } from "./Pagination";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { BarElement, resolveSlots } from "../helpers/resolveSlots";
import {
    useCustomPagination,
    useGalleryRootVM,
    usePaginationConfig,
    usePaginationVM
} from "../model/hooks/injection-hooks";

const TopBarPagination = observer(function TopBarPagination(): ReactNode {
    const pgConfig = usePaginationConfig();
    const customPagination = useCustomPagination();

    // Only "top" renders custom pagination up here; "both" keeps it in the footer so the configured
    // widget instances are never duplicated across the two bars.
    const showCustomPagination = pgConfig.customPaginationEnabled && pgConfig.pagingPosition === "top";
    return showCustomPagination ? customPagination.get() : <Pagination />;
});

const TopBarSelectionCounter = observer(function TopBarSelectionCounter(): ReactNode {
    const counterVM = useSelectionCounterViewModel();
    return counterVM.isTopCounterVisible ? <SelectionCounter /> : null;
});

export const GalleryTopBarControls = observer(function GalleryTopBarControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const rootVM = useGalleryRootVM();
    const pgConfig = usePaginationConfig();
    const pagingVM = usePaginationVM();

    const showCustomPagination = pgConfig.customPaginationEnabled && pgConfig.pagingPosition === "top";
    const showPagination = pgConfig.pagingPosition !== "bottom" && pagingVM.paginationVisible;

    const slots = resolveSlots({
        alignment: rootVM.pagingAlignment,
        hasCounter: counterVM.isTopCounterVisible,
        hasLoadMore: false,
        hasPagination: showPagination || showCustomPagination
    });

    const elements: Record<BarElement, ReactNode> = {
        pagination: <TopBarPagination />,
        counter: <TopBarSelectionCounter />,
        loadMore: null
    };

    const getElementForSlot = (element: BarElement | null): ReactNode => (element ? elements[element] : null);

    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-start">{getElementForSlot(slots.start)}</div>
            <div className="widget-gallery-tb-middle">{getElementForSlot(slots.middle)}</div>
            <div className="widget-gallery-tb-end">{getElementForSlot(slots.end)}</div>
        </div>
    );
});
