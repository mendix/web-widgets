import { createElement, useReducer } from "react";
import { useGate, useUnit } from "effector-react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Model } from "./features/model/base";
import { useModel } from "./features/model/main";
import { ColumnId } from "./typings/GridColumn";

type Props = { items?: any[]; model: Model };

function Controlled(props: Props): React.ReactElement {
    console.log("DEBUG", "render start");

    const { model, items } = props;
    const [available, visible] = useUnit([model.grid.available, model.grid.visible]);
    const [s, se] = useReducer(
        (state: Set<ColumnId>, a: React.ChangeEvent<HTMLInputElement> | "reset"): Set<ColumnId> => {
            if (a === "reset") {
                return new Set();
            }

            const next = new Set(state);
            if (next.delete(a.target.value as ColumnId) === false) {
                next.add(a.target.value as ColumnId);
            }
            return next.size > 2 ? state : next;
        },
        new Set<ColumnId>()
    );

    return (
        <div>
            <div>
                <button
                    disabled={s.size < 2}
                    onClick={() => {
                        const [a, b] = s;
                        model.grid.swap([a, b]);
                    }}
                >
                    Swap
                </button>
                <button onClick={() => se("reset")}>Clear</button>
            </div>
            <div>
                <button onClick={model.grid.prevPage}>Prev</button>
                <button onClick={model.grid.nextPage}>Next</button>
            </div>
            <div style={{ display: "flex" }}>
                {available.map(x => (
                    <span key={x.columnId}>
                        <input type="checkbox" onChange={se} value={x.columnId} checked={s.has(x.columnId)} />
                        <strong>{x.header}&nbsp;</strong>
                        <button onClick={() => model.grid.hide(x.columnId)}>visible</button>&nbsp;
                    </span>
                ))}
            </div>
            <hr />
            <table className="table">
                <thead>
                    <tr>
                        {visible.map(x => (
                            <th key={x.columnId}>
                                <strong>{x.header}</strong>
                                <button onClick={() => model.grid.sortBy(x.columnId)}>sort</button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(items ?? []).map(obj => {
                        return (
                            <tr key={obj.id}>
                                {visible.map(x => (
                                    <td key={x.columnId}>{x.renderCellContent(obj)}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function Container(props: DatagridContainerProps): React.ReactElement {
    const model = useModel();
    const loading = useUnit(model.status) !== "ready";
    useGate(model.gate, props);

    if (loading) {
        return <div>loading</div>;
    }
    return (
        <div>
            <Controlled items={props.datasource.items} model={model} />;
        </div>
    );
}
