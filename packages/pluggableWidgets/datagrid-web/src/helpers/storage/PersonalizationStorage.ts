import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export interface PersonalizationStorage {
    settings: GridPersonalizationStorageSettings | undefined;
    updateSettings(newSettings: GridPersonalizationStorageSettings): void;

    updateProps?(props: DatagridContainerProps): void;
}
