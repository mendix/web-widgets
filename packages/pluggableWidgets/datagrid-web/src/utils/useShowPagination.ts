import { useMemo, useEffect } from "react";
import { PaginationEnum, ShowPagingButtonsEnum } from "../../typings/DatagridProps";

interface ShowPaginationProps {
    pagination: PaginationEnum;
    showPagingButtonsOrRows: ShowPagingButtonsEnum | boolean;
    totalCount?: number;
    limit: number;
    requestTotalCount: (needTotalCount: boolean) => void;
}

export const useShowPagination = (props: ShowPaginationProps): boolean => {
    const { pagination, showPagingButtonsOrRows, totalCount, limit, requestTotalCount } = props;

    useEffect(() => {
        if (pagination !== "buttons" && showPagingButtonsOrRows) {
            requestTotalCount(true);
        }
    }, [pagination]);

    return useMemo(() => {
        return (
            showPagingButtonsOrRows === true ||
            showPagingButtonsOrRows === "always" ||
            (showPagingButtonsOrRows === "auto" && (totalCount ? totalCount > limit : false))
        );
    }, [pagination, showPagingButtonsOrRows, totalCount, limit]);
};
