(function() {
	new Domain()
		.setupButtons(() => ({
			play: document.querySelector('.playControls .playControl'),
			next: document.querySelector('.playControls .skipControl__next'),
			prev: document.querySelector('.playControls .skipControl__previous')
		}))
		.setupPlayState(function(callback, playButton) {
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
		.setupInfo(function(callback) {
			var watchElem = document.querySelector('.playbackSoundBadge');

			function sendUpdate() {
				var imageElem = watchElem.querySelector('.image .sc-artwork');
				var titleElem = watchElem.querySelector('.playbackSoundBadge__title span:last-of-type');
				var subtitleElem = watchElem.querySelector('.playbackSoundBadge__context');

				callback({
					image: getComputedStyle(imageElem).backgroundImage.replace('50x50', '250x250'),
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
		.setupAction('like', async function(callback) {
			await Util.waitForChild(document.querySelector('.playbackSoundBadge'), node =>
				node.nodeName === 'DIV' && node.classList.contains('playbackSoundBadge__actions')
			);

			var likeButton = document.querySelector('.playbackSoundBadge__like');

			function sendUpdate() {
				callback({
					icon: '\uf004',
					state: likeButton.classList.contains('sc-button-selected')
				});
			}

			Util.observe(
				likeButton,
				{ attributes: true, attributeFilter: ['class'] },
				sendUpdate
			);

			sendUpdate();

			return () => Util.click(likeButton);
		})
		.go(Util.waitForChild(document.getElementById('app'), node =>
			node.nodeName === 'DIV' && node.classList.contains('playControls')
		));
})();
