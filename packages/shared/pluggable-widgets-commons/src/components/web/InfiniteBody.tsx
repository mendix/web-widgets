import {
    createElement,
    ReactElement,
    useCallback,
    useState,
    useRef,
    useLayoutEffect,
    PropsWithChildren,
    CSSProperties
} from "react";
import classNames from "classnames";

interface InfiniteBodyProps {
    className?: string;
    hasMoreItems: boolean;
    isInfinite: boolean;
    role?: string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    style?: CSSProperties;
}

export function InfiniteBody(props: PropsWithChildren<InfiniteBodyProps>): ReactElement {
    const { setPage, hasMoreItems, isInfinite } = props;
    const [bodySize, setBodySize] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const trackScrolling = useCallback(
        e => {
            /**
             * In Windows OS the result of first expression returns a non integer and result in never loading more, require floor to solve.
             */
            const bottom = Math.floor(e.target.scrollHeight - e.target.scrollTop) === Math.floor(e.target.clientHeight);
            if (bottom) {
                if (hasMoreItems && setPage) {
                    setPage(prev => prev + 1);
                }
            }
        },
        [hasMoreItems, setPage]
    );

    const calculateBodyHeight = useCallback((): void => {
        if (isInfinite && hasMoreItems && bodySize <= 0 && containerRef.current) {
            setBodySize(containerRef.current.clientHeight - 30);
        }
    }, [isInfinite, hasMoreItems, bodySize]);

    useLayoutEffect(() => {
        setTimeout(() => calculateBodyHeight(), 100);
    }, [calculateBodyHeight]);

    return (
        <div
            ref={containerRef}
            className={classNames(props.className, isInfinite ? "infinite-loading" : "")}
            onScroll={isInfinite ? trackScrolling : undefined}
            role={props.role}
            style={isInfinite && bodySize > 0 ? { ...props.style, maxHeight: bodySize } : props.style}
        >
            {props.children}
        </div>
    );
}
