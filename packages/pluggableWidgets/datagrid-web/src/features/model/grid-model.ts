import { combine, createEvent, createStore, Event, sample, split } from "effector";
import { ColumnsType, DatagridContainerProps, PaginationEnum } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { ColumnId } from "../../typings/GridColumn";
import * as Grid from "../../typings/GridState";
import { createStorage } from "../storage/storage-model";
import { GridModel, InitParams } from "./base";
import { getHash, sortByOrder } from "./utils";

const USE_MULTI_SORT = false;

type Props = DatagridContainerProps;

export function createGridModel(propsUpdate: Event<Props>, paramsReady: Event<InitParams>): GridModel {
    const hide = createEvent<ColumnId>();
    const sortBy = createEvent<ColumnId>();
    const swap = createEvent<[a: ColumnId, b: ColumnId]>();
    const resize = createEvent<[id: ColumnId, size: number]>();
    const setPage = createEvent<(prevPage: number) => number>();
    // When setPage is called one of this event will be emitted,
    // depending on current pagination type.
    const limitChanged = createEvent<number>();
    const offsetChanged = createEvent<number>();

    const $columns = createStore<ColumnsType[]>([])
        .on(propsUpdate, (_, props) => props.columns)
        .map<Column[]>(columns => columns.map((columnsType, index) => new Column(columnsType, index)));

    const $hidden = createStore<Grid.Hidden>(new Set())
        .on(hide, reduceHidden)
        .on(paramsReady, (_, params) => params.hidden);

    const $order = createStore<Grid.Order>([])
        .on(swap, reduceOrder)
        .on(paramsReady, (_, params) => params.order);

    const $settingsHash = $columns.map(getHash);

    const $size = createStore<Grid.ColumnWidthConfig>({})
        .on(resize, reduceSize)
        .on(paramsReady, (_, params) => params.size);

    const $sort = createStore<Grid.SortOrder>([]).on(sortBy, USE_MULTI_SORT ? reduceSortMulti : reduceSortSingle);

    const $available = combine($columns, $order, (columns, order) => {
        if (order.length === columns.length) {
            columns = sortByOrder(columns, order);
        }
        return columns.filter(column => column.visible);
    });

    const $visible = combine($available, $hidden, (columns, hidden) => columns.filter(c => !hidden.has(c.columnId)));

    const $storage = createStorage(propsUpdate, $settingsHash);

    const $pagination = createStore<PaginationEnum>("buttons").on(propsUpdate, (_, props) => props.pagination);

    const $pageSize = createStore(0).on(propsUpdate, (_, props) => props.pageSize);

    const $currentPage = createStore(0, {
        // To prevent NaN on first update
        updateFilter: page => !isNaN(page)
    }).on(propsUpdate, (_, props) => {
        return props.pagination === "buttons"
            ? props.datasource.offset / props.pageSize
            : props.datasource.limit / props.pageSize;
    });

    split({
        source: sample({
            source: [$currentPage, $pageSize],
            clock: setPage,
            fn: ([prevPage, pageSize], computePage) => computePage(prevPage) * pageSize
        }),
        match: $pagination,
        cases: {
            virtualScrolling: limitChanged,
            buttons: offsetChanged
        }
    });

    return {
        available: $available,
        columns: $columns,
        currentPage: $currentPage,
        hidden: $hidden,
        hide,
        limitChanged,
        offsetChanged,
        order: $order,
        resize,
        setPage,
        settingsHash: $settingsHash,
        size: $size,
        sort: $sort,
        sortBy,
        storage: $storage,
        swap,
        visible: $visible
    };
}

function reduceOrder(prev: Grid.Order, [a, b]: [a: ColumnId, b: ColumnId]): Grid.Order {
    const indexA = prev.indexOf(a);
    const indexB = prev.indexOf(b);

    if (indexA === -1 || indexB === -1) {
        console.warn("Unable to find column in the current order array.");
        return prev;
    }

    if (indexA !== indexB) {
        const nextOrder = [...prev];
        nextOrder[indexA] = b;
        nextOrder[indexB] = a;
        return nextOrder;
    }

    return prev;
}

function reduceHidden(prev: Grid.Hidden, id: ColumnId): Grid.Hidden {
    const next = new Set(prev);

    if (next.delete(id) === false) {
        next.add(id);
    }

    return next;
}

function reduceSortSingle(sort: Grid.SortOrder, columnId: ColumnId): Grid.SortOrder {
    const [[id, dir] = []] = sort;
    if (id === columnId) {
        return dir === "asc" ? [[columnId, "desc"]] : [];
    }
    return [[columnId, "asc"]];
}

function reduceSortMulti(sort: Grid.SortOrder, columnId: ColumnId): Grid.SortOrder {
    if (sort.some(([id]) => id === columnId)) {
        return sort.flatMap(rule => {
            if (rule[0] === columnId) {
                return rule[1] === "asc" ? [[columnId, "desc"]] : [];
            }
            return [rule];
        });
    }

    return [...sort, [columnId, "asc"]];
}

function reduceSize(prev: Grid.ColumnWidthConfig, [id, size]: [id: ColumnId, size: number]): Grid.ColumnWidthConfig {
    return {
        ...prev,
        [id]: size
    };
}
