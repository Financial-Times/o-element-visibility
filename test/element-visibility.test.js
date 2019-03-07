/* eslint-env mocha */
const proclaim = require('proclaim');
const sinon = require('sinon');

const oElemVis = require('./../main.js');

function isPhantom() {
	return /PhantomJS/.test(navigator.userAgent);
}

describe('o-element-visibility', function() {
	let inview;
	let outview;

	const height = (window.innerHeight + 100);
	beforeEach(function() {
		document.body.style.height = height + 'px';
		document.body.style.margin = '0';
		document.body.insertAdjacentHTML('afterbegin', '<div id="inview" style="width: 10px; height: 10px; background: #bada55;" data-o-element-visibility-track></div>');
		document.body.insertAdjacentHTML('afterbegin', '<div id="outview" style="width: 10px; height: 10px; top: ' + window.innerHeight + 'px; position: absolute; background: #bada55;"></div>');
		inview = document.getElementById('inview');
		outview = document.getElementById('outview');
	});

	afterEach(function() {
		oElemVis.destroy();
		document.body.removeAttribute('style');
		document.body.removeChild(inview);
		document.body.removeChild(outview);
		// sinon.spy().restore();
		document.body.style.height = height + 'px';
		window.scroll(0,0);
	});

	it('should track elements with the attribute  data-o-element-visibility-track', function() {
		document.documentElement.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
		proclaim.equal(oElemVis.tracked.length, 1);
	});

	it('should track stop tracking elements when destroy is called', function() {
		oElemVis.track(inview);
		proclaim.equal(oElemVis.tracked.length, 1);
		oElemVis.destroy();
		proclaim.equal(oElemVis.tracked.length, 0);
	});

	it('Attempting to track the same element twice is caught', function() {
		const result1 = oElemVis.track(inview);
		proclaim.equal(oElemVis.tracked.length, 1);
		const result2 = oElemVis.track(inview);
		proclaim.deepEqual(result1, result2);
		proclaim.equal(oElemVis.tracked.length, 1);
	});

	it('should track elements passed to track', function() {
		oElemVis.track(outview);
		proclaim.equal(oElemVis.tracked.length, 1);
		proclaim.equal(oElemVis.tracked[0].node.id, 'outview');
	});

	describe('should fire events when first run', function() {
		it('should report the inview element as 100% in viewport', function(done) {
			function assert(event) {
				proclaim.equal(event.detail.inviewport, true);
				proclaim.equal(event.detail.percentage, 100);
				proclaim.equal(event.detail.element.node.id, 'inview');

				document.documentElement.removeEventListener('oVisibility.inview', assert);
				done();
			}

			document.documentElement.addEventListener('oVisibility.inview', assert);
			oElemVis.track(inview);

		});

		it('should report the outview element as 0% in viewport', function(done) {
			// setting viewport size doesn't seem to work with karma/phantomjs so skip this test
			if (isPhantom()) {
				done();
				return true;
			}

			function assert(event) {
				proclaim.equal(event.detail.inviewport, false);
				proclaim.equal(event.detail.percentage, 0);
				proclaim.equal(event.detail.element.node.id, 'outview');

				document.documentElement.removeEventListener('oVisibility.inview', assert);
				done();
			}

			document.documentElement.addEventListener('oVisibility.inview', assert);

			oElemVis.track(outview);
		});

		it.skip('should recalculate the position of tracked elements once you scroll if height of body changed', function(done) {
			// setting viewport size doesn't seem to work with karma/phantomjs so skip this test
			if (isPhantom()) {
				done();
				return true;
			}

			// remove css height from body (set by a test)
			document.body.style.height = 'auto';

			let trackedElement = oElemVis.track(inview);
			// spy on the update position
			let trackedElementUpdatePositionSpy = sinon.spy(trackedElement, 'updatePosition');

			proclaim.equal(trackedElement.top, 0);
			proclaim.equal(trackedElement.inview, true);
			proclaim.equal(trackedElementUpdatePositionSpy.callCount, 0);
			// append DOM to add a new element
			document.body.insertAdjacentHTML('afterbegin', '<div id="gap" style="width: 10px; height: '+height+'px; background: #ff0000;"></div>');
			function assertFirst(){
				// make sure tracked element position has been updated
				proclaim.equal(trackedElement.top, height);
				proclaim.equal(trackedElement.inview, false);
				// make sure the recalculation has only been done once and not once for each scroll event
				proclaim.equal(trackedElementUpdatePositionSpy.callCount, 1);
			}

			function assertSecond(){
				// make sure we did not call the updatePosition twice
				proclaim.equal(trackedElementUpdatePositionSpy.callCount, 1);
				done();
			}

			window.addEventListener('scroll', assertFirst);
			window.dispatchEvent(new CustomEvent('scroll'));
			window.removeEventListener('scroll', assertFirst);

			window.addEventListener('scroll', assertSecond);
			window.dispatchEvent(new CustomEvent('scroll'));
			window.removeEventListener('scroll', assertSecond);

			// test cleanup
			document.body.removeChild(document.getElementById('gap'));
			trackedElementUpdatePositionSpy.restore();

		});
	});

	describe('should fire events when visibility status changes', function() {

		it('should report the outview element as 100% and inview as 0% in viewport', function(done) {
			// setting viewport size doesn't seem to work with karma/phantomjs so skip this test
			if (isPhantom()) {
				done();
				return true;
			}

			let assertions = 0;
			document.documentElement.addEventListener('oVisibility.inview', assertFirst);
			oElemVis.track(inview);
			oElemVis.track(outview);

			function assertFirst(event) {
				if (event.detail.element.node.id === 'inview') {
					proclaim.equal(event.detail.inviewport, true);
					proclaim.equal(event.detail.percentage, 100);
					assertions++;
				} else if (event.detail.element.node.id === 'outview') {
					proclaim.equal(event.detail.inviewport, false);
					proclaim.equal(event.detail.percentage, 0);
					assertions++;
				}

				if (assertions === 2) {
					assertions = 0;
					document.documentElement.removeEventListener('oVisibility.inview', assertFirst);
					document.documentElement.addEventListener('oVisibility.inview', assertSecond);
					window.scroll(0, height);
				}
			}

			function assertSecond(event) {
				if (event.detail.element.node.id === 'inview') {
					proclaim.equal(event.detail.inviewport, false);
					proclaim.equal(event.detail.percentage, 0);
					assertions++;
				} else if (event.detail.element.node.id === 'outview') {
					proclaim.equal(event.detail.inviewport, true);
					proclaim.equal(event.detail.percentage, 100);
					assertions++;
				}

				if (assertions === 2) {
					assertions = 0;
					document.documentElement.removeEventListener('oVisibility.inview', assertSecond);
					done();
				}
			}
		});
	});
});
