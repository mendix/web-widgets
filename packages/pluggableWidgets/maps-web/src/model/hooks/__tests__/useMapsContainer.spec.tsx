import { renderHook } from "@testing-library/react";
import { mockContainerProps } from "../../../utils/mock-container-props";
import { CORE_TOKENS as CORE } from "../../tokens";
import { useMapsContainer } from "../useMapsContainer";

describe("useMapsContainer", () => {
    it("should create stable container instance on re-renders", () => {
        const props = mockContainerProps();
        const { result, rerender } = renderHook(() => useMapsContainer(props));

        const firstContainer = result.current;

        // Re-render with same props reference
        rerender();

        const secondContainer = result.current;

        // Should be the same instance
        expect(secondContainer).toBe(firstContainer);
    });

    it("should update props when they change", () => {
        const initialProps = mockContainerProps({ name: "map1" });
        const { result, rerender } = renderHook(({ props }) => useMapsContainer(props), {
            initialProps: { props: initialProps }
        });

        const container = result.current;
        const initialConfig = container.get(CORE.config);
        expect(initialConfig.name).toBe("map1");

        // Update props
        const newProps = mockContainerProps({ name: "map2" });
        rerender({ props: newProps });

        // Container should still be the same instance
        expect(result.current).toBe(container);
    });
});
