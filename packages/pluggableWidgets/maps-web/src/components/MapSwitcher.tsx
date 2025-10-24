import { PropsWithChildren, ReactElement, ReactNode, useEffect, useState } from "react";
import { GoogleMapContainer, GoogleMapsProps } from "./GoogleMap";
import { LeafletMap, LeafletProps } from "./LeafletMap";

interface SwitcherProps extends GoogleMapsProps, LeafletProps {}

export const MapSwitcher = (props: SwitcherProps): ReactElement => {
    return props.mapProvider === "googleMaps" ? (
        <GoogleMapContainer {...props} />
    ) : (
        <Delayed delay={1000}>
            <LeafletMap {...props} />
        </Delayed>
    );
};

type DelayedProps = {
    delay: number;
} & PropsWithChildren;

const Delayed = ({ children, delay }: DelayedProps): ReactNode => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    return isVisible ? children : null;
};
