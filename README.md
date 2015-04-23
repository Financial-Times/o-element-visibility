# o-element-visibility [![Build Status](https://travis-ci.org/Financial-Times/o-element-visibility.svg?branch=master)](https://travis-ci.org/Financial-Times/o-element-visibility)

Utility for tracking element visibility within the viewport

## Methods

### `o-element-visibility#trackElements(selector)`
Tracks the selected elements and report the percentage of the element currently on the screen, changes to the percentage in view fires events within the `oViewport` namespace (see **Events** below).

If the selector argument is omitted `[data-o-element-visibility-track]` is used.

*Note: Enabling element tracking will also attach all other o-element-visibility events.*


## Events
Each of these custom events are fired on `document.body`. For each custom event `event.detail.originalEvent` contains a reference to the original browser event and `event.detail.viewport` the result of `o-element-visibility#getSize()`. Additional properties in `event.detail` are detailed below:

### `oVisibility.visible`
```js
element: HTMLElement // or Node in < ie10
visible: Boolean // if the element is in the viewport
percentInView: Number //  the percentage of the element that is visible
```
