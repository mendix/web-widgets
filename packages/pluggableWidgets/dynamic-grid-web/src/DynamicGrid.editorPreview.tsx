import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { DynamicGridPreviewProps } from "../typings/DynamicGridProps";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./ui/DynamicGrid.css";

interface IRow {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

export function preview(props: DynamicGridPreviewProps): ReactElement {
    console.info(props);
    const rowData: IRow[] = [
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false }
    ];

    // Column Definitions: Defines the columns to be displayed.
    const colDefs: ColDef<IRow>[] = [{ field: "make" }, { field: "model" }, { field: "price" }, { field: "electric" }];

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
