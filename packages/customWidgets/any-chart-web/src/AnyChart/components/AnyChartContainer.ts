let __webpack_public_path__;
import { Component, createElement } from "react";
import { Provider } from "react-redux";
import { store } from "../../store";

import AnyChartDataHandler from "./AnyChartDataHandler";
import { getInstanceID } from "../../utils/data";
import { Container } from "../../utils/namespaces";
import AnyChartContainerProps = Container.AnyChartContainerProps;

__webpack_public_path__ = window.mx
  ? `${window.mx.remoteUrl}widgets/`
  : "../widgets";

class AnyChartContainer extends Component<AnyChartContainerProps> {
  private instanceID =
    this.props.uniqueid || getInstanceID(this.props.friendlyId, store, "any");

  render() {
    return createElement(Provider, {
      store,
      children: createElement(AnyChartDataHandler, {
        ...(this.props as AnyChartContainerProps),
        instanceID: this.instanceID,
      }),
    });
  }
}

export { AnyChartContainer as default, __webpack_public_path__ };
