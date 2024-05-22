import { FilterContextValue } from "@mendix/widget-plugin-filtering";
import { useState } from "react";
import { FilterAPIClient } from "./FilterAPIClient";
import { FilterAPIBox, useFilterAPIv2 } from "./useFilterAPIv2";
import * as errors from "./errors";

export function useFilterAPIClient(apiv1: FilterContextValue): [Error | undefined, FilterAPIClient] {
    const apiv2 = useFilterAPIv2(apiv1);
    const [client] = useState(() => new FilterAPIClient(apiv2));
    return [checkAPIs(apiv1, apiv2), client];
}

function checkAPIs(apiv1: FilterContextValue, apiv2: FilterAPIBox): Error | undefined {
    const { attributes } = apiv2.current;

    if (apiv1.singleAttribute === undefined && apiv1.multipleAttributes === undefined) {
        return new Error(errors.EPLACE);
    }

    if (attributes.length === 0) {
        return new Error(apiv1.singleAttribute ? errors.EPLACE : errors.ENOATTRS);
    }

    if (attributes[0].type !== "DateTime") {
        return new Error(errors.EATTRTYPE);
    }

    return undefined;
}
