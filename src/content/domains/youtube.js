new Domain()
	.defButtons(function() {
		return {
			play: document.querySelector('.ytp-button-play, .ytp-button-pause'),
			next: document.querySelector('.ytp-button-next'),
			prev: document.querySelector('.ytp-button-prev')
		};
	})
	.defPlayState(function(playButton) {
		return playButton.classList.contains('ytp-button-pause');
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
