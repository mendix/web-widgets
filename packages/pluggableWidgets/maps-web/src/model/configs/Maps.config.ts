import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { MapsContainerProps } from "../../../typings/MapsProps";

export interface MapsConfig {
    id: string;
    name: string;
    showCurrentLocation: boolean;
}

export function mapsConfig(props: MapsContainerProps): MapsConfig {
    const id = `${props.name}:Maps@${generateUUID()}`;

    return {
        id,
        name: props.name,
        showCurrentLocation: props.showCurrentLocation
    };
}
