(() => {
	new Domain()
		.setupButtons(() => ({
			play: document.querySelector('sj-icon-button[data-id="play-pause"]'),
			next: document.querySelector('sj-icon-button[data-id="forward"]'),
			prev: document.querySelector('sj-icon-button[data-id="rewind"]')
		}))
		.setupPlayState((callback, playButton) => {
			function sendUpdate() {
				callback(playButton.classList.contains('playing'));
			}

			Util.observe(
				playButton,
				{ attributes: true, attributeFilter: ['class'] },
				sendUpdate
			);

			sendUpdate();
		})
		.setupInfo(callback => {
			var watchElem = document.getElementById('playerSongInfo');

			function sendUpdate() {
				var imageElem = watchElem.querySelector('#playingAlbumArt');
				var titleElem = watchElem.querySelector('#player-song-title');
				var subtitleElem = watchElem.querySelector('.player-artist-album-wrapper');

				callback({
					image: `url(${imageElem.src.replace('=s90', '=s250')})`,
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
		.setupAction('thumbs-up', async (callback) => {
			var parent = document.getElementById('playerSongInfo');

			await Util.waitForChild(parent, node =>
				node.nodeName === 'DIV' && node.classList.contains('now-playing-info-wrapper')
			);

			var thumbUpButton = parent.querySelector('sj-icon-button[data-rating="5"]');

			function sendUpdate() {
				callback({
					icon: '\uf164',
					state: thumbUpButton.getAttribute('aria-label').toLowerCase().includes('undo')
				});
			}

			Util.observe(
				thumbUpButton,
				{ attributes: true, attributeFilter: ['aria-label'] },
				sendUpdate
			);

			sendUpdate();

			return () => Util.click(thumbUpButton);
		})
		.setupAction('thumbs-down', async (callback) => {
			var parent = document.getElementById('playerSongInfo');

			await Util.waitForChild(parent, node =>
				node.nodeName === 'DIV' && node.classList.contains('now-playing-info-wrapper')
			);

			var thumbDownButton = parent.querySelector('sj-icon-button[data-rating="1"]');

			function sendUpdate() {
				callback({
					icon: '\uf165',
					state: thumbDownButton.getAttribute('aria-label').toLowerCase().includes('undo')
				});
			}

			Util.observe(
				thumbDownButton,
				{ attributes: true, attributeFilter: ['aria-label'] },
				sendUpdate
			);

			sendUpdate();

			return () => Util.click(thumbDownButton);
		})
		.go(Util.waitForEvent(window, 'load'));
})();
