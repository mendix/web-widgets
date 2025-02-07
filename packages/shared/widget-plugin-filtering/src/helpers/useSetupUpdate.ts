import { useEffect } from "react";
import { Setupable, useSetup } from "./useSetup";

interface IUpdateModel<P> extends Setupable {
    updateProps: (props: P) => void;
}

export function useSetupUpdate<T extends IUpdateModel<P>, P>(setup: () => T, props: P): T {
    const obj = useSetup(setup);

    // NOTE: Don't use dependencies.
    // Model should be updated on every render.
    useEffect(() => obj.updateProps(props));
    return obj;
}
