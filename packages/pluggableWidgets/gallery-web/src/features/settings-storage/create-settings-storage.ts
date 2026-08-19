import { EditableValue } from "mendix";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { AttributeStorage } from "./AttributeStorage";
import { BrowserStorage } from "./BrowserStorage";
import { ObservableStorage } from "./storage";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

export function createSettingsStorage(
    host: SetupComponentHost,
    gate: DerivedPropsGate<GalleryGateProps>
): ObservableStorage {
    const props = gate.props;

    if (props.stateStorageType === "localStorage") {
        return new BrowserStorage(props.name);
    }

    if (props.stateStorageType === "attribute") {
        if (!props.stateStorageAttr) {
            throw new Error(`Gallery: attribute for settings storage is undefined.`);
        }

        return new AttributeStorage(host, gate as DerivedPropsGate<{ stateStorageAttr: EditableValue<string> }>);
    }

    throw new Error(`Gallery: unknown storage type: ${props.stateStorageType}`);
}
