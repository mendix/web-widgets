import { DatagridContainerProps } from "../../../typings/DatagridProps";

type RequiredProps = Pick<DatagridContainerProps, "configurationAttribute">;

export interface PersonalizationStorage {
    settings: unknown;
    updateSettings(newSettings: any): void;
    updateProps?(props: RequiredProps): void;
}
