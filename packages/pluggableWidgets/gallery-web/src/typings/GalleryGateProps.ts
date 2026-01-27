import { GalleryContainerProps } from "../../typings/GalleryProps";

/** Type to declare props available through main gate. */
export type GalleryGateProps = Pick<
    GalleryContainerProps,
    | "name"
    | "style"
    | "class"
    | "datasource"
    | "tabIndex"
    | "filterSectionTitle"
    | "filtersPlaceholder"
    | "refreshIndicator"
    | "refreshInterval"
    | "selectionCountPosition"
    | "itemSelection"
    | "onSelectionChange"
    | "pagination"
    | "pagingPosition"
    | "showPagingButtons"
    | "pageSize"
    | "showTotalCount"
    | "desktopItems"
    | "tabletItems"
    | "phoneItems"
    | "ariaLabelListBox"
    | "itemClass"
    | "onClick"
    | "content"
    | "ariaLabelItem"
>;
