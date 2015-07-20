(function() {
	new Domain()
		.setupButtons(() => ({
			play: document.querySelector('.ytp-button-play, .ytp-button-pause'),
			next: document.querySelector('.ytp-button-next'),
			prev: document.querySelector('.ytp-button-prev')
		}))
		.setupPlayState(function(callback, buttons) {
			function sendUpdate() {
				callback(buttons.play.classList.contains('ytp-button-pause'));
			}

			Util.observe(
				buttons.play,
				{ attributes: true, attributeFilter: ['class'] },
				sendUpdate
			);

			sendUpdate();
		})
		.setupInfo(function(callback) {
			var watchElem = document.getElementById('content');

			async function sendUpdate() {
				var imageElem = watchElem.querySelector('#watch-header .video-thumb img');
				var titleElem = watchElem.querySelector('#watch-headline-title');
				var subtitleElem = watchElem.querySelector('#watch-header .yt-user-info');

				await Util.waitForMutation(
					imageElem,
					{ attributes: true, attributeFilter: ['src'] }
				);

				callback({
					image: `url(${imageElem.src.replace('/s88', '/s250')})`,
					title: titleElem.textContent,
					subtitle: subtitleElem.textContent
				});
			}

			Util.observe(
				watchElem,
				{ childList: true, subtree: true },
				mutation => {
					if (Array.from(mutation.addedNodes).some(node => node.id === 'watch-header')) {
						sendUpdate();
					}
				}
			);

			sendUpdate();
		})
		.go(Util.waitForChild(document.getElementById('player-api'), node =>
			node.nodeName === 'DIV' && node.classList.contains('html5-video-player')
		));
})();
