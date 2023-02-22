import { Component, ReactChild, createElement } from "react";

import AnyChart, { AnyChartComponentProps } from "./components/AnyChart";
import { Container } from "../utils/namespaces";
import { validateAdvancedOptions } from "../utils/data";
import { Provider } from "react-redux";
import { store } from "../store";

// tslint:disable-next-line class-name
export class preview extends Component<Container.AnyChartContainerProps, {}> {
  render() {
    return createElement(Provider, {
      store,
      children: createElement(AnyChart, {
        ...(this.props as AnyChartComponentProps),
        devMode: "advanced",
        fetchingData: false,
        attributeData: this.props.sampleData,
        attributeLayout: this.props.sampleLayout,
        alertMessage: this.validateSeriesProps(this.props),
      }),
    });
  }

  private validateSeriesProps(
    props: Container.AnyChartContainerProps
  ): ReactChild {
    const errorMessages: string[] = [];

    if (props.layoutStatic && props.layoutStatic.trim()) {
      const error = validateAdvancedOptions(props.layoutStatic.trim());
      if (error) {
        errorMessages.push(`Invalid static layout JSON: ${error}`);
      }
    }
    if (props.dataStatic && props.dataStatic.trim()) {
      const error = validateAdvancedOptions(props.dataStatic.trim());
      if (error) {
        errorMessages.push(`Invalid static data JSON: ${error}`);
      }
    }
    const hasEvent = props.eventEntity && props.eventDataAttribute;
    if (props.tooltipForm && !hasEvent) {
      errorMessages.push(
        "A tooltip requires event entity and event data attribute"
      );
    }
    if (props.tooltipForm && props.tooltipMicroflow) {
      errorMessages.push("A tooltip requires a tooltip microflow");
    }
    if (props.onClickMicroflow && !hasEvent) {
      errorMessages.push(
        "On click microflow requires event entity and event data attribute"
      );
    }
    if (props.onClickNanoflow && !hasEvent) {
      errorMessages.push(
        "On click nanoflow requires event entity and event data attribute"
      );
    }
    // TODO can we validate the context object of tooltip form to match the tooltip entity?

    if (errorMessages.length) {
      return createElement(
        "div",
        {},
        `Configuration error in widget ${props.friendlyId}:`,
        errorMessages.map((message, key) =>
          createElement("p", { key }, message)
        )
      );
    }

    return "";
  }
}

export function getPreviewCss() {
  return (
    require("../ui/Charts.scss") +
    require("../ui/ChartsLoading.scss") +
    require("../ui/Sidebar.scss") +
    require("../ui/Playground.scss") +
    require("../ui/Panel.scss") +
    require("../ui/InfoTooltip.scss") +
    require("plotly.js/src/css/style.scss")
  );
}
