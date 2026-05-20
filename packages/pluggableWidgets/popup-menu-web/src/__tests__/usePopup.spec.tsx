import { useHover } from "@floating-ui/react";
import { renderHook } from "@testing-library/react";
import { usePopup } from "../hooks/usePopup";

jest.mock("@floating-ui/react", () => ({
    ...jest.requireActual("@floating-ui/react"),
    useHover: jest.fn()
}));

describe("usePopup", () => {
    const mockUseHover = useHover as jest.MockedFunction<typeof useHover>;
    const mockOnOpenChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseHover.mockReturnValue({});
    });

    describe("basic functionality", () => {
        it("returns open state when false", () => {
            const { result } = renderHook(() =>
                usePopup({
                    open: false,
                    onOpenChange: mockOnOpenChange,
                    trigger: "onclick",
                    clippingStrategy: "absolute",
                    placement: "top",
                    hoverCloseOn: "onClickOutside"
                })
            );

            expect(result.current.open).toBe(false);
        });

        it("returns open state when true", () => {
            const { result } = renderHook(() =>
                usePopup({
                    open: true,
                    onOpenChange: mockOnOpenChange,
                    trigger: "onclick",
                    clippingStrategy: "absolute",
                    placement: "bottom",
                    hoverCloseOn: "onHoverLeave"
                })
            );

            expect(result.current.open).toBe(true);
        });

        it("returns nodeId", () => {
            const { result } = renderHook(() =>
                usePopup({
                    open: true,
                    onOpenChange: mockOnOpenChange,
                    trigger: "onclick",
                    clippingStrategy: "absolute",
                    placement: "bottom",
                    hoverCloseOn: "onHoverLeave"
                })
            );

            expect(result.current.nodeId).toBeDefined();
            expect(typeof result.current.nodeId).toBe("string");
        });

        it("returns required floating UI properties", () => {
            const { result } = renderHook(() =>
                usePopup({
                    open: true,
                    onOpenChange: mockOnOpenChange,
                    trigger: "onclick",
                    clippingStrategy: "fixed",
                    placement: "top",
                    hoverCloseOn: "onHoverLeave"
                })
            );

            expect(result.current.context).toBeDefined();
            expect(result.current.floatingStyles).toBeDefined();
            expect(result.current.refs).toBeDefined();
            expect(result.current.getReferenceProps).toBeDefined();
            expect(result.current.getFloatingProps).toBeDefined();
        });
    });

    describe("hover interaction with hoverCloseOn", () => {
        it("disables hover when trigger is onclick", () => {
            renderHook(() =>
                usePopup({
                    open: false,
                    onOpenChange: mockOnOpenChange,
                    trigger: "onclick",
                    clippingStrategy: "absolute",
                    placement: "bottom",
                    hoverCloseOn: "onHoverLeave"
                })
            );

            expect(mockUseHover).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    enabled: false
                })
            );
        });

        it("enables hover when trigger is onhover", () => {
            renderHook(() =>
                usePopup({
                    open: false,
                    onOpenChange: mockOnOpenChange,
                    trigger: "onhover",
                    clippingStrategy: "absolute",
                    placement: "bottom",
                    hoverCloseOn: "onHoverLeave"
                })
            );

            expect(mockUseHover).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    enabled: true
                })
            );
        });
    });
});
