import { useCallback, useEffect, useState } from "react";

type Fn = () => void;
type Cancel = () => void;

export function usePositionObserver(target: HTMLElement | null, active: boolean): DOMRect | undefined {
    const [position, setPosition] = useState<DOMRect | undefined>();

    const onAnimationFrameHandler = useCallback(() => {
        setPosition(prev => {
            const next = target?.getBoundingClientRect();

            if (shouldUpdatePosition(prev, next)) {
                return next;
            }

            return prev;
        });
    }, [target]);

    useAnimationFrameEffect(active ? onAnimationFrameHandler : undefined);

    return position;
}

function useAnimationFrameEffect(callback?: Fn): void {
    useEffect(() => (callback ? animationLoop(callback) : undefined), [callback]);
}

function shouldUpdatePosition(a?: DOMRect, b?: DOMRect): boolean {
    return (
        !a ||
        !b ||
        a.height !== b.height ||
        a.width !== b.width ||
        a.bottom !== b.bottom ||
        a.top !== b.top ||
        a.left !== b.left ||
        a.right !== b.right
    );
}

function animationLoop(callback: Fn): Cancel {
    let requestId: number;

    const requestFrame: Fn = () => {
        requestId = window.requestAnimationFrame(() => {
            callback();
            requestFrame();
        });
    };

    const cancel: Cancel = () => window.cancelAnimationFrame(requestId);

    requestFrame();

    return cancel;
}
