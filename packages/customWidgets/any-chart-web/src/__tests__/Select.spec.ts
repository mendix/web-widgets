import { shallow } from "enzyme";
import { createElement } from "react";
import { Select, SelectProps } from "../components/Select";

describe("Select", () => {
    let defaultProps: SelectProps;

    beforeEach(() => {
        defaultProps = {
            onChange: jasmine.createSpy("onChange"),
            options: [{ name: "Option 1", value: "option", isDefaultSelected: false }]
        };
    });

    it("should render the structure correctly", () => {
        const switcher = shallow(createElement(Select, defaultProps));

        expect(switcher).toBeElement(
            createElement(
                "select",
                { className: "form-control", onChange: jasmine.any(Function) },
                createElement("option", { value: "option", defaultSelected: false }, "Option 1")
            )
        );
    });

    it("with no options renders no options", () => {
        defaultProps.options = [];
        const switcher = shallow(createElement(Select, defaultProps));

        expect(switcher.find("option").length).toBe(0);
    });

    it("with one option renders one option", () => {
        const switcher = shallow(createElement(Select, defaultProps));

        expect(switcher.find("option").length).toBe(1);
    });

    it("with multiple option renders all specified options", () => {
        defaultProps.options = [
            { name: "Option 1", value: "option1", isDefaultSelected: false },
            { name: "Option 2", value: "option2", isDefaultSelected: true },
            { name: "Option 3", value: "option3", isDefaultSelected: false }
        ];
        const switcher = shallow(createElement(Select, defaultProps));

        expect(switcher.find("option").length).toBe(3);
    });

    xit("should respond to changes in selection", () => {
        // const onChangeSpy = defaultProps.onChange = jasmine.createSpy("onChange");
        const switcher = shallow(createElement(Select, defaultProps));
        const instance = switcher.instance();
        spyOn(instance, "onChange" as any);
        // switcher.simulate("change");

        expect(switcher.simulate("change")).toThrowError(
            "TypeError: Cannot read property 'currentTarget' of undefined"
        );
    });
});
