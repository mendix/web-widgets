import { useMemo } from "react";
import { getGlobalFilterContextObject } from "@mendix/widget-plugin-filtering";

type Provider = ReturnType<typeof getGlobalFilterContextObject>["Provider"];

export function useFilterContextProvider(): Provider {
    const { Provider } = useMemo(getGlobalFilterContextObject, []);
    return Provider;
}
