(function() {
	new Domain()
		.setupButtons(() => ({
			play: document.querySelector('sj-icon-button[data-id="play-pause"]'),
			next: document.querySelector('sj-icon-button[data-id="forward"]'),
			prev: document.querySelector('sj-icon-button[data-id="rewind"]')
		}))
		.setupPlayState(function(callback, buttons) {
			function sendUpdate() {
				callback(buttons.play.classList.contains('playing'));
			}

			Util.observe(
				buttons.play,
				{ attributes: true, attributeFilter: ['class'] },
				sendUpdate
			);

			sendUpdate();
		})
		.setupInfo(function(callback) {
			var watchElem = document.getElementById('playerSongInfo');

			function sendUpdate() {
				var imageElem = watchElem.querySelector('#playingAlbumArt');
				var titleElem = watchElem.querySelector('#player-song-title');
				var subtitleElem = watchElem.querySelector('.player-artist-album-wrapper');

				callback({
					image: imageElem.src.replace('=s90', '=s250'),
					title: titleElem.textContent,
					subtitle: subtitleElem.textContent
				});
			}

			Util.observe(
				watchElem,
				{ childList: true },
				sendUpdate
			);
		})
		.go(Util.waitForEvent(window, 'load'));
})();
