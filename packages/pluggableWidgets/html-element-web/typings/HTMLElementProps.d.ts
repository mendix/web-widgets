/**
 * This file was generated from HTMLElement.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, ListValue, ListActionValue, ListExpressionValue, ListWidgetValue } from "mendix";

export type TagNameEnum = "div" | "span" | "p" | "ul" | "ol" | "li" | "a" | "img" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "__customTag__";

export type TagContentModeEnum = "container" | "innerHTML";

export type AttributeValueTypeEnum = "expression" | "template";

export interface AttributesType {
    attributeName: string;
    attributeValueType: AttributeValueTypeEnum;
    attributeValueTemplate?: DynamicValue<string>;
    attributeValueExpression?: DynamicValue<string>;
    attributeValueTemplateRepeat?: ListExpressionValue<string>;
    attributeValueExpressionRepeat?: ListExpressionValue<string>;
}

export type EventNameEnum = "onAbort" | "onAbortCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAuxClick" | "onAuxClickCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onBlur" | "onBlurCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onChange" | "onChangeCapture" | "onClick" | "onClickCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onContextMenu" | "onContextMenuCapture" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onError" | "onErrorCapture" | "onFocus" | "onFocusCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onInput" | "onInputCapture" | "onInvalid" | "onInvalidCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onLeave" | "onLoad" | "onLoadCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onPaste" | "onPasteCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerOut" | "onPointerOutCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerUp" | "onPointerUpCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onReset" | "onResetCapture" | "onScroll" | "onScrollCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onSelect" | "onSelectCapture" | "onStalled" | "onStalledCapture" | "onSubmit" | "onSubmitCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onWheel" | "onWheelCapture";

export interface EventsType {
    eventName: EventNameEnum;
    eventAction?: ActionValue;
    eventActionRepeat?: ListActionValue;
    eventStopPropagation: boolean;
    eventPreventDefault: boolean;
}

export interface AttributesPreviewType {
    attributeName: string;
    attributeValueType: AttributeValueTypeEnum;
    attributeValueTemplate: string;
    attributeValueExpression: string;
    attributeValueTemplateRepeat: string;
    attributeValueExpressionRepeat: string;
}

export interface EventsPreviewType {
    eventName: EventNameEnum;
    eventAction: {} | null;
    eventActionRepeat: {} | null;
    eventStopPropagation: boolean;
    eventPreventDefault: boolean;
}

export interface HTMLElementContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    tagName: TagNameEnum;
    tagNameCustom: string;
    tagUseRepeat: boolean;
    tagContentRepeatDataSource: ListValue;
    tagContentMode: TagContentModeEnum;
    tagContentHTML?: DynamicValue<string>;
    tagContentContainer?: ReactNode;
    tagContentRepeatHTML?: ListExpressionValue<string>;
    tagContentRepeatContainer?: ListWidgetValue;
    attributes: AttributesType[];
    events: EventsType[];
}

export interface HTMLElementPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    tagName: TagNameEnum;
    tagNameCustom: string;
    tagUseRepeat: boolean;
    tagContentRepeatDataSource: {} | { caption: string } | { type: string } | null;
    tagContentMode: TagContentModeEnum;
    tagContentHTML: string;
    tagContentContainer: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    tagContentRepeatHTML: string;
    tagContentRepeatContainer: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    attributes: AttributesPreviewType[];
    events: EventsPreviewType[];
}
