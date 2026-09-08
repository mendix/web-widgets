# HTML Element

Displays custom HTML

## Overview

- **Folder**: `html-element-web`
- **Category**: Uncategorized
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/htmlelement)

## XML Properties

### HTML element

- **Tag name** (`tagName`; type: enumeration, required, default: div). Allowed values: `div` (div), `span` (span), `p` (p), `ul` (ul), `ol` (ol), `li` (li), `a` (a), `img` (img), `h1` (h1), `h2` (h2), `h3` (h3), `h4` (h4), `h5` (h5), `h6` (h6), `__customTag__` (Use custom name).
- **Custom tag** (`tagNameCustom`; type: string, optional, default: div).
- **Repeat element** (`tagUseRepeat`; type: boolean, default: false). Repeat element for each item in data source.
- **Data source** (`tagContentRepeatDataSource`; type: datasource, required, list).
- **Content** (`tagContentMode`; type: enumeration, default: container). Allowed values: `container` (Container for widgets), `innerHTML` (HTML).
- **HTML** (`tagContentHTML`; type: textTemplate, optional).
- **Content** (`tagContentContainer`; type: widgets, optional).
- **HTML** (`tagContentRepeatHTML`; type: textTemplate, optional, data source: tagContentRepeatDataSource).
- **Content** (`tagContentRepeatContainer`; type: widgets, optional, data source: tagContentRepeatDataSource).

### HTML attributes

- **Attributes** (`attributes`; type: object, optional, list). The HTML attributes that are added to the HTML element. For example: ‘title‘, ‘href‘. If ‘class’ or ‘style’ is added as attribute this is merged with the widget class/style property. For events (e.g. onClick) use the Events section.
- **Name** (`attributeName`; type: string, required).
- **Value based on** (`attributeValueType`; type: enumeration, default: expression). Allowed values: `expression` (Expression), `template` (Text template).
- **Value** (`attributeValueTemplate`; type: textTemplate, optional).
- **Value** (`attributeValueExpression`; type: expression, optional). Returns: String.
- **Value** (`attributeValueTemplateRepeat`; type: textTemplate, optional, data source: ../tagContentRepeatDataSource).
- **Value** (`attributeValueExpressionRepeat`; type: expression, optional, data source: ../tagContentRepeatDataSource). Returns: String.

- **Events** (`events`; type: object, optional, list).
- **Name** (`eventName`; type: enumeration, required, default: onClick). Allowed values: `onAbort` (onAbort), `onAbortCapture` (onAbortCapture), `onAnimationEnd` (onAnimationEnd), `onAnimationEndCapture` (onAnimationEndCapture), `onAnimationIteration` (onAnimationIteration), `onAnimationIterationCapture` (onAnimationIterationCapture), `onAnimationStart` (onAnimationStart), `onAnimationStartCapture` (onAnimationStartCapture), `onAuxClick` (onAuxClick), `onAuxClickCapture` (onAuxClickCapture), `onBeforeInput` (onBeforeInput), `onBeforeInputCapture` (onBeforeInputCapture), `onBlur` (onBlur), `onBlurCapture` (onBlurCapture), `onCanPlay` (onCanPlay), `onCanPlayCapture` (onCanPlayCapture), `onCanPlayThrough` (onCanPlayThrough), `onCanPlayThroughCapture` (onCanPlayThroughCapture), `onChange` (onChange), `onChangeCapture` (onChangeCapture), `onClick` (onClick), `onClickCapture` (onClickCapture), `onCompositionEnd` (onCompositionEnd), `onCompositionEndCapture` (onCompositionEndCapture), `onCompositionStart` (onCompositionStart), `onCompositionStartCapture` (onCompositionStartCapture), `onCompositionUpdate` (onCompositionUpdate), `onCompositionUpdateCapture` (onCompositionUpdateCapture), `onContextMenu` (onContextMenu), `onContextMenuCapture` (onContextMenuCapture), `onCopy` (onCopy), `onCopyCapture` (onCopyCapture), `onCut` (onCut), `onCutCapture` (onCutCapture), `onDoubleClick` (onDoubleClick), `onDoubleClickCapture` (onDoubleClickCapture), `onDrag` (onDrag), `onDragCapture` (onDragCapture), `onDragEnd` (onDragEnd), `onDragEndCapture` (onDragEndCapture), `onDragEnter` (onDragEnter), `onDragEnterCapture` (onDragEnterCapture), `onDragExit` (onDragExit), `onDragExitCapture` (onDragExitCapture), `onDragLeave` (onDragLeave), `onDragLeaveCapture` (onDragLeaveCapture), `onDragOver` (onDragOver), `onDragOverCapture` (onDragOverCapture), `onDragStart` (onDragStart), `onDragStartCapture` (onDragStartCapture), `onDrop` (onDrop), `onDropCapture` (onDropCapture), `onDurationChange` (onDurationChange), `onDurationChangeCapture` (onDurationChangeCapture), `onEmptied` (onEmptied), `onEmptiedCapture` (onEmptiedCapture), `onEncrypted` (onEncrypted), `onEncryptedCapture` (onEncryptedCapture), `onEnded` (onEnded), `onEndedCapture` (onEndedCapture), `onError` (onError), `onErrorCapture` (onErrorCapture), `onFocus` (onFocus), `onFocusCapture` (onFocusCapture), `onGotPointerCapture` (onGotPointerCapture), `onGotPointerCaptureCapture` (onGotPointerCaptureCapture), `onInput` (onInput), `onInputCapture` (onInputCapture), `onInvalid` (onInvalid), `onInvalidCapture` (onInvalidCapture), `onKeyDown` (onKeyDown), `onKeyDownCapture` (onKeyDownCapture), `onKeyPress` (onKeyPress), `onKeyPressCapture` (onKeyPressCapture), `onKeyUp` (onKeyUp), `onKeyUpCapture` (onKeyUpCapture), `onLeave` (onLeave), `onLoad` (onLoad), `onLoadCapture` (onLoadCapture), `onLoadedData` (onLoadedData), `onLoadedDataCapture` (onLoadedDataCapture), `onLoadedMetadata` (onLoadedMetadata), `onLoadedMetadataCapture` (onLoadedMetadataCapture), `onLoadStart` (onLoadStart), `onLoadStartCapture` (onLoadStartCapture), `onLostPointerCapture` (onLostPointerCapture), `onLostPointerCaptureCapture` (onLostPointerCaptureCapture), `onMouseDown` (onMouseDown), `onMouseDownCapture` (onMouseDownCapture), `onMouseEnter` (onMouseEnter), `onMouseLeave` (onMouseLeave), `onMouseMove` (onMouseMove), `onMouseMoveCapture` (onMouseMoveCapture), `onMouseOut` (onMouseOut), `onMouseOutCapture` (onMouseOutCapture), `onMouseOver` (onMouseOver), `onMouseOverCapture` (onMouseOverCapture), `onMouseUp` (onMouseUp), `onMouseUpCapture` (onMouseUpCapture), `onPaste` (onPaste), `onPasteCapture` (onPasteCapture), `onPause` (onPause), `onPauseCapture` (onPauseCapture), `onPlay` (onPlay), `onPlayCapture` (onPlayCapture), `onPlaying` (onPlaying), `onPlayingCapture` (onPlayingCapture), `onPointerCancel` (onPointerCancel), `onPointerCancelCapture` (onPointerCancelCapture), `onPointerDown` (onPointerDown), `onPointerDownCapture` (onPointerDownCapture), `onPointerEnter` (onPointerEnter), `onPointerEnterCapture` (onPointerEnterCapture), `onPointerLeave` (onPointerLeave), `onPointerLeaveCapture` (onPointerLeaveCapture), `onPointerMove` (onPointerMove), `onPointerMoveCapture` (onPointerMoveCapture), `onPointerOut` (onPointerOut), `onPointerOutCapture` (onPointerOutCapture), `onPointerOver` (onPointerOver), `onPointerOverCapture` (onPointerOverCapture), `onPointerUp` (onPointerUp), `onPointerUpCapture` (onPointerUpCapture), `onProgress` (onProgress), `onProgressCapture` (onProgressCapture), `onRateChange` (onRateChange), `onRateChangeCapture` (onRateChangeCapture), `onReset` (onReset), `onResetCapture` (onResetCapture), `onScroll` (onScroll), `onScrollCapture` (onScrollCapture), `onSeeked` (onSeeked), `onSeekedCapture` (onSeekedCapture), `onSeeking` (onSeeking), `onSeekingCapture` (onSeekingCapture), `onSelect` (onSelect), `onSelectCapture` (onSelectCapture), `onStalled` (onStalled), `onStalledCapture` (onStalledCapture), `onSubmit` (onSubmit), `onSubmitCapture` (onSubmitCapture), `onSuspend` (onSuspend), `onSuspendCapture` (onSuspendCapture), `onTimeUpdate` (onTimeUpdate), `onTimeUpdateCapture` (onTimeUpdateCapture), `onTouchCancel` (onTouchCancel), `onTouchCancelCapture` (onTouchCancelCapture), `onTouchEnd` (onTouchEnd), `onTouchEndCapture` (onTouchEndCapture), `onTouchMove` (onTouchMove), `onTouchMoveCapture` (onTouchMoveCapture), `onTouchStart` (onTouchStart), `onTouchStartCapture` (onTouchStartCapture), `onTransitionEnd` (onTransitionEnd), `onTransitionEndCapture` (onTransitionEndCapture), `onVolumeChange` (onVolumeChange), `onVolumeChangeCapture` (onVolumeChangeCapture), `onWaiting` (onWaiting), `onWaitingCapture` (onWaitingCapture), `onWheel` (onWheel), `onWheelCapture` (onWheelCapture).
- **Action** (`eventAction`; type: action, optional).
- **Action** (`eventActionRepeat`; type: action, optional, data source: ../tagContentRepeatDataSource).
- **Stop propagation** (`eventStopPropagation`; type: boolean, default: true).
- **Prevent default** (`eventPreventDefault`; type: boolean, default: true).

### HTML Sanitization

- **Sanitization configuration** (`sanitizationConfigFull`; type: string, optional). Configuration for HTML sanitization in JSON format. Leave blank for default.

## Additional Notes

Please see [HTML Element](https://docs.mendix.com/appstore/widgets/html-element) in the Mendix documentation for details.
