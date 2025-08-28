import "@testing-library/jest-dom";
import { actionValue, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { fireEvent, render } from "@testing-library/react";
import { createElement } from "react";
import { SwitchContainerProps } from "../../typings/SwitchProps";
import { Switch } from "../Switch";

describe("Switch", () => {
    const renderSwitch = (props: SwitchContainerProps) => {
        return render(<Switch {...props} />);
    };
    const createProps = (props?: Partial<SwitchContainerProps>): SwitchContainerProps => {
        const defaultProps: SwitchContainerProps = {
            name: "switch",
            tabIndex: 0,
            id: "com.mendix.widgets.custom.switch1",
            booleanAttribute: new EditableValueBuilder<boolean>().withValue(false).build(),
            action: undefined
        };

        return { ...defaultProps, ...props };
    };

    it("with editable value renders the structure correctly", () => {
        const props = createProps({
            booleanAttribute: new EditableValueBuilder<boolean>().withValue(false).build()
        });
        const { container } = renderSwitch(props);
        expect(container).toMatchSnapshot();
    });

    it("with readonly value renders the structure correctly", () => {
        const props = createProps({
            booleanAttribute: new EditableValueBuilder<boolean>().isReadOnly().withValue(false).build()
        });
        const { container } = renderSwitch(props);
        expect(container).toMatchSnapshot();
    });

    it("without validation message renders correctly", () => {
        const props = createProps({
            booleanAttribute: new EditableValueBuilder<boolean>().withValue(false).build()
        });
        const { queryByRole } = renderSwitch(props);
        expect(queryByRole("alert")).toBeNull();
    });

    it("with validation message renders correctly", () => {
        const props = createProps({
            booleanAttribute: new EditableValueBuilder<boolean>().withValidation("error").withValue(false).build()
        });
        const { container } = renderSwitch(props);
        const alertDiv = container.querySelector(".alert.alert-danger");
        expect(alertDiv).toBeInTheDocument();
        expect(alertDiv?.textContent).toBe("error");
    });

    it("when value is false renders with correct attributes", () => {
        const props = createProps();
        const { container } = renderSwitch(props);
        const wrapper = container.querySelector(".widget-switch-btn-wrapper");
        const button = container.querySelector(".widget-switch-btn");
        expect(wrapper?.classList.contains("un-checked")).toBe(true);
        expect(wrapper?.classList.contains("checked")).toBe(false);
        expect(wrapper?.getAttribute("aria-checked")).toBe("false");
        expect(button?.classList.contains("left")).toBe(true);
        expect(button?.classList.contains("right")).toBe(false);
    });

    it("when value is true renders with correct attributes", () => {
        const props = createProps({ booleanAttribute: new EditableValueBuilder<boolean>().withValue(true).build() });
        const { container } = renderSwitch(props);
        const wrapper = container.querySelector(".widget-switch-btn-wrapper");
        const button = container.querySelector(".widget-switch-btn");
        expect(wrapper?.classList.contains("un-checked")).toBe(false);
        expect(wrapper?.classList.contains("checked")).toBe(true);
        expect(wrapper?.getAttribute("aria-checked")).toBe("true");
        expect(button?.classList.contains("left")).toBe(false);
        expect(button?.classList.contains("right")).toBe(true);
    });

    it("with tabIndex passed renders correctly", () => {
        const props = createProps({ tabIndex: 1 });
        const { container } = renderSwitch(props);
        const wrapper = container.querySelector(".widget-switch-btn-wrapper");
        expect(wrapper?.getAttribute("tabindex")).toEqual("1");
    });

    it("without tabIndex passed renders correctly", () => {
        const props = createProps({ tabIndex: undefined });
        const { container } = renderSwitch(props);
        const wrapper = container.querySelector(".widget-switch-btn-wrapper");
        expect(wrapper?.getAttribute("tabindex")).toEqual("0");
    });

    describe("when editable", () => {
        it("renders elements with correct attributes", () => {
            const props = createProps();
            const { container } = renderSwitch(props);
            const wrapper = container.querySelector(".widget-switch-btn-wrapper");
            expect(wrapper?.classList.contains("disabled")).toBe(false);
            expect(wrapper?.getAttribute("aria-readonly")).toBe("false");
        });

        it("invokes action on click", () => {
            const props = createProps({ action: actionValue() });
            const { container } = renderSwitch(props);
            const wrapper = container.querySelector(".widget-switch-btn-wrapper");
            fireEvent.click(wrapper!);
            expect(props.action?.execute).toHaveBeenCalled();
        });

        it("invokes action on space keydown", () => {
            const props = createProps({ action: actionValue() });
            const { container } = renderSwitch(props);
            const wrapper = container.querySelector(".widget-switch-btn-wrapper");
            fireEvent.keyDown(wrapper!, { key: " " });
            expect(props.action?.execute).toHaveBeenCalled();
        });

        it("shouldn't invoke action on keydown of any key but space", () => {
            const props = createProps({ action: actionValue() });
            const { container } = renderSwitch(props);
            const wrapper = container.querySelector(".widget-switch-btn-wrapper");
            fireEvent.keyDown(wrapper!, { key: "enter" });
            expect(props.action?.execute).not.toHaveBeenCalled();
        });

        describe("when value is available", () => {
            it("toggles the attributes value onClick", () => {
                const props = createProps({
                    booleanAttribute: new EditableValueBuilder<boolean>().withValue(false).build()
                });
                const { container } = renderSwitch(props);
                const button = container.querySelector(".widget-switch-btn");
                fireEvent.click(button!);
                expect(props.booleanAttribute.setValue).toHaveBeenCalled();
                expect(props.booleanAttribute.value).toEqual(true);
                fireEvent.click(button!);
                expect(props.booleanAttribute.setValue).toHaveBeenCalled();
                expect(props.booleanAttribute.value).toEqual(false);
            });

            it("toggles the attribute value on space keydown", () => {
                const props = createProps({
                    booleanAttribute: new EditableValueBuilder<boolean>().withValue(false).build()
                });
                const { container } = renderSwitch(props);
                const button = container.querySelector(".widget-switch-btn");
                fireEvent.keyDown(button!, { key: " " });
                expect(props.booleanAttribute.setValue).toHaveBeenCalled();
                expect(props.booleanAttribute.value).toEqual(true);
                fireEvent.keyDown(button!, { key: " " });
                expect(props.booleanAttribute.setValue).toHaveBeenCalled();
                expect(props.booleanAttribute.value).toEqual(false);
            });

            it("shouldn't toggle the attribute on keydown of any key but space", () => {
                const props = createProps({
                    booleanAttribute: new EditableValueBuilder<boolean>().withValue(false).build()
                });
                const { container } = renderSwitch(props);
                const button = container.querySelector(".widget-switch-btn");
                fireEvent.keyDown(button!, { key: "enter" });
                expect(props.booleanAttribute.setValue).not.toHaveBeenCalled();
            });
        });
    });

    describe("when readonly", () => {
        it("renders elements with correct attributes", () => {
            const props = createProps({ booleanAttribute: new EditableValueBuilder<boolean>().isReadOnly().build() });
            const { container } = renderSwitch(props);
            const wrapper = container.querySelector(".widget-switch-btn-wrapper");
            expect(wrapper?.classList.contains("disabled")).toBe(true);
            expect(wrapper?.getAttribute("aria-readonly")).toBe("true");
        });

        it("shouldn't invoke action", () => {
            const props = createProps({
                booleanAttribute: new EditableValueBuilder<boolean>().isReadOnly().build(),
                action: actionValue()
            });
            const { container } = renderSwitch(props);
            const button = container.querySelector(".widget-switch-btn");
            fireEvent.click(button!);
            expect(props.action?.execute).not.toHaveBeenCalled();
        });

        it("shouldn't change the attributes value", () => {
            const props = createProps({
                booleanAttribute: new EditableValueBuilder<boolean>().isReadOnly().build()
            });
            const { container } = renderSwitch(props);
            const button = container.querySelector(".widget-switch-btn");
            fireEvent.click(button!);
            expect(props.booleanAttribute.setValue).not.toHaveBeenCalled();
        });
    });
});
