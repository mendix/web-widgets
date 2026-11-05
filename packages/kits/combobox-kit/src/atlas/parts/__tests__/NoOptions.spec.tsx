import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ComboboxViewModel } from "../../../core/ComboboxViewModel";
import { NoOptions } from "../NoOptions";

function vmWithNoOptionsText(text: string): ComboboxViewModel {
    return { t: (key: string) => (key === "noOptions" ? text : "") } as unknown as ComboboxViewModel;
}

describe("NoOptions", () => {
    it("does not expose an empty option when there is no no-options text", () => {
        const { container } = render(<NoOptions vm={vmWithNoOptionsText("")} />);

        expect(container.querySelector('[role="option"]')).toBeNull();
    });

    it("does not expose an empty option when the no-options text is only whitespace", () => {
        const { container } = render(<NoOptions vm={vmWithNoOptionsText("   ")} />);

        expect(container.querySelector('[role="option"]')).toBeNull();
    });

    it("exposes the no-options text as an option when it is set", () => {
        const { getByRole } = render(<NoOptions vm={vmWithNoOptionsText("No options")} />);

        expect(getByRole("option")).toHaveTextContent("No options");
    });
});
