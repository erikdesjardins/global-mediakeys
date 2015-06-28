(function(exports) {
	function click(ele) {
		if (typeof ele === 'string') {
			console.log('Util.click: selecting element', ele);
			ele = document.querySelector(ele);
		}

		if (!ele.dispatchEvent) {
			console.error('Cannot dispatch event on element:', ele);
		} else {
			ele.dispatchEvent(new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			}));
		}
	}

	exports.click = click;
})(/* jshint -W020 */ Util = {});
