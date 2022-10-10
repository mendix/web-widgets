import { CSSProperties, useMemo } from "react";

import { Dimensions, getDimensions } from "@mendix/pluggable-widgets-commons";

export function useStyle(dimensions: Dimensions): CSSProperties {
    return useMemo(() => {
        return getDimensions(dimensions);
    }, [dimensions]);
}
