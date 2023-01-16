import { useLayoutEffect, useState } from "react";

export const useIsElementInViewport = (ref: React.RefObject<HTMLElement>): boolean => {
    const element = ref.current;
    const [isInViewport, setIsInViewport] = useState(true);
    useLayoutEffect(() => {
        const rect = element?.getBoundingClientRect();
        const inViewport = rect
            ? rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            : true;

        setIsInViewport(inViewport);
    }, [element]);
    return isInViewport;
};
