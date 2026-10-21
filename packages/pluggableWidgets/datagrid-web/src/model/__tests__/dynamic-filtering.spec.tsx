// The base jest config maps every "mendix/filters/builders" path to bare jest.fn()s, so build conditions inline.
jest.mock("mendix/filters/builders", () => {
    const op =
        (name: string) =>
        (...args: unknown[]) => ({ type: "function", name, args });
    return {
        attribute: (id: string) => ({ type: "attribute", attributeId: id }),
        literal: (value: unknown) => ({ type: "literal", value }),
        ...Object.fromEntries(
            ["and", "or", "equals", "notEqual", "contains", "startsWith", "endsWith", "empty"].map(n => [n, op(n)])
        ),
        greaterThan: op(">"),
        greaterThanOrEqual: op(">="),
        lessThan: op("<"),
        lessThanOrEqual: op("<=")
    };
});
import { render, screen } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { ListAttributeValue } from "mendix";
import { configure } from "mobx";
import { ReactElement } from "react";
import { useDynamicMode } from "@mendix/widget-plugin-filtering/dynamic/context";
import { DynamicFilterSet } from "@mendix/widget-plugin-filtering/dynamic/DynamicFilterSet";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { StringInputFilterStore } from "@mendix/widget-plugin-filtering/stores/input/StringInputFilterStore";
import { attrId, dynamic, listAttribute, setupIntersectionObserverStub } from "@mendix/widget-plugin-test-utils";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { WidgetHeader } from "../../components/WidgetHeader";
import { GridPersonalizationStore } from "../../helpers/state/GridPersonalizationStore";
import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { mockContainerProps } from "../../utils/test-utils";
import { datagridConfig } from "../configs/Datagrid.config";
import { createDatagridContainer } from "../containers/createDatagridContainer";
import { CORE_TOKENS as CORE, DG_TOKENS as DG } from "../tokens";

configure({ enforceActions: "never" });
setupIntersectionObserverStub();

function attr(id: string, type: ListAttributeValue["type"], universe?: unknown[]): ListAttributeValue<string> {
    const a = listAttribute(() => "") as unknown as ListAttributeValue<string>;
    a.id = attrId(id);
    (a as { type: string }).type = type;
    (a as { universe?: unknown[] }).universe = universe;
    return a;
}

const status = attr("status", "Enum", ["open", "closed"]);
const name = attr("name", "String");

function dynamicProps(overrides: Partial<DatagridContainerProps> = {}): DatagridContainerProps {
    return mockContainerProps({
        filteringMode: "dynamic",
        filterFields: [
            { key: "status", attribute: status, label: dynamic.available("Status") },
            { key: "name", attribute: name, label: dynamic.available("Name") }
        ],
        filterFieldOptions: [],
        addFilterCaption: dynamic.available("Add filter"),
        clearFiltersCaption: dynamic.available("Clear all"),
        removeFilterAriaLabel: dynamic.available("Remove filter"),
        filterFieldAriaLabel: dynamic.available("Filter field"),
        ...overrides
    });
}

function ModeProbe(): ReactElement {
    return <span>{useDynamicMode() ? "probe: dynamic" : "probe: fixed"}</span>;
}

function renderHeader(props: DatagridContainerProps): void {
    const [container] = createDatagridContainer(props);
    render(
        <ContainerProvider container={container}>
            <WidgetHeader />
        </ContainerProvider>
    );
}

describe("Dynamic filtering mode", () => {
    describe("config", () => {
        it("turns column filters off in Dynamic mode", () => {
            expect(datagridConfig(dynamicProps({ columnsFilterable: true })).columnsFilterable).toBe(false);
        });

        it("keeps column filters in Fixed mode", () => {
            expect(datagridConfig(mockContainerProps({ columnsFilterable: true })).columnsFilterable).toBe(true);
        });
    });

    describe("header", () => {
        it("renders with an empty slot and shows only the Add filter button", () => {
            renderHeader(dynamicProps({ filtersPlaceholder: undefined }));
            expect(screen.getByRole("button", { name: "Add filter" })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
        });

        it("doesn't render with an empty slot in Fixed mode", () => {
            renderHeader(mockContainerProps({ filtersPlaceholder: undefined }));
            expect(document.querySelector(".widget-datagrid-header")).toBeNull();
        });

        it("signals Dynamic mode to header content, rendered before the builder", () => {
            renderHeader(dynamicProps({ filtersPlaceholder: <ModeProbe /> }));
            const probe = screen.getByText("probe: dynamic");
            const add = screen.getByRole("button", { name: "Add filter" });
            const all = Array.from(document.querySelectorAll(".widget-datagrid-header *"));
            expect(all.indexOf(probe)).toBeLessThan(all.indexOf(add));
        });

        it("doesn't signal Dynamic mode in Fixed mode", () => {
            renderHeader(mockContainerProps({ filtersPlaceholder: <ModeProbe /> }));
            expect(screen.getByText("probe: fixed")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Add filter" })).not.toBeInTheDocument();
        });
    });

    describe("datasource filter", () => {
        it("equals the Filter Set's condition", () => {
            const [container] = createDatagridContainer(dynamicProps());
            const filterSet = container.get(DG.dynamicFilterSet)!;
            const combined = container.get(DG.combinedFilter);

            expect(combined.filter).toBeUndefined();

            const row = filterSet.addRow();
            filterSet.setField(row.id, "name");
            (row.store as StringInputFilterStore).arg1.value = "Jo";

            expect(row.condition).toBeDefined();
            expect(combined.filter).toEqual(filterSet.condWithMeta.cond);
        });

        it("has no Filter Set in Fixed mode", () => {
            const [container] = createDatagridContainer(mockContainerProps());
            expect(container.get(DG.dynamicFilterSet)).toBeNull();
        });
    });
});

describe("Dynamic filters personalization", () => {
    const host = { add: (): void => undefined, remove: (): void => undefined };
    let warn: jest.SpyInstance;

    beforeEach(() => {
        localStorage.clear();
        warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    });
    afterEach(() => warn.mockRestore());

    function setup(
        storeFilters = true,
        mode: "fixed" | "dynamic" = "dynamic"
    ): { store: GridPersonalizationStore; filterSet: DynamicFilterSet; dispose: () => void } {
        const props = dynamicProps({
            filteringMode: mode,
            configurationStorageType: "localStorage",
            storeFiltersInPersonalization: storeFilters
        });
        const [container] = createDatagridContainer(props);
        const filterSet = new DynamicFilterSet([
            { key: "status", attribute: status, label: "Status" },
            { key: "name", attribute: name, label: "Name" }
        ]);
        const store = new GridPersonalizationStore(
            host,
            { props },
            container.get(CORE.columnsStore),
            new CustomFilterHost(),
            mode === "dynamic" ? filterSet : null
        );
        return { store, filterSet, dispose: store.setup() };
    }

    function save(settings: GridPersonalizationStorageSettings): void {
        localStorage.setItem(`${settings.name}_${settings.settingsHash}`, JSON.stringify(settings));
    }

    it("writes the rows and restores them, keeping schemaVersion 3", () => {
        const first = setup();
        const row = first.filterSet.addRow();
        first.filterSet.setField(row.id, "status");
        row.store!.fromJSON(["open"]);
        const saved = first.store.settings;
        first.dispose();

        expect(saved.schemaVersion).toBe(3);
        expect(saved.dynamicFilters).toEqual([{ field: "status", data: ["open"] }]);

        save(saved);
        const second = setup();
        expect(second.filterSet.rows.map(r => r.fieldKey)).toEqual(["status"]);
        expect(second.filterSet.toJSON()).toEqual(saved.dynamicFilters);
        second.dispose();
    });

    it("keeps column settings when the blob has no dynamicFilters", () => {
        const first = setup();
        const blob = first.store.settings;
        first.dispose();
        const legacy = {
            ...blob,
            sortOrder: [[blob.columns[0].columnId, "desc"]]
        } as GridPersonalizationStorageSettings;
        delete legacy.dynamicFilters;
        save(legacy);

        const second = setup();
        expect(second.filterSet.rows).toEqual([]);
        expect(second.store.settings.sortOrder).toEqual(legacy.sortOrder);
        second.dispose();
    });

    it("drops rows for unknown field keys silently", () => {
        const first = setup();
        const blob = first.store.settings;
        first.dispose();
        save({
            ...blob,
            dynamicFilters: [
                { field: "region", data: ["eu"] },
                { field: "status", data: ["closed"] }
            ]
        });

        const second = setup();
        expect(second.filterSet.toJSON()).toEqual([{ field: "status", data: ["closed"] }]);
        second.dispose();
    });

    it("neither writes nor restores rows when filter persistence is off", () => {
        const first = setup(false);
        const row = first.filterSet.addRow();
        first.filterSet.setField(row.id, "status");
        row.store!.fromJSON(["open"]);
        const blob = first.store.settings;
        first.dispose();
        expect(blob.dynamicFilters).toBeUndefined();

        save({ ...blob, dynamicFilters: [{ field: "status", data: ["open"] }] });
        const second = setup(false);
        expect(second.filterSet.rows).toEqual([]);
        second.dispose();
    });

    it("doesn't write dynamicFilters in Fixed mode", () => {
        const { store, dispose } = setup(true, "fixed");
        expect(store.settings).not.toHaveProperty("dynamicFilters");
        dispose();
    });
});
