import { useRef } from "react";

export function useConst<T>(fn: () => T): T {
    return (useRef<T | null>(null).current ??= fn());
}
