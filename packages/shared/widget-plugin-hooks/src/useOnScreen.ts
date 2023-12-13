import { RefObject, useEffect, useRef, useState } from "react";

export function useOnScreen(ref: RefObject<HTMLElement>): boolean {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const observer = (useRef<IntersectionObserver>().current ??= createObserver({ setIsIntersecting }));

    useEffect(() => {
        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [observer, ref]);

    return isIntersecting;
}

type CreateObserverType = {
    setIsIntersecting: (intersecting: boolean) => void;
};

function createObserver({ setIsIntersecting }: CreateObserverType): IntersectionObserver {
    return new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
    });
}
