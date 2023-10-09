import { ColumnsType } from "../../typings/DatagridProps";

export type ColumnsState = {
    columnsHidden?: number[];
    columnsOrder?: number[];
};

export function useColumnsState(columns: ColumnsType[], state: ColumnsState | undefined): { columns: ColumnsType[] } {
    const filteredIndexes = state?.columnsOrder?.reduce((accumulator, currIndex) => {
        if (state.columnsHidden?.includes(currIndex)) {
            return accumulator;
        }

        return [...accumulator, currIndex];
    }, []);

    return {
        columns:
            filteredIndexes && filteredIndexes?.length > 0
                ? filteredIndexes.map((index): ColumnsType => columns[index])
                : columns
    };
}
