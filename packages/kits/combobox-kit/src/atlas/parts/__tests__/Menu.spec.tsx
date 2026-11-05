import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { Menu } from "../Menu";

const baseProps = { menuProps: {} };

describe("Menu", () => {
    it("applies floating styles to the menu when open and not alwaysOpen", () => {
        const floatingRef = createRef<HTMLDivElement>();
        const { container } = render(
            <Menu
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
            <Menu
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

    it("marks an open menu with data-open and a closed one with nothing", () => {
        const closed = render(<Menu {...baseProps} isOpen={false} />);
        expect(closed.container.querySelector(".widget-combobox-menu")).not.toHaveAttribute("data-open");

        const open = render(<Menu {...baseProps} isOpen />);
        expect(open.container.querySelector(".widget-combobox-menu")).toHaveAttribute("data-open", "true");
    });
});
