import DatagridTextFilter from "@mendix/datagrid-text-filter-web/src/DatagridTextFilter";
import Datagrid from "@mendix/datagrid-web/src/Datagrid";
import type { ColumnsType, DatagridContainerProps } from "@mendix/datagrid-web/typings/DatagridProps";
import { dynamic, Harness } from "../../src/main";
import { people, peopleSchema } from "../fixtures/people";
import { ScenarioFactory } from "../scenario";

const delay = Number(new URLSearchParams(window.location.search).get("delay") ?? 50);

const create: ScenarioFactory = () => {
    const harness = new Harness(peopleSchema, { Person: people });
    const datasource = harness.list({ entity: "Person", delay });
    const selection = harness.selectionMulti(datasource);
    const onClick = harness.listAction("onClickRow");
    const onSelectionChange = harness.action("onSelectionChange");
    const firstNameHeader = harness.dynamicValue("First name");

    function column(attr: string, header: string, extra: Partial<ColumnsType> = {}): ColumnsType {
        return {
            showContentAs: "attribute",
            attribute: attr ? harness.listAttribute("Person", attr) : undefined,
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
            wrapText: false,
            ...extra
        };
    }

    function props(): DatagridContainerProps {
        return {
            name: "datagrid1",
            // The Mendix client passes the mx-name class through `class`.
            class: "mx-name-datagrid1",
            datasource: datasource.value,
            refreshInterval: 0,
            columns: [
                column("firstName", "", {
                    header: firstNameHeader.value,
                    filter: (
                        <DatagridTextFilter
                            name="textFilter1"
                            class="mx-name-textFilter1"
                            attrChoice="auto"
                            attributes={[]}
                            defaultFilter="contains"
                            adjustable
                            delay={100}
                            placeholder={dynamic("Search")}
                        />
                    )
                }),
                column("lastName", "Last name"),
                column("age", "Age"),
                column("color", "Color"),
                column("", "Full name", {
                    showContentAs: "dynamicText",
                    attribute: undefined,
                    dynamicText: harness.listExpression(obj => `${obj.values.firstName} ${obj.values.lastName}`)
                }),
                column("", "Badge", {
                    showContentAs: "customContent",
                    attribute: undefined,
                    content: harness.listWidget(obj => <span className="age-badge">age {String(obj.values.age)}</span>)
                })
            ],
            columnsFilterable: true,
            onClickTrigger: "single",
            onClick,
            itemSelection: selection.value,
            onSelectionChange: onSelectionChange.value,
            itemSelectionMethod: "checkbox",
            autoSelect: false,
            itemSelectionMode: "toggle",
            showSelectAllToggle: true,
            enableSelectAll: false,
            keepSelection: false,
            selectionCounterPosition: "bottom",
            loadingType: "spinner",
            refreshIndicator: false,
            pageSize: 10,
            pagination: "buttons",
            useCustomPagination: false,
            showPagingButtons: "always",
            showNumberOfRows: true,
            pagingPosition: "bottom",
            showEmptyPlaceholder: "none",
            columnsSortable: true,
            columnsResizable: true,
            columnsDraggable: false,
            columnsHidable: true,
            configurationStorageType: "localStorage",
            storeFiltersInPersonalization: false,
            selectAllText: dynamic("Select all"),
            selectAllTemplate: dynamic("Select all %d rows"),
            allSelectedText: dynamic("All %d rows selected")
        };
    }

    return {
        harness,
        render: () => <Datagrid {...props()} />,
        expose: { datasource, selection, firstNameHeader }
    };
};

export default create;
