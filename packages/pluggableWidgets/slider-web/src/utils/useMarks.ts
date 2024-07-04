import { useMemo } from "react";
import { createMarks } from "./marks";

type UseMarksParams = {
    noOfMarkers: number;
    decimalPlaces: number;
    min?: number;
    max?: number;
};

export function useMarks(props: UseMarksParams): ReturnType<typeof createMarks> {
    const { noOfMarkers, decimalPlaces, min = 0, max = 100 } = props;

    return useMemo(
        () =>
            createMarks({
                numberOfMarks: noOfMarkers,
                decimalPlaces,
                min,
                max
            }),
        [min, max, noOfMarkers, decimalPlaces]
    );
}
