(function() {'use strict';
	new Domain()
		.setupButtons(function() {
			return {
				play: document.querySelector('sj-icon-button[data-id="play-pause"]'),
				next: document.querySelector('sj-icon-button[data-id="forward"]'),
				prev: document.querySelector('sj-icon-button[data-id="rewind"]')
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
		.setupInfo(function() {
			var imageElem = document.getElementById('playingAlbumArt');
			var titleElem = document.getElementById('player-song-title');
			var subtitleElem = document.querySelector('.player-artist-album-wrapper');
			return {
				image: imageElem.src.replace('=s90', '=s250'),
				title: titleElem.textContent,
				subtitle: subtitleElem.textContent
			};
		})
		.go(function(callback) {
			window.addEventListener('load', callback);
			return window.removeEventListener.bind(window, 'load', callback);
		});
})();
