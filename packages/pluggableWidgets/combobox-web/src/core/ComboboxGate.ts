import { ComboboxContainerProps } from "../../typings/ComboboxProps";

/**
 * The Mendix values of one widget instance, everything that changes between renders: the bound
 * attribute or association, the options datasource with its captions and custom content, the
 * texts, the slots and the actions. The simple-type properties are read once into
 * `ComboboxConfig` instead. Each selector family declares the subset it derives from.
 */
export type ComboboxGateProps = Pick<
    ComboboxContainerProps,
    // value and options per family
    | "attributeEnumeration"
    | "attributeBoolean"
    | "attributeAssociation"
    | "optionsSourceAssociationDataSource"
    | "optionsSourceAssociationCaptionAttribute"
    | "optionsSourceAssociationCaptionExpression"
    | "optionsSourceAssociationCustomContent"
    | "optionsSourceDatabaseDataSource"
    | "optionsSourceDatabaseItemSelection"
    | "optionsSourceDatabaseCaptionAttribute"
    | "optionsSourceDatabaseCaptionExpression"
    | "optionsSourceDatabaseCustomContent"
    | "optionsSourceDatabaseValueAttribute"
    | "databaseAttributeString"
    | "customEditabilityExpression"
    | "staticAttribute"
    | "optionsSourceStaticDataSource"
    | "emptyOptionText"
    // texts, accessibility, slots and actions
    | "ariaRequired"
    | "ariaLabel"
    | "noOptionsText"
    | "clearButtonAriaLabel"
    | "removeValueAriaLabel"
    | "selectAllButtonCaption"
    | "a11ySelectedValue"
    | "a11yOptionsAvailable"
    | "a11yInstructions"
    | "menuFooterContent"
    | "onChangeFilterInputEvent"
    | "onEnterEvent"
    | "onLeaveEvent"
>;
