import { Container, injected } from "brandi";
import { TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ROOT_TOKENS as ROOT } from "./tokens";
import { WidgetRootViewModel } from "./WidgetRoot.viewModel";
import { MainGateProps } from "../typings/MainGateProps";
import { columnsBindings } from "./features/columns/columns.bindings";
import { BindingGroup, CoreInitDependencies } from "./features/core/binding-group";
import { DatagridConfig } from "./features/core/configs/Datagrid.config";
import { CORE_TOKENS as CORE } from "./features/core/tokens";
import { DATA_EXPORT_TOKENS as DATA_EXPORT } from "./features/data-export/tokens";
import { datasourceBindings } from "./features/datasource/datasource.bindings";
import { DATASOURCE_TOKENS as DATASOURCE } from "./features/datasource/tokens";
import { emptyMessageBindings } from "./features/empty-message/empty-message.bindings";
import { paginationBindings } from "./features/pagination/pagination.bindings";
import { PAGINATION_TOKENS as PAGINATION } from "./features/pagination/tokens";
import { personalizationBindings } from "./features/personalization/personalization.bindings";
import { rowInteractionBindings } from "./features/row-interaction/row-interaction.bindings";
import { selectAllBindings } from "./features/selection/select-all/select-all.bindings";
import { SelectAllModule } from "./features/selection/select-all/SelectAllModule.container";
import { SA_TOKENS } from "./features/selection/select-all/tokens";
import { selectionBindings } from "./features/selection/selection.bindings";

interface InitDependencies extends CoreInitDependencies {
    exportProgressService: TaskProgressService;
    selectAllModule: SelectAllModule;
}

const _01_coreBindings: BindingGroup<InitDependencies> = {
    inject() {
        injected(
            WidgetRootViewModel,
            CORE.mainGate,
            CORE.config,
            DATA_EXPORT.exportProgressService,
            SA_TOKENS.selectionDialogVM
        );
    },
    define(container: Container) {
        container.bind(ROOT.datagridRootVM).toInstance(WidgetRootViewModel).inTransientScope();
    },
    init(container, { mainGate, config, exportProgressService }) {
        container.bind(CORE.mainGate).toConstant(mainGate);
        container.bind(CORE.config).toConstant(config);
        container.bind(DATA_EXPORT.exportProgressService).toConstant(exportProgressService);
    },
    postInit(container) {
        // Make sure essential services are created upfront
        container.get(DATASOURCE.paramsService); // Enable sort & filtering
        container.get(PAGINATION.gridSizeStore);
    }
};

const groups: Array<BindingGroup<InitDependencies>> = [
    _01_coreBindings,
    datasourceBindings,
    columnsBindings,
    emptyMessageBindings,
    personalizationBindings,
    paginationBindings,
    selectionBindings,
    rowInteractionBindings,
    selectAllBindings
];

// Inject tokens from groups
for (const grp of groups) {
    grp.inject?.();
}

export class DatagridContainer extends Container {
    id = `DatagridContainer@${generateUUID()}`;

    constructor(root: Container) {
        super();
        this.extend(root);

        for (const grp of groups) {
            grp.define?.(this);
        }
    }

    /**
     * Setup container constants. If possible, declare all other bindings in the constructor.
     * @remark Make sure not to bind things that already exist in root container.
     */
    init(dependencies: {
        props: MainGateProps;
        config: DatagridConfig;
        mainGate: DerivedPropsGate<MainGateProps>;
        exportProgressService: TaskProgressService;
        selectAllModule: SelectAllModule;
    }): DatagridContainer {
        const { props, config, mainGate, exportProgressService, selectAllModule } = dependencies;

        // Bind refresh interval
        // Run binding groups init phase
        for (const grp of groups) {
            grp.init?.(this, { props, config, mainGate, exportProgressService, selectAllModule });
        }

        // Run binding groups post init phase
        for (const grp of groups) {
            grp.postInit?.(this, { props, config, mainGate, exportProgressService, selectAllModule });
        }

        // Make sure essential services are created upfront
        this.get(DATASOURCE.paramsService); // Enable sort & filtering
        this.get(PAGINATION.gridSizeStore);

        return this;
    }
}
