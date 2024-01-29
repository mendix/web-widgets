import { configure } from "mobx";
import { observer } from "mobx-react-lite";
import { createElement, useMemo, useEffect } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { XCell, XColumn, XGrid, XRow } from "./XGrid";
import "./ui/Sandbox.scss";

configure({ isolateGlobalState: true });

const Cell = observer(({ cell }: { cell: XCell }) => (
    <td key={Math.random()} className="changed" style={cell.style} onClick={cell.onClick}>
        <span className="td-text">{cell.content}</span>
    </td>
));

const Header = observer(({ column }: { column: XColumn }) => (
    <th key={Math.random()} className="changed">
        {column.caption}
    </th>
));

const Row = ({ children }: React.PropsWithChildren): React.ReactElement => <tr>{children}</tr>;

const DataRow = observer(({ row }: { row: XRow }) => (
    <Row>
        {row.cells.map(cell => (
            <Cell key={cell.id} cell={cell} />
        ))}
    </Row>
));

const THead = observer((props: { grid: XGrid }) => (
    <thead>
        <Row>
            {props.grid.columns.map(col => (
                <Header key={col.id} column={col} />
            ))}
        </Row>
    </thead>
));

const TBody = observer((props: { grid: XGrid }) => (
    <tbody>
        {props.grid.rows.map(row => (
            <DataRow key={row.id} row={row} />
        ))}
    </tbody>
));

const Table = (props: { grid: XGrid }): React.ReactElement => (
    <table className="table">
        <THead grid={props.grid} />
        <TBody grid={props.grid} />
    </table>
);

function useModel(props: DatagridContainerProps): XGrid {
    return useMemo(() => {
        return new XGrid(props.columns.map(c => new XColumn(c)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export function Datagrid(props: DatagridContainerProps): React.ReactElement {
    (window as any).__ds = props.datasource;
    const model = useModel(props);
    (window as any).__model = model;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => props.datasource.setLimit(props.pageSize), []);

    useEffect(() => {
        if (props.datasource.items) {
            model.setItems(props.datasource.items);
        }
    }, [props.datasource.items, model]);

    useEffect(() => {
        model.setSelection(props.itemSelection);
    }, [props.itemSelection, model]);

    useEffect(() => {
        model.columns.forEach((column, index) => {
            const d = props.columns.at(index);
            return d ? column.updateColumn(d) : null;
        });
    }, [props.columns, model]);

    return <Table grid={model} />;
}
