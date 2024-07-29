import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { DynamicGridContainerProps } from "../typings/DynamicGridProps";
import { transformColumn } from "./features/transform-column";
import { transformData } from "./features/transform-data";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./ui/DynamicGrid.css";

export function DynamicGrid(props: DynamicGridContainerProps): ReactElement {
    console.info(props);
    const rowData = transformData(props.datasource.items ?? [], props.columns);
    const colDefs = props.columns.map(transformColumn);

    const defaultColDef: ColDef = {
        flex: 1
    };

    return (
        <div className={classNames("ag-theme-quartz", props.class)} style={{ height: 500 }}>
            <AgGridReact
                columnDefs={[
                    {
                        headerName: "Personal data",
                        children: colDefs.slice(0, 2)
                    },
                    {
                        headerName: "Sensitive data",
                        children: colDefs.slice(2)
                    }
                ]}
                defaultColDef={defaultColDef}
                rowData={rowData}
                rowSelection="multiple"
                pagination={true}
                paginationPageSize={20}
            />
        </div>
    );
}
