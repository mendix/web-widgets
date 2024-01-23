import { useEffect, useMemo } from "react";
import { GalleryContainerProps, GalleryPreviewProps } from "../../typings/GalleryProps";
import { ClickActionHelper } from "./ClickActionHelper";

export function useClickActionHelper(
    props: Pick<GalleryContainerProps | GalleryPreviewProps, "onClick">
): ClickActionHelper {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const clickActionHelper = useMemo(() => new ClickActionHelper(props.onClick), []);

    useEffect(() => {
        clickActionHelper.update(props.onClick);
    });

    return clickActionHelper;
}
