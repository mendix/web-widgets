import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";

const baseProps = {
    isEmpty: true,
    isLoading: false,
    isOpen: true,
    lazyLoading: false,
    loader: null,
    getMenuProps: (options?: any) => ({ ...options })
};

describe("ComboboxMenuWrapper empty state", () => {
    it("does not expose an empty option when there is no no-options text", () => {
        const { container } = render(<ComboboxMenuWrapper {...baseProps} noOptionsText="" />);

        expect(container.querySelector('[role="option"]')).toBeNull();
    });

    it("exposes the no-options text as an option when it is set", () => {
        const { getByRole } = render(<ComboboxMenuWrapper {...baseProps} noOptionsText="No options" />);

        expect(getByRole("option")).toHaveTextContent("No options");
    });
});
