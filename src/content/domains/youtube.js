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
	.go();
