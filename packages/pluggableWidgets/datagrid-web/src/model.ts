import { ListValue } from "mendix";
import { useMemo } from "react";
import {
    clearNode,
    createEffect,
    createStore,
    sample,
    Event,
    EventCallable,
    Store,
    createDomain,
    combine,
    createEvent,
    split
} from "effector";
import { createGate, Gate } from "effector-react";
import { ColumnsType, DatagridContainerProps } from "../typings/DatagridProps";
import { Column } from "./helpers/Column";
import { ColumnId } from "./typings/GridColumn";
import { SortRule } from "./typings/GridSettings";
import { ColumnWidthConfig } from "./typings/GridState";
import { AttrStorage } from "./features/state/AttrStorage";
import { SettingsStorage } from "./typings/SettingsStorage";
import { getHash } from "./features/state/hash";
import { sortByOrder } from "./features/state/utils";

export type Model = {
    Gate: Gate<DatagridContainerProps>;
    grid: GridColumnUnits;
    status: Store<Status>;
};

type Props = DatagridContainerProps;

type Status = "pending" | "ready";

type InitParams = {
    sort: SortRule[];
    columnsSize: ColumnWidthConfig;
    columnsHidden: Set<ColumnId>;
    columnsOrder: ColumnId[];
    filter: ListValue["filter"];
};

function log(...args: any[]): void {
    console.log("DEBUG", ...args);
}

type GridColumnUnits = {
    available: Store<Column[]>;
    columns: Store<Column[]>;
    hidden: Store<Set<ColumnId>>;
    hideColumn: EventCallable<ColumnId>;
    order: Store<ColumnId[]>;
    settingsHash: Store<string>;
    swapColumns: EventCallable<{ a: ColumnId; b: ColumnId }>;
    storage: Store<StorageNode>;
    visible: Store<Column[]>;
};
type StorageNode = { status: "pending"; value: null } | { status: "ready"; value: SettingsStorage };

export function storage(propsUpdate: Event<Props>): Store<StorageNode> {
    const updateLocal = createEvent<Props>();
    const updateAttr = createEvent<Props>();

    const $storageType = createStore<"local" | "attr">("local").on(propsUpdate, (_, props) =>
        props.configurationAttribute ? "attr" : "local"
    );

    split({
        source: propsUpdate,
        match: $storageType,
        cases: {
            local: updateLocal,
            attr: updateAttr
        }
    });

    const $local = createStore<StorageNode>({ status: "pending", value: null }).on(updateLocal, (state, _) => {
        if (state.status === "ready") {
            return state;
        }

        return {
            status: "ready",
            value: {
                save() {},
                load() {
                    return undefined;
                },
                reset() {}
            }
        };
    });

    const $attr = createStore<Props["configurationAttribute"]>(undefined, { skipVoid: false })
        .on(updateAttr, (_, props) => props.configurationAttribute)
        .map<StorageNode>(attr => {
            if (attr?.status === "available") {
                return { status: "ready", value: new AttrStorage(attr) };
            }
            return { status: "pending", value: null };
        });

    const $storage = combine($attr, $local, $storageType, (attr, local, storageType) => {
        return storageType === "local" ? local : attr;
    });

    return $storage;
}

function gridColumnUnits(propsUpdate: Event<Props>, initParamsReady: EventCallable<InitParams>): GridColumnUnits {
    const domain = createDomain("columns-model");
    const hideColumn = domain.event<ColumnId>();
    const swapColumns = domain.event<{ a: ColumnId; b: ColumnId }>();

    const $columns = domain
        .store<ColumnsType[]>([])
        .on(propsUpdate, (_, props) => props.columns)
        .map(columns => columns.map((columnsType, index) => new Column(columnsType, index)));

    const $order = domain
        .store<ColumnId[]>([])
        .on(swapColumns, (prev, { a, b }) => {
            const indexA = prev.indexOf(a);
            const indexB = prev.indexOf(b);

            if (indexA === -1 || indexB === -1) {
                console.warn("Unable to find column in the current order array");
                return prev;
            }

            if (indexA !== indexB) {
                const nextOrder = [...prev];
                nextOrder[indexA] = b;
                nextOrder[indexB] = a;
                return nextOrder;
            }

            return prev;
        })
        .on(initParamsReady, (_, params) => params.columnsOrder);

    const $hidden = domain
        .store<Set<ColumnId>>(new Set())
        .on(hideColumn, (columns, id) => {
            const next = new Set(columns);

            if (next.delete(id) === false) {
                next.add(id);
            }

            return next;
        })
        .on(initParamsReady, (_, params) => params.columnsHidden);

    const $available = combine($columns, $order, (columns, order) => {
        if (order.length === columns.length) {
            columns = sortByOrder(columns, order);
        }
        return columns.filter(column => column.visible);
    });

    const $visible = combine($available, $hidden, (columns, hidden) => columns.filter(c => !hidden.has(c.columnId)));

    const $settingsHash = $columns.map(getHash);

    const $storage = storage(propsUpdate);

    sample({
        source: {
            $order,
            $hidden
        },
        target: createEffect((data: unknown) => {
            log(JSON.stringify(data));
        })
    });

    return {
        available: $available,
        columns: $columns,
        hidden: $hidden,
        hideColumn,
        order: $order,
        settingsHash: $settingsHash,
        swapColumns,
        storage: $storage,
        visible: $visible
    };
}

function createInitParams(params: {
    columns: Column[];
    ds: ListValue;
    settingsHash: string;
    storage: SettingsStorage;
}): InitParams {
    // return params as unknown as InitParams;
    const settings = params.storage.load();

    if (settings) {
        return {
            sort: settings.sort,
            columnsOrder: settings.order,
            columnsHidden: new Set(settings.columns.flatMap(col => (col.hidden ? [col.columnId] : []))),
            columnsSize: Object.fromEntries(settings.columns.map(col => [col.columnId, col.size])),
            filter: params.ds.filter
        };
    }

    return {
        sort: [],
        columnsSize: {},
        columnsHidden: new Set(params.columns.flatMap(column => (column.initiallyHidden ? [column.columnId] : []))),
        columnsOrder: params.columns.map(col => col.columnId),
        filter: params.ds.filter
    };
}

function readyEvents($status: Store<Status>): {
    // Event for stores
    initParamsReady: EventCallable<InitParams>;
    // Event for effects/events
    initParamsSent: EventCallable<InitParams>;
} {
    const initParamsSent = createEvent<InitParams>();
    const initParamsReady = createEvent<InitParams>();
    const misuseOfReady = createEffect(() =>
        console.warn("Avoid calling sendInitParams event once status become ready")
    );

    split({
        source: initParamsSent,
        match: $status,
        cases: {
            pending: initParamsReady,
            ready: misuseOfReady
        }
    });

    return { initParamsReady, initParamsSent };
}

// function withAttrStorage(columns: Store<Column[]>, initParamsSent: EventCallable<InitParams>): Event<Props> {
//     const event = createEvent<Props>();

//     const paramsReady = sample({
//         clock: event,
//         source: { columns },
//         fn: ({ columns }, props) => {
//             let storage: SettingsStorage | undefined;

//             if (props.configurationAttribute === undefined) {
//                 storage = {
//                     save() {},
//                     load() {
//                         return undefined;
//                     },
//                     reset() {}
//                 };
//             } else if (props.configurationAttribute.status === "available") {
//                 storage = new AttrStorage(props.configurationAttribute);
//             }
//             if (!storage) {
//                 return;
//             }

//             return createInitParams({
//                 columns,
//                 ds: props.datasource,
//                 settingsHash: "",
//                 storage
//             });
//         }
//     }).filterMap(payload => payload);

//     sample({
//         source: paramsReady,
//         target: initParamsSent
//     });

//     return event;
// }

// function withLocalStorage(columns: Store<Column[]>, initParamsSent: EventCallable<InitParams>): Event<Props> {
//     const event = createEvent<Props>();

//     sample({
//         clock: event,
//         source: [columns],
//         fn: ([columns], props) => {
//             return createInitParams({
//                 columns,
//                 ds: props.datasource,
//                 settingsHash: "",
//                 storage: { save() {}, load() {} }
//             });
//         },
//         target: initParamsSent
//     });

//     return event;
// }

function createModel(): Model {
    const Gate = createGate<Props>();
    const propsUpdated = Gate.state.updates;
    const $status = createStore<Status>("pending");

    propsUpdated.watch(s => log("props updated", s));

    const { initParamsSent, initParamsReady } = readyEvents($status);
    const grid = gridColumnUnits(propsUpdated, initParamsReady);

    $status.on(initParamsReady, () => "ready");

    const setup = sample({
        clock: propsUpdated,
        source: {
            status: $status,
            columns: grid.columns,
            settingsHash: grid.settingsHash,
            storage: grid.storage
        },
        // filter: ([status, columns], { datasource }) =>
        //     status === "pending" && datasource.status === "available" && !columns.some(c => c.status === "loading"),
        fn: ({ status, columns, settingsHash, storage }, { datasource }) => {
            if (status === "ready") {
                return;
            }

            if (datasource.status !== "available") {
                return;
            }

            if (columns.some(c => c.status === "loading")) {
                return;
            }

            if (storage.status === "pending") {
                return;
            }

            return createInitParams({
                columns,
                ds: datasource,
                settingsHash,
                storage: storage.value
            });
        }
    });

    sample({
        source: setup.filterMap(params => params),
        target: initParamsSent
    });

    // split({
    //     source: setup,
    //     match: props => (props.configurationAttribute ? "attr" : "local"),
    //     cases: {
    //         local: withLocalStorage(grid.columns, initParamsSent),
    //         attr: withAttrStorage(grid.columns, initParamsSent)
    //     }
    // });
    // const initFromSettingsFx = createEffect();
    // initFromSettingsFx.use(() => {});

    // sample({
    //     source: setup,
    //     filter: params => {
    //         log("filter");
    //         return params.configurationAttribute?.status === "available";
    //     },
    //     fn: params => {
    //         log("fn");
    //         return params.configurationAttribute;
    //     }
    // });

    // initParamsSent.watch(p => log("init params", p));
    initParamsReady.watch(p => log("params ready", p));
    grid.columns.updates.watch(s => log("columns update", s));
    grid.available.updates.watch(s => log("available update", s));
    grid.visible.updates.watch(s => log("visible update", s));

    // const push = createEvent<{ props: DatagridContainerProps; columns: Column[] }>();

    // const initializeFx = sample({
    //     source: [$status, $columns] as const,
    //     clock: propsUpdated,
    //     filter: ([status]) => {
    //         if (status === "ready") {
    //             return false;
    //         }
    //         return true;
    //     },
    //     target: createEffect()
    // });

    const setupDatasourceFx = sample({
        source: propsUpdated,
        target: createEffect((props: DatagridContainerProps) => {
            log("set limit");
            props.datasource.setLimit(props.pageSize);
            clearNode(setupDatasourceFx);
        })
    });

    return { Gate, grid, status: $status };
}

export function useModel(): Model {
    return useMemo(createModel, []);
}
