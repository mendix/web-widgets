import { useEffect } from "react";
import { useConst } from "./useConst";

export interface Setupable {
    setup(): void | (() => void);
}

export function useSetup<T extends Setupable>(fn: () => T): T {
    const obj = useConst(fn);
    useEffect(() => obj.setup(), [obj]);
    return obj;
}
