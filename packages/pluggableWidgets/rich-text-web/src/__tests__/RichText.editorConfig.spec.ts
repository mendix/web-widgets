import { checkDeltaPersistenceConfiguration, DeltaEditorConfigValues } from "../utils/deltaEditorConfig";

describe("delta editor config", () => {
    function createPreviewProps(props: Partial<DeltaEditorConfigValues>): DeltaEditorConfigValues {
        return {
            enableDelta: false,
            deltaAttribute: "",
            ...props
        };
    }

    it("returns no Delta error when Delta persistence is disabled", () => {
        expect(
            checkDeltaPersistenceConfiguration(createPreviewProps({ enableDelta: false, deltaAttribute: "" }))
        ).toEqual([]);
    });

    it("returns a Delta attribute error when Delta persistence is enabled without an attribute", () => {
        expect(
            checkDeltaPersistenceConfiguration(createPreviewProps({ enableDelta: true, deltaAttribute: "" }))
        ).toEqual([
            {
                property: "deltaAttribute",
                message: "Select a string attribute for Delta persistence, or disable Delta persistence."
            }
        ]);
    });

    it("returns no Delta error when Delta persistence is enabled with an attribute", () => {
        expect(
            checkDeltaPersistenceConfiguration(
                createPreviewProps({ enableDelta: true, deltaAttribute: "MyModule.Entity.delta" })
            )
        ).toEqual([]);
    });
});
