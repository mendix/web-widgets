// TEMPORARY triage repro — not for merge.
import { renderHook } from "@testing-library/react";
import { ObjectItem } from "mendix";
import { TreeNodeState } from "../../../common/TreeNodeState";
import { TreeConfigRef, useIncrementalTreeData } from "../useIncrementalTreeData";

function makeItem(id: string): ObjectItem {
    return { id } as ObjectItem;
}

function makeConfig(parentMap: Record<string, string | undefined>, startExpanded: boolean): TreeConfigRef {
    return {
        headerType: "text",
        headerCaption: { get: (item: ObjectItem) => ({ status: "available", value: String(item.id) }) } as any,
        headerContent: undefined,
        parentAssociation: {
            id: "parent",
            get: (item: ObjectItem) => {
                const parentId = parentMap[String(item.id)];
                return { status: "available", value: parentId ? makeItem(parentId) : undefined };
            }
        } as any,
        startExpanded
    };
}

describe("REPRO stuck spinner v2", () => {
    it("keeps every node LOADING when the datasource delivers items exactly once", () => {
        const config = makeConfig({ root: undefined, child: "root" }, true);
        const items = [makeItem("root"), makeItem("child")];
        const { result } = renderHook(() => useIncrementalTreeData(items, config));

        // Data is present...
        expect(result.current[0].id).toBe("root");
        expect(result.current[0].children.map(c => c.id)).toEqual(["child"]);
        // ...but the state never leaves LOADING -> spinner instead of chevron, body rendered collapsed.
        expect(result.current[0].treeNodeState).toBe(TreeNodeState.LOADING);
        expect(result.current[0].children[0].treeNodeState).toBe(TreeNodeState.LOADING);
    });

    it("falls back to LOADING for the whole tree after a refresh that returns new object ids", () => {
        const config = makeConfig({ root: undefined, child: "root", "root#2": undefined, "child#2": "root#2" }, true);
        const { result, rerender } = renderHook(
            ({ items }: { items: ObjectItem[] }) => useIncrementalTreeData(items, config),
            { initialProps: { items: [makeItem("root"), makeItem("child")] } }
        );

        // second update carrying the same ids clears LOADING (the happy path)
        rerender({ items: [makeItem("root"), makeItem("child")] });
        expect(result.current[0].treeNodeState).toBe(TreeNodeState.EXPANDED);

        // search refresh: microflow returns freshly created objects -> new GUIDs
        rerender({ items: [makeItem("root#2"), makeItem("child#2")] });

        const root = result.current[0];
        expect(root.id).toBe("root#2");
        expect(root.children.map(c => c.id)).toEqual(["child#2"]);
        // stuck: no further datasource update arrives, so this spinner never clears
        expect(root.treeNodeState).toBe(TreeNodeState.LOADING);
    });
});
