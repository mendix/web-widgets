import { DatasourceService, ProgressService, SelectAllService } from "@mendix/widget-plugin-grid/main";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container } from "brandi";
import { TOKENS } from "../../model/tokens";
import { SelectAllGateProps } from "./SelectAllGateProps";

export class SelectAllModule extends Container {
    id = `SelectAllModule@${generateUUID()}`;

    init(props: SelectAllGateProps, root: Container): SelectAllModule {
        this.extend(root);

        const gateProvider = new GateProvider<SelectAllGateProps>(props);
        this.setProps = props => gateProvider.setProps(props);

        // Bind service deps
        this.bind(TOKENS.selectAllGate).toConstant(gateProvider.gate);
        this.bind(TOKENS.queryGate).toConstant(gateProvider.gate);
        this.bind(TOKENS.query).toInstance(DatasourceService).inSingletonScope();
        this.bind(TOKENS.selectAllProgressService).toInstance(ProgressService).inSingletonScope();

        // Finally bind select all service
        this.bind(TOKENS.selectAllService).toInstance(SelectAllService).inSingletonScope();

        return this;
    }

    setProps = (_props: SelectAllGateProps): void => {
        throw new Error(`${this.id} is not initialized yet`);
    };
}
