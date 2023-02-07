import { Component, ReactChild, createElement } from "react";
import { MapDispatchToProps, MapStateToProps, connect } from "react-redux";
import { bindActionCreators } from "redux";

import AnyChart, { AnyChartComponentProps } from "./AnyChart";
import { AnyChartPlayground } from "./AnyPlayground";

import * as AnyChartActions from "../store/AnyChartActions";
import {
  isContextChanged,
  renderError,
  validateAdvancedOptions,
} from "../../utils/data";
import { Container } from "../../utils/namespaces";
import * as PlotlyChartActions from "../../components/actions/PlotlyChartActions";
import {
  AnyChartInstanceState,
  AnyReduxStore as ReduxStore,
  defaultInstanceState,
} from "../store/AnyChartReducer";
import { store } from "../../store";
import AnyChartContainerProps = Container.AnyChartContainerProps;

export type Actions = typeof AnyChartActions & typeof PlotlyChartActions;
type ComponentProps = AnyChartContainerProps & { instanceID: string };
export type AnyChartDataHandlerProps = ComponentProps &
  AnyChartInstanceState &
  Actions;

export class AnyChartDataHandler extends Component<AnyChartDataHandlerProps> {
  private subscriptionHandles: number[] = [];

  render() {
    const anyChartProps: AnyChartComponentProps = {
      ...(this.props as AnyChartDataHandlerProps),
      onClick: this.onClick,
      onHover: this.props.tooltipForm ? this.onHover : undefined,
    };

    return createElement(
      "div",
      { className: "widget-charts-wrapper" },
      createElement(
        this.props.devMode === "developer" ? AnyChartPlayground : AnyChart,
        anyChartProps
      )
    );
  }

  componentDidMount() {
    const validationError = AnyChartDataHandler.validateSeriesProps(this.props);
    if (validationError) {
      this.props.showAlertMessage(this.props.instanceID, validationError);
    }
    this.props.toggleFetchingData(this.props.instanceID, true);
  }

  componentWillReceiveProps(nextProps: AnyChartDataHandlerProps) {
    this.resetSubscriptions(nextProps.mxObject);
    if (!nextProps.alertMessage) {
      if (!nextProps.mxObject) {
        if (this.props.mxObject) {
          nextProps.noContext(nextProps.instanceID);
        }
      } else if (isContextChanged(this.props.mxObject, nextProps.mxObject)) {
        if (!nextProps.fetchingData) {
          nextProps.toggleFetchingData(nextProps.instanceID, true);
        }
        nextProps.fetchData(nextProps);
      }
    }
  }

  shouldComponentUpdate(nextProps: AnyChartDataHandlerProps) {
    const optionsUpdated =
      nextProps.attributeData !== this.props.attributeData ||
      nextProps.attributeLayout !== this.props.attributeLayout ||
      nextProps.configurationOptions !== this.props.configurationOptions ||
      nextProps.dataStatic !== this.props.dataStatic ||
      nextProps.layoutStatic !== this.props.layoutStatic;
    const playgroundLoaded = !!nextProps.playground && !this.props.playground;
    const toggleFetchingData =
      nextProps.fetchingData !== this.props.fetchingData;

    return (
      toggleFetchingData ||
      optionsUpdated ||
      playgroundLoaded ||
      !nextProps.mxObject
    );
  }

  componentWillUnmount() {
    this.props.clearInstanceState(this.props.instanceID);
  }

  private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
    this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    this.subscriptionHandles = [];
    if (mxObject) {
      this.subscriptionHandles.push(
        window.mx.data.subscribe({
          // @ts-ignore
          callback: () => store.dispatch(this.props.fetchData(this.props)),
          guid: mxObject.getGuid(),
        })
      );
      if (this.props.dataAttribute) {
        this.subscriptionHandles.push(
          window.mx.data.subscribe({
            // @ts-ignore
            callback: () => store.dispatch(this.props.fetchData(this.props)),
            guid: mxObject.getGuid(),
            attr: this.props.dataAttribute,
          })
        );
      }
      if (this.props.layoutAttribute) {
        this.subscriptionHandles.push(
          window.mx.data.subscribe({
            // @ts-ignore
            callback: () => store.dispatch(this.props.fetchData(this.props)),
            guid: mxObject.getGuid(),
            attr: this.props.layoutAttribute,
          })
        );
      }
    }
  }

  private onClick = (data: any) => {
    const {
      eventEntity,
      eventDataAttribute,
      onClickMicroflow,
      onClickNanoflow,
      mxform,
    } = this.props;

    if (eventEntity && eventDataAttribute && onClickMicroflow) {
      mx.data.create({
        entity: eventEntity,
        callback: (object) => {
          object.set(eventDataAttribute, JSON.stringify(data));
          mx.data.action({
            params: {
              actionname: onClickMicroflow,
              applyto: "selection",
              guids: [object.getGuid()],
            },
            error: (error) =>
              window.mx.ui.error(
                `Error executing on click microflow ${onClickMicroflow} : ${error.message}`
              ),
          });
        },
        error: (error) =>
          window.mx.ui.error(
            `Error creating event entity ${eventEntity} : ${error.message}`
          ),
      });
    }

    if (onClickNanoflow.nanoflow) {
      const context = new mendix.lib.MxContext();
      mx.data.create({
        entity: eventEntity,
        callback: (object) => {
          object.set(eventDataAttribute, JSON.stringify(data));
          context.setContext(eventEntity, object.getGuid());
          mx.data.callNanoflow({
            context,
            error: (error) =>
              mx.ui.error(
                `Error executing nanoflow ${onClickNanoflow} : ${error.message}`
              ),
            nanoflow: onClickNanoflow,
            origin: mxform,
          });
        },
        error: (error) =>
          window.mx.ui.error(
            `Error creating event entity ${eventEntity} : ${error.message}`
          ),
      });
    }
  };

  private onHover = (data: any, tooltipNode: HTMLDivElement) => {
    const {
      eventEntity,
      eventDataAttribute,
      tooltipForm,
      tooltipMicroflow,
      tooltipEntity,
    } = this.props;
    if (
      eventEntity &&
      eventDataAttribute &&
      tooltipForm &&
      tooltipMicroflow &&
      tooltipEntity
    ) {
      mx.data.create({
        entity: eventEntity,
        callback: (object) => {
          object.set(eventDataAttribute, JSON.stringify(data));
          mx.data.action({
            callback: (toolTipObjects: mendix.lib.MxObject[]) =>
              this.openTooltipForm(tooltipNode, tooltipForm, toolTipObjects[0]),
            params: {
              actionname: tooltipMicroflow,
              applyto: "selection",
              guids: [object.getGuid()],
            },
            error: (error) =>
              window.mx.ui.error(
                `Error executing on hover microflow ${tooltipMicroflow} : ${error.message}`
              ),
          });
        },
        error: (error) =>
          window.mx.ui.error(
            `Error creating event entity ${eventEntity} : ${error.message}`
          ),
      });
    }
  };

  private openTooltipForm(
    domNode: HTMLDivElement,
    tooltipForm: string,
    dataObject: mendix.lib.MxObject
  ) {
    const context = new mendix.lib.MxContext();
    context.setContext(dataObject.getEntity(), dataObject.getGuid());
    window.mx.ui.openForm(tooltipForm, { domNode, context, location: "node" });
  }

  public static validateSeriesProps(props: AnyChartContainerProps): ReactChild {
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
    if (props.tooltipForm && !props.tooltipMicroflow) {
      errorMessages.push("A tooltip requires a tooltip microflow");
    }
    if (props.onClickMicroflow && !hasEvent) {
      errorMessages.push(
        "On click microflow requires event entity and event data attribute"
      );
    }
    // TODO can we validate the context object of tooltip form to match the tooltip entity?

    return renderError(props.friendlyId, errorMessages);
  }
}

const mapStateToProps: MapStateToProps<
  AnyChartInstanceState,
  ComponentProps,
  ReduxStore
> = (state, props) =>
  state.any[props.instanceID] ||
  (defaultInstanceState as AnyChartInstanceState);
const mapDispatchToProps: MapDispatchToProps<
  typeof AnyChartActions & typeof PlotlyChartActions,
  ComponentProps
> = (dispatch) => ({
  ...bindActionCreators(AnyChartActions, dispatch),
  ...bindActionCreators(PlotlyChartActions, dispatch),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnyChartDataHandler);
