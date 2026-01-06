import { UIEventHandler } from "react";
import { useInfiniteControl } from "./useInfiniteControl";

export function useBodyScroll(): {
    handleScroll: UIEventHandler<HTMLDivElement> | undefined;
} {
    const [trackBodyScrolling] = useInfiniteControl();

    return {
        handleScroll: trackBodyScrolling
    };
}
