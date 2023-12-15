import { useUnit } from "effector-react";
import { Column } from "../../helpers/Column";
import { ViewModel } from "../../typings/GridModel";
import { Model } from "./base";

export function useViewModel(model: Model): ViewModel<Column> {
    return useUnit({
        available: model.available,
        columns: model.columns,
        currentPage: model.currentPage,
        filter: model.filter,
        hidden: model.hidden,
        order: model.order,
        size: model.size,
        sort: model.sort,
        visible: model.visible
    });
}
