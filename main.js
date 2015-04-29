"use strict";
var tracked = [];
var oviewport = require('../o-viewport/main.js');
var initialised = false;

function broadcast(eventType, data, target) {
	target = target || document.body;

	target.dispatchEvent(new CustomEvent('oVisibility.' + eventType, {
		detail: data,
		bubbles: true
	}));
}

function Element(node) {
	if(!(this instanceof Element)) {
		return new Element(node);
	}

	this.id = node.id;
	this.node = node;
	this.lastResult = false;
	this.lastPercentage = 0;
	this.updatePosition(node);
	tracked.push(this);
}

Element.prototype.updatePosition = function(){
	var rect = this.node.getBoundingClientRect();
	var scroll = oviewport.getScrollPosition();
	var width = this.width = rect.width;
	var height = this.height = rect.height;
	var top = this.top = scroll.y + rect.top;
	var left = this.left = scroll.x + rect.left;
	var bottom = this.bottom = top + height;
	var right = this.right = left + width;
	var area = this.area = width * height;
	return {
		top: top,
		left: left,
		bottom: bottom,
		right: right,
		area: area,
		width: width,
		height: height
	};
};


Element.prototype.inViewport = function () {
	var scrollPos = oviewport.getScrollPosition();
	var viewportDims = oviewport.getViewportSize();
	var viewport = {
		top: scrollPos.y,
		left: scrollPos.x,
		bottom: scrollPos.y + viewportDims.height,
		right: scrollPos.x + viewportDims.width,
	};
	return (
		// is in viewport vertically
		((this.top >= viewport.top && this.top <= viewport.bottom) ||
		(this.bottom >= viewport.top && this.bottom <= viewport.bottom)) &&
		// is in viewport horizontally
		((this.left >=  viewport.left && this.left <= viewport.right) || (this.right >=  viewport.left && this.right <= viewport.right))
	);
};

Element.prototype.percentInViewport = function () {
	var viewport = oviewport.getViewportSize();
	var scroll = oviewport.getScrollPosition();
	var inViewWidth = Math.min(this.right, (scroll.x + viewport.width)) - Math.max(this.left, scroll.x);
	var inViewHeight = Math.min(this.bottom, (scroll.y + viewport.height)) - Math.max(this.top, scroll.y);
	var percentage = (inViewWidth * inViewHeight) / (this.area / 100);
	if ((inViewHeight > 0 && inViewWidth > 0) && percentage > 0) {
		return Math.round(percentage);
	} else {
		return 0;
	}
};

Element.prototype.update = function() {
	var type;
	var inview =  this.inViewport();
	var percentage = this.percentInViewport();
	if(this.lastResult !== inview){
		 this.lastResult = inview;
		 type = 'visibilityChange';
	} else if(this.lastPercentage !== percentage){
		this.lastPercentage	= percentage;
		type = 'percentageChange';
	} else {
		return;
	}

	broadcast('inview', {
		element: this,
		type: type,
		inviewport: inview,
		percentage: percentage
	}, this.node);
};

function track(element) {
	element = new Element(element);
	element.update();
	initEvents();
	return element;
}

function updatePositions(event) {
	tracked.forEach(function (element){
		element.updatePosition();
		element.update();
	});
}

function update(){
	tracked.forEach(function (element){
		element.update();
	});
}

function init(selector, debug){
	var elements = [];
	selector = typeof selector === 'string' ? selector : '[data-o-viewport-track]';

	try{
		elements = document.querySelectorAll(selector);
	} catch(err){
		if (debug) {
			/*jshint devel: true */
			console.error(err);
		}
		return;
	}

	if (elements.length) {
		[].slice.call(elements).forEach(function(element){
			new Element(element);
		});
		update();
	}
	initEvents();
	document.documentElement.removeEventListener('o.DOMContentLoaded', init);
}

function initEvents() {
	if (initialised === false){
		oviewport.listenToAll();
		document.body.addEventListener('oViewport.orientation', updatePositions);
		document.body.addEventListener('oViewport.resize', updatePositions);
		document.body.addEventListener('oViewport.scroll', update);
		document.body.addEventListener('oViewport.visibility', update);
		initialised = true;
	}
}

document.documentElement.addEventListener('o.DOMContentLoaded', init);

module.exports = {
	track: track,
	tracked: tracked,
	updatePositions: updatePositions,
	update: update,
};
