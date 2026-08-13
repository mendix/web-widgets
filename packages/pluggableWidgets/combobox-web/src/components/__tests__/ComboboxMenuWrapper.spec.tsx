import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { ComboboxMenuWrapper } from "../ComboboxMenuWrapper";

const baseProps = {
    isEmpty: false,
    isLoading: false,
    lazyLoading: false,
    loader: null,
    getMenuProps: (options?: any) => ({ ...options })
};

describe("ComboboxMenuWrapper", () => {
    it("applies floating styles to the menu when open and not alwaysOpen", () => {
        const floatingRef = createRef<HTMLDivElement>();
        const { container } = render(
            <ComboboxMenuWrapper
                {...baseProps}
                isOpen
                floatingRef={floatingRef}
                floatingStyles={{ position: "fixed", top: 10, left: 20 }}
            />
        );

        const menu = container.querySelector(".widget-combobox-menu") as HTMLElement;
        expect(menu.style.position).toBe("fixed");
        expect(menu.style.top).toBe("10px");
        // floating ref is attached so floating-ui can measure/position the element
        expect(floatingRef.current).toBe(menu);
    });

    it("renders inline (position: relative) and ignores floating positioning when alwaysOpen", () => {
        const floatingRef = createRef<HTMLDivElement>();
        const { container } = render(
            <ComboboxMenuWrapper
                {...baseProps}
                isOpen
                alwaysOpen
                floatingRef={floatingRef}
                floatingStyles={{ position: "fixed", top: 10, left: 20 }}
            />
        );

        const menu = container.querySelector(".widget-combobox-menu") as HTMLElement;
        expect(menu.style.position).toBe("relative");
        expect(menu.style.top).toBe("");
        // floating ref must NOT be attached in alwaysOpen mode
        expect(floatingRef.current).toBeNull();
    });
});
