import { useRef, useEffect } from "react";
import { ColumnId } from "../../typings/GridColumn";

export type ColumnElementsMap<T> = Map<ColumnId, T>;

export type HeaderRefHook<T> = (id: ColumnId) => React.RefObject<T>;

export type GetColumnElementsMapFn<T> = (callback: (map: ColumnElementsMap<T>) => void) => void;

export function useColumnsElementsMap<T>(): [GetColumnElementsMapFn<T>, HeaderRefHook<T>] {
    const mapRef = useRef<ColumnElementsMap<T>>(new Map());
    // eslint-disable-next-line prefer-arrow-callback
    const { current: hook } = useRef<HeaderRefHook<T>>(function useHeaderRef(id: ColumnId): React.RefObject<T> {
        const headerRef = useRef<T>(null);

        useEffect(() => {
            const map = mapRef.current;
            map.set(id, headerRef.current!);
            return () => {
                map.delete(id);
            };
        }, [id]);

        return headerRef;
    });

    const { current: getColumnElementsMap } = useRef<GetColumnElementsMapFn<T>>(callback => callback(mapRef.current));

    return [getColumnElementsMap, hook];
}
