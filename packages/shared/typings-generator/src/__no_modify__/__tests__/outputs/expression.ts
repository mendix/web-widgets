export const expressionWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, EditableValue, ListValue, ListExpressionValue } from "mendix";
import { Big } from "big.js";

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    myDataSource: ListValue;
    expressionReturnTypeType: DynamicValue<string>;
    expressionReturnTypeTypeDataSource: ListExpressionValue<string>;
    expressionReturnTypeAssignableTo: DynamicValue<string | Big | boolean>;
    expressionReturnTypeAssignableToDataSource: ListExpressionValue<string | Big | boolean>;
    myAttribute: EditableValue<string | Big | boolean>;
}

export interface MyWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    myDataSource: {} | { type: string } | null;
    expressionReturnTypeType: string;
    expressionReturnTypeTypeDataSource: string;
    expressionReturnTypeAssignableTo: string;
    expressionReturnTypeAssignableToDataSource: string;
    myAttribute: string;
}
`;

export const expressionNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    myDataSource: ListValue;
    expressionReturnTypeType: DynamicValue<string>;
    expressionReturnTypeTypeDataSource: ListExpressionValue<string>;
    expressionReturnTypeAssignableTo: DynamicValue<string | Big | boolean>;
    expressionReturnTypeAssignableToDataSource: ListExpressionValue<string | Big | boolean>;
    myAttribute: EditableValue<string | Big | boolean>;
}`;
