import { SortRule } from "../../typings/sorting";
import { action, computed, IReactionDisposer, makeObservable, reaction } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { getHash } from "../../utils/columns-hash";
import { ColumnGroupStore } from "./ColumnGroupStore";
import {
    ColumnPersonalizationSettings,
    GridPersonalizationStorageSettings
} from "../../typings/personalization-settings";
import { PersonalizationStorage } from "../storage/PersonalizationStorage";
import { AttributePersonalizationStorage } from "../storage/AttributePersonalizationStorage";
import { LocalStoragePersonalizationStorage } from "../storage/LocalStoragePersonalizationStorage";

export class GridPersonalizationStore {
    private readonly gridName: string;
    private readonly gridColumnsHash: string;

    private storage: PersonalizationStorage;

    private disposers: IReactionDisposer[] = [];

    constructor(props: DatagridContainerProps, private columnsStore: ColumnGroupStore) {
        this.gridName = props.name;
        this.gridColumnsHash = getHash(this.columnsStore._allColumns, this.gridName);

        makeObservable<GridPersonalizationStore, "applySettings">(this, {
            settings: computed,

            applySettings: action
        });

        if (props.configurationStorageType === "localStorage") {
            this.storage = new LocalStoragePersonalizationStorage(`${this.gridName}_${this.gridColumnsHash}`);
        } else {
            this.storage = new AttributePersonalizationStorage(props);
        }

        this.disposers.push(
            reaction(
                () => this.storage.settings,
                settings => {
                    if (settings !== undefined && JSON.stringify(settings) !== JSON.stringify(this.settings)) {
                        this.applySettings(settings);
                    }
                },
                { fireImmediately: true }
            )
        );

        this.disposers.push(
            reaction(
                () => this.settings,
                settings => {
                    this.storage.updateSettings(settings);
                }
            )
        );
    }

    dispose(): void {
        this.disposers.forEach(d => d());
    }

    updateProps(props: DatagridContainerProps): void {
        this.storage.updateProps?.(props);
    }

    private applySettings(settings: GridPersonalizationStorageSettings): void {
        this.columnsStore.applySettings(fromStorageFormat(this.gridName, this.gridColumnsHash, settings));
    }

    get settings(): GridPersonalizationStorageSettings {
        return toStorageFormat(this.gridName, this.gridColumnsHash, this.columnsStore.settings);
    }
}

function fromStorageFormat(
    gridName: string,
    gridColumnsHash: string,
    settings: GridPersonalizationStorageSettings
): ColumnPersonalizationSettings[] {
    if (settings.name !== gridName || settings.settingsHash !== gridColumnsHash) {
        console.warn(
            `Widget configuration for (${gridName})[hash:${gridColumnsHash}] doesn't match provided settings (${settings.name})[hash:${settings.settingsHash}]. Restoring those settings might result in errors.`
        );
    }
    return settings.columns.map(c => {
        const sortIndex = settings.sortOrder.findIndex(s => s[0] === c.columnId);

        return {
            columnId: c.columnId,
            size: c.size,
            hidden: c.hidden,

            orderWeight: settings.columnOrder.indexOf(c.columnId),

            sortWeight: sortIndex !== -1 ? sortIndex + 1 : undefined,
            sortDir: sortIndex !== -1 ? settings.sortOrder[sortIndex]?.[1] : undefined,

            filterSettings: undefined
        };
    });
}

function toStorageFormat(
    gridName: string,
    gridColumnsHash: string,
    columnsSettings: ColumnPersonalizationSettings[]
): GridPersonalizationStorageSettings {
    const sortOrder = columnsSettings
        .filter(c => c.sortDir && c.sortWeight !== undefined)
        .sort((a, b) => a.sortWeight! - b.sortWeight!)
        .map(c => [c.columnId!, c.sortDir!] as SortRule);

    const columnOrder = [...columnsSettings].sort((a, b) => a.orderWeight - b.orderWeight).map(c => c.columnId);

    return {
        name: gridName,
        schemaVersion: 1,
        settingsHash: gridColumnsHash,
        columns: columnsSettings.map(c => ({
            columnId: c.columnId,
            size: c.size,
            hidden: c.hidden,
            filterSettings: undefined
        })),
        sortOrder,
        columnOrder
    };
}
