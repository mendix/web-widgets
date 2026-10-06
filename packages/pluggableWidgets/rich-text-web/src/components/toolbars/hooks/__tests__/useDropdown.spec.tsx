import { act, fireEvent, renderHook, RenderHookResult } from "@testing-library/react";
import { useDropdown, UseDropdownOptions, UseDropdownReturn } from "../useDropdown";

// Contract: while open, a mousedown outside both the reference and the floating element
// closes the dropdown. The document listener exists only while open and is removed on
// close/unmount.
describe("useDropdown click-outside handling", () => {
    let reference: HTMLButtonElement;
    let floating: HTMLDivElement;
    let outside: HTMLDivElement;

    beforeEach(() => {
        reference = document.createElement("button");
        floating = document.createElement("div");
        floating.appendChild(document.createElement("span"));
        outside = document.createElement("div");
        document.body.append(reference, floating, outside);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.restoreAllMocks();
    });

    function setup(initial: UseDropdownOptions): RenderHookResult<UseDropdownReturn, UseDropdownOptions> {
        const hook = renderHook((props: UseDropdownOptions) => useDropdown(props), { initialProps: initial });
        act(() => {
            hook.result.current.refs.setReference(reference);
            hook.result.current.refs.setFloating(floating);
        });
        return hook;
    }

    it("calls onClose on mousedown outside both reference and floating element", () => {
        const onClose = jest.fn();
        setup({ isOpen: true, onClose });

        fireEvent.mouseDown(outside);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose on mousedown inside the floating element", () => {
        const onClose = jest.fn();
        setup({ isOpen: true, onClose });

        fireEvent.mouseDown(floating.firstChild as HTMLElement);
        fireEvent.mouseDown(floating);

        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose on mousedown on the reference element", () => {
        const onClose = jest.fn();
        setup({ isOpen: true, onClose });

        fireEvent.mouseDown(reference);

        expect(onClose).not.toHaveBeenCalled();
    });

    it("registers no mousedown listener while closed", () => {
        const addSpy = jest.spyOn(document, "addEventListener");
        const onClose = jest.fn();
        setup({ isOpen: false, onClose });

        fireEvent.mouseDown(outside);

        expect(addSpy).not.toHaveBeenCalledWith("mousedown", expect.any(Function));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("removes the mousedown listener when closed after being open", () => {
        const removeSpy = jest.spyOn(document, "removeEventListener");
        const onClose = jest.fn();
        const hook = setup({ isOpen: true, onClose });

        hook.rerender({ isOpen: false, onClose });
        fireEvent.mouseDown(outside);

        expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("removes the same mousedown listener on unmount", () => {
        const addSpy = jest.spyOn(document, "addEventListener");
        const removeSpy = jest.spyOn(document, "removeEventListener");
        const onClose = jest.fn();
        const hook = setup({ isOpen: true, onClose });

        const added = addSpy.mock.calls.filter(([type]) => type === "mousedown").map(([, fn]) => fn);
        expect(added).toHaveLength(1);

        hook.unmount();

        expect(removeSpy).toHaveBeenCalledWith("mousedown", added[0]);
        fireEvent.mouseDown(outside);
        expect(onClose).not.toHaveBeenCalled();
    });
});
