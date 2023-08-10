import { ObjectItem } from "mendix";
import { isAvailable } from "@mendix/pluggable-widgets-commons";
import { ColumnsType } from "../../typings/DatagridProps";

type ExportType = "csv" | "xls" | "sql" | "json";

export class ExportFromDatagrid {
    private columns: ColumnsType[];
    private items: ObjectItem[];

    constructor() {
        this.columns = [];
        this.items = [];
    }

    addColumns(columns: ColumnsType[]) {
        this.columns = columns;
    }

    addItems(exportItems: ObjectItem[]) {
        this.items = [...this.items, ...exportItems];
    }

    async export(dataType: ExportType = "json") {
        switch (dataType) {
            case "json":
                if (this.items) {
                    const json = this.exportJson();
                    console.info(json);
                }
                break;
            default:
                console.info("implement CSV, XLS, SQL");
                break;
        }
    }

    private exportJson() {
        let exportData: {}[] = [];

        this.items.forEach(item => {
            const exportItem = this.columns.reduce((prev, curr) => {
                const header = curr.header && isAvailable(curr.header) ? curr.header.value ?? "" : "";
                let value = "";

                if (curr.showContentAs === "attribute") {
                    value = curr.attribute?.get(item)?.displayValue ?? "";
                } else if (curr.showContentAs === "dynamicText") {
                    value = curr.dynamicText?.get(item)?.value ?? "";
                } else {
                    value = "n/a";
                }

                return {
                    ...prev,
                    [header.replaceAll(" ", "_").toLowerCase()]: value
                };
            }, {});

            exportData.push(exportItem);
        });

        return exportData;
    }
}
