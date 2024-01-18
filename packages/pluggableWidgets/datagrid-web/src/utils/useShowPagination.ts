import { useMemo } from "react";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../typings/DatagridProps";

interface ShowPaginationProps {
    pagination: PaginationEnum;
    showPagingButtons: ShowPagingButtonsEnum;
    totalCount?: number;
    limit: number;
}

export const useShowPagination = (props: ShowPaginationProps): boolean => {
    const { pagination, showPagingButtons, totalCount, limit } = props;
    return useMemo(() => {
        return (
            pagination === "buttons" &&
            (showPagingButtons === "always" ||
                (showPagingButtons === "auto" && (totalCount ? totalCount > limit : false)))
        );
    }, [pagination, showPagingButtons, totalCount, limit]);
};
