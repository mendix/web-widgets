import { error, Result, value } from "@mendix/widget-plugin-filtering/result-meta";
import { HeaderFiltersStore } from "@mendix/widget-plugin-filtering/stores/generic/HeaderFiltersStore";
import { FiltersSettingsMap } from "@mendix/widget-plugin-filtering/typings/settings";
import { action, comparer, computed, IReactionDisposer, makeObservable, reaction } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { ColumnId } from "../../typings/GridColumn";
import {
    ColumnPersonalizationSettings,
    GridPersonalizationStorageSettings
} from "../../typings/personalization-settings";
import { SortRule } from "../../typings/sorting";
import { getHash } from "../../utils/columns-hash";
import { AttributePersonalizationStorage } from "../storage/AttributePersonalizationStorage";
import { LocalStoragePersonalizationStorage } from "../storage/LocalStoragePersonalizationStorage";
import { PersonalizationStorage } from "../storage/PersonalizationStorage";
import { ColumnGroupStore } from "./ColumnGroupStore";
export class GridPersonalizationStore {
    private readonly gridName: string;
    private readonly gridColumnsHash: string;
    private readonly schemaVersion: GridPersonalizationStorageSettings["schemaVersion"] = 2;
    private readonly storeFilters: boolean;

    private storage: PersonalizationStorage;

    private disposers: IReactionDisposer[] = [];

    constructor(
        props: DatagridContainerProps,
        private columnsStore: ColumnGroupStore,
        private headerFilters: HeaderFiltersStore
    ) {
        this.gridName = props.name;
        this.gridColumnsHash = getHash(this.columnsStore._allColumns, this.gridName);
        this.storeFilters = props.storeFiltersInPersonalization;

        makeObservable<GridPersonalizationStore, "applySettings">(this, {
            settings: computed,

            applySettings: action
        });

        if (props.configurationStorageType === "localStorage") {
            this.storage = new LocalStoragePersonalizationStorage(`${this.gridName}_${this.gridColumnsHash}`);
        } else {
            this.storage = new AttributePersonalizationStorage(props);
        }

        this.disposers.push(this.setupReadReaction());
        this.disposers.push(this.setupWriteReaction());
    }

    dispose(): void {
        this.disposers.forEach(d => d());
    }

    updateProps(props: DatagridContainerProps): void {
        this.storage.updateProps?.(props);
    }

    private setupReadReaction(): IReactionDisposer {
        return reaction<GridPersonalizationStorageSettings | null, true>(
            () => {
                const maybeSettings = this.storage.settings;
                const result = this.readSettings(this.gridName, this.gridColumnsHash, maybeSettings);
                if (result.hasError) {
                    if (result.error instanceof InvalidSettingsError) {
                        console.warn(this.gridName, result.error);
                        console.warn(this.gridName, "Erase settings to prevent errors.");
                        this.storage.updateSettings(undefined);
                    }
                    return null;
                }
                return result.value;
            },
            settings => {
                if (settings == null) {
                    return;
                }
                this.applySettings(settings);
            },
            { fireImmediately: true, equals: comparer.structural }
        );
    }

    private setupWriteReaction(): IReactionDisposer {
        return reaction(
            () => this.settings,
            settings => {
                this.storage.updateSettings(settings);
            },
            { delay: 250, equals: comparer.structural }
        );
    }

    private applySettings(settings: GridPersonalizationStorageSettings): void {
        this.columnsStore.setColumnSettings(toColumnSettings(settings));
        this.columnsStore.setColumnFilterSettings(settings.columnFilters);
    }

    private readSettings(
        gridName: string,
        gridColumnsHash: string,
        settings: unknown
    ): Result<GridPersonalizationStorageSettings, Error> {
        if (settings == null) {
            return error(new UndefinedSettingsError());
        }
        if (!this.isSettingsObject(settings)) {
            return error(new InvalidSettingsError());
        }
        if (settings.name !== gridName || settings.settingsHash !== gridColumnsHash) {
            return error(
                new Error(
                    `Widget configuration for (${gridName})[hash:${gridColumnsHash}]` +
                        ` doesn't match provided settings (${settings.name})[hash:${settings.settingsHash}].` +
                        " Restoring those settings might result in errors."
                )
            );
        }
        return value(settings);
    }

    private isSettingsObject(settings: unknown): settings is GridPersonalizationStorageSettings {
        return (
            typeof settings === "object" &&
            settings !== null &&
            "name" in settings &&
            "settingsHash" in settings &&
            "schemaVersion" in settings &&
            settings.schemaVersion === this.schemaVersion
        );
    }

    get settings(): GridPersonalizationStorageSettings {
        return toStorageFormat(
            this.gridName,
            this.gridColumnsHash,
            this.columnsStore.columnSettings,
            this.storeFilters ? this.columnsStore.filterSettings : new Map(),
            this.storeFilters ? this.headerFilters.settings : new Map()
        );
    }
}

function toColumnSettings(settings: GridPersonalizationStorageSettings): ColumnPersonalizationSettings[] {
    return settings.columns.map(c => {
        const sortIndex = settings.sortOrder.findIndex(s => s[0] === c.columnId);

        return {
            columnId: c.columnId,
            size: c.size,
            hidden: c.hidden,

            orderWeight: settings.columnOrder.indexOf(c.columnId),

            sortWeight: sortIndex !== -1 ? sortIndex + 1 : undefined,
            sortDir: sortIndex !== -1 ? settings.sortOrder[sortIndex]?.[1] : undefined
        };
    });
}

function toStorageFormat(
    gridName: string,
    gridColumnsHash: string,
    columnsSettings: ColumnPersonalizationSettings[],
    columnFilters: FiltersSettingsMap<ColumnId>,
    groupFilters: FiltersSettingsMap<string>
): GridPersonalizationStorageSettings {
    const sortOrder = columnsSettings
        .filter(c => c.sortDir && c.sortWeight !== undefined)
        .sort((a, b) => a.sortWeight! - b.sortWeight!)
        .map(c => [c.columnId!, c.sortDir!] as SortRule);

    const columnOrder = [...columnsSettings].sort((a, b) => a.orderWeight - b.orderWeight).map(c => c.columnId);

    return {
        name: gridName,
        schemaVersion: 2,
        settingsHash: gridColumnsHash,
        columns: columnsSettings.map(c => ({
            columnId: c.columnId,
            size: c.size,
            hidden: c.hidden,
            filterSettings: undefined
        })),

        columnFilters: Array.from(columnFilters),
        groupFilters: Array.from(groupFilters),

        sortOrder,
        columnOrder
    };
}

class InvalidSettingsError extends Error {
    constructor() {
        super("Invalid settings object");
        this.name = "InvalidSettingsError";
    }
}
class UndefinedSettingsError extends Error {
    constructor() {
        super("Settings is undefined");
        this.name = "UndefinedSettingsError";
    }
}
