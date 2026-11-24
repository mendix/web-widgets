import type { Container } from "brandi";
import type { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import type { DatagridConfig } from "./configs/Datagrid.config";
import type { MainGateProps } from "../../../typings/MainGateProps";

export interface CoreInitDependencies {
    props: MainGateProps;
    mainGate: DerivedPropsGate<MainGateProps>;
    config: DatagridConfig;
}

/** Just little utility object to group related bindings */
export interface BindingGroup<Deps = CoreInitDependencies> {
    /** Runs during container constructor. Use this hook to add new binding to the container. */
    define?(container: Container): void;
    /** Runs on container init with deps. Use this hook to bind constants, configs and values that depend on props. */
    init?(container: Container, deps: Deps): void;
    /** This method runs after init phase. Use this hook to init instances and other "bootstrapping" work. */
    postInit?(container: Container, deps: Deps): void;
    /** This method runs only once. Should be used to inject dependencies. */
    inject?(): void;
}
