import { combine, createEvent, createStore, Event, sample, split, Store } from "effector";
import { ColumnsType, DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { ColumnId } from "../../typings/GridColumn";
import * as Grid from "../../typings/GridModel";
import { storageUnit } from "../storage/storage-model";
import { Model, InitParams } from "./base";
import { getHash, sortByOrder } from "./utils";

const USE_MULTI_SORT = false;

type Props = DatagridContainerProps;

export function createGridModel(
    propsUpdate: Event<Props>,
    paramsReady: Event<InitParams>
): {
    model: Model;
    actions: Grid.Actions;
    events: Grid.Events;
} {
    const hide = createEvent<ColumnId>();
    const sortBy = createEvent<ColumnId>();
    const swap = createEvent<[a: ColumnId, b: ColumnId]>();
    const resize = createEvent<[id: ColumnId, size: number]>();
    const setPage = createEvent<number>();
    const mapPage = createEvent<(n: number) => number>();
    const nextPage = createEvent<unknown>();
    const prevPage = createEvent<unknown>();

    // When setPage is called one of this event will be emitted,
    // depending on current pagination type.
    const limitChanged = createEvent<number>();
    const offsetChanged = createEvent<number>();
    const cleanup = createEvent<unknown>();

    const $columns = createStore<ColumnsType[]>([])
        .on(propsUpdate, (_, props) => props.columns)
        .map<Column[]>(columns => columns.map((columnsType, index) => new Column(columnsType, index)));

    const $order = createStore<Grid.Order>([])
        .on(swap, reduceOrder)
        .on(paramsReady, (_, params) => params.order);

    const $settingsHash = $columns.map(getHash);

    const $size = createStore<Grid.ColumnWidthConfig>({})
        .on(resize, reduceSize)
        .on(paramsReady, (_, params) => params.size);

    const $sort = createStore<Grid.SortOrder>([])
        .on(sortBy, USE_MULTI_SORT ? reduceSortMulti : reduceSortSingle)
        .on(hide, reduceSortRemove)
        .on(paramsReady, (_, params) => params.sort);

    const $available = combine($columns, $order, (columns, order) => {
        if (order.length === columns.length) {
            columns = sortByOrder(columns, order);
        }
        return columns.filter(column => column.visible);
    });

    const [$hidden, $visible] = createHidden($available, paramsReady, hide);

    const $storage = storageUnit(propsUpdate, cleanup, $settingsHash);

    const $pagingBy = createStore<"limit" | "offset">("offset").on(propsUpdate, (_, props) =>
        props.pagination === "virtualScrolling" ? "limit" : "offset"
    );

    const $pageSize = createStore(0).on(propsUpdate, (_, props) => props.pageSize);

    const $currentPage = createStore(0, {
        // To prevent NaN on first update
        updateFilter: page => !isNaN(page)
    }).on(propsUpdate, (_, props) => {
        return props.pagination === "buttons"
            ? props.datasource.offset / props.pageSize
            : props.datasource.limit / props.pageSize;
    });

    const incPage = sample({ clock: nextPage, source: $currentPage, fn: n => n + 1 });
    const decPage = sample({ clock: prevPage, source: $currentPage, fn: n => n - 1 });
    const newPage = sample({ clock: mapPage, source: $currentPage, fn: (n, map) => map(n) });

    split({
        source: sample({
            source: $pageSize,
            clock: [setPage, incPage, decPage, newPage],
            fn: (pageSize, newPage) => newPage * pageSize
        }),
        match: $pagingBy,
        cases: {
            limit: limitChanged,
            offset: offsetChanged
        }
    });

    $columns.watch(() => console.log("DEBUG columns changed"));
    $order.watch(() => console.log("DEBUG order changed"));

    return {
        model: {
            available: $available,
            columns: $columns,
            currentPage: $currentPage,
            hidden: $hidden,
            order: $order,
            settingsHash: $settingsHash,
            size: $size,
            sort: $sort,
            storage: $storage,
            visible: $visible
        },
        actions: {
            hide,
            mapPage,
            nextPage,
            prevPage,
            resize,
            setPage,
            sortBy,
            swap
        },
        events: {
            cleanup,
            limitChanged,
            offsetChanged
        }
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

function reduceSortRemove(sort: Grid.SortOrder, columnId: ColumnId): Grid.SortOrder {
    return sort.flatMap(rule => (rule[0] === columnId ? [] : [rule]));
}

function reduceSize(prev: Grid.ColumnWidthConfig, [id, size]: [id: ColumnId, size: number]): Grid.ColumnWidthConfig {
    return {
        ...prev,
        [id]: size
    };
}

function createHidden(
    $available: Store<Column[]>,
    paramsReady: Event<InitParams>,
    hide: Event<ColumnId>
): [Store<Grid.Hidden>, Store<Column[]>] {
    const resetHidden = createEvent<unknown>();
    const $hidden = createStore<Grid.Hidden>(new Set()).reset(resetHidden);
    const $visible = combine($available, $hidden, (columns, hidden) => columns.filter(c => !hidden.has(c.columnId)));

    const initValue = paramsReady.map(params => params.hidden);
    const newValue = sample({
        clock: hide,
        source: $hidden,
        fn: reduceHidden
    });

    sample({
        clock: [initValue, newValue],
        source: $available,
        // Pass new value only if at least 1 column is visible
        filter: (available, nextHidden) => {
            const visibleCount = available.reduce((n, column) => (nextHidden.has(column.columnId) ? n : n + 1), 0);
            return visibleCount > 0;
        },
        fn: (_, next) => next,
        target: $hidden
    });

    sample({
        source: $visible,
        filter: visible => visible.length === 0,
        target: resetHidden
    });

    return [$hidden, $visible];
}
