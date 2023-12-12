import { createElement, memo, useEffect, useReducer, Fragment } from "react";
import { ObjectItem } from "mendix";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { createStore, createEvent, sample } from "effector";
import { useUnit } from "effector-react";
import { Column } from "./helpers/Column";
import { ColumnId } from "./typings/GridColumn";

const $props = createStore<DatagridContainerProps | null>(null);
const propsUpdated = createEvent<DatagridContainerProps>();
// const updateColumns = propsUpdated.map(props => props.columns);
// const xSt = restore(updateColumns, []).map(columns => {
//     console.log("DEBUG", "map columns");
//     return columns.map(column => column.header?.value ?? "N/A");
// });

// let limit = 0;

$props.on(propsUpdated, (_, nextProps) => nextProps);
$props.watch(p => console.log("DEBUG", "payload", p));
// sample({
//     source: $props,
//     clock: propsUpdated,
//     filter() {
//         return true;
//     },
//     fn: (_, nextProps) => nextProps,
//     target: $props
// });

// const someHappened = createEvent();
// const increment = createEvent();
// const $counter = createStore(0);

// sample({
//     clock: increment,
//     source: $counter,
//     target: someHappened
// });

// $counter.on(increment, counter => {
//     return counter + 1;
// });
// someHappened.watch(p => console.log("DEBUG", "payload for Some", p));
const $columns = sample({
    source: $props.map(props => {
        return props?.columns ?? [];
    }),
    fn: columns => columns.map((columnsType, index) => new Column(columnsType, index))
    // target: createStore(0, { updateFilter: n => n % 10 === 0 })
});

const toggleHidden = createEvent<ColumnId>();
const $hidden = createStore<Set<ColumnId>>(new Set());

$hidden.on(toggleHidden, (hidden, id) => {
    const next = new Set(hidden);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    return next;
});

$hidden.watch(s => console.log("DEBUG", "hidden state", s));

const $columnsAvailable = $columns.map(columns => columns.filter(x => x.visible));
const $columnsVisible = sample({
    source: [$columnsAvailable, $hidden] as const,
    fn: ([columns, hidden]) => columns.filter(({ columnId }) => !hidden.has(columnId))
});

// eslint-disable-next-line prefer-arrow-callback
const Controlled = memo(function Controlled(props: { items?: ObjectItem[] }) {
    console.log("DEBUG", "render start");
    const [available, visible] = useUnit([$columnsAvailable, $columnsVisible]);

    return (
        <div>
            <div style={{ display: "flex" }}>
                {available.map(x => (
                    <span key={x.columnId}>
                        <strong>{x.header}&nbsp;</strong>
                        <button onClick={() => toggleHidden(x.columnId)}>visible</button>&nbsp;
                    </span>
                ))}
            </div>
            <table>
                <tr>
                    {visible.map(x => (
                        <th key={x.columnId}>
                            <strong>{x.header}</strong> ({x.attrId}); &nbsp;&nbsp;
                        </th>
                    ))}
                </tr>
                {(props.items ?? []).map(obj => {
                    return (
                        <tr key={obj.id}>
                            {visible.map(x => (
                                <td key={x.columnId}>{x.renderCellContent(obj)}</td>
                            ))}
                        </tr>
                    );
                })}
            </table>
        </div>
    );
});

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const [skipUpdates, toggle] = useReducer(b => !b, false);

    useEffect(() => {
        propsUpdated(props);
    }, [props]);

    console.log("DEBUG", "parent");

    useEffect(() => {
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            props.datasource.setLimit(props.pageSize);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Fragment>
            <div>
                Limit: {props.datasource.limit}; Offset: {props.datasource.offset}
            </div>
            <div>
                <button onClick={() => $props.reinit()}>Reinit props</button> ;
            </div>
            <label htmlFor="23">
                Tick&nbsp;
                <input
                    type="checkbox"
                    onChange={() => {
                        toggle();
                    }}
                    checked={skipUpdates}
                    id="23"
                />
            </label>
            <Controlled items={props.datasource.items} />
            <button
                onClick={() => {
                    props.datasource.setOffset(props.datasource.offset - props.pageSize);
                }}
            >
                Prev
            </button>{" "}
            <button
                onClick={() => {
                    props.datasource.setOffset(props.datasource.offset + props.pageSize);
                }}
            >
                Next
            </button>
        </Fragment>
    );
}
