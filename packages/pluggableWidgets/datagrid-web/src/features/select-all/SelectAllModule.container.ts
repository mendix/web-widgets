import { DatasourceService, SelectAllService, TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected } from "brandi";

import { SelectAllFeature } from "@mendix/widget-plugin-grid/select-all/select-all.feature";
import { selectAllEmitter } from "@mendix/widget-plugin-grid/select-all/select-all.model";
import { SelectAllBarStore } from "@mendix/widget-plugin-grid/select-all/SelectAllBar.store";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { MainGateProps } from "../../../typings/MainGateProps";
import { DatagridConfig } from "../../model/configs/Datagrid.config";
import { CORE_TOKENS as CORE, DG_TOKENS as DG, SA_TOKENS } from "../../model/tokens";
import { SelectAllBarViewModel } from "./SelectAllBar.viewModel";
import { SelectionProgressDialogViewModel } from "./SelectionProgressDialog.viewModel";

injected(
    SelectAllBarViewModel,
    SA_TOKENS.emitter,
    SA_TOKENS.barStore,
    CORE.selection.selectedCounterTextsStore,
    CORE.selection.selectAllTexts,
    SA_TOKENS.enableSelectAll
);

injected(
    SelectionProgressDialogViewModel,
    CORE.setupService,
    SA_TOKENS.gate,
    SA_TOKENS.progressService,
    SA_TOKENS.selectAllService
);

injected(
    SelectAllFeature,
    CORE.setupService,
    SA_TOKENS.emitter,
    SA_TOKENS.selectAllService,
    SA_TOKENS.barStore,
    SA_TOKENS.progressService,
    CORE.selection.isCurrentPageSelected,
    CORE.selection.isAllItemsSelected
);

injected(SelectAllService, SA_TOKENS.gate, DG.query, SA_TOKENS.emitter);

export class SelectAllModule extends Container {
    id = `SelectAllModule@${generateUUID()}`;

    constructor(root: Container) {
        super();
        this.extend(root);
        this.bind(SA_TOKENS.barStore).toInstance(SelectAllBarStore).inSingletonScope();
        this.bind(SA_TOKENS.emitter).toInstance(selectAllEmitter).inSingletonScope();
        this.bind(DG.query).toInstance(DatasourceService).inSingletonScope();
        this.bind(SA_TOKENS.selectAllService).toInstance(SelectAllService).inSingletonScope();
        this.bind(SA_TOKENS.selectAllBarVM).toInstance(SelectAllBarViewModel).inSingletonScope();
        this.bind(SA_TOKENS.selectionDialogVM).toInstance(SelectionProgressDialogViewModel).inSingletonScope();
        this.bind(SA_TOKENS.feature).toInstance(SelectAllFeature).inSingletonScope();
    }

    init(dependencies: {
        props: MainGateProps;
        mainGate: DerivedPropsGate<MainGateProps>;
        progressSrv: TaskProgressService;
        config: DatagridConfig;
    }): SelectAllModule {
        const { props, config, mainGate, progressSrv } = dependencies;

        const ownGate = new GateProvider<MainGateProps>(props);
        this.setProps = props => ownGate.setProps(props);

        this.bind(CORE.config).toConstant(config);
        // Bind main gate from main provider.
        this.bind(CORE.mainGate).toConstant(mainGate);
        this.bind(SA_TOKENS.progressService).toConstant(progressSrv);
        this.bind(SA_TOKENS.gate).toConstant(ownGate.gate);
        this.bind(DG.queryGate).toConstant(ownGate.gate);
        this.bind(SA_TOKENS.enableSelectAll).toConstant(config.enableSelectAll);

        this.postInit();

        return this;
    }

    postInit(): void {
        // Initialize feature
        if (this.get(SA_TOKENS.enableSelectAll)) {
            this.get(SA_TOKENS.feature);
        }
    }

    setProps = (_props: MainGateProps): void => {
        throw new Error(`${this.id} is not initialized yet`);
    };
}
