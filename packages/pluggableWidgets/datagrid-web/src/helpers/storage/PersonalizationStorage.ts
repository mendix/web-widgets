import { DatagridContainerProps } from "../../../typings/DatagridProps";

export interface PersonalizationStorage {
    settings: unknown;
    updateSettings(newSettings: any): void;
    updateProps?(props: DatagridContainerProps): void;
}
