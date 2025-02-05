import { useRef } from "react";

export function useConst<T>(fn: T): T extends (...args: never) => infer R ? R : T {
    return (useRef<T | null>(null).current ??= typeof fn === "function" ? fn() : fn);
}
