import { renderHook } from "@testing-library/react";
import { Container } from "brandi";
import { ContainerProvider } from "brandi-react";
import { ReactNode } from "react";
import { createGalleryContainer } from "../../model/containers/createGalleryContainer";
import { useGalleryRootVM } from "../../model/hooks/injection-hooks";
import { mockContainerProps } from "../../utils/mock-container-props";

/** Function to bind hook context to provided container. */
const withContainer = (ct: Container) => {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <ContainerProvider container={ct} isolated>
                {children}
            </ContainerProvider>
        );
    };
};

describe("GalleryRootViewModel", () => {
    it("should return className, style and tabIndex from props", () => {
        const props = mockContainerProps();
        const [container] = createGalleryContainer({ ...props, tabIndex: 2, style: { color: "red" } });
        const { result } = renderHook(() => useGalleryRootVM(), { wrapper: withContainer(container) });
        expect(result.current.className).toBe("gallery-test-class");
        expect(result.current.style).toMatchObject({ color: "red" });
        expect(result.current.tabIndex).toBe(2);
    });

    it("should change className, when gate props change", () => {
        const props = mockContainerProps();
        const [container, gate] = createGalleryContainer({ ...props, class: "initial-class" });
        const { result } = renderHook(() => useGalleryRootVM(), { wrapper: withContainer(container) });
        expect(result.current.className).toBe("initial-class");

        gate.setProps({ ...props, class: "updated-class" });
        expect(result.current.className).toBe("updated-class");
    });
});
