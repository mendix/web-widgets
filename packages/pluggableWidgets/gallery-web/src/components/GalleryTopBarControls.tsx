import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode } from "react";
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

export const GalleryTopBarControls = observer(function GalleryTopBarControls(): ReactElement {
    const counterVM = useSelectionCounterViewModel();
    const rootVM = useGalleryRootVM();
    const pgConfig = usePaginationConfig();
    const pagingVM = usePaginationVM();
    const customPagination = useCustomPagination();

    // Only "top" renders custom pagination up here; "both" keeps it in the footer so the configured
    // widget instances are never duplicated across the two bars.
    const showCustomPagination = pgConfig.customPaginationEnabled && pgConfig.pagingPosition === "top";
    const showPagination = pgConfig.pagingPosition !== "bottom" && pagingVM.paginationVisible;

    const zones = resolveZones({
        alignment: rootVM.pagingAlignment,
        hasCounter: counterVM.isTopCounterVisible,
        hasLoadMore: false,
        hasPagination: showPagination || showCustomPagination
    });

    const occupants: Record<BarOccupant, ReactNode> = {
        pagination: showCustomPagination ? customPagination.get() : <Pagination />,
        counter: <SelectionCounter />,
        loadMore: null
    };

    const render = (occupant: BarOccupant | null): ReactNode => (occupant ? occupants[occupant] : null);

    return (
        <div className="widget-gallery-top-bar-controls">
            <div className="widget-gallery-tb-start">{render(zones.start)}</div>
            <div className="widget-gallery-tb-middle">{render(zones.middle)}</div>
            <div className="widget-gallery-tb-end">{render(zones.end)}</div>
        </div>
    );
});
