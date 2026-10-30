import { RefObject, TransitionEvent, useCallback, useLayoutEffect, useRef, useState } from "react";

export const useAnimatedTreeNodeContentHeight = (
    treeNodeBranchBody: RefObject<HTMLDivElement | null>
): {
    isAnimating: boolean;
    captureElementHeight: () => void;
    animateTreeNodeContent: (isExpanding: boolean) => (() => void) | undefined;
    cleanupAnimation: (event?: TransitionEvent<HTMLElement>) => void;
} => {
    const currentElementHeight = useRef<number>(undefined);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    const captureElementHeight = useCallback(() => {
        currentElementHeight.current = treeNodeBranchBody.current?.getBoundingClientRect().height ?? 0;
    }, []);

    const cleanupAnimation = useCallback((event?: TransitionEvent<HTMLElement>) => {
        // Ignore transitions bubbling up from nested tree node bodies
        if (event && (event.target !== event.currentTarget || event.propertyName !== "height")) {
            return;
        }
        setIsAnimating(false);
    }, []);

    // Remove the inline height in the same commit that applies the hidden class, to avoid a full-height frame
    useLayoutEffect(() => {
        if (!isAnimating) {
            treeNodeBranchBody.current?.style.removeProperty("height");
        }
    }, [isAnimating]);

    const animateTreeNodeContent = useCallback(
        (isExpanding: boolean) => {
            const element = treeNodeBranchBody.current;
            const startHeight = currentElementHeight.current;
            currentElementHeight.current = undefined;
            if (!element || startHeight === undefined || Number.isNaN(startHeight)) {
                return;
            }

            // Measure the natural height; mid-animation the inline height would be read instead
            element.style.removeProperty("height");
            const targetHeight = isExpanding ? element.getBoundingClientRect().height : 0;
            if (targetHeight === startHeight) {
                cleanupAnimation();
                return;
            }

            setIsAnimating(true);
            element.style.height = `${startHeight}px`;
            // Wait for the re-render that un-hides a collapsing body before starting the transition
            const timeout = setTimeout(() => {
                // Force reflow so the start height is committed; otherwise the transition may never start
                element.getBoundingClientRect();
                element.style.height = `${targetHeight}px`;
            }, 1);
            return () => clearTimeout(timeout);
        },
        [cleanupAnimation]
    );

    return { isAnimating, captureElementHeight, animateTreeNodeContent, cleanupAnimation };
};
