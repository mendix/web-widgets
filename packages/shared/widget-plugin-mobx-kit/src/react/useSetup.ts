import { useEffect } from "react";
import { useConst } from "./useConst";

export function useSetup<
    T extends {
        setup(): void | (() => void);
    }
>(fn: () => T): T {
    const obj = useConst(fn);
    useEffect(() => obj.setup(), [obj]);
    return obj;
}
