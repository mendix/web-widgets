import { RefObject, useEffect, useRef, useState } from "react";

export function useOnScreen(ref: RefObject<HTMLElement>): boolean {
    const [isIntersecting, setIsIntersecting] = useState(false);

    const observer = useRef(
        new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        })
    );

    useEffect(() => {
        observer.current.disconnect();

        if (ref.current) {
            observer.current.observe(ref.current);
        }

        return () => {
            observer.current.disconnect();
        };
    }, [ref]);

    return isIntersecting;
}
