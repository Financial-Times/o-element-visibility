'use strict';
var oviewport = require('o-viewport');

/*
* Represents a tracked element
*/
function TrackedElement(node) {
	if (!(this instanceof TrackedElement)) {
		return new TrackedElement(node);
	}

	this.node = node;
	this.updatePosition();
}

/*
* Update the current visibility status of a tracked element
*/
TrackedElement.prototype.update = function(force) {
	this.inViewport().percentInViewport();

	var type = (this.lastResult !== this.inview) ? 'visibility' :
						(this.lastPercentage !== this.percentage) ? 'percentage' :
						(force) ? 'update' : false;

	if (type) {
		broadcast('inview', {
			element: this,
			type: type,
			inviewport: this.inview,
			percentage: this.percentage
		}, this.node);
	}

	return this;
};

/*
* get the current absolute position of the element in the document
*/
TrackedElement.prototype.updatePosition = function() {
	var rect = this.node.getBoundingClientRect();
	var scroll = oviewport.getScrollPosition();
	var width = this.width = rect.width;
	var height = this.height = rect.height;
	var top = this.top = scroll.top + rect.top;
	var left = this.left = scroll.left + rect.left;
	this.bottom = top + height;
	this.right = left + width;
	this.area = width * height;
	return this;
};

/*
* Check if the element is in the viewport
*/
TrackedElement.prototype.inViewport = function() {
	this.lastInview = this.inview || false;
	var scrollPos = oviewport.getScrollPosition();
	var viewportDims = oviewport.getSize();
	var viewport = {
		top: scrollPos.top,
		left: scrollPos.left,
		bottom: scrollPos.top + viewportDims.height,
		right: scrollPos.left + viewportDims.width
	};

	this.inview = (

		// is in viewport vertically
		((this.top >= viewport.top && this.top < viewport.bottom) ||
		(this.bottom > viewport.top && this.bottom <= viewport.bottom)) &&

		// is in viewport horizontally
		((this.left >=  viewport.left && this.left < viewport.right) ||
			(this.right >  viewport.left && this.right <= viewport.right))
	);
	return this;
};

/*
* Get the percentage of the element in the viewport
*/
TrackedElement.prototype.percentInViewport = function() {
	this.lastPercentage	= this.percentage || 0;

	var viewport = oviewport.getSize();
	var scroll = oviewport.getScrollPosition();
	var inViewWidth = Math.min(this.right, (scroll.left + viewport.width)) - Math.max(this.left, scroll.left);
	var inViewHeight = Math.min(this.bottom, (scroll.top + viewport.height)) - Math.max(this.top, scroll.top);
	var percentage = (inViewWidth * inViewHeight) / (this.area / 100);
	this.percentage = ((inViewHeight > 0 && inViewWidth > 0) && percentage > 0) ? Math.round(percentage) : 0;
	return this;
};

function broadcast(eventType, data, target) {
	target = target || document.body;

	target.dispatchEvent(new CustomEvent('oVisibility.' + eventType, {
		detail: data,
		bubbles: true
	}));
}

module.exports = TrackedElement;
