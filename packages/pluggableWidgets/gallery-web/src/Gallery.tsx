import { observer } from "mobx-react-lite";
import { useOnResetFiltersEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { getColumnAndRowBasedOnIndex, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { ReactElement, ReactNode, createElement, useCallback } from "react";
import { GalleryContainerProps } from "../typings/GalleryProps";
import { Gallery as GalleryComponent } from "./components/Gallery";
import { useItemEventsController } from "./features/item-interaction/ItemEventsController";
import { GridPositionsProps, useGridPositions } from "./features/useGridPositions";
import { useItemHelper } from "./helpers/ItemHelper";
import { useItemSelectHelper } from "./helpers/useItemSelectHelper";
import { useGalleryStore } from "./helpers/useGalleryStore";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { GalleryRootScope, GalleryContext, useGalleryRootScope } from "./helpers/root-context";

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

    useOnResetFiltersEvent(rootStore.name, rootStore.id);

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
            header={props.filtersPlaceholder}
            headerTitle={props.filterSectionTitle?.value}
            ariaLabelListBox={props.ariaLabelListBox?.value}
            showHeader={!!props.filtersPlaceholder}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            items={items}
            itemHelper={itemHelper}
            numberOfItems={props.datasource.totalCount}
            page={rootStore.paging.currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            phoneItems={props.phoneItems}
            setPage={rootStore.paging.setPage}
            style={props.style}
            tabletItems={props.tabletItems}
            tabIndex={props.tabIndex}
            selectHelper={itemSelectHelper}
            itemEventsController={itemEventsController}
            focusController={focusController}
            getPosition={getPositionCallback}
        />
    );
});

function useCreateGalleryScope(props: GalleryContainerProps): GalleryRootScope {
    const rootStore = useGalleryStore(props);
    const selectionHelper = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);
    const itemSelectHelper = useItemSelectHelper(props.itemSelection, selectionHelper);

    return useConst<GalleryRootScope>({
        rootStore,
        selectionHelper,
        itemSelectHelper
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
