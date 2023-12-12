import { createElement, useReducer, Fragment } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Container } from "./Container";

export default function Datagrid(props: DatagridContainerProps): React.ReactElement {
    const [n, tick] = useReducer(n => n + 1, 0);
    return (
        <Fragment>
            <label htmlFor="23">
                Tick&nbsp;{n}&nbsp;
                <button onClick={tick} id="23" type="button" value="tick">
                    tick
                </button>
            </label>
            <Container {...props} />
        </Fragment>
    );
}
