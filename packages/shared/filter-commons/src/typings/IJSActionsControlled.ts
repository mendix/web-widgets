export interface IJSActionsControlled {
    handleResetValue: ResetHandler;
    handleSetValue: SetValueHandler;
}

export type ResetHandler = (useDefaultValue: boolean) => void;

export type SetValueHandler = (
    useDefaultValue: boolean,
    params: { operators: any; stringValue: string; numberValue: Big.Big; dateTimeValue: Date; dateTimeValue2: Date }
) => void;
