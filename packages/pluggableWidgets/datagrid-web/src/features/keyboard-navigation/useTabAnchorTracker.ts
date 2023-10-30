import { useRef, useMemo } from "react";
import { TabAnchorTracker } from "./TabAnchorTracker";
import { VirtualGridLayout } from "./VirtualGridLayout";

export type LayoutProps = { rows: number; columns: number };

export function useTabAnchorTracker({ rows, columns }: LayoutProps): TabAnchorTracker {
    const trackerRef = useRef<null | TabAnchorTracker>(null);

    return useMemo<TabAnchorTracker>(() => {
        const layout = new VirtualGridLayout(rows, columns);
        if (trackerRef.current === null) {
            trackerRef.current = new TabAnchorTracker(layout);
        } else {
            trackerRef.current.updateGridLayout(layout);
        }
        return trackerRef.current;
    }, [rows, columns]);
}
