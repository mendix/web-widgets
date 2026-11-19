import "@testing-library/jest-dom";
import { act, createEvent, fireEvent, render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccordionGroup, AccordionGroupProps, Target } from "../AccordionGroup";

describe("AccordionGroup", () => {
    const defaultAccordionGroupProps: AccordionGroupProps = {
        id: "id",
        header: "header",
        content: <span>content</span>,
        collapsed: true,
        visible: true,
        dynamicClassName: "class-name",
        collapsible: false,
        animateContent: false, // testing animations with Enzyme doesn't work
        generateHeaderIcon: jest.fn(),
        showHeaderIcon: "right",
        loadContent: "always"
    };

    function renderAccordionGroup(props: Partial<AccordionGroupProps> = {}): RenderResult {
        return render(<AccordionGroup {...defaultAccordionGroupProps} {...props} />);
    }

    it("doesn't render when the group isn't visible", () => {
        const accordionGroup = renderAccordionGroup({ visible: false });

        expect(defaultAccordionGroupProps.generateHeaderIcon).not.toHaveBeenCalled();
        expect(accordionGroup.asFragment()).toMatchSnapshot();
    });

    describe("collapsible", () => {
        function renderCollapsibleAccordionGroup(
            accordionGroupProps: Partial<AccordionGroupProps> = {},
            toggleCollapsed?: () => void,
            changeFocus?: (focusedGroupHeader: EventTarget | null, focusTargetGroupHeader: Target) => void
        ): RenderResult {
            const resToggleCollapsed = toggleCollapsed ?? jest.fn();

            return renderAccordionGroup({
                ...accordionGroupProps,
                collapsible: true,
                toggleCollapsed: resToggleCollapsed,
                changeFocus
            });
        }

        it("renders correctly when the group is visible and collapsed", () => {
            const accordionGroup = renderCollapsibleAccordionGroup();

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("renders correctly when the group is visible and expanded", () => {
            const accordionGroup = renderCollapsibleAccordionGroup({
                collapsed: false
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("renders correctly when the group is visible and gets expanded", () => {
            const accordionGroup = renderCollapsibleAccordionGroup();
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);

            act(() => {
                accordionGroup.rerender(
                    <AccordionGroup
                        {...defaultAccordionGroupProps}
                        collapsed={false}
                        collapsible
                        toggleCollapsed={jest.fn()}
                    />
                );
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(3);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("renders correctly when the group is visible and gets collapsed", () => {
            const accordionGroup = renderCollapsibleAccordionGroup({
                collapsed: false
            });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);

            act(() => {
                accordionGroup.rerender(
                    <AccordionGroup {...defaultAccordionGroupProps} collapsed collapsible toggleCollapsed={jest.fn()} />
                );
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(3);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("renders correctly when the group becomes visible and is collapsed", () => {
            const accordionGroup = renderCollapsibleAccordionGroup({
                visible: false
            });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);

            act(() => {
                accordionGroup.rerender(
                    <AccordionGroup {...defaultAccordionGroupProps} visible collapsible toggleCollapsed={jest.fn()} />
                );
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("renders correctly when the group becomes visible and is expanded", () => {
            const accordionGroup = renderCollapsibleAccordionGroup({
                collapsed: false,
                visible: false
            });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);

            act(() => {
                accordionGroup.rerender(
                    <AccordionGroup {...defaultAccordionGroupProps} visible collapsible toggleCollapsed={jest.fn()} />
                );
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(2);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        describe("header", () => {
            const user = userEvent.setup();

            function getFocusedHeaderButton(accordionGroup: RenderResult): HTMLElement {
                const headerButton = accordionGroup.getByRole("button", { name: /header/i });
                headerButton.focus();

                return headerButton;
            }

            it("calls toggleCollapsed when clicking to expand", async () => {
                const toggleCollapsedMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, toggleCollapsedMock);
                const headerButton = getFocusedHeaderButton(accordionGroup);

                await user.click(headerButton);

                expect(toggleCollapsedMock).toHaveBeenCalledTimes(1);
            });

            it("calls toggleCollapsed when clicking to collapse", async () => {
                const toggleCollapsedMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({ collapsed: false }, toggleCollapsedMock);
                const headerButton = getFocusedHeaderButton(accordionGroup);

                await user.click(headerButton);

                expect(toggleCollapsedMock).toHaveBeenCalledTimes(1);
            });

            it("calls toggleCollapsed when Space key is pressed", async () => {
                const toggleCollapsedMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, toggleCollapsedMock);
                getFocusedHeaderButton(accordionGroup);

                await user.keyboard("{ }");

                expect(toggleCollapsedMock).toHaveBeenCalledTimes(1);
            });

            it("calls toggleCollapsed when Enter key is pressed", async () => {
                const toggleCollapsedMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, toggleCollapsedMock);
                getFocusedHeaderButton(accordionGroup);

                await user.keyboard("{Enter}");

                expect(toggleCollapsedMock).toHaveBeenCalledTimes(1);
            });

            it("calls changeFocus with the next target when ArrowDown key is pressed", async () => {
                const changeFocusMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, undefined, changeFocusMock);
                const headerButton = getFocusedHeaderButton(accordionGroup);

                await user.keyboard("{ArrowDown}");

                expect(changeFocusMock).toHaveBeenCalledTimes(1);
                expect(changeFocusMock).toHaveBeenCalledWith(headerButton, Target.NEXT);
            });

            it("calls changeFocus with the previous target when ArrowUp key is pressed", async () => {
                const changeFocusMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, undefined, changeFocusMock);
                const headerButton = getFocusedHeaderButton(accordionGroup);

                await user.keyboard("{ArrowUp}");

                expect(changeFocusMock).toHaveBeenCalledTimes(1);
                expect(changeFocusMock).toHaveBeenCalledWith(headerButton, Target.PREVIOUS);
            });

            it("calls changeFocus with the first target when Home key is pressed", async () => {
                const changeFocusMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, undefined, changeFocusMock);
                const headerButton = getFocusedHeaderButton(accordionGroup);

                await user.keyboard("{Home}");

                expect(changeFocusMock).toHaveBeenCalledTimes(1);
                expect(changeFocusMock).toHaveBeenCalledWith(headerButton, Target.FIRST);
            });

            it("calls changeFocus with the last target when End key is pressed", async () => {
                const changeFocusMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({}, undefined, changeFocusMock);
                const headerButton = getFocusedHeaderButton(accordionGroup);

                await user.keyboard("{End}");

                expect(changeFocusMock).toHaveBeenCalledTimes(1);
                expect(changeFocusMock).toHaveBeenCalledWith(headerButton, Target.LAST);
            });

            it("calls onToggleCompletion", () => {
                const onToggleCompletionMock = jest.fn();

                const accordionGroup = renderCollapsibleAccordionGroup({
                    onToggleCompletion: onToggleCompletionMock
                });

                act(() => {
                    accordionGroup.rerender(
                        <AccordionGroup
                            {...defaultAccordionGroupProps}
                            collapsed={false}
                            onToggleCompletion={onToggleCompletionMock}
                        />
                    );
                });

                expect(onToggleCompletionMock).toHaveBeenCalledTimes(1);
                expect(onToggleCompletionMock).toHaveBeenCalledWith(false);
            });

            it("applies the correct class when the header icon is aligned right", () => {
                const accordionGroup = renderCollapsibleAccordionGroup({});
                const headerButton = getFocusedHeaderButton(accordionGroup);

                expect(headerButton.className).toContain("widget-accordion-group-header-button-icon-right");
            });

            it("applies the correct class when the header icon is aligned left", () => {
                const accordionGroup = renderCollapsibleAccordionGroup({
                    showHeaderIcon: "left"
                });
                const headerButton = getFocusedHeaderButton(accordionGroup);

                expect(headerButton.className).toContain("widget-accordion-group-header-button-icon-left");
            });

            it("doesn't render the icon when set to not visible", () => {
                const accordionGroup = renderCollapsibleAccordionGroup({
                    showHeaderIcon: "no"
                });

                expect(accordionGroup.asFragment()).toMatchSnapshot();
            });
        });
    });

    describe("not collapsible", () => {
        it("renders the content when the group is visible and not collapsed", () => {
            const accordionGroup = renderAccordionGroup({
                collapsed: false
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("renders the content when the group becomes visible dynamically", () => {
            const accordionGroup = renderAccordionGroup({
                collapsed: false,
                visible: false
            });

            act(() => {
                accordionGroup.rerender(<AccordionGroup {...defaultAccordionGroupProps} visible collapsed={false} />);
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });
    });

    describe("loadContent behaviour", () => {
        it("renders widgets when 'loadContent' is set 'always'", () => {
            const accordionGroup = renderAccordionGroup({
                collapsible: true,
                content: <div>Widgets</div>,
                loadContent: "always"
            });

            expect(accordionGroup.getByText("Widgets")).toBeInTheDocument();
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("doesn't render widgets when 'loadContent' is set 'whenExpanded'", () => {
            const accordionGroup = renderAccordionGroup({
                collapsible: true,
                content: <div>Widgets</div>,
                loadContent: "whenExpanded"
            });

            expect(accordionGroup.queryByText("Widgets")).not.toBeInTheDocument();
            expect(accordionGroup.asFragment()).toMatchSnapshot();
        });

        it("render widgets when 'loadContent' is set 'whenExpanded' and 'collapsed' is set to false", () => {
            const accordionGroup = renderAccordionGroup({
                collapsible: true,
                content: <div>Widgets</div>,
                loadContent: "whenExpanded",
                collapsed: false
            });

            expect(accordionGroup.getByText("Widgets")).toBeInTheDocument();
        });

        it("keep widgets rendered when 'loadContent' is 'whenExpanded' and 'collapsed' prop becomes true", () => {
            const accordionGroup = renderAccordionGroup({
                collapsible: true,
                content: <div>Widgets</div>,
                loadContent: "whenExpanded",
                collapsed: true
            });

            expect(accordionGroup.queryByText("Widgets")).not.toBeInTheDocument();

            act(() => {
                accordionGroup.rerender(
                    <AccordionGroup
                        {...defaultAccordionGroupProps}
                        collapsible
                        content={<div>Widgets</div>}
                        loadContent="whenExpanded"
                        collapsed={false}
                    />
                );
            });

            expect(accordionGroup.queryByText("Widgets")).toBeInTheDocument();

            act(() => {
                accordionGroup.rerender(
                    <AccordionGroup
                        {...defaultAccordionGroupProps}
                        collapsible
                        content={<div>Widgets</div>}
                        loadContent="whenExpanded"
                        collapsed
                    />
                );
            });

            expect(accordionGroup.queryByText("Widgets")).toBeInTheDocument();
        });
    });

    describe("animated", () => {
        const animatedProps: AccordionGroupProps = {
            ...defaultAccordionGroupProps,
            animateContent: true,
            collapsible: true,
            toggleCollapsed: jest.fn()
        };

        function mockTransitionDuration(duration: string): void {
            const original = window.getComputedStyle;
            jest.spyOn(window, "getComputedStyle").mockImplementation(element => {
                const style = original(element);
                return { ...style, transitionDuration: duration, transitionDelay: "0s" } as CSSStyleDeclaration;
            });
        }

        function getGroup(result: RenderResult): HTMLElement {
            return result.container.querySelector(".widget-accordion-group") as HTMLElement;
        }

        function fireTransitionEnd(element: Element, propertyName = "grid-template-rows"): void {
            const event = createEvent.transitionEnd(element);
            Object.defineProperty(event, "propertyName", { value: propertyName });
            fireEvent(element, event);
        }

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.restoreAllMocks();
            jest.useRealTimers();
        });

        it("expands with a transition and completes on transitionend", () => {
            mockTransitionDuration("0.2s");
            const onToggleCompletion = jest.fn();
            const result = render(<AccordionGroup {...animatedProps} onToggleCompletion={onToggleCompletion} />);

            result.rerender(
                <AccordionGroup {...animatedProps} collapsed={false} onToggleCompletion={onToggleCompletion} />
            );
            const group = getGroup(result);
            expect(group).toHaveClass("widget-accordion-group-expanding");
            expect(group).not.toHaveClass("widget-accordion-group-collapsed");
            expect(onToggleCompletion).not.toHaveBeenCalled();

            act(() => fireTransitionEnd(group));

            expect(group).not.toHaveClass("widget-accordion-group-expanding");
            expect(onToggleCompletion).toHaveBeenCalledTimes(1);
            expect(onToggleCompletion).toHaveBeenCalledWith(false);

            act(() => jest.runAllTimers());
            expect(onToggleCompletion).toHaveBeenCalledTimes(1);
        });

        it("collapses with a transition and completes on transitionend", () => {
            mockTransitionDuration("0.2s");
            const onToggleCompletion = jest.fn();
            const result = render(
                <AccordionGroup {...animatedProps} collapsed={false} onToggleCompletion={onToggleCompletion} />
            );

            result.rerender(<AccordionGroup {...animatedProps} collapsed onToggleCompletion={onToggleCompletion} />);
            const group = getGroup(result);
            expect(group).toHaveClass("widget-accordion-group-collapsing");
            expect(group).not.toHaveClass("widget-accordion-group-collapsed");

            act(() => fireTransitionEnd(group));

            expect(group).toHaveClass("widget-accordion-group-collapsed");
            expect(group).not.toHaveClass("widget-accordion-group-collapsing");
            expect(onToggleCompletion).toHaveBeenCalledTimes(1);
            expect(onToggleCompletion).toHaveBeenCalledWith(true);
        });

        it("ignores transitionend events from other properties and from the content", () => {
            mockTransitionDuration("0.2s");
            const onToggleCompletion = jest.fn();
            const result = render(<AccordionGroup {...animatedProps} onToggleCompletion={onToggleCompletion} />);
            result.rerender(
                <AccordionGroup {...animatedProps} collapsed={false} onToggleCompletion={onToggleCompletion} />
            );
            const group = getGroup(result);

            act(() => {
                fireTransitionEnd(group, "border-radius");
                fireTransitionEnd(result.getByText("content"));
            });

            expect(group).toHaveClass("widget-accordion-group-expanding");
            expect(onToggleCompletion).not.toHaveBeenCalled();
        });

        it("completes when transitionend does not fire", () => {
            mockTransitionDuration("0.2s");
            const onToggleCompletion = jest.fn();
            const result = render(<AccordionGroup {...animatedProps} onToggleCompletion={onToggleCompletion} />);
            result.rerender(
                <AccordionGroup {...animatedProps} collapsed={false} onToggleCompletion={onToggleCompletion} />
            );

            act(() => jest.advanceTimersByTime(400));

            expect(getGroup(result)).not.toHaveClass("widget-accordion-group-expanding");
            expect(onToggleCompletion).toHaveBeenCalledTimes(1);
        });

        it("completes immediately when there is no transition, such as with reduced motion", () => {
            mockTransitionDuration("0s");
            const onToggleCompletion = jest.fn();
            const result = render(
                <AccordionGroup {...animatedProps} collapsed={false} onToggleCompletion={onToggleCompletion} />
            );

            result.rerender(<AccordionGroup {...animatedProps} collapsed onToggleCompletion={onToggleCompletion} />);

            const group = getGroup(result);
            expect(group).toHaveClass("widget-accordion-group-collapsed");
            expect(group).not.toHaveClass("widget-accordion-group-collapsing");
            expect(onToggleCompletion).toHaveBeenCalledTimes(1);
        });

        it("renders content from the start of expanding when loading content when expanded", () => {
            mockTransitionDuration("0.2s");
            const result = render(<AccordionGroup {...animatedProps} loadContent="whenExpanded" />);
            expect(result.queryByText("content")).not.toBeInTheDocument();

            result.rerender(<AccordionGroup {...animatedProps} loadContent="whenExpanded" collapsed={false} />);

            expect(getGroup(result)).toHaveClass("widget-accordion-group-expanding");
            expect(result.getByText("content")).toBeInTheDocument();
        });
    });
});
