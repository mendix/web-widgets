import { Container, injected } from "brandi";
import {
    createSetPageAction,
    createSetPageSizeAction,
    currentPageAtom,
    customPaginationAtom,
    dynamicPageAtom,
    dynamicPageSizeAtom,
    DynamicPaginationFeature,
    PageControlService,
    pageSizeAtom,
    PaginationViewModel
} from "@mendix/widget-plugin-grid/pagination/main";
import { GridSizeStore } from "./GridSize.store";
import { paginationConfig } from "./pagination.config";
import { PAGINATION_TOKENS as PAGINATION } from "./tokens";
import { BindingGroup } from "../core/binding-group";
import { CORE_TOKENS as CORE } from "../core/tokens";
import { DATASOURCE_TOKENS as DATASOURCE } from "../datasource/tokens";

export const paginationBindings: BindingGroup = {
    inject() {
        injected(
            GridSizeStore,
            CORE.atoms.hasMoreItems,
            PAGINATION.paginationConfig,
            PAGINATION.setPageAction,
            PAGINATION.pageSize,
            CORE.atoms.visibleColumnsCount
        );
        injected(
            createSetPageAction,
            DATASOURCE.query,
            PAGINATION.paginationConfig,
            PAGINATION.currentPage,
            PAGINATION.pageSize
        );
        injected(
            createSetPageSizeAction,
            DATASOURCE.query,
            PAGINATION.paginationConfig,
            PAGINATION.currentPage,
            CORE.pageSizeStore,
            PAGINATION.setPageAction
        );
        injected(currentPageAtom, DATASOURCE.query, PAGINATION.pageSize, PAGINATION.paginationConfig);
        injected(dynamicPageAtom, CORE.mainGate, PAGINATION.paginationConfig);
        injected(dynamicPageSizeAtom, CORE.mainGate);
        injected(PageControlService, CORE.mainGate, PAGINATION.setPageSizeAction, PAGINATION.setPageAction);
        injected(pageSizeAtom, CORE.pageSizeStore);
        injected(
            PaginationViewModel,
            PAGINATION.paginationConfig,
            DATASOURCE.query,
            PAGINATION.currentPage,
            PAGINATION.pageSize,
            PAGINATION.setPageAction
        );
        injected(
            DynamicPaginationFeature,
            CORE.setupService,
            PAGINATION.paginationConfig,
            PAGINATION.dynamicPage,
            PAGINATION.dynamicPageSize,
            CORE.atoms.totalCount,
            PAGINATION.currentPage,
            CORE.atoms.itemCount,
            CORE.mainGate,
            PAGINATION.pageControl
        );
        injected(customPaginationAtom, CORE.mainGate);
    },
    define(container: Container) {
        container.bind(PAGINATION.gridSizeStore).toInstance(GridSizeStore).inSingletonScope();
        container.bind(PAGINATION.currentPage).toInstance(currentPageAtom).inTransientScope();
        container.bind(PAGINATION.customPagination).toInstance(customPaginationAtom).inTransientScope();
        container.bind(PAGINATION.dynamicPage).toInstance(dynamicPageAtom).inTransientScope();
        container.bind(PAGINATION.dynamicPageSize).toInstance(dynamicPageSizeAtom).inTransientScope();
        container.bind(PAGINATION.dynamicPagination).toInstance(DynamicPaginationFeature).inSingletonScope();
        container.bind(PAGINATION.pageSize).toInstance(pageSizeAtom).inTransientScope();
        container.bind(PAGINATION.pageControl).toInstance(PageControlService).inSingletonScope();
        container.bind(PAGINATION.paginationVM).toInstance(PaginationViewModel).inSingletonScope();
        container.bind(PAGINATION.setPageAction).toInstance(createSetPageAction).inSingletonScope();
        container.bind(PAGINATION.setPageSizeAction).toInstance(createSetPageSizeAction).inSingletonScope();
    },
    init(container, { props }) {
        const config = paginationConfig(props);
        container.bind(PAGINATION.paginationConfig).toConstant(config);
        container.bind(CORE.initPageSize).toConstant(config.initPageSize);
    },
    postInit(container) {
        const config = container.get(PAGINATION.paginationConfig);
        const query = container.get(DATASOURCE.query);
        query.requestTotalCount(config.requestTotalCount);
        // Use the resolved initPageSize (dynamic value if provided, else constPageSize)
        // so the very first datasource fetch uses the correct limit.
        query.setBaseLimit(container.get(CORE.initPageSize));
        container.get(PAGINATION.dynamicPagination); // Enable dynamic pagination feature
    }
};
