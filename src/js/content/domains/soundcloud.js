(() => {
	new Domain()
		.setupButtons(() => ({
			play: document.querySelector('.playControls .playControl'),
			next: document.querySelector('.playControls .skipControl__next'),
			prev: document.querySelector('.playControls .skipControl__previous')
		}))
		.setupPlayState((callback, playButton) => {
			Util.onMutation(
				playButton,
				{ attributes: true, attributeFilter: ['class'] },
				() => callback(playButton.classList.contains('playing')),
				{ initialCallback: true }
			);
		})
		.setupInfo(async (callback) => {
			const watchElem = document.querySelector('.playbackSoundBadge');

			function sendUpdate() {
				const imageElem = watchElem.querySelector('.image .sc-artwork');
				const titleElem = watchElem.querySelector('.playbackSoundBadge__title span:last-of-type');
				const subtitleElem = watchElem.querySelector('.playbackSoundBadge__context');

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

			await Util.waitForChild(watchElem, '*');

			sendUpdate();
		})
		.setupAction('like', async (callback) => {
			const rootElem = document.querySelector('.playbackSoundBadge');
			const likeSelector = '.playbackSoundBadge__like';

			function sendUpdate(likeButton) {
				callback({
					icon: '\uf004',
					state: likeButton.classList.contains('sc-button-selected')
				});
			}

			await Util.onDescendantMutation(
				rootElem,
				likeSelector,
				{ attributes: true, attributeFilter: ['class'] },
				sendUpdate,
				{ initialCallback: true }
			);

			return () => Util.click(rootElem.querySelector(likeSelector));
		})
		.go(Util.waitForChild(document.getElementById('app'), '.playControls'));
})();
