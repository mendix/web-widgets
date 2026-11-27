import { ReactElement } from "react";
import Datagrid from "@mendix/datagrid-web/src/Datagrid";
import type { ColumnsType, DatagridContainerProps } from "@mendix/datagrid-web/typings/DatagridProps";
import { dynamic, Harness, LiveEditable, LiveList, LiveSelection } from "../../src/main";
import { testProjectData, testProjectSchema } from "../fixtures/test-project";
import { probed } from "../Probed";
import { ScenarioFactory } from "../scenario";

const Grid = probed(Datagrid);
const Person = "MyFirstModule.Person";
const params = new URLSearchParams(window.location.search);
const page = params.get("page") ?? "home";
const delay = Number(params.get("delay") ?? 20);

/** The pages of the datagrid-web test project that behavior specs use, rebuilt from the same widget settings. */
const create: ScenarioFactory = () => {
    const harness = new Harness(testProjectSchema, testProjectData);
    const lists: Record<string, LiveList> = {};
    const configs: Record<string, LiveEditable<string>> = {};
    const selections: Record<string, LiveSelection<any>> = {};

    function list(name: string, sortOrder?: Array<[string, "asc" | "desc"]>): LiveList {
        return (lists[name] = harness.list({ entity: Person, delay, sortOrder }));
    }

    function column(attr: string, header: string): ColumnsType {
        return {
            showContentAs: "attribute",
            attribute: harness.listAttribute(Person, attr),
            header: dynamic(header),
            visible: dynamic(true),
            exportType: "default",
            sortable: true,
            resizable: true,
            draggable: false,
            hidable: "yes",
            allowEventPropagation: true,
            width: "autoFill",
            size: 1,
            minWidth: "auto",
            minWidthLimit: 100,
            alignment: "left",
            wrapText: false
        };
    }

    function grid(name: string, columns: ColumnsType[], extra: Partial<DatagridContainerProps>): ReactElement {
        const props: DatagridContainerProps = {
            name,
            class: `mx-name-${name}`,
            datasource: lists[name].value,
            refreshInterval: 0,
            columns,
            columnsFilterable: false,
            onClickTrigger: "single",
            itemSelectionMethod: "checkbox",
            autoSelect: false,
            itemSelectionMode: "toggle",
            showSelectAllToggle: true,
            enableSelectAll: false,
            keepSelection: false,
            selectionCounterPosition: "off",
            loadingType: "spinner",
            refreshIndicator: false,
            pageSize: 20,
            pagination: "buttons",
            useCustomPagination: false,
            showPagingButtons: "always",
            showNumberOfRows: false,
            pagingPosition: "bottom",
            showEmptyPlaceholder: "none",
            columnsSortable: true,
            columnsResizable: true,
            columnsDraggable: false,
            columnsHidable: true,
            configurationStorageType: "attribute",
            configurationAttribute: configs[name]?.value,
            storeFiltersInPersonalization: false,
            selectAllText: dynamic("Select all"),
            selectAllTemplate: dynamic("Select all %d rows"),
            allSelectedText: dynamic("All %d rows selected"),
            ...extra
        };
        return <Grid key={name} {...props} />;
    }

    let render: () => ReactElement;
    if (page === "home") {
        list("datagrid1", [["LastName", "desc"]]);
        list("datagrid3");
        list("datagrid5");
        configs.datagrid5 = harness.editable<string>({ value: "" });
        render = () => (
            <div>
                {grid("datagrid5", [column("FirstName", "First Name"), column("LastName", "Last Name")], {})}
                {grid(
                    "datagrid1",
                    [column("Age", "Age"), column("FirstName", "First Name"), column("LastName", "Last Name")],
                    { pageSize: 5, onClick: harness.listAction("onClickDatagrid1") }
                )}
                {grid(
                    "datagrid3",
                    [
                        column("Age", "Age"),
                        column("FirstName", "First Name"),
                        column("LastName", "Last Name"),
                        column("Birthday", "Birthday")
                    ],
                    { pageSize: 5 }
                )}
            </div>
        );
    } else {
        const type = page === "multi-selection" ? "Multi" : "Single";
        const name = `dg${type}SelectionCheckbox`;
        const source = list(name);
        configs[name] = harness.editable<string>({ value: "" });
        selections[name] = type === "Multi" ? harness.selectionMulti(source) : harness.selectionSingle(source);
        render = () =>
            grid(name, [column("FirstName", "First Name"), column("LastName", "Last Name")], {
                itemSelection: selections[name].value
            });
    }

    return { harness, render: () => render(), expose: { lists, configs, selections } };
};

export default create;
