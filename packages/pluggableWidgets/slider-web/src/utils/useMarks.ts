import { useMemo } from "react";
import { ValueFormatter } from "./helpers";
import { createMarks } from "./marks";
import type { ValueFormatter } from "./helpers";

type UseMarksParams = {
    noOfMarkers: number;
    decimalPlaces: number;
    format: ValueFormatter;
    min?: number;
    max?: number;
};

export function useMarks(props: UseMarksParams): ReturnType<typeof createMarks> {
    const { noOfMarkers, decimalPlaces, format, min = 0, max = 100 } = props;

    return useMemo(
        () =>
            createMarks({
                numberOfMarks: noOfMarkers,
                decimalPlaces,
                format,
                min,
                max
            }),
        [min, max, noOfMarkers, decimalPlaces, format]
    );
}
