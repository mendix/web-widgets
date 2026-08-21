import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode } from "react";
import { LoadMore } from "./LoadMore";
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

const FooterPagination = observer(function FooterPagination(): ReactNode {
    const pgConfig = usePaginationConfig();
    const customPagination = useCustomPagination();

    // Custom pagination widgets are rendered once, below the gallery, even when the position is
    // "both": the placeholder holds real widget instances, so rendering it in both bars would
    // duplicate those instances, their DOM ids and their state.
    const showCustomPagination = pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "top";
    return showCustomPagination ? customPagination.get() : <Pagination />;
});

const FooterSelectionCounter = observer(function FooterSelectionCounter(): ReactNode {
    const counterVM = useSelectionCounterViewModel();
    return counterVM.isBottomCounterVisible ? <SelectionCounter /> : null;
});

export const GalleryFooterControls = observer(function GalleryFooterControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const rootVM = useGalleryRootVM();
    const pgConfig = usePaginationConfig();
    const pagingVM = usePaginationVM();

    const showCustomPagination = pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "top";
    const showPagination = pgConfig.pagingPosition !== "top" && pagingVM.paginationVisible;

    const slots = resolveSlots({
        alignment: rootVM.pagingAlignment,
        hasCounter: counterVM.isBottomCounterVisible,
        hasLoadMore: pagingVM.loadMoreVisible,
        hasPagination: showPagination || showCustomPagination
    });

    const elements: Record<BarElement, ReactNode> = {
        pagination: <FooterPagination />,
        counter: <FooterSelectionCounter />,
        loadMore: <LoadMore />
    };

    const getElementForSlot = (element: BarElement | null): ReactNode => (element ? elements[element] : null);

    return (
        <div className="widget-gallery-footer-controls">
            <div className="widget-gallery-fc-start">{getElementForSlot(slots.start)}</div>
            <div className="widget-gallery-fc-middle">{getElementForSlot(slots.middle)}</div>
            <div className="widget-gallery-fc-end">{getElementForSlot(slots.end)}</div>
        </div>
    );
});
