import "@testing-library/jest-dom";
import { createElement } from "react";
import { act, render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { Accordion, AccordionProps } from "../Accordion";

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

describe("Accordion", () => {
    let defaultProps: AccordionProps;
    let user: UserEvent;

    beforeEach(() => {
        defaultProps = {
            id: "id",
            class: "",
            style: { height: "500px" },
            tabIndex: 1,
            groups: [
                {
                    header: "header",
                    content: <span>content</span>,
                    initiallyCollapsed: true,
                    visible: true,
                    loadContent: "always"
                },
                {
                    header: "header2",
                    content: <span>content2</span>,
                    initiallyCollapsed: true,
                    visible: false,
                    loadContent: "always"
                }
            ],
            collapsible: true,
            singleExpandedGroup: true,
            generateHeaderIcon: jest.fn(),
            showGroupHeaderIcon: "right"
        };
        user = userEvent.setup();
    });

    function renderAccordion(props: Partial<AccordionProps> = {}): RenderResult {
        return render(<Accordion {...defaultProps} {...props} />);
    }

    describe("collapsible AccordionGroupWrapper", () => {
        it("gives the next accordion group button focus on arrow down key down", async () => {
            const groups = [...defaultProps.groups];
            groups[1].visible = true;

            const accordion = renderAccordion({ groups });
            const buttons = accordion.getAllByRole("button");

            await user.tab();
            await user.keyboard("{ArrowDown}");

            expect(buttons[1]).toHaveFocus();
        });

        it("gives the previous accordion group button focus on arrow up key down", async () => {
            const groups = [...defaultProps.groups];
            groups[1].visible = true;

            const accordion = renderAccordion({ groups });

            const buttons = accordion.getAllByRole("button");

            await user.tab();
            await user.tab();
            await user.keyboard("{ArrowUp}");

            expect(buttons[0]).toHaveFocus();
        });

        it("gives the first accordion group button focus on Home key down", async () => {
            const groups = [
                ...defaultProps.groups,
                { header: "header3", content: <span>content3</span>, visible: true, loadContent: "always" as const }
            ];
            groups[1].visible = true;

            const accordion = renderAccordion({ groups });

            const buttons = accordion.getAllByRole("button");

            await user.tab();
            await user.tab();
            await user.tab();
            await user.keyboard("{Home}");

            expect(buttons[0]).toHaveFocus();
        });

        it("gives the last accordion group button focus on End key down", async () => {
            const groups = [
                ...defaultProps.groups,
                { header: "header3", content: <span>content3</span>, visible: true, loadContent: "always" as const }
            ];
            groups[1].visible = true;

            const accordion = renderAccordion({ groups });
            const buttons = accordion.getAllByRole("button");

            await user.tab();
            await user.tab();
            await user.tab();
            await user.keyboard("{End}");

            expect(buttons[buttons.length - 1]).toHaveFocus();
        });

        it("remains focus on the last accordion group button on arrow down key down", async () => {
            const groups = [
                ...defaultProps.groups,
                { header: "header3", content: <span>content3</span>, visible: true, loadContent: "always" as const }
            ];
            groups[1].visible = true;

            const accordion = renderAccordion({ groups });
            const buttons = accordion.getAllByRole("button");

            await user.tab();
            await user.tab();
            await user.tab();
            await user.keyboard("{ArrowDown}");

            expect(buttons[buttons.length - 1]).toHaveFocus();
        });
    });

    it("renders correctly without tabindex", () => {
        const accordion = renderAccordion({ tabIndex: undefined });

        expect(accordion.asFragment()).toMatchSnapshot();
    });

    describe("in collapsible & single expanded group mode", () => {
        it("renders correctly", () => {
            const accordion = renderAccordion();

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("expands a group", async () => {
            const accordion = renderAccordion();
            const button = accordion.getAllByRole("button")[1];

            await user.click(button);

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("allows one group to be expanded only", async () => {
            const groups = [...defaultProps.groups];
            groups[1].visible = true;

            const accordion = renderAccordion({ groups });
            const buttons = accordion.getAllByRole("button");

            await user.click(buttons[0]);
            await user.click(buttons[buttons.length - 1]);

            expect(buttons[1]).toHaveFocus();
            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("collapses a group", async () => {
            const accordion = renderAccordion();
            const button = accordion.getAllByRole("button")[0];

            await user.click(button);
            await user.click(button);

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("inits with group initially collapsed settings", () => {
            const groups = [...defaultProps.groups];
            groups[0].initiallyCollapsed = false;
            const accordion = renderAccordion({ groups });

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("inits with not more than one group expanded", () => {
            const groups = [...defaultProps.groups].map(group => ({ ...group, initiallyCollapsed: false }));
            const accordion = renderAccordion({ groups });

            expect(accordion.asFragment()).toMatchSnapshot();
        });
    });

    describe("in collapsible & multiple expanded group mode", () => {
        it("renders correctly", () => {
            const accordion = renderAccordion({ singleExpandedGroup: false });

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("expands a group", async () => {
            const accordion = renderAccordion({ singleExpandedGroup: false });
            const button = accordion.getAllByRole("button")[0];

            await user.click(button);

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("allows multiple groups to be expanded", async () => {
            const groups = [...defaultProps.groups];
            groups[1].visible = true;

            const accordion = renderAccordion({ singleExpandedGroup: false, groups });
            const buttons = accordion.getAllByRole("button");

            await user.click(buttons[0]);
            await user.click(buttons[buttons.length - 1]);

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("collapses a group", async () => {
            const groups = [...defaultProps.groups];
            groups[1].visible = true;

            const accordion = renderAccordion({ singleExpandedGroup: false, groups });
            const buttons = accordion.getAllByRole("button");

            await user.click(buttons[0]);
            await user.click(buttons[buttons.length - 1]);
            await user.click(buttons[0]);

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("inits with group initially collapsed settings", () => {
            const groups = [...defaultProps.groups].map(group => ({ ...group, initiallyCollapsed: false }));
            groups.push({
                header: "header3",
                content: <span>content3</span>,
                initiallyCollapsed: true,
                visible: true,
                loadContent: "always" as const
            });

            const accordion = renderAccordion({ singleExpandedGroup: false, groups });

            expect(accordion.asFragment()).toMatchSnapshot();
        });

        it("applies group collapsed value changes", () => {
            const accordion = renderAccordion({ singleExpandedGroup: false });
            const newGroups = [...defaultProps.groups];
            newGroups[1].collapsed = false;

            act(() => {
                accordion.rerender(<Accordion {...defaultProps} singleExpandedGroup={false} groups={newGroups} />);
            });

            expect(accordion.asFragment()).toMatchSnapshot();
        });
    });

    describe("not collapsible", () => {
        it("renders correctly", () => {
            const accordion = renderAccordion({ collapsible: false });

            expect(accordion.asFragment()).toMatchSnapshot();
        });
    });
});
