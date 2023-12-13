import { combine, createEvent, createStore, Event } from "effector";
import { ColumnsType, DatagridContainerProps } from "../../../typings/DatagridProps";
import { Column } from "../../helpers/Column";
import { ColumnId } from "../../typings/GridColumn";
import * as Grid from "../../typings/GridState";
import { createStorage } from "../storage/storage-model";
import { GridModel, InitParams } from "./base";
import { getHash, sortByOrder } from "./utils";

const USE_MULTI_SORT = true;

type Props = DatagridContainerProps;

export function createGridModel(propsUpdate: Event<Props>, paramsReady: Event<InitParams>): GridModel {
    const hideColumn = createEvent<ColumnId>();
    const sortBy = createEvent<ColumnId>();
    const swapColumns = createEvent<{ a: ColumnId; b: ColumnId }>();

    const $columns = createStore<ColumnsType[]>([])
        .on(propsUpdate, (_, props) => props.columns)
        .map<Column[]>(columns => columns.map((columnsType, index) => new Column(columnsType, index)));

    const $order = createStore<Grid.Order>([])
        .on(swapColumns, reduceOrder)
        .on(paramsReady, (_, params) => params.order);

    const $hidden = createStore<Grid.Hidden>(new Set())
        .on(hideColumn, reduceHidden)
        .on(paramsReady, (_, params) => params.hidden);

    const $sort = createStore<Grid.SortOrder>([]).on(sortBy, USE_MULTI_SORT ? reduceSortMulti : reduceSortSingle);

    const $available = combine($columns, $order, (columns, order) => {
        if (order.length === columns.length) {
            columns = sortByOrder(columns, order);
        }
        return columns.filter(column => column.visible);
    });

    const $visible = combine($available, $hidden, (columns, hidden) => columns.filter(c => !hidden.has(c.columnId)));

    const $settingsHash = $columns.map(getHash);

    const $storage = createStorage(propsUpdate, $settingsHash);

    return {
        available: $available,
        columns: $columns,
        hidden: $hidden,
        hideColumn,
        order: $order,
        settingsHash: $settingsHash,
        sort: $sort,
        storage: $storage,
        swapColumns,
        visible: $visible
    };
}

function reduceOrder(prev: Grid.Order, { a, b }: { a: ColumnId; b: ColumnId }): Grid.Order {
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
