import { GridPersonalizationStorageSettings } from "../../typings/personalization-settings";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

export interface PersonalizationStorage {
    storedSettings: GridPersonalizationStorageSettings | undefined;
    storeSettings(newSettings: GridPersonalizationStorageSettings): void;

    updateProps(props: DatagridContainerProps): void;
}
