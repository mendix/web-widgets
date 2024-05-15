import { GUID } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { HTMLAttributes, mount, ReactWrapper, render as renderEnzyme } from "enzyme";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/setup/setup";
import "@testing-library/jest-dom";
import { TreeNode, TreeNodeProps } from "../TreeNode";

const items: TreeNodeProps["items"] = [
    { id: "11" as GUID, headerContent: "First header", bodyContent: <div>First content</div> },
    { id: "22" as GUID, headerContent: "Second header", bodyContent: <div>Second content</div> },
    { id: "33" as GUID, headerContent: "Third header", bodyContent: <div>Third content</div> }
];

const defaultProps: TreeNodeProps = {
    class: "",
    items: [],
    isUserDefinedLeafNode: false,
    startExpanded: false,
    showCustomIcon: false,
    iconPlacement: "right",
    expandedIcon: undefined,
    collapsedIcon: undefined,
    animateIcon: false,
    animateTreeNodeContent: false,
    openNodeOn: "headerClick"
};

jest.useFakeTimers();

describe("TreeNode", () => {
    it("preserves the DOM structure when collapsed", () => {
        expect(renderEnzyme(<TreeNode {...defaultProps} class="" items={items} />)).toMatchSnapshot();
    });

    it("preserves the DOM structure when expanded", () => {
        expect(renderEnzyme(<TreeNode {...defaultProps} class="" items={items} startExpanded />)).toMatchSnapshot();
    });

    it("shows everything properly when starting expanded", () => {
        const treeNode = mount(
            <TreeNode {...defaultProps} class="" items={items} isUserDefinedLeafNode={false} startExpanded />
        );

        // There is not really another way to properly identify that we're dealing with tree node branches.
        const treeNodeBranches = treeNode.find(".widget-tree-node-branch");
        expect(treeNodeBranches).toHaveLength(items.length);

        expect(treeNodeBranches.at(0).text()).toContain("First header");
        expect(treeNodeBranches.at(1).text()).toContain("Second header");
        expect(treeNodeBranches.at(2).text()).toContain("Third header");

        expect(treeNodeBranches.at(0).text()).toContain("First content");
        expect(treeNodeBranches.at(1).text()).toContain("Second content");
        expect(treeNodeBranches.at(2).text()).toContain("Third content");
    });

    it("does not show the tree node item content when not starting expanded", () => {
        const treeNode = mount(
            <TreeNode {...defaultProps} class="" items={items} isUserDefinedLeafNode={false} startExpanded={false} />
        );

        // There is not really another way to properly identify that we're dealing with tree node branches.
        const treeNodeBranches = treeNode.find(".widget-tree-node-branch");
        expect(treeNodeBranches).toHaveLength(items.length);

        expect(treeNodeBranches.at(0).text()).toContain("First header");
        expect(treeNodeBranches.at(1).text()).toContain("Second header");
        expect(treeNodeBranches.at(2).text()).toContain("Third header");

        expect(treeNodeBranches.at(0).text()).not.toContain("First content");
        expect(treeNodeBranches.at(1).text()).not.toContain("Second content");
        expect(treeNodeBranches.at(2).text()).not.toContain("Third content");
    });

    it("handles tree headers properly even if they are composed with widgets", () => {
        const newItems = [
            ...items,
            {
                id: "44" as GUID,
                headerContent: <div>This is the 44 header</div>,
                bodyContent: <div>Fourth content</div>
            }
        ];
        const treeNode = mount(
            <TreeNode {...defaultProps} class="" items={newItems} isUserDefinedLeafNode={false} startExpanded />
        );

        // There is not really another way to properly identify that we're dealing with tree node branches.
        const treeNodeBranches = treeNode.find(".widget-tree-node-branch");
        expect(treeNodeBranches).toHaveLength(newItems.length);

        expect(treeNodeBranches.at(3).html()).toContain("<div>This is the 44 header</div>");
        expect(treeNodeBranches.at(3).text()).toContain("Fourth content");
    });

    function findTreeNodeItems(reactWrapper: ReactWrapper<any, any, any>): ReactWrapper<HTMLAttributes, any, any> {
        return reactWrapper.find('[role="treeitem"]');
    }

    it("shows the tree node headers in the correct order as a treeitem when not defined as a leaf node", () => {
        const treeNode = mount(
            <TreeNode {...defaultProps} class="" items={items} isUserDefinedLeafNode={false} startExpanded={false} />
        );

        const treeNodeHeaders = findTreeNodeItems(treeNode);

        expect(treeNodeHeaders).toHaveLength(items.length);
        items.forEach(item => {
            expect(treeNode.text()).toContain(item.headerContent);
        });
    });

    it("correctly collapses and expands the tree node branch content when clicking on the header", async () => {
        render(
            <TreeNode {...defaultProps} class="" items={items} isUserDefinedLeafNode={false} startExpanded={false} />
        );

        const treeNodeItems = screen.getAllByRole("treeitem");
        expect(treeNodeItems).toHaveLength(3);

        expect(screen.queryByText("Second content")).not.toBeInTheDocument();

        const secondTreeNode = treeNodeItems[1];
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        // expand
        await user.click(secondTreeNode.children[0]!);
        expect(screen.queryByText("Second content")).toBeInTheDocument();

        // collapse
        await user.click(secondTreeNode);
        expect(secondTreeNode).toHaveAttribute("aria-expanded", "false");
    });

    const customIconProps: Partial<TreeNodeProps> = {
        showCustomIcon: true,
        expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
        collapsedIcon: { type: "image", iconUrl: "image.png" }
    };

    function getExpandedIconFromBranchHeader(header: ReactWrapper<any>): ReactWrapper<any> {
        return header.findWhere(
            node => node.type() === "span" && node.hasClass("glyphicon") && node.hasClass("expanded-icon")
        );
    }

    function getCollapsedImageFromBranchHeader(header: ReactWrapper<any>): ReactWrapper<any> {
        return header.findWhere(node => node.type() === "img" && node.prop("src") === "image.png");
    }

    it("shows custom expanded icon accordingly", () => {
        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                {...customIconProps}
                class=""
                items={items}
                isUserDefinedLeafNode={false}
                startExpanded={false}
            />
        );

        const treeNodeBranches = findTreeNodeItems(treeNode);
        const firstTreeNodeBranch = treeNodeBranches.at(0);

        expect(firstTreeNodeBranch).toHaveLength(1);
        expect(firstTreeNodeBranch.text()).toContain("First header");

        expect(getExpandedIconFromBranchHeader(firstTreeNodeBranch)).toHaveLength(0);
        expect(getCollapsedImageFromBranchHeader(firstTreeNodeBranch)).toHaveLength(1);
    });

    it("shows custom close icon accordingly", () => {
        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                {...customIconProps}
                class=""
                items={items}
                isUserDefinedLeafNode={false}
                startExpanded
            />
        );

        const treeNodeBranches = findTreeNodeItems(treeNode);
        const firstTreeNodeBranch = treeNodeBranches.at(0);

        expect(firstTreeNodeBranch).toHaveLength(1);
        expect(firstTreeNodeBranch.text()).toContain("First header");

        expect(getExpandedIconFromBranchHeader(firstTreeNodeBranch)).toHaveLength(1);
        expect(getCollapsedImageFromBranchHeader(firstTreeNodeBranch)).toHaveLength(0);
    });

    it("show an icon when its child has no nodes", () => {
        const nestedItems: TreeNodeProps["items"] = [
            {
                id: "11" as GUID,
                headerContent: "Parent treeview with a nested treeview that is empty",
                bodyContent: (
                    <TreeNode
                        {...defaultProps}
                        class=""
                        items={[]}
                        isUserDefinedLeafNode={false}
                        startExpanded={false}
                    />
                )
            }
        ];

        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                {...customIconProps}
                class=""
                items={nestedItems}
                isUserDefinedLeafNode={false}
                startExpanded
            />
        );

        const parentTreeNodeHeader = treeNode.findWhere(
            node =>
                node.type() === "span" &&
                node.hasClass("widget-tree-node-branch-header") &&
                node.text().includes("Parent treeview")
        );
        expect(parentTreeNodeHeader).toHaveLength(1);
        expect(getExpandedIconFromBranchHeader(parentTreeNodeHeader)).toHaveLength(1);
        expect(getCollapsedImageFromBranchHeader(parentTreeNodeHeader)).toHaveLength(0);
    });

    it("is clickable and shows an icon when its child has nodes", () => {
        const nestedItems: TreeNodeProps["items"] = [
            {
                id: "11" as GUID,
                headerContent: "Parent treeview with a nested treeview that is filled",
                bodyContent: (
                    <TreeNode
                        {...defaultProps}
                        class=""
                        items={items}
                        isUserDefinedLeafNode={false}
                        startExpanded={false}
                    />
                )
            }
        ];

        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                {...customIconProps}
                class=""
                items={nestedItems}
                isUserDefinedLeafNode={false}
                startExpanded
            />
        );

        const parentTreeNodeHeader = treeNode.findWhere(
            node =>
                node.type() === "span" &&
                node.hasClass("widget-tree-node-branch-header") &&
                node.text().includes("Parent treeview")
        );

        expect(parentTreeNodeHeader).toHaveLength(1);
        expect(parentTreeNodeHeader.hasClass("widget-tree-node-branch-header-clickable")).toBe(true);

        expect(getExpandedIconFromBranchHeader(parentTreeNodeHeader)).toHaveLength(1);
        expect(getCollapsedImageFromBranchHeader(parentTreeNodeHeader)).toHaveLength(0);
    });

    it("does not influence the parent if it is not immediately in the chain", () => {
        const RandomOtherWidget = ({ children }: { children: ReactNode }): ReactElement => <div>{children}</div>;
        const nestedItems: TreeNodeProps["items"] = [
            {
                id: "11" as GUID,
                headerContent:
                    "Parent treeview with a nested treeview that is empty and wrapped with a random other widget",
                bodyContent: (
                    <RandomOtherWidget>
                        <TreeNode
                            {...defaultProps}
                            class=""
                            items={[]}
                            isUserDefinedLeafNode={false}
                            startExpanded={false}
                        />
                    </RandomOtherWidget>
                )
            }
        ];

        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                {...customIconProps}
                class=""
                items={nestedItems}
                isUserDefinedLeafNode={false}
                startExpanded
            />
        );

        const parentTreeNodeHeader = treeNode.findWhere(
            node =>
                node.type() === "span" &&
                node.hasClass("widget-tree-node-branch-header") &&
                node.text().includes("Parent treeview")
        );

        expect(parentTreeNodeHeader).toHaveLength(1);
        expect(parentTreeNodeHeader.hasClass("widget-tree-node-branch-header-clickable")).toBe(true);

        expect(getExpandedIconFromBranchHeader(parentTreeNodeHeader)).toHaveLength(1);
        expect(getCollapsedImageFromBranchHeader(parentTreeNodeHeader)).toHaveLength(0);
    });

    it("is treated as a leaf node even if the user does not specify as a leaf but also dont specify content", () => {
        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                {...customIconProps}
                class=""
                items={[{ id: "11" as GUID, headerContent: "First header", bodyContent: undefined }]}
                isUserDefinedLeafNode={false}
                startExpanded
            />
        );

        const treeNodes = treeNode.findWhere(node => node.type() === "li");

        expect(treeNodes).toHaveLength(1);
        expect(
            treeNodes
                .at(0)
                .findWhere(node => node.type() === "span" && node.hasClass("widget-tree-node-branch-header"))
                .hasClass("widget-tree-node-branch-header-clickable")
        ).toBe(false);
    });

    it("adds a CSS class for the header when the icon animates on toggle", () => {
        const treeNode = mount(
            <TreeNode
                {...defaultProps}
                class=""
                items={items}
                isUserDefinedLeafNode={false}
                startExpanded
                animateIcon
            />
        );
        expect(
            treeNode
                .find(".widget-tree-node-branch-header")
                .at(0)
                .find("svg")
                .hasClass("widget-tree-node-branch-header-icon-animated")
        ).toBe(true);
    });

    describe("for performance reasons", () => {
        const itemsWithNestedTreeNode: TreeNodeProps["items"] = [
            {
                id: "11" as GUID,
                headerContent: "Parent treeview with a nested treeview that is filled",
                bodyContent: (
                    <TreeNode
                        {...defaultProps}
                        class=""
                        items={items}
                        isUserDefinedLeafNode={false}
                        startExpanded={false}
                    />
                )
            }
        ];

        it("expands the nested tree node normally", () => {
            const treeNode = mount(
                <TreeNode
                    {...defaultProps}
                    class=""
                    items={itemsWithNestedTreeNode}
                    isUserDefinedLeafNode={false}
                    startExpanded={false}
                />
            );

            const treeNodeBranches = findTreeNodeItems(treeNode);
            expect(treeNodeBranches).toHaveLength(1);
            expect(treeNode.text()).not.toContain("First header");

            treeNodeBranches.find(".widget-tree-node-branch-header").simulate("click");
            expect(treeNode.text()).toContain("First header");
        });

        it("collapses the nested treeview through CSS instead of JS after being expanded once", () => {
            const treeNode = mount(
                <TreeNode
                    {...defaultProps}
                    class=""
                    items={itemsWithNestedTreeNode}
                    isUserDefinedLeafNode={false}
                    startExpanded={false}
                />
            );

            const treeNodeBranches = findTreeNodeItems(treeNode);
            expect(treeNodeBranches).toHaveLength(1);
            expect(treeNode.text()).not.toContain("First header");

            treeNodeBranches.find(".widget-tree-node-branch-header").simulate("click");
            expect(treeNode.text()).toContain("First header");

            treeNodeBranches.find(".widget-tree-node-branch-header").simulate("click");
            expect(treeNode.text()).toContain("First header");
            expect(treeNode.find(".widget-tree-node-body").hasClass("widget-tree-node-branch-hidden")).toBe(true);
        });

        function getLoadingSpinnerFromBranchHeader(header: ReactWrapper<any>): ReactWrapper<any> {
            return header.findWhere(node => node.type() === "img" && node.hasClass("widget-tree-node-loading-spinner"));
        }

        it("shows a loading spinner icon when opening for the first time", () => {
            const treeNode = mount(
                <TreeNode
                    {...defaultProps}
                    {...customIconProps}
                    class=""
                    items={items}
                    isUserDefinedLeafNode={false}
                    startExpanded={false}
                />
            );

            const treeNodeBranches = findTreeNodeItems(treeNode);
            const firstTreeNodeBranch = treeNodeBranches.at(0);

            expect(getExpandedIconFromBranchHeader(firstTreeNodeBranch)).toHaveLength(0);
            expect(getCollapsedImageFromBranchHeader(firstTreeNodeBranch)).toHaveLength(1);

            firstTreeNodeBranch.find(".widget-tree-node-branch-header").simulate("click");

            const updatedFirstTreeNodeBranch = findTreeNodeItems(treeNode).at(0);
            expect(getExpandedIconFromBranchHeader(updatedFirstTreeNodeBranch)).toHaveLength(0);
            expect(getCollapsedImageFromBranchHeader(updatedFirstTreeNodeBranch)).toHaveLength(0);
            expect(getLoadingSpinnerFromBranchHeader(updatedFirstTreeNodeBranch)).toHaveLength(1);
        });

        it("the nested treeview should tell the parent it can change from the loading spinner to the next state", () => {
            const treeNode = mount(
                <TreeNode
                    {...defaultProps}
                    {...customIconProps}
                    class=""
                    items={itemsWithNestedTreeNode}
                    isUserDefinedLeafNode={false}
                    startExpanded={false}
                />
            );

            // There is not really another way to properly identify that we're dealing with tree node branches.
            const treeNodeBranches = findTreeNodeItems(treeNode);
            const firstTreeViewBranch = treeNodeBranches.at(0);

            expect(getExpandedIconFromBranchHeader(firstTreeViewBranch)).toHaveLength(0);
            expect(getCollapsedImageFromBranchHeader(firstTreeViewBranch)).toHaveLength(1);

            firstTreeViewBranch.find(".widget-tree-node-branch-header").simulate("click");

            const updatedFirstTreeViewBranch = findTreeNodeItems(treeNode).at(0);
            expect(getExpandedIconFromBranchHeader(updatedFirstTreeViewBranch)).toHaveLength(1);
            expect(getCollapsedImageFromBranchHeader(updatedFirstTreeViewBranch)).toHaveLength(0);
            expect(getLoadingSpinnerFromBranchHeader(updatedFirstTreeViewBranch)).toHaveLength(0);
        });
    });

    describe("when interacting through the keyboard", () => {
        let user: UserEvent;
        beforeEach(() => {
            user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
            const treeNodeItems = [
                { id: "1" as GUID, headerContent: "First header", bodyContent: <div>First content</div> },
                {
                    id: "2" as GUID,
                    headerContent: "Second header",
                    bodyContent: (
                        <TreeNode
                            {...defaultProps}
                            class=""
                            items={[
                                {
                                    id: "21" as GUID,
                                    headerContent: "Second First header",
                                    bodyContent: <div>Second First content</div>
                                },
                                {
                                    id: "22" as GUID,
                                    headerContent: "Second Second header",
                                    bodyContent: <div>Second Second content</div>
                                },
                                {
                                    id: "23" as GUID,
                                    headerContent: "Second Third header",
                                    bodyContent: <div>Second Third content</div>
                                }
                            ]}
                            isUserDefinedLeafNode={false}
                            startExpanded={false}
                        />
                    )
                },
                {
                    id: "3" as GUID,
                    headerContent: "Third header",
                    bodyContent: (
                        <TreeNode
                            {...defaultProps}
                            class=""
                            items={[]}
                            isUserDefinedLeafNode={false}
                            startExpanded={false}
                        />
                    )
                },
                {
                    id: "4" as GUID,
                    headerContent: "Fourth header",
                    bodyContent: <div>Fourth content</div>
                }
            ];
            render(
                <TreeNode
                    {...defaultProps}
                    class=""
                    items={treeNodeItems}
                    isUserDefinedLeafNode={false}
                    startExpanded={false}
                />
            );
        });

        function getClickableTreeViewHeaders(): HTMLElement[] {
            return screen.getAllByRole("treeitem").filter(element => element.tagName === "LI");
        }

        function getTreeViewItems(): HTMLElement[] {
            return screen.getAllByRole("treeitem").filter(element => element.tagName === "LI");
        }

        async function focusFirstTreeViewElement(): Promise<void> {
            expect(document.body).toHaveFocus();
            await user.tab();
        }

        it("collapses and expands the content when pressing Space and Enter keys", async () => {
            expect(screen.queryByText("First content")).not.toBeInTheDocument();

            const treeNodes = getTreeViewItems();
            expect(treeNodes).toHaveLength(4);
            treeNodes.forEach(treeNode => {
                expect(treeNode).toHaveAttribute("aria-expanded", "false");
            });

            await focusFirstTreeViewElement();

            await user.tab();

            // expand
            await user.keyboard("{Enter}");

            await screen.findByText("Second First header");
            expect(screen.queryByText("Second First header")).toBeInTheDocument();
            expect(treeNodes[1]).toHaveAttribute("aria-expanded", "true");

            // collapse
            await user.keyboard(" ");

            expect(treeNodes[1]).toHaveAttribute("aria-expanded", "false");
        });

        it("the Home key jumps focus to the first tree node", async () => {
            const treeNodeHeaders = getClickableTreeViewHeaders();
            const treeNodes = getTreeViewItems();
            expect(treeNodes).toHaveLength(4);
            treeNodes.forEach(treeNode => {
                expect(treeNode).toHaveAttribute("aria-expanded", "false");
            });

            await focusFirstTreeViewElement();

            await user.tab();
            await user.tab();

            expect(treeNodeHeaders[2]).toHaveFocus();

            await user.keyboard("{Home}");

            expect(treeNodeHeaders[0]).toHaveFocus();
        });

        it("the End key jumps focus to the last tree node", async () => {
            const treeViewHeaders = getClickableTreeViewHeaders();
            const treeViews = getTreeViewItems();
            expect(treeViews).toHaveLength(4);
            treeViews.forEach(treeView => {
                expect(treeView).toHaveAttribute("aria-expanded", "false");
            });

            await focusFirstTreeViewElement();

            expect(treeViewHeaders[0]).toHaveFocus();

            await user.keyboard("{End}");

            expect(treeViewHeaders[3]).toHaveFocus();
        });

        describe("the ArrowDown key", () => {
            it("goes to the next tree node element if the current one is collapsed", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                expect(treeViewHeaders[0]).toHaveFocus();

                await user.keyboard("{ArrowDown}");

                expect(treeViewHeaders[1]).toHaveFocus();
            });

            it("does not circularly target the first tree node element if the current one is the last", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();
                await user.tab();
                await user.tab();

                expect(treeViewHeaders[3]).toHaveFocus();

                await user.keyboard("{ArrowDown}");

                expect(treeViewHeaders[0]).not.toHaveFocus();
                expect(treeViewHeaders[3]).toHaveFocus();
            });

            it("goes to the next nested tree node element if the current one is expanded", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();
                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{Enter}");

                expect(screen.getByText("Second First header")).toBeInTheDocument();
                expect(screen.getByText("Second Second header")).toBeInTheDocument();
                expect(screen.getByText("Second Third header")).toBeInTheDocument();
                expect(getClickableTreeViewHeaders()).toHaveLength(7);
                expect(treeViews[1]).toHaveAttribute("aria-expanded", "true");

                expect(treeViewHeaders[1]).toHaveFocus();
                await user.keyboard("{ArrowDown}");

                expect(treeViewHeaders[2]).not.toHaveFocus();
                expect(getClickableTreeViewHeaders()[2]).toHaveFocus();
            });
        });

        describe("the ArrowUp key", () => {
            it("goes to the previous tree node element if the current one is collapsed", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{ArrowUp}");

                expect(treeViewHeaders[0]).toHaveFocus();
            });

            it("does not circularly target the last tree node element if the current one is the first", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                expect(treeViewHeaders[0]).toHaveFocus();

                await user.keyboard("{ArrowUp}");

                expect(treeViewHeaders[2]).not.toHaveFocus();
                expect(treeViewHeaders[0]).toHaveFocus();
            });

            it("goes to the previous nested tree node element if there are nested elements inbetween", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{Enter}");

                expect(screen.getByText("Second First header")).toBeInTheDocument();
                expect(screen.getByText("Second Second header")).toBeInTheDocument();
                expect(screen.getByText("Second Third header")).toBeInTheDocument();
                expect(getClickableTreeViewHeaders()).toHaveLength(7);
                expect(treeViews[1]).toHaveAttribute("aria-expanded", "true");

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.tab();
                await user.tab();
                await user.tab();
                await user.tab();

                expect(treeViewHeaders[2]).toHaveFocus();

                await user.keyboard("{Up}");

                expect(treeViewHeaders[1]).not.toHaveFocus();
                expect(getClickableTreeViewHeaders()[4]).toHaveFocus();
            });
        });

        describe("the ArrowRight key", () => {
            it("stays at the current tree node if it turns out to be empty", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();
                await user.tab();

                expect(treeViewHeaders[2]).toHaveFocus();

                await user.keyboard("{ArrowRight}");

                expect(treeViewHeaders[2]).toHaveFocus();
            });

            it("expands a tree node element if possible", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{ArrowRight}");

                expect(treeViews[1]).toHaveAttribute("aria-expanded", "true");
                expect(getClickableTreeViewHeaders()).not.toHaveLength(4);
            });

            it("targets the first child tree node element if the current one is already expanded", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{ArrowRight}");

                expect(treeViews[1]).toHaveAttribute("aria-expanded", "true");

                await user.keyboard("{ArrowRight}");

                expect(treeViewHeaders[2]).not.toHaveFocus();
                expect(getClickableTreeViewHeaders()[2]).toHaveFocus();
            });
        });

        describe("the ArrowLeft key", () => {
            it("does nothing if the current one is top level and collapsed", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();
                await user.tab();

                expect(treeViewHeaders[2]).toHaveFocus();

                await user.keyboard("{ArrowLeft}");

                expect(treeViewHeaders[2]).toHaveFocus();
            });

            it("collapses a tree node element if possible", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{ArrowRight}");

                expect(treeViews[1]).toHaveAttribute("aria-expanded", "true");
                expect(getClickableTreeViewHeaders()).not.toHaveLength(4);

                await user.keyboard("{ArrowLeft}");
                expect(treeViews[1]).toHaveAttribute("aria-expanded", "false");
                expect(getClickableTreeViewHeaders()).toHaveLength(4);
            });

            it("goes to the parent tree node element if the current one is not top level and is collapsed", async () => {
                const treeViewHeaders = getClickableTreeViewHeaders();
                const treeViews = getTreeViewItems();
                expect(treeViews).toHaveLength(4);
                treeViews.forEach(treeView => {
                    expect(treeView).toHaveAttribute("aria-expanded", "false");
                });

                await focusFirstTreeViewElement();

                await user.tab();

                expect(treeViewHeaders[1]).toHaveFocus();

                await user.keyboard("{ArrowRight}");

                expect(treeViews[1]).toHaveAttribute("aria-expanded", "true");

                await user.keyboard("{ArrowRight}");

                expect(treeViewHeaders[2]).not.toHaveFocus();

                await user.keyboard("{ArrowDown}");
                expect(getClickableTreeViewHeaders()[3]).toHaveFocus();

                await user.keyboard("{ArrowLeft}");

                expect(treeViewHeaders[1]).toHaveFocus();
            });
        });
    });
});
