export interface IJSActionsControlled {
    handleResetValue: (useDefaultValue: boolean) => void;
    handleSetValue: (useDefaultValue: boolean, params: { stringValue: string }) => void;
}
