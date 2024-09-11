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
import { useRootGalleryStore } from "./helpers/useRootGalleryStore";
import { RootGalleryStore } from "./stores/RootGalleryStore";
import { HeaderContainer } from "./components/HeaderContainer";

interface RootAPI {
    rootStore: RootGalleryStore;
}

function Container(props: GalleryContainerProps & RootAPI): ReactElement {
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;
    const setPage = useCallback(
        (computePage: (prevPage: number) => number) => {
            const newPage = computePage(currentPage);

            if (isInfiniteLoad) {
                props.datasource.setLimit(newPage * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    const selection = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);
    const selectHelper = useItemSelectHelper(props.itemSelection, selection);
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
        selectHelper,
        clickActionHelper,
        focusController,
        numberOfColumns,
        props.itemSelectionMode
    );

    const showHeader = props.filterList.length > 0 || props.sortList.length > 0 || selection?.type === "Multi";
    const itemHelper = useItemHelper({
        classValue: props.itemClass,
        contentValue: props.content,
        clickValue: props.onClick
    });

    useOnResetFiltersEvent(props.rootStore.staticInfo.name, props.rootStore.staticInfo.filtersChannelName);

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
            header={
                showHeader && (
                    <HeaderContainer
                        filtersStore={props.rootStore.headerFiltersStore}
                        selectionHelper={selection}
                        sortProvider={props.rootStore.sortProvider}
                    >
                        {props.filtersPlaceholder}
                    </HeaderContainer>
                )
            }
            headerTitle={props.filterSectionTitle?.value}
            ariaLabelListBox={props.ariaLabelListBox?.value}
            showHeader={showHeader}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            items={items}
            itemHelper={itemHelper}
            numberOfItems={props.datasource.totalCount}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            paginationPosition={props.pagingPosition}
            phoneItems={props.phoneItems}
            setPage={setPage}
            style={props.style}
            tabletItems={props.tabletItems}
            tabIndex={props.tabIndex}
            selectHelper={selectHelper}
            itemEventsController={itemEventsController}
            focusController={focusController}
            getPosition={getPositionCallback}
        />
    );
}

// eslint-disable-next-line prefer-arrow-callback
const Widget = observer(function RootStoreProvider(props: GalleryContainerProps) {
    const store = useRootGalleryStore(props);

    return <Container {...props} rootStore={store} />;
});

export function Gallery(props: GalleryContainerProps): ReactElement {
    return <Widget {...props} />;
}
