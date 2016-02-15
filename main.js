const oViewport = require('o-viewport');
const TrackedElement = require('./src/tracked-element');

const tracked = [];
let tracking = false;
let bodyHeight = window.document.body.clientHeight;

/*
* begin tracking an element
*/
function track(element) {
	const exists = tracked.filter(sameElement(element));
	if (exists.length) {
		element = exists[0];
	} else {
		element = new TrackedElement(element);
		tracked.push(element);
		element.update();
		initEvents();
	}

	return element;
}

/*
* Provides a test for matching elements
*/
function sameElement(element) {
	return function(item) {
		return item.node === element;
	};
}

/*
* Call the update method on all tracked elements
*/
function update(force) {
	force = force === true ? true : false;
	tracked.forEach(function(element) {
		element.update(force);
	});
}

/*
* Call the updatePositions method on all tracked elements
*/
function updatePositions(force) {
	force = force === true ? true : false;
	tracked.forEach(function(element) {
		element.updatePosition().update(force);
	});
}

/*
* Call the updateScrollHandler method when scrolling
*/
function updateScrollHandler() {
	if(bodyHeight !== document.body.clientHeight) {
		bodyHeight = document.body.clientHeight;
		updatePositions();
	}
	update();
}

/*
* initialise
*/
function init(selector) {
	let elements = [];
	selector = typeof selector === 'string' ? selector : '[data-o-element-visibility-track]';

	try {
		elements = document.querySelectorAll(selector);
	} catch (err) {
		return;
	}

	if (elements.length) {
		[].slice.call(elements).forEach(track);
		update();
	}

	initEvents();
	document.documentElement.removeEventListener('o.DOMContentLoaded', init);
}

function destroy() {
	tracked.length = 0;
	if (tracking === true) {
		document.body.removeEventListener('oViewport.orientation', updatePositions);
		document.body.removeEventListener('oViewport.resize', updatePositions);
		document.body.removeEventListener('oViewport.scroll', updateScrollHandler);
		document.body.removeEventListener('oViewport.visibility', update);
		tracking = false;
	}
}

function initEvents() {
	if (tracking === false) {
		oViewport.listenTo('all');
		document.body.addEventListener('oViewport.orientation', updatePositions);
		document.body.addEventListener('oViewport.resize', updatePositions);
		document.body.addEventListener('oViewport.scroll', updateScrollHandler);
		document.body.addEventListener('oViewport.visibility', update);

		tracking = true;
	}
}

document.documentElement.addEventListener('o.DOMContentLoaded', init);

module.exports = {
	track: track,
	tracked: tracked,
	updatePositions: updatePositions,
	update: update,
	init: init,
	destroy: destroy
};
