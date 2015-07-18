(function() {'use strict';
	new Domain()
		.setupButtons(function() {
			return {
				play: document.querySelector('.ytp-button-play, .ytp-button-pause'),
				next: document.querySelector('.ytp-button-next'),
				prev: document.querySelector('.ytp-button-prev')
			};
		})
		.setupPlayState(function(callback, buttons) {
			function isPlaying(playButton) {
				return playButton.classList.contains('ytp-button-pause');
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
				document.getElementById('player-api'),
				{ childList: true },
				function(mutation) {
					Array.from(mutation.addedNodes).some(function(node) {
						if (node.nodeName === 'DIV' && node.classList.contains('html5-video-player')) {
							callback();
							return true;
						}
					});
				}
			);
			return observer.disconnect.bind(observer);
		});
})();
