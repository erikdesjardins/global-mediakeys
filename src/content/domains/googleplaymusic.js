new Domain()
	.defButtons(function() {
		return {
			play: document.querySelector('sj-icon-button[data-id="play-pause"]'),
			next: document.querySelector('sj-icon-button[data-id="forward"]'),
			prev: document.querySelector('sj-icon-button[data-id="rewind"]')
		};
	})
	.defPlayState(function(playButton) {
		return playButton.classList.contains('playing');
	})
	.go('load');
