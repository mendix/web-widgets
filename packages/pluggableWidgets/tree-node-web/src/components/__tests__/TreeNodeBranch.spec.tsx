import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createElement } from "react";
import { TreeNodeBranch, TreeNodeBranchProps } from "../TreeNodeBranch";
import { TreeNodeProps } from "../TreeNode";

describe("TreeNodeBranch", () => {
    const mockGuid = { __guidTag: true } as any;

    const defaultRootProps: TreeNodeProps = {
        class: "",
        items: [],
        startExpanded: false,
        showCustomIcon: false,
        iconPlacement: "right",
        expandedIcon: undefined,
        collapsedIcon: undefined,
        animateIcon: false,
        animateTreeNodeContent: false,
        openNodeOn: "headerClick",
        fetchChildren: jest.fn().mockResolvedValue([]),
        isInfiniteTreeNodesEnabled: false
    };

    const defaultProps: TreeNodeBranchProps = {
        animateTreeNodeContent: false,
        children: createElement("div", null, "Branch content"),
        item: {
            id: mockGuid,
            headerContent: "Branch header",
            isUserDefinedLeafNode: false,
            bodyContent: createElement("div", null, "Branch content")
        },
        iconPlacement: "right",
        openNodeOn: "headerClick",
        startExpanded: false,
        changeFocus: jest.fn(),
        renderHeaderIcon: jest.fn(() => createElement("span", null, "icon")),
        fetchChildren: jest.fn().mockResolvedValue([]),
        appendChildren: jest.fn(),
        isInfiniteTreeNodesEnabled: false,
        treeNodeProps: defaultRootProps
    };

    it("renders header and content", () => {
        render(createElement(TreeNodeBranch, { ...defaultProps }));
        expect(screen.getByText("Branch header")).toBeInTheDocument();
        // The content is not visible unless expanded, so check for its absence
        expect(screen.queryByText("Branch content")).not.toBeInTheDocument();
    });

    it("renders content when expanded", () => {
        render(createElement(TreeNodeBranch, { ...defaultProps, startExpanded: true }));
        expect(screen.getByText("Branch header")).toBeInTheDocument();
        expect(screen.getByText("Branch content")).toBeInTheDocument();
    });

    it("renders icon", () => {
        render(createElement(TreeNodeBranch, { ...defaultProps }));
        expect(screen.getByText("icon")).toBeInTheDocument();
    });
});
