import { useMemo } from "react";
import { type ValueFormatter } from "@mendix/widget-plugin-platform/utils/number-formatter";
import { createMarks } from "@mendix/widget-plugin-platform/utils/slider-marks";

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
