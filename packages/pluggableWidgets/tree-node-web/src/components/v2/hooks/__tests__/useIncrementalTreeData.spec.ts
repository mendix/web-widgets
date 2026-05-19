import { renderHook } from "@testing-library/react";
import { ObjectItem } from "mendix";
import { dynamic, listReference } from "@mendix/widget-plugin-test-utils";
import { TreeNodeState } from "../../../common/TreeNodeState";
import { TreeConfigRef, useIncrementalTreeData } from "../useIncrementalTreeData";

function makeItem(id: string): ObjectItem {
    return { id } as ObjectItem;
}

function makeConfig(overrides: Partial<TreeConfigRef> = {}): TreeConfigRef {
    return {
        headerType: "text",
        headerCaption: {
            get: jest.fn((item: ObjectItem) => dynamic(String(item.id)))
        } as any,
        headerContent: undefined,
        parentAssociation: listReference(b =>
            b.withGet((_item: ObjectItem) => dynamic(undefined as unknown as ObjectItem)).build()
        ),
        startExpanded: false,
        ...overrides
    };
}

function makeConfigWithParentMap(
    parentMap: Record<string, string | undefined>,
    overrides: Partial<TreeConfigRef> = {}
): TreeConfigRef {
    return {
        headerType: "text",
        headerCaption: {
            get: jest.fn((item: ObjectItem) => dynamic(String(item.id)))
        } as any,
        headerContent: undefined,
        parentAssociation: listReference(b =>
            b
                .withGet((item: ObjectItem) => {
                    const parentId = parentMap[String(item.id)];
                    return parentId ? dynamic(makeItem(parentId)) : dynamic(undefined as unknown as ObjectItem);
                })
                .build()
        ),
        startExpanded: false,
        ...overrides
    };
}

describe("useIncrementalTreeData", () => {
    describe("basic tree building", () => {
        it("returns empty array when items is undefined", () => {
            const config = makeConfig();
            const { result } = renderHook(() => useIncrementalTreeData(undefined, config));
            expect(result.current).toEqual([]);
        });

        it("places items without a parent as roots", () => {
            const items = [makeItem("a"), makeItem("b"), makeItem("c")];
            const config = makeConfig();
            const { result } = renderHook(() => useIncrementalTreeData(items, config));
            expect(result.current).toHaveLength(3);
            expect(result.current.map(n => n.id)).toEqual(["a", "b", "c"]);
        });

        it("nests children under their parent", () => {
            const items = [makeItem("parent"), makeItem("child")];
            const config = makeConfigWithParentMap({ parent: undefined, child: "parent" });
            const { result } = renderHook(() => useIncrementalTreeData(items, config));
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("parent");
            expect(result.current[0].children).toHaveLength(1);
            expect(result.current[0].children[0].id).toBe("child");
        });

        it("assigns COLLAPSED_WITH_JS when startExpanded is false", () => {
            const items = [makeItem("a")];
            const config = makeConfig({ startExpanded: false });
            const { result } = renderHook(() => useIncrementalTreeData(items, config));
            expect(result.current[0].treeNodeState).toBe(TreeNodeState.COLLAPSED_WITH_JS);
        });

        it("assigns EXPANDED when startExpanded is true", () => {
            const items = [makeItem("a")];
            const config = makeConfig({ startExpanded: true });
            const { result } = renderHook(() => useIncrementalTreeData(items, config));
            expect(result.current[0].treeNodeState).toBe(TreeNodeState.EXPANDED);
        });
    });

    describe("out-of-order arrival (child before parent)", () => {
        it("re-parents orphan node when its parent arrives later", () => {
            const child = makeItem("child");
            const parent = makeItem("parent");
            const config = makeConfigWithParentMap({ child: "parent", parent: undefined });

            const { result, rerender } = renderHook(
                ({ items }: { items: ObjectItem[] }) => useIncrementalTreeData(items, config),
                { initialProps: { items: [child] } }
            );

            // child has no parent yet — appears as root
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("child");

            // parent arrives
            rerender({ items: [child, parent] });

            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("parent");
            expect(result.current[0].children[0].id).toBe("child");
        });
    });

    describe("cycle detection", () => {
        it("places self-referencing node as a root instead of looping", () => {
            const item = makeItem("self");
            const items = [item];
            const config = makeConfigWithParentMap({ self: "self" });
            const { result } = renderHook(() => useIncrementalTreeData(items, config));
            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("self");
            expect(result.current[0].children).toHaveLength(0);
        });
    });

    describe("removed items trigger rebuild", () => {
        it("removes node when item disappears from the list", () => {
            const config = makeConfig();

            const { result, rerender } = renderHook(
                ({ items }: { items: ObjectItem[] }) => useIncrementalTreeData(items, config),
                { initialProps: { items: [makeItem("a"), makeItem("b"), makeItem("c")] } }
            );

            expect(result.current).toHaveLength(3);

            rerender({ items: [makeItem("a"), makeItem("c")] });

            expect(result.current).toHaveLength(2);
            expect(result.current.map(n => n.id)).toEqual(["a", "c"]);
        });
    });

    describe("incremental updates (items added without full rebuild)", () => {
        it("adds new node on next render", () => {
            const config = makeConfig();

            const { result, rerender } = renderHook(
                ({ items }: { items: ObjectItem[] }) => useIncrementalTreeData(items, config),
                { initialProps: { items: [makeItem("a")] } }
            );

            expect(result.current).toHaveLength(1);

            rerender({ items: [makeItem("a"), makeItem("b")] });

            expect(result.current).toHaveLength(2);
            expect(result.current.map(n => n.id)).toEqual(["a", "b"]);
        });

        it("does not duplicate a child already placed under its parent", () => {
            const items = [makeItem("parent"), makeItem("child")];
            const config = makeConfigWithParentMap({ parent: undefined, child: "parent" });

            const { result, rerender } = renderHook(
                ({ items }: { items: ObjectItem[] }) => useIncrementalTreeData(items, config),
                { initialProps: { items } }
            );

            expect(result.current[0].children).toHaveLength(1);

            // same items arrive again
            rerender({ items: [makeItem("parent"), makeItem("child")] });

            expect(result.current[0].children).toHaveLength(1);
        });
    });

    describe("deep nesting", () => {
        it("builds a three-level tree correctly", () => {
            const grandparent = makeItem("gp");
            const parent = makeItem("p");
            const child = makeItem("c");
            const config = makeConfigWithParentMap({ gp: undefined, p: "gp", c: "p" });

            const items = [grandparent, parent, child];
            const { result } = renderHook(() => useIncrementalTreeData(items, config));

            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("gp");
            expect(result.current[0].children[0].id).toBe("p");
            expect(result.current[0].children[0].children[0].id).toBe("c");
        });
    });

    describe("config change triggers full rebuild", () => {
        it("rebuilds tree when headerType changes", () => {
            const items = [makeItem("a")];
            const config1 = makeConfig({ headerType: "text" });
            const config2 = makeConfig({ headerType: "custom" });

            const { result, rerender } = renderHook(
                ({ config }: { config: TreeConfigRef }) => useIncrementalTreeData(items, config),
                { initialProps: { config: config1 } }
            );

            expect(result.current).toHaveLength(1);

            rerender({ config: config2 });

            expect(result.current).toHaveLength(1);
            expect(result.current[0].id).toBe("a");
        });

        it("rebuilds tree when parentAssociation changes", () => {
            const items = [makeItem("a")];
            const config1 = makeConfig();
            const config2 = makeConfigWithParentMap({ a: undefined });

            const { result, rerender } = renderHook(
                ({ config }: { config: TreeConfigRef }) => useIncrementalTreeData(items, config),
                { initialProps: { config: config1 } }
            );

            expect(result.current).toHaveLength(1);

            rerender({ config: config2 });

            expect(result.current).toHaveLength(1);
        });
    });
});
