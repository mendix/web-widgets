import { UIEventHandler, useCallback, useRef } from "react";

type Callback<T extends Element> = UIEventHandler<T>;
type Options = {
    /**
     * When set, force callback to be called when *x* pixels left to reach content bottom.
     * For example, if value 50, then callback is called when 50px left to reach content bottom.
     * @remark If set to 0, then callback is called only when content fully scrolled.
     * @default 0
     */
    triggerZoneHeight?: number;
};

export function useOnScrollBottom<T extends Element = Element>(
    cb: Callback<T>,
    options: Options = {}
): UIEventHandler<T> {
    const { triggerZoneHeight = 0 } = options;

    const onScrollParams = useRef({
        callback: cb,
        offset: Math.max(triggerZoneHeight, 0),
        isInDeadZone: false
    });

    // Update params callback on every render.
    onScrollParams.current.callback = cb;

    const onScroll = useCallback<Callback<T>>(event => {
        const {
            current: { isInDeadZone, callback, offset }
        } = onScrollParams;

        const scrollHeight = event.currentTarget.scrollHeight - offset;

        const isDeadZoneNow =
            Math.floor(scrollHeight - event.currentTarget.scrollTop) <= Math.floor(event.currentTarget.clientHeight);

        const shouldFire = !isInDeadZone && isDeadZoneNow;

        onScrollParams.current.isInDeadZone = isDeadZoneNow;

        // Run callback when we entered "dead zone".
        if (shouldFire) {
            callback(event);
        }
    }, []);

    return onScroll;
}
