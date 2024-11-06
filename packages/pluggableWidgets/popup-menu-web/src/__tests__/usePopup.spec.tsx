import { renderHook } from "@testing-library/react";

import { usePopup } from "../hooks/usePopup";

describe("usePopup", () => {
    it("somethign", () => {
        const popup = renderHook(() => {
            return usePopup({ open: false, onOpenChange: jest.fn(), trigger: "onclick", clippingStrategy: "absolute" });
        });

        expect(popup.result.current.open).toBe(false);
    });
});
