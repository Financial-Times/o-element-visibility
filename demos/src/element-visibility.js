'use strict';
var debounce = require('lodash/function/debounce');
var oViewport = require('../../../o-viewport/main.js');
var elementVis = require('../../main.js');

// cover the page in randomly with divs
function GeneratePage() {
	this.generatedPositions = [];

	// get the size of our sample div, then remove it, it's served it's purpose
	var div = document.querySelector('[data-o-element-visibility-track]');
	if (!div) throw new Error('Demo base div missing');
	this.div = div.getBoundingClientRect();
	div.parentNode.removeChild(div);

	// set the body size to be 20% larger than the viewport
	this.body = this.setBodySize(1.2);

	// calculate a sensible amount of divs to display
	var numDivs = this.numDivs = this.maxDivs();
	this.addDivs(numDivs);

	// counters
	this.inView = document.getElementsByClassName('inview');

	// initialise the info box
	this.setupInfo();
}

// setup the info box
GeneratePage.prototype.setupInfo = function(argument) {
	// fields
	this.inViewField = document.getElementById('inView');
	this.totalField = document.getElementById('total');
	this.thresholdField = document.getElementById('threshold');

	// form elements
	this.threshold = document.querySelector('[name="threshold"]');
	this.listen = document.querySelector('[name="listen"]');

	// set the number of divs on the page
	this.setField('total', this.numDivs);

	// threshold slider in the info box
	this.threshold.addEventListener('change', debounce(this.changeThresholdEvent, 200).bind(this));

	this.listen.addEventListener('change', this.changeListenEvent.bind(this));
};

// set the value of a field in the info box
GeneratePage.prototype.setField = function(field, num) {
	if (this[field + 'Field']) {
		this[field + 'Field'].innerHTML = num;
	}
	return num;
};

// get the current value of the in view threshold slider
GeneratePage.prototype.getThreshold = function() {
	return parseInt(this.threshold.value, 10);
};

// update the element tracking values when threshold is changed
GeneratePage.prototype.changeThresholdEvent = function(event) {
	var threshold = this.getThreshold();
	this.setField('threshold', threshold);
	elementVis.update(true);
	return threshold;
};

// get the current value of the in view threshold slider
GeneratePage.prototype.getListen = function() {
	return this.listen.checked;
};

// update the element tracking values when threshold is changed
GeneratePage.prototype.changeListenEvent = function(event) {
	var listen = this.getListen();
	if (listen) {
		oViewport.listenTo('all');
		elementVis.update();
	} else {
		oViewport.stopListening('all');
	}

	return listen;
};

// set the size of the document body
GeneratePage.prototype.setBodySize = function(factor) {
	var viewport = oViewport.getSize();
	var width = Math.ceil(viewport.width * factor);
	var height = Math.ceil(viewport.height * factor);
	document.body.style.width = width + 'px';
	document.body.style.height = height + 'px';

	return {
		width: width,
		height: height
	};
};

// we don't want overlapping divs
GeneratePage.prototype.doesCollide = function doesCollide(current) {
	var pos, collides;
	var div = this.div;

	for (var i = 0, len = this.generatedPositions.length; i < len; i++) {
		pos = this.generatedPositions[i];
		collides = !(
			((current.top + div.height) < (pos.top)) ||
			(current.top > (pos.top + div.height)) ||
			((current.left + div.width) < pos.left) ||
			(current.left > (pos.left + div.width))
		);

		if (collides) {
			return true;
		}
	}

	return false;
};

// generates a random unique top/left postion within the body of the page
GeneratePage.prototype.randomPosition = function() {
	var top, left;

	do {
		top = Math.floor(Math.random() * this.body.height);
		left = Math.floor(Math.random() * this.body.width);
	} while (this.doesCollide({top: top, left: left, width: this.div.width, height: this.div.width}));

	this.generatedPositions.push({
		top: top,
		left: left
	});

	return {
		top: top,
		left: left
	};
};

// Add the given number of elements to the page, randomly positioned
GeneratePage.prototype.addDivs = function(num) {
	while (num--) {
		var pos = this.randomPosition();
		document.body.insertAdjacentHTML('afterbegin', '<div data-o-element-visibility-track="" style="top: ' + pos.top + 'px; left: ' + pos.left + 'px;"></div>');
	}
};

// Calculate a sensible amount of divs to add to the page
// the result will be a page with half it's area covered
// any more and the collision detection will take a long time and possibly crash
GeneratePage.prototype.maxDivs = function(num) {
	var bodyArea = (this.body.width * this.body.height);
	var divArea = (this.div.width * this.div.height);
	return Math.floor((bodyArea / divArea) / 2);
};

document.addEventListener('DOMContentLoaded', function() {
	// setup the demo
	window.oDemo = new GeneratePage();
	document.body.addEventListener('oVisibility.inview', function(event) {
		if (event.detail.percentage >= window.oDemo.getThreshold()) {
			event.detail.element.node.className = 'inview';
			oDemo.setField('inView', oDemo.inView.length);
		} else {
			event.detail.element.node.className = '';
			oDemo.setField('inView', oDemo.inView.length);
		}
	});

	// begin tracking the divs
	document.documentElement.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
