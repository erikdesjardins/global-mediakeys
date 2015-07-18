(function() {'use strict';
	new Domain()
		.setupButtons(function() {
			return {
				play: document.querySelector('.playControls .playControl'),
				next: document.querySelector('.playControls .skipControl__next'),
				prev: document.querySelector('.playControls .skipControl__previous')
			};
		})
		.setupPlayState(function(callback, buttons) {
			function isPlaying(playButton) {
				return playButton.classList.contains('playing');
			}

			Util.dom.observe(
				buttons.play,
				{ attributes: true, attributeFilter: ['class'] },
				function() { callback(isPlaying(buttons.play)); }
			);

			callback(isPlaying(buttons.play));
		})
		.go(function(callback) {
			var observer = Util.dom.observe(
				document.getElementById('app'),
				{ childList: true },
				function(mutation) {
					Array.from(mutation.addedNodes).some(function(node) {
						if (node.nodeName === 'DIV' && node.classList.contains('playControls')) {
							callback();
							return true;
						}
					});
				}
			);
			return observer.disconnect.bind(observer);
		});
})();
