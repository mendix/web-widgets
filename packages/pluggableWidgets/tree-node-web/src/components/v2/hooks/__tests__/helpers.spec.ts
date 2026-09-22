import { ObjectItem } from "mendix";
import { TreeNodeState } from "../../../common/TreeNodeState";
import { deriveDesiredParentIds } from "../helpers";
import { TreeNodeV2DataItem } from "../useIncrementalTreeData";

interface NodeSpec {
    id: string;
    state?: TreeNodeState;
    children?: NodeSpec[];
    /** Only for orphans: the datasource renders them at root level, but they are not roots. */
    orphanOf?: string;
}

function makeTree(specs: NodeSpec[], parentId?: string): TreeNodeV2DataItem[] {
    return specs.map(spec => ({
        children: makeTree(spec.children ?? [], spec.id),
        id: spec.id,
        item: { id: spec.id } as ObjectItem,
        parentId: spec.orphanOf ?? parentId,
        treeNodeState: spec.state ?? TreeNodeState.COLLAPSED_WITH_JS,
        title: spec.id
    }));
}

function allIds(nodes: TreeNodeV2DataItem[]): string[] {
    return nodes.flatMap(node => [node.id, ...allIds(node.children)]);
}

/** Derives over a tree whose every node the delivery carried. */
function derive(specs: NodeSpec[]): string[] {
    const tree = makeTree(specs);
    return deriveDesiredParentIds(tree, new Set(allIds(tree)));
}

const expanded = TreeNodeState.EXPANDED;

describe("deriveDesiredParentIds", () => {
    it("asks for the roots and one level past them when nothing is expanded", () => {
        // The roots are visible, so their children must be retrievable; those children need their
        // own children known too, or they render without an expand icon.
        expect(
            derive([{ id: "root1", children: [{ id: "child1", children: [{ id: "grandchild1" }] }] }, { id: "root2" }])
            // each node is followed by the children it contributes; the filter itself is a set
        ).toEqual(["root1", "child1", "root2"]);
    });

    it("reaches one level further for each node that is expanded", () => {
        expect(
            derive([{ id: "root", state: expanded, children: [{ id: "child", children: [{ id: "grandchild" }] }] }])
        ).toEqual(["root", "child", "grandchild"]);
    });

    it("asks for the whole tree when every node is expanded", () => {
        const tree = [
            {
                id: "root",
                state: expanded,
                children: [{ id: "child", state: expanded, children: [{ id: "grandchild", state: expanded }] }]
            }
        ];

        expect(derive(tree)).toEqual(["root", "child", "grandchild"]);
    });

    it("keeps the subtree of a node that was opened and then closed", () => {
        // COLLAPSED_WITH_CSS still renders its body (hidden), so dropping its descendants here would
        // remove them from the tree and leave them iconless on reopen.
        expect(
            derive([
                {
                    id: "root",
                    state: TreeNodeState.COLLAPSED_WITH_CSS,
                    children: [{ id: "child", state: expanded, children: [{ id: "grandchild" }] }]
                }
            ])
        ).toEqual(["root", "child", "grandchild"]);
    });

    it("stops at a node whose body was never rendered", () => {
        expect(
            derive([
                {
                    id: "root",
                    children: [
                        { id: "child", state: TreeNodeState.COLLAPSED_WITH_JS, children: [{ id: "grandchild" }] }
                    ]
                }
            ])
        ).toEqual(["root", "child"]);
    });

    it("does not treat an item whose parent was not delivered as a root", () => {
        // An orphan is promoted to root level for rendering, but making it a root here would make
        // the derived set depend on what was delivered, which the filter itself decides.
        const result = derive([
            { id: "root", children: [{ id: "child" }] },
            { id: "orphan", orphanOf: "absent", children: [{ id: "orphanChild" }] }
        ]);

        expect(result).toEqual(["root", "child"]);
    });

    it("excludes ids the current delivery did not carry", () => {
        const tree = makeTree([{ id: "root", state: expanded, children: [{ id: "fresh" }, { id: "retained" }] }]);

        expect(deriveDesiredParentIds(tree, new Set(["root", "fresh"]))).toEqual(["root", "fresh"]);
    });

    it("returns each id once even when the same node is reachable twice", () => {
        const result = derive([
            { id: "root", state: expanded, children: [{ id: "child", state: expanded, children: [{ id: "leaf" }] }] }
        ]);

        expect(result).toEqual([...new Set(result)]);
    });

    it("returns nothing for an empty tree", () => {
        expect(deriveDesiredParentIds([], new Set())).toEqual([]);
    });
});
