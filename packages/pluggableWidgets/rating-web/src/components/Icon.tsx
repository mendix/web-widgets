import { Icon as InternalIcon } from "@mendix/pluggable-widgets-commons/components/web";
import classNames from "classnames";
import { WebIcon } from "mendix";
import { ReactElement, createElement } from "react";
import { StarIcon } from "./StarIcon";

interface IconProps {
    animate?: boolean;
    empty?: boolean;
    full?: boolean;
    value?: WebIcon;
}

export function Icon({ animate, empty, full, value }: IconProps): ReactElement {
    let className;
    if (value?.type === "icon") {
        className = classNames("rating-icon", { "rating-icon-empty": empty, "rating-icon-full": full, animate });
        return <StarIcon className={className} empty={empty} full={full} />;
    }
    if (value?.type === "image") {
        className = classNames("rating-image", {
            "rating-image-empty": empty,
            "rating-image-full": full,
            animate
        });
    }
    return <InternalIcon icon={value} className={className} fallback={<div />} />;
}
