import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreeNodeBranch, TreeNodeBranchProps } from "../TreeNodeBranch";
import * as React from "react";

describe("TreeNodeBranch", () => {
    const mockGuid = { __guidTag: true } as any;
    const defaultProps: TreeNodeBranchProps = {
        animateTreeNodeContent: false,
        children: React.createElement("div", null, "Branch content"),
        headerContent: "Branch header",
        iconPlacement: "right",
        id: mockGuid,
        isUserDefinedLeafNode: false,
        openNodeOn: "headerClick",
        startExpanded: false,
        changeFocus: jest.fn(),
        renderHeaderIcon: jest.fn(() => React.createElement("span", null, "icon"))
    };

    it("renders header and content", () => {
        render(React.createElement(TreeNodeBranch, { ...defaultProps }));
        expect(screen.getByText("Branch header")).toBeInTheDocument();
        // The content is not visible unless expanded, so check for its absence
        expect(screen.queryByText("Branch content")).not.toBeInTheDocument();
    });

    it("renders content when expanded", () => {
        render(React.createElement(TreeNodeBranch, { ...defaultProps, startExpanded: true }));
        expect(screen.getByText("Branch header")).toBeInTheDocument();
        expect(screen.getByText("Branch content")).toBeInTheDocument();
    });

    it("renders icon", () => {
        render(React.createElement(TreeNodeBranch, { ...defaultProps }));
        expect(screen.getByText("icon")).toBeInTheDocument();
    });
});
