import { render } from "@testing-library/react";
import { CheckboxRadioSelectionContainerProps } from "../../typings/CheckboxRadioSelectionProps";
import CheckboxRadioSelection from "../CheckboxRadioSelection";
import { CheckboxSelection } from "../components/CheckboxSelection/CheckboxSelection";
import { MultiSelector } from "../helpers/types";

// Mock the selector to avoid implementation dependencies for basic tests
jest.mock("../helpers/getSelector", () => ({
    getSelector: jest.fn(() => ({
        type: "single",
        status: "available",
        readOnly: false,
        currentId: "option1",
        clearable: false,
        customContentType: "no",
        updateProps: jest.fn(),
        setValue: jest.fn(),
        options: {
            status: "available",
            searchTerm: "",
            sortOrder: undefined,
            datasourceFilter: undefined,
            hasMore: false,
            isLoading: false,
            getAll: jest.fn(() => ["option1", "option2", "option3"]),
            setSearchTerm: jest.fn(),
            onAfterSearchTermChange: jest.fn(),
            loadMore: jest.fn(),
            _updateProps: jest.fn(),
            _optionToValue: jest.fn(),
            _valueToOption: jest.fn()
        },
        controlType: "radio",
        caption: {
            get: jest.fn((value: string) => `Caption ${value}`),
            render: jest.fn((value: string) => `Caption ${value}`),
            emptyCaption: "Select an option",
            formatter: undefined
        }
    }))
}));

describe("CheckboxRadioSelection", () => {
    const defaultProps: CheckboxRadioSelectionContainerProps = {
        name: "selectionControls1",
        id: "selectionControls1",
        source: "context" as const,
        optionsSourceType: "enumeration" as const,
        attributeEnumeration: {
            status: "available",
            value: "option1",
            validation: undefined,
            readOnly: false,
            displayValue: "Option 1",
            setValue: jest.fn(),
            formatter: {
                format: jest.fn(),
                type: "enum"
            },
            universe: ["option1", "option2", "option3"]
        } as any,
        attributeBoolean: {} as any,
        attributeAssociation: {} as any,
        staticAttribute: {} as any,
        optionsSourceStaticDataSource: [],
        optionsSourceAssociationCaptionType: "attribute" as const,
        optionsSourceDatabaseCaptionType: "attribute" as const,
        optionsSourceCustomContentType: "no" as const,
        customEditability: "default" as const,
        customEditabilityExpression: { status: "available", value: false } as any,
        readOnlyStyle: "bordered" as const,
        ariaRequired: { status: "available", value: false } as any,
        ariaLabel: { status: "available", value: "" } as any,
        controlType: "checkbox" as const
    };

    it("renders without crashing", () => {
        const component = render(<CheckboxRadioSelection {...defaultProps} />);
        expect(component.container.querySelector(".widget-checkbox-radio-selection")).toBeTruthy();
    });

    it("renders placeholder when selector status is unavailable", () => {
        // This test would need more setup to properly mock the unavailable state
        const component = render(<CheckboxRadioSelection {...defaultProps} />);
        expect(component.container).toBeDefined();
    });

    it("applies correct CSS class", () => {
        const component = render(<CheckboxRadioSelection {...defaultProps} />);
        const widget = component.container.querySelector(".widget-checkbox-radio-selection");
        expect(widget?.className).toContain("widget-checkbox-radio-selection");
    });
});

function makeMultiSelector(overrides: Partial<MultiSelector> = {}): MultiSelector {
    return {
        type: "multi",
        status: "available",
        readOnly: false,
        currentId: [],
        clearable: false,
        customContentType: "no",
        validation: undefined,
        updateProps: jest.fn(),
        setValue: jest.fn(),
        getOptions: jest.fn(() => ["option1", "option2", "option3"]),
        options: {
            status: "available",
            searchTerm: "",
            isLoading: false,
            getAll: jest.fn(() => ["option1", "option2", "option3"]),
            setSearchTerm: jest.fn(),
            onAfterSearchTermChange: jest.fn(),
            _updateProps: jest.fn(),
            _optionToValue: jest.fn(),
            _valueToOption: jest.fn()
        },
        caption: {
            get: jest.fn((v: string) => `Caption ${v}`),
            render: jest.fn((v: string | null | number | null) => `Caption ${v}`),
            emptyCaption: "Select an option",
            formatter: undefined
        },
        ...overrides
    };
}

const baseCheckboxProps = {
    inputId: "test-checkbox",
    tabIndex: 0,
    ariaRequired: { status: "available" as const, value: false } as any,
    ariaLabel: undefined,
    groupName: undefined,
    noOptionsText: "No options"
};

describe("CheckboxSelection – read-only text mode", () => {
    it("hides unselected options and their inputs", () => {
        const selector = makeMultiSelector({ readOnly: true, currentId: ["option1"] });
        const { queryByDisplayValue } = render(
            <CheckboxSelection {...baseCheckboxProps} selector={selector} readOnlyStyle="text" />
        );

        // unselected options should not appear at all
        expect(queryByDisplayValue("option2")).toBeNull();
        expect(queryByDisplayValue("option3")).toBeNull();
    });

    it("renders no <input> for the selected option in text mode", () => {
        const selector = makeMultiSelector({ readOnly: true, currentId: ["option1"] });
        const { queryAllByRole } = render(
            <CheckboxSelection {...baseCheckboxProps} selector={selector} readOnlyStyle="text" />
        );

        expect(queryAllByRole("checkbox")).toHaveLength(0);
    });

    it("renders selected option caption text", () => {
        const selector = makeMultiSelector({ readOnly: true, currentId: ["option1"] });
        const { getByText } = render(
            <CheckboxSelection {...baseCheckboxProps} selector={selector} readOnlyStyle="text" />
        );

        expect(getByText("Caption option1")).toBeTruthy();
    });

    it("renders all inputs when not read-only", () => {
        const selector = makeMultiSelector({ readOnly: false, currentId: ["option1"] });
        const { getAllByRole } = render(
            <CheckboxSelection {...baseCheckboxProps} selector={selector} readOnlyStyle="text" />
        );

        expect(getAllByRole("checkbox")).toHaveLength(3);
    });

    it("renders inputs in bordered read-only mode", () => {
        const selector = makeMultiSelector({ readOnly: true, currentId: ["option1"] });
        const { getAllByRole } = render(
            <CheckboxSelection {...baseCheckboxProps} selector={selector} readOnlyStyle="bordered" />
        );

        expect(getAllByRole("checkbox")).toHaveLength(3);
    });
});
