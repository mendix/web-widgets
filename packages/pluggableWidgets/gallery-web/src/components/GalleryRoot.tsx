import classNames from "classnames";
import { ReactElement, createElement } from "react";

export type GalleryRootProps = Omit<JSX.IntrinsicElements["div"], "ref"> & {
    selectable?: boolean;
};

export function GalleryRoot(props: GalleryRootProps): ReactElement {
    const { className, selectable, children, ...rest } = props;

    return (
        <div
            className={classNames(
                "widget-gallery",
                {
                    "widget-gallery-selectable": selectable
                },
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
}
