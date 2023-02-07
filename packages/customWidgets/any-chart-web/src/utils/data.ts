import { ReactChild, createElement } from "react";
import deepMerge from "deepmerge";
import { Datum } from "plotly.js";
import { Container, Data } from "./namespaces";
import { Store } from "redux";
import { asString } from "date-format";
import SeriesProps = Data.SeriesProps;
import SeriesData = Data.SeriesData;
import EventProps = Data.EventProps;
import ScatterTrace = Data.ScatterTrace;
import ReferencesSpec = Data.ReferencesSpec;
import FetchedData = Data.FetchedData;
import FetchDataOptions = Data.FetchDataOptions;
import FetchByXPathOptions = Data.FetchByXPathOptions;
import FetchByIdOptions = Data.FetchByGuidsOptions;
import MxMetaObject = mendix.lib.MxMetaObject;

type MxO = mendix.lib.MxObject;
type Callback =
  | mendix.lib.MxObject
  | mendix.lib.MxObject[]
  | boolean
  | number
  | string
  | mxui.lib.form._FormBase;

export const validateSeriesProps = <T extends Partial<SeriesProps>>(
  dataSeries: T[],
  widgetId: string,
  layoutOptions: string,
  configurationOptions: string
): ReactChild => {
  const errorMessage: string[] = [];
  if (dataSeries && dataSeries.length) {
    dataSeries.forEach((series, index) => {
      const identifier = series.name ? `series "${series.name}"` : "the widget";
      if (series.seriesType === "dynamic") {
        if (!series.seriesEntity) {
          errorMessage.push(
            `'Dynamic series - Series entity' in ${identifier} is missing`
          );
        } else {
          const seriesPath = series.seriesEntity.split("/")[0];
          const { dataEntity } = series;
          const dataEntityMeta =
            dataEntity && window.mx && window.mx.meta.getEntity(dataEntity);
          if (
            !(
              dataEntity === seriesPath ||
              (dataEntityMeta && dataEntityMeta.isReference(seriesPath))
            )
          ) {
            errorMessage.push(
              `'Dynamic series - Series entity ${
                series.seriesEntity
              }' in 'series ${
                index + 1
              }' should be the same as ${dataEntity} or a reference of ${dataEntity}`
            );
          }
        }
        if (!series.seriesNameAttribute) {
          errorMessage.push(
            `'Dynamic series - Series name attribute' in ${identifier} is missing`
          );
        }
      }
      if (series.dataSourceType === "microflow") {
        if (!series.dataSourceMicroflow) {
          errorMessage.push(
            `'Data source type' in ${identifier} is set to 'Microflow' but no microflow is specified.`
          );
        }
        if (
          series.xValueAttribute &&
          series.xValueAttribute.split("/").length > 1
        ) {
          errorMessage.push(
            `'X-axis data attribute' in ${identifier} does not support references for data source 'Microflow'`
          );
        }
        if (
          series.xValueSortAttribute &&
          series.xValueSortAttribute.split("/").length > 1
        ) {
          errorMessage.push(
            `'X-axis sort attribute' in ${identifier} does not support references for data source 'Microflow'`
          );
        }
      } else if (series.dataSourceType === "XPath") {
        if (
          series.xValueAttribute &&
          series.xValueAttribute.split("/").length > 3
        ) {
          errorMessage.push(
            `'X-axis data attribute' in ${identifier} supports maximal one level deep reference`
          );
        }
        if (
          series.xValueSortAttribute &&
          series.xValueSortAttribute.split("/").length > 3
        ) {
          errorMessage.push(
            `'X-axis sort attribute' in ${identifier} supports maximal one level deep reference`
          );
        }
      } else if (series.dataSourceType === "REST") {
        if (!series.restUrl) {
          errorMessage.push(
            `\n'Data source type' in ${identifier} is set to 'REST' but no REST URL is specified.`
          );
        }
      }
      if (series.seriesOptions && series.seriesOptions.trim()) {
        const error = validateAdvancedOptions(series.seriesOptions.trim());
        if (error) {
          errorMessage.push(`Invalid options JSON for ${identifier}: ${error}`);
        }
      }
      if (series.dataEntity && window.mx) {
        const dataEntityMeta = window.mx.meta.getEntity(series.dataEntity);
        if (
          series.dataSourceType === "XPath" &&
          !isPersistable(dataEntityMeta, series.dataEntity)
        ) {
          errorMessage.push(
            `Entity ${series.dataEntity} should be persistable when using Data source 'Database'`
          );
        }
      }
    });
  }

  if (layoutOptions && layoutOptions.trim()) {
    const error = validateAdvancedOptions(layoutOptions.trim());
    if (error) {
      errorMessage.push(`Invalid layout JSON: ${error}`);
    }
  }
  if (configurationOptions && configurationOptions.trim()) {
    const error = validateAdvancedOptions(configurationOptions.trim());
    if (error) {
      errorMessage.push(`Invalid configuration JSON: ${error}`);
    }
  }

  return errorMessage.length ? renderError(widgetId, errorMessage) : "";
};

function isPersistable(metaObject: MxMetaObject, entity: string) {
  // In MX9.1 `isPersistable` was removed from MxMetaObject.
  if (typeof metaObject.isPersistable === "function") {
    return metaObject.isPersistable();
  }

  // The types defined in `mendix-client` are outdated.
  // @ts-ignore
  return (window.mx.session.getConfig("metadata") as any).find(
    (metaJsonObject: any) => metaJsonObject.objectType === entity
  ).persistable;
}

export const validateAdvancedOptions = (rawData: string): string => {
  if (rawData && rawData.trim()) {
    try {
      JSON.parse(rawData.trim());
    } catch (error) {
      return (error as any).message;
    }
  }

  return "";
};

export const fetchData = <S>(
  options: FetchDataOptions<S>
): Promise<FetchedData<S>> =>
  new Promise<FetchedData<S>>((resolve, reject) => {
    const { guid, entity, sortAttribute, sortOrder, attributes, customData } =
      options;
    if (entity && guid) {
      if (options.type === "XPath") {
        const references = getReferences(options.attributes || []);
        fetchByXPath({
          guid,
          entity,
          constraint: options.constraint || "",
          sortAttribute,
          sortOrder,
          attributes: references.attributes,
          references: references.references,
        })
          .then((mxObjects) => resolve({ mxObjects, customData }))
          .catch((message) =>
            reject({ message, customData: options.customData })
          );
      } else if (options.type === "microflow" && options.microflow) {
        fetchByMicroflow(options.microflow, guid)
          .then((mxObjects) => resolve({ mxObjects, customData }))
          .catch((message) =>
            reject({ message, customData: options.customData })
          );
      } else if (options.type === "REST" && options.url && attributes) {
        fetchByREST(options.url)
          .then((restData) => {
            const valuesAttribute =
              customData &&
              (customData as any).seriesEntity.indexOf("/") > -1 &&
              (customData as any).seriesType === "dynamic"
                ? customData &&
                  (customData as any).seriesEntity.split("/")[0].split(".")[1]
                : undefined;
            const jsonData =
              customData && (customData as any).seriesType === "dynamic"
                ? restData[0][valuesAttribute]
                : restData;
            const validationString = validateJSONData(jsonData, attributes);
            if (validationString) {
              reject({
                message: validationString,
                customData: options.customData,
              });
            } else {
              resolve({ restData, customData });
            }
          })
          .catch(reject);
      }
    } else {
      reject("entity & guid are required");
    }
  });

export const fetchSeriesData = <S extends SeriesProps = SeriesProps>(
  mxObject: MxO,
  series: S,
  restParameters: Container.RestParameter[] = []
): Promise<SeriesData<S>> =>
  new Promise<SeriesData<S>>((resolve, reject) => {
    if (series.dataEntity) {
      if (series.dataSourceType === "XPath") {
        const attributes = [
          series.xValueAttribute,
          series.yValueAttribute,
          series.xValueSortAttribute,
        ];
        if ((series as any).markerSizeAttribute) {
          attributes.push((series as any).markerSizeAttribute);
        }

        const references = getReferences(attributes);
        const sortAttribute =
          series.xValueSortAttribute || series.xValueAttribute;
        fetchByXPath({
          guid: mxObject.getGuid(),
          entity: series.dataEntity,
          constraint: series.entityConstraint,
          sortAttribute,
          sortOrder: series.sortOrder,
          attributes: references.attributes,
          references: references.references,
        })
          .then((mxObjects) => resolve({ data: mxObjects, series }))
          .catch(reject);
      } else if (
        series.dataSourceType === "microflow" &&
        series.dataSourceMicroflow
      ) {
        fetchByMicroflow(series.dataSourceMicroflow, mxObject.getGuid())
          .then((mxObjects) => resolve({ data: mxObjects, series }))
          .catch(reject);
      } else if (series.dataSourceType === "REST" && series.restUrl) {
        const parameters: string[] = [
          `contextId=${mxObject.getGuid()}`,
          `seriesName=${series.name}`,
        ];
        parameters.push(
          ...restParameters.map(
            (parameter) =>
              `${parameter.parameterAttribute}=${mxObject.get(
                parameter.parameterAttribute
              )}`
          )
        );
        const url = `${series.restUrl}${
          series.restUrl.indexOf("?") >= 0 ? "&" : "?"
        }${parameters.join("&")}`;
        fetchByREST(url)
          .then((restData) => {
            const attributes: string[] = [
              series.xValueAttribute,
              series.yValueAttribute,
            ];
            const validationString = validateJSONData(restData, attributes);
            if (validationString) {
              reject(validationString);
            } else {
              resolve({ restData, series });
            }
          })
          .catch(reject);
      }
    } else {
      // Skip for purpose of code migration
      // @ts-ignore
      resolve();
    }
  });

export const generateRESTURL = (
  mxObject: MxO,
  endpoint: string,
  parameters: Container.RestParameter[]
) => {
  const parameterString = [`contextId=${mxObject.getGuid()}`]
    .concat(
      parameters.map(
        (parameter) =>
          `${parameter.parameterAttribute}=${mxObject.get(
            parameter.parameterAttribute
          )}`
      )
    )
    .join("&");

  return `${endpoint}${
    endpoint.indexOf("?") >= 0 ? "&" : "?"
  }${parameterString}`;
};

const validateJSONData = (data: any, attributes: string[]): string => {
  for (const attribute of attributes) {
    if (data.length > 1 && !data[0].hasOwnProperty(attribute) && attribute) {
      return `JSON result for REST data source does not contain attribute ${attribute}`;
    }
  }

  return "";
};

export const getReferences = (attributePaths: string[]): ReferencesSpec => {
  let references: ReferencesSpec = { attributes: [] };
  attributePaths.forEach((attribute) => {
    references = addPathReference(references, attribute);
  });

  return references;
};

const addPathReference = (
  references: ReferencesSpec,
  path: string
): ReferencesSpec =>
  path.split("/").reduce((referenceSet, part, index, pathParts) => {
    let parent = referenceSet;
    // Use relations, skip entities sample: "module.relation_X_Y/module.entity_Y/attribute"
    // At the moment Mendix support only 1 level deep.
    if (index % 2 === 0) {
      for (let i = 0; i < index; i += 2) {
        if (parent.references) {
          parent = parent.references[pathParts[i]];
        }
      }
      if (pathParts.length - 1 === index) {
        // Skip empty attributes
        if (part) {
          parent.attributes = parent.attributes
            ? parent.attributes.concat(part)
            : [part];
        }
      } else if (!parent.references) {
        parent.references = { [part]: {} };
      } else if (!parent.references[part]) {
        parent.references[part] = {};
      }
    }

    return referenceSet;
  }, references);

export const fetchByXPath = (options: FetchByXPathOptions): Promise<MxO[]> =>
  new Promise<MxO[]>((resolve, reject) => {
    const {
      guid,
      entity,
      constraint,
      sortAttribute,
      sortOrder,
      attributes,
      references,
    } = options;
    const entityPath = entity.split("/");
    const entityName =
      entityPath.length > 1 ? entityPath[entityPath.length - 1] : entity;
    const xpath = `//${entityName}${constraint
      .split("[%CurrentObject%]")
      .join(guid)}`;

    window.mx.data.get({
      callback: resolve,
      error: (error) =>
        reject(
          `An error occurred while retrieving data via XPath (${xpath}): ${error.message}`
        ),
      filter: {
        sort:
          (sortAttribute && !window.mx.isOffline()) ||
          (sortAttribute && sortAttribute.indexOf("/") === -1)
            ? [[sortAttribute, sortOrder || "asc"]]
            : [],
        references,
        attributes,
      },
      xpath,
    });
  });

export const fetchByGuids = (options: FetchByIdOptions): Promise<MxO[]> =>
  new Promise<MxO[]>((resolve, reject) => {
    const { guids, sortAttribute, sortOrder, attributes, references } = options;
    window.mx.data.get({
      callback: resolve,
      guids,
      filter: {
        sort:
          (sortAttribute && !window.mx.isOffline()) ||
          (sortAttribute && sortAttribute.indexOf("/") === -1)
            ? [[sortAttribute, sortOrder || "asc"]]
            : [],
        references,
        attributes,
      },
      error: (error) =>
        reject(
          `An error occurred while retrieving data for ids (${guids.join(
            ", "
          )}): ${error.message}`
        ),
    });
  });

export const fetchByMicroflow = (
  actionname: string,
  guid: string
): Promise<MxO[]> =>
  new Promise((resolve, reject) => {
    const errorMessage = `An error occurred while retrieving data by microflow (${actionname}): `;
    window.mx.data.action({
      params: {
        actionname,
        applyto: "selection",
        guids: [guid],
      },
      callback: (mxObjects: MxO[]) => resolve(mxObjects),
      error: (error) => reject(`${errorMessage} ${error.message}`),
    });
  });

export const fetchByREST = (url: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const errorMessage = `An error occurred while retrieving data via REST endpoint (${url}): `;
    window
      .fetch(url, {
        credentials: "include",
        headers: { "X-Csrf-Token": mx.session.getConfig("csrftoken") },
      })
      .then((data) => {
        if (data.ok) {
          resolve(data.json());
        } else {
          reject(`${errorMessage} ${data.statusText}`);
        }
      })
      .catch((error) => reject(`${errorMessage} ${error.message}`));
  });

export const handleOnClick = <T extends EventProps>(
  options: T,
  mxObjectCustom?: Container.MxClick,
  mxform?: mxui.lib.form._FormBase
): Promise<Callback> =>
  new Promise((resolve, reject) => {
    const context = new mendix.lib.MxContext();

    if (!mxObjectCustom || options.onClickEvent === "doNothing") {
      // Skip for purpose of code migration
      // @ts-ignore
      resolve();

      return;
    } else {
      context.setContext(mxObjectCustom.entity, mxObjectCustom.guid);
    }

    if (options.onClickEvent === "callMicroflow" && options.onClickMicroflow) {
      window.mx.data.action({
        callback: resolve,
        error: (error) =>
          reject(
            `Error while executing microflow ${options.onClickMicroflow}: ${error.message}`
          ), // tslint:disable-line max-line-length
        params: {
          actionname: options.onClickMicroflow,
          applyto: "selection",
          guids: mxObjectCustom ? [mxObjectCustom.guid] : undefined,
        },
        origin: mxform,
      });
    } else if (options.onClickEvent === "showPage" && options.onClickPage) {
      window.mx.ui.openForm(options.onClickPage, {
        callback: resolve,
        context,
        error: (error) =>
          reject(
            `Error while opening page ${options.onClickPage}: ${error.message}`
          ),
        location: options.openPageLocation,
      });

      if (options.openPageLocation === "content") {
        // Callback is not called in this case
        // Skip for purpose of code migration
        // @ts-ignore
        resolve();
      }
    } else if (
      options.onClickEvent === "callNanoflow" &&
      options.onClickNanoflow.nanoflow &&
      mxform &&
      context
    ) {
      window.mx.data.callNanoflow({
        callback: resolve,
        context,
        error: (error) =>
          reject(`Error executing the on click nanoflow ${error.message}`),
        nanoflow: options.onClickNanoflow,
        origin: mxform,
      });
    }
  });

export const openTooltipForm = (
  domNode: HTMLDivElement,
  tooltipForm: string,
  dataObject: Container.MxClick
) => {
  const context = new mendix.lib.MxContext();
  context.setContext(dataObject.entity, dataObject.guid);
  window.mx.ui.openForm(tooltipForm, { domNode, context, location: "node" });
};

export const isContextChanged = (
  currentContext?: mendix.lib.MxObject,
  newContext?: mendix.lib.MxObject
): boolean => {
  return (
    (!currentContext && !!newContext) ||
    (!!currentContext && !newContext) ||
    (!!currentContext && currentContext.getGuid()) !==
      (!!newContext && newContext.getGuid())
  );
};

export const setRefreshAction =
  (refreshInterval: number, mxObject?: mendix.lib.MxObject) =>
  (callback: () => void) => {
    if (refreshInterval > 0 && mxObject) {
      return window.setInterval(callback, refreshInterval);
    }
  };

export const getSeriesTraces = ({
  data,
  restData,
  series,
}: SeriesData): ScatterTrace => {
  let xData: Datum[] = [];
  let yData: number[] = [];
  let markerSizeData: number[] | undefined = [];
  let sortData: Datum[] = [];
  if (data) {
    xData = data.map((mxObject) =>
      getAttributeValue(mxObject, series.xValueAttribute)
    );
    yData = data.map((mxObject) =>
      parseFloat(mxObject.get(series.yValueAttribute) as string)
    );
    markerSizeData = (series as any).markerSizeAttribute
      ? data.map((mxObject) =>
          parseFloat(
            mxObject.get((series as any).markerSizeAttribute) as string
          )
        )
      : undefined;
    sortData = series.xValueSortAttribute
      ? data.map((mxObject) =>
          getAttributeValue(mxObject, series.xValueSortAttribute)
        )
      : [];
  } else if (restData) {
    xData = restData.map((dataValue: any) => dataValue[series.xValueAttribute]);
    yData = restData.map((dataValue: any) => dataValue[series.yValueAttribute]);
    markerSizeData = (series as any).markerSizeAttribute
      ? restData.map(
          (dataValue: any) =>
            dataValue[(series as any).markerSizeAttribute as string]
        )
      : undefined;
    sortData = series.xValueSortAttribute
      ? restData.map((dataValue: any) => dataValue[series.xValueSortAttribute])
      : [];
  }
  const sortDataError =
    xData.length !== yData.length || xData.length !== sortData.length;
  const alreadySorted =
    series.dataSourceType === "XPath" &&
    series.xValueSortAttribute &&
    series.xValueSortAttribute.split("/").length === 1;
  if (!series.xValueSortAttribute || alreadySorted || sortDataError) {
    return {
      x: xData,
      y: yData,
      marker: markerSizeData ? { size: markerSizeData } : {},
    };
  }
  const unsorted = sortData.map((value, index) => {
    return {
      x: xData[index],
      y: yData[index],
      marker: markerSizeData ? { size: markerSizeData[index] } : {},
      sort: value,
    };
  });
  const sorted = unsorted.sort((a, b) => {
    if (series.sortOrder === "asc") {
      if (a.sort < b.sort) {
        return -1;
      }
      if (a.sort > b.sort) {
        return 1;
      }
    }
    // Sort order "desc"
    if (a.sort > b.sort) {
      return -1;
    }
    if (a.sort < b.sort) {
      return 1;
    }

    return 0;
  });
  const sortedXData = sorted.map((value) => value.x);
  const sortedYData = sorted.map((value) => value.y);
  const sortedSizeData =
    markerSizeData && sorted.map((value) => value.marker.size);

  return {
    x: sortedXData,
    y: sortedYData,
    marker: { size: sortedSizeData as number[] },
  };
};

export const getRuntimeTraces = ({
  data,
  series,
}: SeriesData): { name: string } & ScatterTrace => ({
  name: series.name,
  ...getSeriesTraces({ data, series }),
});

export const getAttributeValue = (mxObject: MxO, attribute: string): Datum => {
  let valueObject = mxObject;
  const path = attribute.split("/");
  const attributeName = path[path.length - 1];
  // Use relations only, skip entity and attribute sample: "module.relation_X_Y/module.entity_Y/attribute"
  for (let i = 0; i < path.length - 1; i += 2) {
    // Know issue; Mendix will return max 1 level deep
    valueObject = valueObject.getChildren(path[i])[0];
    if (!valueObject) {
      return "";
    }
  }
  if (valueObject.isDate(attributeName)) {
    const dateValue: number = valueObject.get(attributeName) as number;

    // Converts the timestamp to ISO-8601
    return asString(new Date(dateValue));
  }
  if (valueObject.isEnum(attributeName)) {
    const enumValue = valueObject.get(attributeName) as string;

    return valueObject.getEnumCaption(attributeName, enumValue);
  }
  if (valueObject.isNumeric(attributeName)) {
    return parseFloat(valueObject.get(attributeName) as any);
  }
  const value = valueObject.get(attributeName) as string;

  return value !== null ? value : "";
};

/**
 * Returns a random integer between min (included) and max (included)
 * @param count
 * @param rangeMax
 * @param rangeMin
 */
export const getRandomNumbers = (
  count: number,
  rangeMax: number,
  rangeMin = 0
): number[] => {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(
      Math.round(Math.random() * (rangeMax - rangeMin + 1) + rangeMin)
    );
  }

  return numbers;
};

const emptyTarget = (value: any) => (Array.isArray(value) ? [] : {});

const clone = (value: any, options: any) =>
  deepMerge(emptyTarget(value), value, options);

export const arrayMerge = (target: any[], source: any[], options: any) => {
  const destination = target.slice();

  source.forEach((e, i) => {
    if (typeof destination[i] === "undefined") {
      const cloneRequested = options.clone !== false;
      const shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone ? clone(e, options) : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = deepMerge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });

  return destination;
};

export const parseAdvancedOptions = (
  devMode: Container.DevMode,
  options: string
) => (devMode !== "basic" && options ? JSON.parse(options) : {});

export const renderError = (id: string, errorMessages: string[]) => {
  if (errorMessages.length) {
    return createElement(
      "div",
      {},
      `Configuration error in widget ${id}:`,
      ...errorMessages.map((message, key) =>
        createElement("p", { key }, message)
      )
    );
  }

  return "";
};

type ReduxStoreKey = "scatter" | "bar" | "pie" | "heatmap" | "any";

export const generateInstanceID = (friendlyId: string) =>
  `${friendlyId}-${Math.round(Math.random() * 2000)}`; // Needed to uniquely identify charts in listview.

export const getInstanceID = (
  friendlyId: string,
  store: Store,
  reduxStoreKey: ReduxStoreKey
): string => {
  let instanceID = generateInstanceID(friendlyId);
  const instances: string[] = Object.keys(store.getState()[reduxStoreKey]);
  while (instances.indexOf(instanceID) > -1) {
    instanceID = generateInstanceID(friendlyId);
  }

  return instanceID;
};
