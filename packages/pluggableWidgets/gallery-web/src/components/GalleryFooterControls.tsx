import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode } from "react";
import { LoadMore } from "./LoadMore";
import { Pagination } from "./Pagination";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { BarOccupant, resolveZones } from "../helpers/resolveZones";
import {
    useCustomPagination,
    useGalleryRootVM,
    usePaginationConfig,
    usePaginationVM
} from "../model/hooks/injection-hooks";

export const GalleryFooterControls = observer(function GalleryFooterControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const rootVM = useGalleryRootVM();
    const pgConfig = usePaginationConfig();
    const pagingVM = usePaginationVM();
    const customPagination = useCustomPagination();

    // Custom pagination widgets are rendered once, below the gallery, even when the position is
    // "both": the placeholder holds real widget instances, so rendering it in both bars would
    // duplicate those instances, their DOM ids and their state.
    const showCustomPagination = pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "top";
    const showPagination = pgConfig.pagingPosition !== "top" && pagingVM.paginationVisible;

    const zones = resolveZones({
        alignment: rootVM.pagingAlignment,
        hasCounter: counterVM.isBottomCounterVisible,
        hasLoadMore: pagingVM.loadMoreVisible,
        hasPagination: showPagination || showCustomPagination
    });

    const occupants: Record<BarOccupant, ReactNode> = {
        pagination: showCustomPagination ? customPagination.get() : <Pagination />,
        counter: <SelectionCounter />,
        loadMore: <LoadMore />
    };

    const render = (occupant: BarOccupant | null): ReactNode => (occupant ? occupants[occupant] : null);

    return (
        <div className="widget-gallery-footer-controls">
            <div className="widget-gallery-fc-start">{render(zones.start)}</div>
            <div className="widget-gallery-fc-middle">{render(zones.middle)}</div>
            <div className="widget-gallery-fc-end">{render(zones.end)}</div>
        </div>
    );
});
