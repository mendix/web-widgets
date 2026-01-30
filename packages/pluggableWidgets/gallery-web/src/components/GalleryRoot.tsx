import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { useGalleryRootVM } from "../model/hooks/injection-hooks";

export const GalleryRoot = observer(function GalleryRoot(props: PropsWithChildren): ReactElement {
    const { children } = props;
    const vm = useGalleryRootVM();

    return (
        <div className={classNames("widget-gallery", vm.className)} style={vm.style} data-focusindex={vm.tabIndex}>
            {children}
        </div>
    );
});
