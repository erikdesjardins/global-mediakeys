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
		return isPlaying(buttons.play);
	})
	.go();
