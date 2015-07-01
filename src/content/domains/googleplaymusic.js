new Domain()
	.buttons(function() {
		return {
			play: document.querySelector('sj-icon-button[data-id="play-pause"]'),
			next: document.querySelector('sj-icon-button[data-id="forward"]'),
			prev: document.querySelector('sj-icon-button[data-id="rewind"]')
		};
	})
	.playState(function(playButton) {
		return playButton.classList.contains('playing');
	})
	.go(function(callback) {
		window.addEventListener('load', callback);
		return window.removeEventListener.bind(window, 'load', callback);
	});
