new Domain()
	.buttons(function() {
		return {
			play: document.querySelector('.playControls .playControl'),
			next: document.querySelector('.playControls .skipControl__next'),
			prev: document.querySelector('.playControls .skipControl__previous')
		};
	})
	.playState(function(playButton) {
		return playButton.classList.contains('playing');
	})
	.go();
