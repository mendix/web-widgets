export type CollapsedAccordionGroupsReducerAction = {
    type: "expand" | "collapse" | "reset";
    index: number;
    values?: boolean[];
};

export function getCollapsedAccordionGroupsReducer(
    expandMode: "single" | "multiple"
): (state: boolean[], action: CollapsedAccordionGroupsReducerAction) => boolean[] {
    return (state: boolean[], action: CollapsedAccordionGroupsReducerAction): boolean[] => {
        if (action.type === "reset") {
            return action.values || state;
        }

        if (action.type === "expand" && expandMode === "single") {
            return state.map((_element, index) => index !== action.index);
        }

        const newState = [...state];
        newState[action.index] = action.type === "collapse";
        return newState;
    };
}
