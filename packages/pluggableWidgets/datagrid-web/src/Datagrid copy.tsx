import { createElement, useEffect, useReducer, useMemo } from "react";
import { ListValue, EditableValue } from "mendix";
import { ColumnsType, DatagridContainerProps } from "../typings/DatagridProps";
// import DatagridContainer from "./components/Datagrid";
import "./ui/Datagrid.scss";
import { createStore, createEvent, restore } from "effector";
import { useUnit } from "effector-react";
// import { Column } from "./helpers/Column";
const KEYS: Array<keyof DatagridContainerProps> = [
    "name",
    "advanced",
    "datasource",
    "refreshInterval",
    "itemSelection",
    "itemSelectionMethod",
    "showSelectAllToggle",
    "columns",
    "columnsFilterable",
    "pageSize",
    "pagination",
    "pagingPosition",
    "showEmptyPlaceholder",
    "emptyPlaceholder",
    "onClick",
    "onSelectionChange",
    "columnsSortable",
    "columnsResizable",
    "columnsDraggable",
    "columnsHidable",
    "configurationAttribute",
    "filterList",
    "filtersPlaceholder",
    "filterSectionTitle",
    "exportDialogLabel",
    "cancelExportLabel",
    "selectRowLabel",
    "class"
];
// import { useInitialize } from "./features/state/use-initialize";
// import { Column } from "./helpers/Column";

// export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
//     const columns = useMemo(() => props.columns.map((col, index) => new Column(col, index)), [props.columns]);
//     const [initState] = useInitialize(props, columns);

//     if (initState === undefined) {
//         return <span>Loading</span>;
//     }

//     return <DatagridContainer {...props} columns={columns} rawColumns={props.columns} initState={initState} />;
// }
// const EMPTY = Symbol("empty");
const propsDidUpdate = createEvent<{ props: DatagridContainerProps; skipUpdates: boolean }>();

const $props = createStore<null | DatagridContainerProps>(null);

function log(prevProps: DatagridContainerProps | null, nextProps: DatagridContainerProps): void {
    if (prevProps === null || prevProps === nextProps) {
        return;
    }
    console.log("DEBUG", "  > next props changed:");
    for (const key of KEYS) {
        if (prevProps[key] !== nextProps[key]) {
            console.log("DEBUG     >", key);
        }
    }
}

$props.on(
    propsDidUpdate,
    (prevProps, { props: nextProps, skipUpdates }: { props: DatagridContainerProps; skipUpdates: boolean }) => {
        // return prevProps;
        // return prevProps === null ? nextProps : prevProps;
        log(prevProps, nextProps);
        return prevProps === nextProps || skipUpdates ? prevProps : nextProps;
    }
);

const [col1, ds2, set3] = [
    createEvent<ColumnsType[]>(),
    createEvent<ListValue>(),
    createEvent<EditableValue<string>>()
];
// const updateFn = <T,>(_: T, payload: T): T => payload;
const $cols = restore(col1, null);
const $ds = restore(ds2, null);
const $settings = restore(set3, null);

// const x = merge([$cols, $ds, $settings]);
$cols.updates.watch(v => console.log("DEBUG     >", v));
$ds.updates.watch(v => console.log("DEBUG     >", v));
$settings.updates.watch(v => console.log("DEBUG     >", v));

const setCount = createEvent<number>();
const $count = restore(setCount, 0);

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const time = performance.now();
    console.log("DEBUG", "render start", time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => console.log("DEBUG", "  > props change"), [props]);
    const count = useUnit($count);
    const [skipUpdates, toggle] = useReducer(b => !b, false);
    const [s1, s2, s3] = useUnit([$cols, $ds, $settings]);
    useMemo(() => {
        console.log("DEBUG", "  > some store is changed", performance.now());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [s1, s2, s3]);

    useEffect(() => {
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            console.log("DEBUG", "  > setLimit");
            props.datasource.setLimit(props.pageSize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.datasource]);
    useEffect(() => {
        propsDidUpdate({ props, skipUpdates });
        if (skipUpdates) {
            return;
        }
        // console.log("DEBUG", "props effect");
        col1(props.columns);
        ds2(props.datasource);
        set3(props.configurationAttribute!);
    }, [props, skipUpdates]);
    console.log("DEBUG", "render end", time);
    return (
        <div>
            <input type="checkbox" onChange={toggle} checked={skipUpdates} />
            Hello {count} <button onClick={() => setCount(count + 1)}>tick</button>
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => props.datasource.setLimit(props.datasource.limit + props.pageSize)}>NextPage</button>
        </div>
    );
}
