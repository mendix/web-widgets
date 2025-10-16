import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { getColumnAndRowBasedOnIndex, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode, useCallback } from "react";
import { GalleryContainerProps } from "../typings/GalleryProps";
import { Gallery as GalleryComponent } from "./components/Gallery";
import { HeaderWidgetsHost } from "./components/HeaderWidgetsHost";
import { useItemEventsController } from "./features/item-interaction/ItemEventsController";
import { GridPositionsProps, useGridPositions } from "./features/useGridPositions";
import { useItemHelper } from "./helpers/ItemHelper";
import { GalleryContext, GalleryRootScope, useGalleryRootScope } from "./helpers/root-context";
import { useGalleryJSActions } from "./helpers/useGalleryJSActions";
import { useGalleryStore } from "./helpers/useGalleryStore";
import { useItemSelectHelper } from "./helpers/useItemSelectHelper";

const Container = observer(function GalleryContainer(props: GalleryContainerProps): ReactElement {
    const { rootStore, itemSelectHelper } = useGalleryRootScope();

    const items = props.datasource.items ?? [];
    const config: GridPositionsProps = {
        desktopItems: props.desktopItems,
        phoneItems: props.phoneItems,
        tabletItems: props.tabletItems,
        totalItems: items.length
    };
    const { numberOfColumns, numberOfRows } = useGridPositions(config);
    const getPositionCallback = useCallback(
        (index: number) => getColumnAndRowBasedOnIndex(numberOfColumns, items.length, index),
        [numberOfColumns, items.length]
    );

    const focusController = useFocusTargetController({
        rows: numberOfRows,
        columns: numberOfColumns,
        pageSize: props.pageSize
    });

    const clickActionHelper = useClickActionHelper({ onClick: props.onClick, onClickTrigger: props.onClickTrigger });

    const itemEventsController = useItemEventsController(
        itemSelectHelper,
        clickActionHelper,
        focusController,
        numberOfColumns,
        props.itemSelectionMode
    );

    const itemHelper = useItemHelper({
        classValue: props.itemClass,
        contentValue: props.content,
        clickValue: props.onClick
    });

    useGalleryJSActions(rootStore, itemSelectHelper);

    const header = <HeaderWidgetsHost>{props.filtersPlaceholder}</HeaderWidgetsHost>;

    return (
        <GalleryComponent
            className={props.class}
            desktopItems={props.desktopItems}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: (children: ReactNode) => ReactElement) =>
                    props.showEmptyPlaceholder === "custom" ? renderWrapper(props.emptyPlaceholder) : <div />,
                [props.emptyPlaceholder, props.showEmptyPlaceholder]
            )}
            emptyMessageTitle={props.emptyMessageTitle?.value}
            header={header}
            headerTitle={props.filterSectionTitle?.value}
            ariaLabelListBox={props.ariaLabelListBox?.value}
            showHeader={!!props.filtersPlaceholder}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            items={items}
            itemHelper={itemHelper}
            numberOfItems={props.datasource.totalCount}
            page={rootStore.paging.currentPage}
            pageSize={props.pageSize}
            paging={rootStore.paging.showPagination}
            paginationPosition={props.pagingPosition}
            paginationType={props.pagination}
            setPage={rootStore.paging.setPage}
            showPagingButtons={props.showPagingButtons}
            phoneItems={props.phoneItems}
            style={props.style}
            tabletItems={props.tabletItems}
            tabIndex={props.tabIndex}
            selectHelper={itemSelectHelper}
            itemEventsController={itemEventsController}
            focusController={focusController}
            getPosition={getPositionCallback}
            loadMoreButtonCaption={props.loadMoreButtonCaption?.value}
            showRefreshIndicator={rootStore.loaderCtrl.showRefreshIndicator}
            selectionCountPosition={props.selectionCountPosition}
        />
    );
});

function useCreateGalleryScope(props: GalleryContainerProps): GalleryRootScope {
    const rootStore = useGalleryStore(props);
    const selectionHelper = useSelectionHelper(
        props.itemSelection,
        props.datasource,
        props.onSelectionChange,
        props.keepSelection ? "always keep" : "always clear"
    );
    const itemSelectHelper = useItemSelectHelper(props.itemSelection, selectionHelper);

    return useConst<GalleryRootScope>({
        rootStore,
        selectionHelper,
        itemSelectHelper,
        selectionCountStore: rootStore.selectionCountStore
    });
}

export function Gallery(props: GalleryContainerProps): ReactElement {
    const scope = useCreateGalleryScope(props);

    return (
        <GalleryContext.Provider value={scope}>
            <Container {...props} />
        </GalleryContext.Provider>
    );
}
