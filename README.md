# o-element-visibility [![Build Status](https://travis-ci.org/Financial-Times/o-element-visibility.svg?branch=master)](https://travis-ci.org/Financial-Times/o-element-visibility)

Utility for tracking element visibility within the viewport.

## Methods

### `o-element-visibility#init(selector)`
Tracks the selected elements and reports the percentage of the element currently on the screen, changes to the percentage in view will fire events within the `oVisibility` namespace (see **Events** below).

If the selector argument is omitted `[data-o-element-visibility-track]` is used.

*Note: Enabling element tracking will also attach all o-viewport events.*

### `o-element-visibility#destroy()`
Stop tracking all currently tracked elements.

*Note: This will not stop listening to all the oViewport events.*

### `o-element-visibility#track(element)`
Pass an element to be tracked, returns a TrackedElement (see below).

### `o-element-visibility#updatePositions(force)`
The position of an element is cached when we begin tracking, this will recache those values for every element currently being tracked.

Force will force an event to fire even if no change is detected.

*Note: During scrolling this method is not run but is run on resize or orientation change*

### `o-element-visibility#update(force)`
Updates the current visibility status of all elements and fires events if change are detected.

Force will force an event to fire even if no change is detected.

## Properties
### `o-element-visibility#tracked`
An array of the currently tracked elements

## TrackedElement
An instance of TrackedElement is returned by the track method. The instance contains information about the position of the element in the page and methods to calculate it's visibility:

```js
inview: Boolean // the elements current visibility within the viewport
percentage: Number // the percentage of the element in view
rect: Object // the result of the last getBoundingClientRect run on this element
width: Number // the width of the element
height: Number // the height of the element
top: Number // the absolute top of the element
left: Number // the absolute left of the element
bottom: Number // the absolute bottom of the element
right: Number // the absolute right of the element
area: Number // the area of the element
```

### updatePosition(force)
```js
returns this
```
Same as above but for this TrackedElement only.
Force will force an event to fire even if no change is detected.

### update(force)
```js
returns this
```
Same as above but for this TrackedElement only.
Force will force an event to fire even if no change is detected.

### inViewport()
```js
returns this
```
Test if the element is currently in the viewport

### percentInViewport()
```js
returns this
```
Calculate the percentage of the element in the viewport

## Events
Each of these custom events are fired on `document.body`. For each custom event `event.detail.originalEvent` contains a reference to the original browser event.

Additional properties in `event.detail` are detailed below:

### `oVisibility.visible`
```js
element: HTMLElement // or Node in < ie10
inviewport: Boolean // if the element is in the viewport
type: ['visibility', 'percentage', 'update'] // the reason the event fired, either because of visibility or percentage change, update means the function was run with force
percentInView: Number //  the percentage of the element that is visible
```

*Note: inviewport can be true while percentage is 0, this means the element has a width or height of 0 but is within the viewport*
