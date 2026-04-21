import classNames from "classnames";
import {
    CSSProperties,
    PropsWithChildren,
    ReactElement,
    RefObject,
    useCallback,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import { useOnScreen } from "@mendix/widget-plugin-hooks/useOnScreen";

export interface InfiniteBodyProps {
    className?: string;
    hasMoreItems: boolean;
    isInfinite: boolean;
    isRefreshing?: boolean;
    role?: string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    style?: CSSProperties;
}
const offsetBottom = 30;

export function useInfiniteControl(
    props: PropsWithChildren<InfiniteBodyProps>
): [trackScrolling: (e: any) => void, bodySize: number, containerRef: RefObject<HTMLDivElement | null>] {
    const { setPage, hasMoreItems, isInfinite, isRefreshing } = props;
    const [bodySize, setBodySize] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(containerRef as RefObject<HTMLElement>);
    const savedScrollTop = useRef(0);
    const prevIsRefreshing = useRef(false);

    const trackScrolling = useCallback(
        (e: any) => {
            /**
             * In Windows OS the result of first expression returns a non integer and result in never loading more, require floor to solve.
             * note: Math floor sometimes result in incorrect integer value,
             * causing mismatch by 1 pixel point, thus, add magic number 2 as buffer.
             */
            const bottom =
                Math.floor(e.target.scrollHeight - offsetBottom - e.target.scrollTop) <=
                Math.floor(e.target.clientHeight) + 2;
            if (bottom) {
                if (hasMoreItems && setPage) {
                    setPage(prev => prev + 1);
                }
            }
        },
        [hasMoreItems, setPage]
    );

    const calculateBodyHeight = useCallback((): void => {
        if (isVisible && isInfinite && hasMoreItems && bodySize <= 0 && containerRef.current) {
            setBodySize(containerRef.current.clientHeight - offsetBottom);
        }
    }, [isInfinite, hasMoreItems, bodySize, isVisible]);

    useLayoutEffect(() => {
        if (bodySize <= 0) {
            calculateBodyHeight();
        }
    });

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || !isInfinite) {
            prevIsRefreshing.current = isRefreshing ?? false;
            return;
        }
        const refreshing = isRefreshing ?? false;
        if (refreshing && !prevIsRefreshing.current) {
            savedScrollTop.current = container.scrollTop;
        } else if (!refreshing && prevIsRefreshing.current && savedScrollTop.current > 0) {
            container.scrollTop = savedScrollTop.current;
        }
        prevIsRefreshing.current = refreshing;
    });

    return [trackScrolling, bodySize, containerRef];
}

export function InfiniteBody(props: PropsWithChildren<InfiniteBodyProps>): ReactElement {
    const { className, isInfinite } = props;
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl(props);
    return (
        <div
            ref={containerRef}
            className={classNames(className, isInfinite ? "infinite-loading" : "")}
            onScroll={isInfinite ? trackScrolling : undefined}
            role={props.role}
            style={isInfinite && bodySize > 0 ? { ...props.style, maxHeight: bodySize } : props.style}
        >
            {props.children}
        </div>
    );
}
