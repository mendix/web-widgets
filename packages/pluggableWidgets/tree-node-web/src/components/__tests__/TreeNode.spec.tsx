import { GUID } from "mendix";
import { createElement, ReactElement, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/setup/setup";
import "@testing-library/jest-dom";
import { TreeNode, TreeNodeProps, TreeNodeState } from "../TreeNode";
import { renderTreeNodeHeaderIcon } from "../HeaderIcon";

jest.mock("../../assets/loading-circle.svg", () => "loading-logo.svg");

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

function renderTreeNode(props: Partial<TreeNodeProps> = {}): ReturnType<typeof render> {
    return render(<TreeNode {...defaultProps} {...props} />);
}

describe("TreeNode", () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    });

    it("renders collapsed DOM structure", () => {
        const { asFragment } = renderTreeNode({ items });
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders expanded DOM structure", () => {
        const { asFragment } = renderTreeNode({ items, startExpanded: true });
        expect(asFragment()).toMatchSnapshot();
    });

    it("shows all headers and contents when starting expanded", () => {
        renderTreeNode({ items, isUserDefinedLeafNode: false, startExpanded: true });
        items.forEach(item => {
            expect(screen.getByText(item.headerContent as string)).toBeInTheDocument();
            expect(screen.getByText((item.bodyContent as React.ReactElement).props.children)).toBeInTheDocument();
        });
    });

    it("does not show item content when not starting expanded", () => {
        renderTreeNode({ items, isUserDefinedLeafNode: false, startExpanded: false });
        items.forEach(item => {
            expect(screen.getByText(item.headerContent as string)).toBeInTheDocument();
            expect(screen.queryByText((item.bodyContent as React.ReactElement).props.children)).not.toBeInTheDocument();
        });
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
        renderTreeNode({ items: newItems, isUserDefinedLeafNode: false, startExpanded: true });
        expect(screen.getByText("This is the 44 header")).toBeInTheDocument();
        expect(screen.getByText("Fourth content")).toBeInTheDocument();
    });

    it("shows the tree node headers in the correct order as a treeitem when not defined as a leaf node", () => {
        renderTreeNode({ items, isUserDefinedLeafNode: false, startExpanded: false });
        const treeNodeHeaders = screen.getAllByRole("treeitem");
        expect(treeNodeHeaders).toHaveLength(items.length);
        items.forEach(item => {
            expect(screen.getByText(item.headerContent as string)).toBeInTheDocument();
        });
    });

    it("correctly collapses and expands the tree node branch content when clicking on the header", async () => {
        renderTreeNode({ items, isUserDefinedLeafNode: false, startExpanded: false });

        const treeNodeItems = screen.getAllByRole("treeitem");

        expect(treeNodeItems).toHaveLength(3);
        expect(screen.queryByText("Second content")).not.toBeInTheDocument();

        // expand
        await user.click(screen.getByText("Second header"));
        expect(screen.queryByText("Second content")).toBeInTheDocument();

        // collapse
        await user.click(screen.getByText("Second header"));
        expect(treeNodeItems[1]).toHaveAttribute("aria-expanded", "false");
    });

    it("shows custom expanded icon accordingly", () => {
        renderTreeNode({
            showCustomIcon: true,
            expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
            collapsedIcon: { type: "image", iconUrl: "image.png" },
            items,
            isUserDefinedLeafNode: false,
            startExpanded: false
        });
        expect(screen.getByText("First header")).toBeInTheDocument();
    });

    it("shows custom close icon accordingly", () => {
        renderTreeNode({
            showCustomIcon: true,
            expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
            collapsedIcon: { type: "image", iconUrl: "image.png" },
            items,
            isUserDefinedLeafNode: false,
            startExpanded: true
        });
        expect(screen.getByText("First header")).toBeInTheDocument();

        const nestedItems: TreeNodeProps["items"] = [
            {
                id: "11" as GUID,
                headerContent: "Parent treeview with a nested treeview that is empty",
                bodyContent: (
                    <TreeNode {...defaultProps} items={[]} isUserDefinedLeafNode={false} startExpanded={false} />
                )
            }
        ];
        renderTreeNode({
            showCustomIcon: true,
            expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
            collapsedIcon: { type: "image", iconUrl: "image.png" },
            items: nestedItems,
            isUserDefinedLeafNode: false,
            startExpanded: true
        });
        expect(screen.getByText("Parent treeview with a nested treeview that is empty")).toBeInTheDocument();
    });

    it("is clickable and shows an icon when its child has nodes", () => {
        const nestedItems: TreeNodeProps["items"] = [
            {
                id: "11" as GUID,
                headerContent: "Parent treeview with a nested treeview that is empty",
                bodyContent: (
                    <TreeNode {...defaultProps} items={[]} isUserDefinedLeafNode={false} startExpanded={false} />
                )
            }
        ];
        renderTreeNode({
            showCustomIcon: true,
            expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
            collapsedIcon: { type: "image", iconUrl: "image.png" },
            items: nestedItems,
            isUserDefinedLeafNode: false,
            startExpanded: true
        });
        expect(screen.getByText("Parent treeview with a nested treeview that is empty")).toBeInTheDocument();
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
                        <TreeNode {...defaultProps} items={[]} isUserDefinedLeafNode={false} startExpanded={false} />
                    </RandomOtherWidget>
                )
            }
        ];
        renderTreeNode({
            showCustomIcon: true,
            expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
            collapsedIcon: { type: "image", iconUrl: "image.png" },
            items: nestedItems,
            isUserDefinedLeafNode: false,
            startExpanded: true
        });
        expect(
            screen.getByText(
                "Parent treeview with a nested treeview that is empty and wrapped with a random other widget"
            )
        ).toBeInTheDocument();
    });

    it("is treated as a leaf node even if the user does not specify as a leaf but also dont specify content", () => {
        renderTreeNode({
            showCustomIcon: true,
            expandedIcon: { type: "glyph", iconClass: "expanded-icon" },
            collapsedIcon: { type: "image", iconUrl: "image.png" },
            items: [{ id: "11" as GUID, headerContent: "First header", bodyContent: undefined }],
            isUserDefinedLeafNode: false,
            startExpanded: true
        });
        expect(screen.getByText("First header")).toBeInTheDocument();
    });

    it("adds a CSS class for the header when the icon animates on toggle", () => {
        renderTreeNode({
            items,
            isUserDefinedLeafNode: false,
            startExpanded: true,
            animateIcon: true
        });
        expect(
            screen.getAllByRole("treeitem")[0].querySelector(".widget-tree-node-branch-header-icon-animated")
        ).toBeTruthy();
    });

    describe("for performance reasons", () => {
        it("does not re-render tree node branches unnecessarily", () => {
            const renderSpy = jest.fn();
            const TestBranch = (props: TreeNodeProps): ReactElement => {
                renderSpy();
                return <TreeNode {...props} />;
            };
            const testItems: TreeNodeProps["items"] = [
                { id: "1" as GUID, headerContent: "Header 1", bodyContent: <div>Content 1</div> },
                { id: "2" as GUID, headerContent: "Header 2", bodyContent: <div>Content 2</div> }
            ];
            render(<TestBranch {...defaultProps} items={testItems} />);
            expect(renderSpy).toHaveBeenCalledTimes(1);
        });

        it("shows loading spinner when loading", async () => {
            const { container } = render(
                renderTreeNodeHeaderIcon(TreeNodeState.LOADING, "right", defaultProps) as ReactElement
            );

            expect(container.querySelector(".widget-tree-node-loading-spinner")).toBeInTheDocument();
        });
    });

    describe("when interacting through the keyboard", () => {
        beforeEach(() => {
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

            renderTreeNode({
                class: "",
                items: treeNodeItems,
                isUserDefinedLeafNode: false,
                startExpanded: false
            });
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
